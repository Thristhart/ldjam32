var inherits = require('util').inherits;
var InputManager = require('./input.js');
var Matter = require('matter-js');

var images = require('./images.js');

var Player = function(x, y) {
  this.construct(x, y);
  this.image = images.PLAYER_RUN;
  this.speed = 2;
  this.left = false;
};
inherits(Player, require('./entity.js'));

Player.prototype.makePhysicsObj = function() {
  this.body = Matter.Bodies.rectangle(this.x, this.y, 30, 30);
  this.body.friction = 0;
  return this.body;
};
Player.prototype.customUpdate = function(context) {
  var vx = this.body.velocity.x;
  var vy = this.body.velocity.y;
  var onGround = this.onObject();
  if(InputManager.up) {
    if(onGround) {
      Matter.Body.applyForce(this.body, this.body.position, {x: 0, y: -0.03});
    }
  }
  if(InputManager.left) {
    this.image = images.PLAYER_RUN_LEFT;
    this.left = true;
    Matter.Body.setVelocity(this.body, {x: -this.speed, y: vy});
  }
  else if(InputManager.right) {
    this.image = images.PLAYER_RUN;
    this.left = false;
    Matter.Body.setVelocity(this.body, {x: this.speed, y: vy});
  }
  else {
    if(vx > 0) {
      this.image = images.PLAYER_SLIDE;
    }
    if(vx < 0) {
      this.image = images.PLAYER_SLIDE_LEFT;
    }
    if(Math.abs(vx) < 0.5) {
      vx = 0;
      Matter.Body.setVelocity(this.body, {x: vx, y: vy});
    }
    if(vx == 0) {
      if(this.left)
        this.image = images.PLAYER_IDLE_LEFT;
      else
        this.image = images.PLAYER_IDLE;
    }
  }

  if(!onGround) {
    if(this.left)
      this.image = images.PLAYER_JUMP_LEFT;
    else
      this.image = images.PLAYER_JUMP;
  }

  Matter.Body.setAngularVelocity(this.body, 0)
};

module.exports = Player;
