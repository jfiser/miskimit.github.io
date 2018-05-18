// Backgound image from Windows Glaciers panoramic theme
// Perito Moreno Glacier, Los Glaciares National Park, Patagonia, Argentina

// Animation based on Diaco's particle demos
// https://codepen.io/MAW/pen/KdmwMb
// https://codepen.io/MAW/pen/pvyoQL
// https://codepen.io/MAW/pen/MYywaw

var baseURL = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/106114/";

var w = window.innerWidth;
var h = window.innerHeight;

var rad = Math.PI / 180;

var size = { x: 1920, y: 980 };

var total = 12000;
var snowflakes = [];

var linear = Linear.easeNone;
var sine = Sine.easeInOut;

var resize = debounce(resizeScene, 100);

var sprites = new PIXI.ParticleContainer(total, {
  scale: true,
  position: true,
  rotation: false,
  uvs: false,
  alpha: false
});

var app = new PIXI.Application(w, h, {
  view: document.querySelector("canvas"),
  backgroundColor: 0x111111,
  autoStart: false
});

var loader = new PIXI.loaders.Loader(baseURL)
  .add("snowflake", "snowflake1.png?v=1")
  .add("glacier", "glacier.jpg?v=1")
  .load(init);

var stage = app.stage;
var glacier = new PIXI.Sprite();

stage.alpha = 0;
stage.addChild(glacier);
stage.addChild(sprites);

//
// INIT
// ===========================================================================
function init(loader, assets) {
  glacier.texture = assets.glacier.texture;

  for (var i = 0; i < total; i++) {
    var snowflake = new PIXI.Sprite(assets.snowflake.texture);

    snowflake.anchor.set(0.5);
    snowflake.scale.set(random(0.15, 1.05));

    snowflakes.push(snowflake);
    sprites.addChild(snowflake);
  }

  window.addEventListener("resize", resize);
  resize();

  app.start();

  TweenLite.to(stage, 1, { alpha: 1, delay: 0.25 });
}

//
// ANIMATE SNOWFLAKE
// ===========================================================================
function animateSnowflake(snowflake) {
  TweenMax.to(snowflake, random(1, 10), {
    x: "-=200",
    repeat: -1,
    yoyo: true,
    ease: sine
  });
  TweenMax.to(snowflake, random(1, 8), {
    y: h + 100,
    ease: linear,
    repeat: -1,
    delay: -15
  });
}

//
// RESIZE SCENE
// ===========================================================================
function resizeScene() {
  w = window.innerWidth;
  h = window.innerHeight;

  var ratio = Math.max(w / size.x, h / size.y);

  app.renderer.resize(w, h);

  glacier.scale.set(ratio);

  for (var i = 0; i < total; i++) {
    var snowflake = snowflakes[i];

    TweenLite.killTweensOf(snowflake);

    var x = random(-200, w + 200);
    var y = random(-200, -150);

    snowflake.position.set(x, y);

    animateSnowflake(snowflake);
  }
}

//
// DEBOUNCE
// ===========================================================================
function debounce(callback, time) {
  var timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(callback, time);
  };
}

//
// RANDOM
// ===========================================================================
function random(min, max) {
  if (max == null) {
    max = min;
    min = 0;
  }
  if (min > max) {
    var tmp = min;
    min = max;
    max = tmp;
  }
  return min + (max - min) * Math.random();
}
