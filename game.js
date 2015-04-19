var Game = {};

var images = require('./images.js');

Game.setup = function(canvas) {
  Game.canvas = canvas;
  Game.context = Game.canvas.getContext("2d");
  Game.state = "training1";
  Game.notes = new Array(15);

  Game.lowestFreq = 2001;
  Game.highestFreq = 0;

  Game.targets = [];
  Game.sequence = null;

  Game.projectiles = [];
  Game.lastShot = performance.now();

  Game.shipPos = 300;
  Game.shipSpeed = 10;

  Game.hitCount = 0;
  Game.missCount = 0;

  Game.render(performance.now());
};


Game.changeState = function(newState) {
  Game.lastStateTransition = performance.now();
  Game.state = newState;
  Game.noteCounter = 0;
  if(newState == "endtrain") {
    Game.addTarget(250);
  }
  if(newState == "round1") {
    Game.setSequence({
      0: 100,
      4000: [200, 300],
      8000: 500,
      9500: 100,
      12000: [200, 500],
      14000: 300
    });
  }
  if(newState == "round2") {
    Game.setSequence({
      1000: 500,
      4000: 100,
      6000: 400,
      7500: 500,
      9000: 100
    });
  }
  if(newState == "round3") {
    Game.rapidFire = true;
    Game.setSequence({
      2000: [500, 100, 300],
      4000: 150,
      4500: 250,
      5000: 350,
      5500: 450,
      9000: [100, 200, 300, 400, 500],
      13000: 100,
      15000: 500,
      17000: 150,
      19000: 100,
      21000: 500,
      23000: 500,
      25000: 300
    });
  }
  if(newState == "round4") {
    Game.rapidFire = false;
    Game.setSequence({
      1000: 100,
      2000: 200,
      3000: 300,
      4000: 400,
      5000: 500,
      6000: 200,
      6500: 500,
      7000: 100,
      9000: [200, 400],
      11000: [300, 500],
      16000: [100, 300, 600],
      20000: 150
    });
  }
  if(newState == "infinite") {
    Game.rapidFire = true;
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
  if(pitchStats.frequency > 1800)
    pitchStats.frequency = 1800;
  if(Game.state.indexOf("training") == -1) {
    if(pitchStats.frequency < Game.lowestFreq)
      pitchStats.frequency = Game.lowestFreq;
    if(pitchStats.frequency > Game.highestFreq)
      pitchStats.frequency = Game.highestFreq;
    if(Game.chargeNote) {

    }
    else {
      Game.startCharge();
    }
  }

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

  if(Game.rapidFire) {
    Game.chargeNote = Game.posToFreq(Game.shipPos);
    Game.stopCharge(200);
    Game.targetShipPos = Game.freqToPos(Game.averageFreq);
    Game.shipSpeed = 50;
  }
  else {
    Game.shipSpeed = 10;
  }

  if(Game.state.indexOf("training") == 0) {
    if(Game.averageFreq < Game.lowestFreq)
      Game.lowestFreq = Game.averageFreq;
    if(Game.averageFreq > Game.highestFreq)
      Game.highestFreq = Game.averageFreq;
  }
};

Game.startCharge = function() {
  Game.chargeNote = Game.averageFreq;
  Game.noteStart = performance.now();
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

Game.onTargetHit = function(target, bullet) {
  target.health -= bullet.size;
  if(target.health < 0) {
    Game.hitCount++;
    Game.targets.splice(Game.targets.indexOf(target), 1);
    if(Game.targets.length == 0 && !Game.sequence) {
      Game.endRound();
    }
  }
};
Game.endRound = function() {
  if(Game.state == "endtrain") {
    Game.changeState("round1");
  }
  else if(Game.state == "round1") {
    Game.changeState("round2");
  }
  else if(Game.state == "round2") {
    Game.changeState("round3");
  }
  else if(Game.state == "round3") {
    Game.changeState("round4");
  }
  else if(Game.state == "round4") {
    Game.changeState("infinite");
  }
};

Game.checkForHit = function(bullet, x) {
  for(var i = 0; i < Game.targets.length; i++) {
    var target = Game.targets[i];
    if(Math.abs(target.y - bullet.y) < 50 + bullet.size && Math.abs(target.x - x) < 50) {
      return target;
    }
  }
};

Game.stopCharge = function(time) {
  var now = performance.now();
  if(now - Game.lastShot < 100)
    return;
  Game.lastShot = now;
  if(Game.rapidFire || time > 500) {
    Game.projectiles.push({freq: Game.chargeNote, size: time/70, y:Game.freqToPos(Game.chargeNote) - 2, x:100});
  }
  Game.chargeNote = null;
};

Game.render = function(time) {
  Game.context.clearRect(0, 0, Game.canvas.width, Game.canvas.height);
  Game.context.font = "12px serif";
  var note;
  if(Game.state.indexOf("training") == 0) {
    for(var i = 0; i < Game.notes.length; i++) {
      note = Game.notes[i];
      if(note) {
        var x = (time - note.timestamp) / 500;
        x *= Game.canvas.width;
        var y = Game.freqToPos(note.frequency);
        Game.context.fillText(Math.floor(note.frequency), x, y);
      }
    }
  }
  else {
    Game.context.fillStyle = "rgba(20, 255, 20, 0.5)";
    Game.context.fillRect(0, Game.freqToPos(Game.averageFreq) - 2, 20, 5);
    Game.context.fillStyle = "black";
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

    if(Game.state != "endtrain") {
      target.x -= target.speed;
      if(target.x < 0) {
        Game.targets.splice(i, 1);
        i--;
        Game.missCount++;
      }
    }
  }
  Game.context.fillStyle = "black";

  Game.context.font = "48px serif";
  if(Game.state == "training1") {
    Game.context.fillText("Whistle the lowest note you can!", 100, 250)
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
      Game.changeState("endtrain");
    }
  }
  if(Game.state == "endtrain") {
    Game.context.fillText("Hit the target to start!", 150, 250);
  }
  if(Game.state == "infinite") {
    if(Math.random() * 1000 < 100) {
      Game.addTarget(Math.random() * 500 + 50);
    }
    Game.context.fillText("Endless mode!", 300, 100);
    Game.context.fillText("Thanks for playing :D", 100, 550);
  }
  if(Game.rapidFire) {
    Game.context.fillText("Rapid Fire!", 300, 50);
  }
  if(Game.state.indexOf("training") != 0) {
    Game.context.font = "24px serif";
    Game.context.fillText("Hit: " + Game.hitCount + " Miss: " + Game.missCount, 600, 550);
    Game.context.font = "48px serif";
    if(Game.shipPos < Game.targetShipPos) {
      if(Game.targetShipPos - Game.shipPos < Game.shipSpeed)
        Game.shipPos = Game.targetShipPos;
      else
        Game.shipPos += Game.shipSpeed;
    }
    if(Game.shipPos > Game.targetShipPos) {
      if(Game.shipPos - Game.targetShipPos < Game.shipSpeed)
        Game.shipPos = Game.targetShipPos;
      else
        Game.shipPos -= Game.shipSpeed;
    }
    Game.context.drawImage(images.SHIP, 0, Game.shipPos - 50);
  }

  
  if(Game.chargeNote && !Game.rapidFire) {
    if(Game.notes[Game.notes.length-1] && time - Game.notes[Game.notes.length-1].timestamp < 100) {
      if(Math.abs(Game.averageFreq - Game.chargeNote) < (Game.highestFreq - Game.lowestFreq) / 10) {
        Game.duration = time - Game.noteStart;
        if(Game.duration > 0) {
          Game.context.beginPath();
          Game.context.arc(100, Game.shipPos, Game.duration / 70, 0, Math.PI * 2);
          Game.context.closePath();
          Game.context.fill();
          Game.context.font = "12px serif";
          Game.context.fillText(Game.chargeNote, 75, Game.shipPos + 40);
        }
      }
      else {
        if(Game.chargeNote) {
          Game.stopCharge(Game.duration);
        }
        Game.startCharge();
      }
    }
    else {
      Game.stopCharge(Game.duration);
    }
    Game.targetShipPos = Game.freqToPos(Game.chargeNote);
  }
  else {
    Game.targetShipPos = Game.freqToPos(Game.averageFreq);
  }




  for(var i = 0; i < Game.projectiles.length; i++) {
    var bullet = Game.projectiles[i];
    bullet.x += 10;
    Game.context.fillRect(bullet.x - 20, bullet.y, 40, bullet.size);
    var hit = Game.checkForHit(bullet, bullet.x);
    if(hit) {
      Game.onTargetHit(hit, bullet);
      Game.projectiles.splice(i, 1);
      i--;
    }
  }


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
        if(Object.keys(Game.sequence).length == 0) {
          Game.sequence = null;
        }
      }
    }
  }
  if(Game.state.indexOf("train") == -1) {
    if(Game.targets.length == 0 && !Game.sequence) {
      Game.endRound();
    }
  }
  requestAnimationFrame(Game.render);
};
Game.addTarget = function(pos, health) {
  health = health || 10;
  var targ = {x: Game.canvas.width, y: pos, frequency: Game.posToFreq(pos),
    maxhealth: health, health: health, speed:1};
  Game.targets.push(targ);
};

window.Game = Game;

module.exports = Game;
