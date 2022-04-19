function redirectViaIntentUrl() {
  try {
    window.location =
      "intent://handshake?api_key=xxxx#Intent;scheme=kite;package=com.zerodha.kite3;S.browser_fallback_url=https%3A%2F%2Fkite.zerodha.com%2Ffunds;end";
  } catch (e) {
    console.table(e);
  }
  return false;
}

function redirectUsingTimeout() {
  window.location.replace("kite://handshake?api_key=xxxx");
  setTimeout(function () {
    window.location.replace("https://kite.zerodha.com/funds");
  }, 500);
  return false;
}
