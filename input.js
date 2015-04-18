var InputManager = {};
InputManager.setup = function() {
  document.body.addEventListener("keydown", function(event) {
    switch(event.keyCode) {
      case 87: // W
      case 38: // up arrow
      case 188: // , (dvorak w)
        InputManager.up = true;
        break;
      case 65: // A (also dvorak)
      case 37: // left arrow
        InputManager.left = true;
        break;
      case 68: // D
      case 39: // right arrow
      case 69: // E (dvorak d)
        InputManager.right = true;
        break;
      case 83: // S
      case 38: // down arrow
      case 79: // O (dvorak s)
        InputManager.down = true;
    }
  });
  document.body.addEventListener("keyup", function(event) {
    switch(event.keyCode) {
      case 87: // W
      case 38: // up arrow
      case 188: // , (dvorak w)
        InputManager.up = false;
        break;
      case 65: // A (also dvorak)
      case 37: // left arrow
        InputManager.left = false;
        break;
      case 68: // D
      case 39: // right arrow
      case 69: // E (dvorak d)
        InputManager.right = false;
        break;
      case 83: // S
      case 38: // down arrow
      case 79: // O (dvorak s)
        InputManager.down = false;
    }
  });
};

module.exports = InputManager;
