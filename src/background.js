chrome.app.runtime.onLaunched.addListener(function() {
  mainWindow = chrome.app.window.create('index.html', {
    'bounds': {
      'width': 520,
      'height': 420
    },
    'minWidth': 520,
    'minHeight': 400
  });
});
