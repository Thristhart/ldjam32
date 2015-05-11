var PitchDetector = require('pitch-detector');
var game = require('./game.js');

window.addEventListener("load", function() {
  var ctx = document.getElementById("display").getContext("2d");
  ctx.font = "48px serif";
  ctx.fillText("Click to start", 300, 250);
  document.getElementById("display").addEventListener("click", start);
});
function update(stats, detector) {
  game.update(stats, detector);
}

function start() {
  buildDetector();
  game.setup(document.getElementById("display"));
  document.getElementById("display").removeEventListener("click", start);
}

function buildDetector() {
  var detector = new PitchDetector({
    "context": new AudioContext(),
    "start": true,
    "length": 1024,
    "stopAfterDetection": false,
    "normalize": "rms",
    "minRms": 0.01,
    "minCorrelationIncrease": false,
    "minCorrelation": 0.8,
    "onDetect": update
  });

  detector.start();
}
