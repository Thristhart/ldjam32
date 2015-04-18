var i = {};
i.byPath = {};
function loadImage(path) {
  var img = document.createElement("img");
  img.src = path;
  i.byPath[path] = img;
  return img;
}
i.PLAYER_RUN = loadImage("./assets/playerchar_run.png");
i.PLAYER_RUN_LEFT = loadImage("./assets/playerchar_run_left.png");
i.PLAYER_SLIDE = loadImage("./assets/playerchar_slide.png");
i.PLAYER_SLIDE_LEFT = loadImage("./assets/playerchar_slide_left.png");
i.PLAYER_IDLE = loadImage("./assets/playerchar_idle.png");
i.PLAYER_IDLE_LEFT = loadImage("./assets/playerchar_idle_left.png");
i.PLAYER_JUMP = loadImage("./assets/playerchar_jump.png");
i.PLAYER_JUMP_LEFT = loadImage("./assets/playerchar_jump_left.png");

module.exports = i;
