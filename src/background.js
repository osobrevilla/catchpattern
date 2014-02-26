chrome.app.runtime.onLaunched.addListener(function() {
  mainWindow = chrome.app.window.create('index.html', {
    'bounds': {
      'width': 460,
      'height': 420
    },
    'minWidth': 420,
    'minHeight': 400
  });
});
