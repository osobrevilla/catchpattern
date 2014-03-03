chrome.app.runtime.onLaunched.addListener(function() {
  mainWindow = chrome.app.window.create('index.html', {
    'bounds': {
      'width': 700,
      'height': 450
    },
    'minWidth': 520,
    'minHeight': 400
  });
});
