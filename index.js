var canvas;
var context;

var Physics = require('PhysicsJS');

var physOpts = {};

var world = Physics(physOpts);

window.addEventListener("load", function() {
  canvas = document.getElementById("display");
  context = canvas.getContext("2d");

  updateLoop();
});


function updateLoop() {
  world.step(Date.now());
  render();
  requestAnimationFrame(updateLoop);
}
function render() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

