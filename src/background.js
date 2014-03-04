chrome.app.runtime.onLaunched.addListener(function() {
  mainWindow = chrome.app.window.create('index.html', {
    'bounds': {
      'width': 399,
      'height': 368
    },
    'minWidth': 368,
    'minHeight': 368
  });
});
