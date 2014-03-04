chrome.app.runtime.onLaunched.addListener(function() {
  mainWindow = chrome.app.window.create('index.html', {
    'bounds': {
      'width': 750,
      'height': 380
    },
    'minWidth': 520,
    'minHeight': 400
  });
});
