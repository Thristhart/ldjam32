var Game = {};

var images = require('./images.js');

Game.setup = function(canvas) {
  Game.canvas = canvas;
  Game.context = Game.canvas.getContext("2d");
  Game.state = "training1";
  Game.notes = new Array(25);

  Game.lowestFreq = 2001;
  Game.highestFreq = 0;

  Game.targets = [];
  Game.sequence = null;

  Game.render(performance.now());
};


Game.changeState = function(newState) {
  Game.lastStateTransition = performance.now();
  Game.state = newState;
  Game.noteCounter = 0;
  if(newState == "endtraining") {
    Game.addTarget(250);
  }
  if(newState == "round1") {
    Game.setSequence({
      0: 100,
      2000: [200, 300],
      4000: 500,
      4500: 100
    });
  }
};

Game.setSequence = function(seq) {
  Game.sequenceStartTime = performance.now();
  Game.sequence = seq;
};

Game.update = function(pitchStats, detector) {
  if(Game.state == "training1") {
    Game.changeState("training2");
  }
  if(Game.state == "training2") {
    if(Game.noteCounter > 50) {
      Game.changeState("training3");
    }
  }
  if(pitchStats.frequency > 2000)
    pitchStats.frequency = 2000;
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

  if(Game.state.indexOf("training") == 0) {
    if(Game.averageFreq < Game.lowestFreq)
      Game.lowestFreq = Game.averageFreq;
    if(Game.averageFreq > Game.highestFreq)
      Game.highestFreq = Game.averageFreq;
  }
};

Game.freqToPos = function(freq) {
  var y = (freq - Game.lowestFreq) / (Game.highestFreq - Game.lowestFreq);
  y = 1 - y;
  y *= Game.canvas.height;
  return y;
};
Game.posToFreq = function(y) {
  y /= Game.canvas.height;
  y = 1 - y;
  y *= (Game.highestFreq - Game.lowestFreq);
  y += Game.lowestFreq;
  return y;
};

Game.onTargetHit = function(target, note) {
  console.log("pow", target);
  if(target.health < 0) {
    Game.targets.splice(Game.targets.indexOf(target), 1);
    Game.notes[Game.notes.indexOf(note)] = undefined;
    console.log("RIP");

    if(Game.state == "endtraining") {
      Game.changeState("round1");
    }
  }
};

Game.checkForHit = function(note, x) {
  for(var i = 0; i < Game.targets.length; i++) {
    var target = Game.targets[i];
    var pos = Game.freqToPos(note.frequency);
    if(Math.abs(target.y - pos) < 50 && Math.abs(target.x - x) < 50) {
      return target;
    }
  }
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
      var y = Game.freqToPos(note.frequency);
      Game.context.fillText(Math.floor(note.frequency), x, y);
      var hit = Game.checkForHit(note, x);
      if(hit) {
        hit.health--;
        Game.onTargetHit(hit, note);
      }
      if(x > Game.canvas.width) {
        delete(Game.notes[i]);
      }
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

  for(var i = 0; i < Game.targets.length; i++) {
    var target = Game.targets[i];
    if(target.health < target.maxhealth) {
      Game.context.fillStyle = "green";
      Game.context.fillRect(target.x - 50, target.y - 60, 50, 10);
      var fill = 50 * (1 - target.health / target.maxhealth);
      Game.context.fillStyle = "red";
      Game.context.fillRect(target.x - fill, target.y - 60, fill, 10);
    }
    Game.context.drawImage(images.TARGET, Game.targets[i].x - 70, Game.targets[i].y - 50);

    if(Game.state != "endtraining") {
      target.x -= target.speed;
    }
  }
  Game.context.fillStyle = "black";


  if(Game.sequence) {
    for(var t in Game.sequence) {
      if(time - Game.sequenceStartTime > t) {
        var tar = Game.sequence[t];
        if(Array.isArray(tar)) {
          for(var j in tar) {
            Game.addTarget(tar[j]);
          }
        }
        else {
          Game.addTarget(tar);
        }
        delete(Game.sequence[t]);
      }
    }
  }
  requestAnimationFrame(Game.render);
};
Game.addTarget = function(pos, health) {
  health = health || 25;
  var targ = {x: Game.canvas.width, y: pos, frequency: Game.posToFreq(pos),
    maxhealth: health, health: health, speed:1};
  Game.targets.push(targ);
};

window.Game = Game;

module.exports = Game;
