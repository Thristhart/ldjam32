var Game = {};

Game.setup = function(canvas) {
  Game.canvas = canvas;
  Game.context = Game.canvas.getContext("2d");
  Game.state = "training1";
  Game.notes = new Array(25);

  Game.lowestFreq = 2001;
  Game.highestFreq = 0;

  Game.render(performance.now());
};


Game.changeState = function(newState) {
  Game.lastStateTransition = performance.now();
  Game.state = newState;
  Game.noteCounter = 0;
};

Game.update = function(pitchStats, detector) {
  if(Game.state == "training1") {
    Game.changeState("training2");
  }
  if(Game.state == "training2") {
    if(Game.noteCounter > 100) {
      Game.changeState("training3");
    }
  }
  if(pitchStats.frequency > 3000)
    pitchStats.frequency = 3000;
  var note = {frequency: pitchStats.frequency, timestamp: performance.now()};
  Game.notes.push(note);
  Game.notes.shift();
  var total = 0;
  var count = Game.notes.length;
  var highest = 0;
  var lowest = 100000;
  for(var i = 0; i < Game.notes.length; i++) {
    if(Game.notes[i] === undefined) {
      count--;
    }
    else {
      var freq = Game.notes[i].frequency;
      total += freq;
      if(highest < freq)
        highest = freq;
      if(lowest > freq)
        lowest = freq;
    }
  }
  total -= highest;
  total -= lowest;
  count -= 2;
  if(count == 0)
    count = 1;
  Game.noteCounter++;
  if(total < 10)
    return;
  Game.averageFreq = Math.floor(total / count);
  if(Game.averageFreq < Game.lowestFreq)
    Game.lowestFreq = Game.averageFreq;
  if(Game.averageFreq > Game.highestFreq)
    Game.highestFreq = Game.averageFreq;
};

Game.render = function(time) {
  Game.context.clearRect(0, 0, Game.canvas.width, Game.canvas.height);
  Game.context.font = "12px serif";
  var note;
  for(var i = 0; i < Game.notes.length; i++) {
    note = Game.notes[i];
    if(note) {
      var x = (time - note.timestamp) / 500;
      x *= Game.canvas.width;
      var y = (note.frequency - Game.lowestFreq) / (Game.highestFreq - Game.lowestFreq);
      y = 1 - y;
      y *= (Game.canvas.height);
      Game.context.fillText(Math.floor(note.frequency), x, y);
    }
  }
  Game.context.font = "48px serif";
  if(Game.state == "training1") {
    Game.context.fillText("Hum or whistle the lowest note you can!", 25, 250)
  }
  if(Game.state == "training2") {
    Game.context.fillText("You're at: " + Game.averageFreq + "hz", 150, 250);
    Game.context.fillText("Your lowest: " + Game.lowestFreq + "hz", 150, 300);
  }
  if(Game.state == "training3") {
    Game.context.fillText("Good! Now the highest note you can!", 25, 250)
    if(time - Game.lastStateTransition > 3000 && Game.noteCounter > 0) {
      Game.changeState("training4");
    }
  }
  if(Game.state == "training4") {
    Game.context.fillText("You're at: " + Game.averageFreq + "hz", 150, 250);
    Game.context.fillText("Your lowest: " + Game.lowestFreq + "hz", 150, 300);
    Game.context.fillText("Your highest: " + Game.highestFreq + "hz", 150, 350);
    if(time - Game.lastStateTransition > 3000 && Game.noteCounter > 25) {
      Game.changeState("endtraining");
    }
  }
  if(Game.state == "endtraining") {
    Game.context.fillText("Hit the target to start!", 150, 250);
  }
  requestAnimationFrame(Game.render);
};

window.Game = Game;

module.exports = Game;
