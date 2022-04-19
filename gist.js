// https://gist.github.com/diachedelic/0d60233dab3dcae3215da8a4dfdcd434

var outputTimer;
function printOut(str) {
  var outputElem = document.getElementById("output");
  if (!outputElem) return;
  if (str === undefined) {
    outputElem.innerText = "";
    return;
  }
  outputElem.innerText = `${outputElem.innerText}> ${str}`;
  //   if (outputTimer) clearTimeout(outputTimer);
  //   outputTimer = setTimeout(() => (outputElem.innerText = ""), 1000);
}

function DeepLinker(options) {
  if (!options) {
    throw new Error("no options");
  }

  var hasFocus = true;
  var didHide = false;

  // window is blurred when dialogs are shown
  function onBlur() {
    hasFocus = false;
    printOut("blurred");
  }

  // document is hidden when native app is shown or browser is backgrounded
  // ! in some iphones this event is never recieved hence fails there as well
  function onVisibilityChange(e) {
    if (e.target.visibilityState === "hidden") {
      didHide = true;
      printOut("hidden");
    }
  }

  // onVisibilityChange may not work in all case, this may help in those cases
  function onPageHide(e) {
      didHide = true;
      printOut("pagehide");
  }

  // window is focused when dialogs are hidden, or browser comes into view
  function onFocus() {
    if (didHide) {
      if (options.onReturn) {
        options.onReturn();
      }

      //   didHide = false; // reset
      printOut("came back");
    } else {
      // ignore duplicate focus event when returning from native app on
      // iOS Safari 13.3+
      printOut("never left");
      if (!hasFocus && options.onFallback) {
        // wait for app switch transition to fully complete - only then is
        // 'visibilitychange' fired
        printOut("may leave");
        setTimeout(function () {
          // if browser was not hidden, the deep link failed
          if (!didHide) {
            printOut("didnt leave");
            options.onFallback();
          }
        }, 500);
      }
    }

    hasFocus = true;
  }

  // add/remove event listeners
  // `mode` can be "add" or "remove"
  function bindEvents(mode) {
    [
      [window, "blur", onBlur],
      [document, "visibilitychange", onVisibilityChange],
      [window, "pagehide", onPageHide],
      [window, "focus", onFocus],
    ].forEach(function (conf) {
      conf[0][mode + "EventListener"](conf[1], conf[2]);
    });
  }

  // add event listeners
  bindEvents("add");

  // expose public API
  this.destroy = bindEvents.bind(null, "remove");
  this.openURL = function (url) {
    // it can take a while for the dialog to appear
    var dialogTimeout = 2000;

    setTimeout(function () {
      // after timeout if focus was gained after closing dialog, consider ignored
      if (!didHide && hasFocus && options.onIgnored) {
        options.onIgnored(); //! on some iphones, this happens before any other events hence fails
      }
    }, dialogTimeout);

    window.location = url;
  };
}

/* usage */
var linker;
function redirectUsingEventsForFallback() {
  printOut();
  if (linker) linker.destroy();
  var ignoreUrl = "https://kite.zerodha.com";
  var fallbackUrl = "https://kite.zerodha.com";
  var deeplink = "kite://handshake?api_key=xxxx";
  linker = new DeepLinker({
    onIgnored: function () {
      console.log("browser failed to respond to the deep link");
      window.location = ignoreUrl;
      printOut("deeplink ignored")
    },
    onFallback: function () {
      console.log("dialog hidden or user returned to tab");
      window.location = fallbackUrl;
      printOut("deeplink fallback")
    },
    onReturn: function () {
      console.log("user returned to the page from the native app");
    },
  });

  linker.openURL(deeplink);
  return false;
}
