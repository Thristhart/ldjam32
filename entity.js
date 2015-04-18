var Entity = function(x, y) {
  this.construct(x, y);
};
Entity.prototype.construct = function(x, y) {
  this.x = x;
  this.y = y;
  this.sx = 0;
  this.sy = 0;
  this.lastFrameTime = 0;
  this.frameDuration = 100;
};

Entity.prototype.makePhysicsObj = function() {
  this.body = require('matter-js').Bodies.rectangle(this.x, this.y, 30, 30);
  return this.body;
};
Entity.prototype.customUpdate = function(context) {

};
Entity.prototype.onObject = function() {
  var pairs = gameContext.engine.pairs.list;
  for(var i = 0; i < pairs.length; i++) {
    if(pairs[i].activeContacts.length > 0) {
      if(pairs[i].bodyA == this.body && pairs[i].collision.normal.y < 0) {
        return true;
      }
      if(pairs[i].bodyB == this.body && pairs[i].collision.normal.y > 0) {
        return true;
      }
    }
  }
  return false;
};
Entity.prototype.update = function(context) {
  this.customUpdate(context);
  if(this.body) {
    this.x = this.body.position.x;
    this.y = this.body.position.y;
  }
  if(this.image) {
    context.drawImage(
      this.image,
      this.sx, this.sy, 30, 30,
      this.x - 15, this.y - 15, 30, 30
    );

    if(this.image.width > 30) {
      var now = Date.now();
      if(now - this.lastFrameTime > this.frameDuration) {
        this.lastFrameTime = now;
        this.sx += 30;
      }
    }
    if(this.sx >= this.image.width)
      this.sx = 0;
  }
  else {
    context.fillRect(this.x - 15, this.y - 15, 30, 30);
  }

};

module.exports = Entity;
