var i = {};
function loadImage(path) {
  var elem = document.createElement("img");
  elem.src = path;
  return elem;
}
i.TARGET = loadImage("./assets/target.png");
i.SHIP = loadImage("./assets/ship.png");

module.exports = i;
