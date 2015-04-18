var canvas;
var context;

var Matter = require('matter-js');
var Player = require('./player.js');

var physOpts = {};

var engine = Matter.Engine.create(null, physOpts);
var world = engine.world;

var InputManager = require('./input.js');

var ents = [];

window.addEventListener("load", function() {
  canvas = document.getElementById("display");
  context = canvas.getContext("2d");
  context.imageSmoothingEnabled = false;
  gameContext.context = context;

  setup();
  updateLoop(performance.now());
});

function addEnt(ent) {
  Matter.World.add(world, ent.makePhysicsObj());
  ents.push(ent);
}

var alivePlayer;
function setup() {
  var ground = Matter.Bodies.rectangle(canvas.width/2, canvas.height + 40, canvas.width, 80, {isStatic: true});
  Matter.World.add(engine.world, ground);

  alivePlayer = new Player(50, 50);
  addEnt(alivePlayer);

  InputManager.setup();
}

var lastFrameTime = performance.now();
function updateLoop(now) {
  var delta = now - lastFrameTime;
  if(delta > 33)
    delta = 33;
  context.clearRect(0, 0, canvas.width, canvas.height);
  Matter.Engine.update(engine, delta);
  for(var i = 0; i < ents.length; i++) {
    ents[i].update(context);
  }
  lastFrameTime = now;
  requestAnimationFrame(updateLoop);
}

window.gameContext = this;
this.alivePlayer = alivePlayer;
this.ents = ents;
this.engine = engine;
this.Matter = Matter;
