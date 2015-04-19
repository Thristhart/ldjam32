var PitchDetector = require('pitch-detector');
var game = require('./game.js');

window.addEventListener("load", function() {
  buildDetector();
  game.setup(document.getElementById("display"));
});
function update(stats, detector) {
  game.update(stats, detector);
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
