var i = {};
function loadImage(path) {
  var elem = document.createElement("img");
  elem.src = path;
  return elem;
}
i.TARGET = loadImage("./assets/target.png");

module.exports = i;
