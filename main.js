var WIDTH  = 1024;
var HEIGHT = 800;
var SPEED = 3;

var cloud = null;

var CloudGenerator = function (width, height) {
  this.width = width;
  this.height = height;

  // create canvas
  this.canvas = document.createElement('canvas');
  this.canvas.width = width;
  this.canvas.height = height;
  if (window.navigator.userAgent.toLowerCase().indexOf('trident') === -1) {
    try {
      this.fxCanvas = fx.canvas();
      this._texture = this.fxCanvas.texture(this.canvas);
    } catch (e) {
      console.log(e);
    }
  }

  this.context = this.canvas.getContext('2d');
  this.context.globalCompositeOperation = 'copy';

  this.octaves = 7;
  this.persistence = 0.6;

  this._time = height;
}

CloudGenerator.prototype.getCanvas = function () {
  return this.fxCanvas || this.canvas;
}

CloudGenerator.prototype.draw = function (sx, sy, w, h, offsetX, offsetY) {
  if (offsetX === undefined) offsetX = 0;
  if (offsetY === undefined) offsetY = 0;

  var image = this.context.getImageData(sx, sy, w, h);

  for (var x = 0; x < w; x++) {
    for (var y = 0; y < h; y++) {
      var cell = (x + y * image.width) * 4;
      var value = noise.octavePerlin2(x + offsetX, y + offsetY, this.octaves, this.persistence);
      value = Math.min((value * 255) * Math.log(value * 400), 255);
      image.data[cell] = image.data[cell + 1] = image.data[cell + 2] = 255;
      image.data[cell + 3] = value;
    }
  }

  this.context.putImageData(image, sx, sy);
  this.fx();
}

CloudGenerator.prototype.move = function (speed) {
  this.context.drawImage(
    this.canvas,
    0, speed, this.width, this.height - speed,
    0, 0, this.width, this.height - speed
  );

  this.draw(0, this.height - speed, WIDTH, speed, 0, this._time);
  this._time += speed;
}

CloudGenerator.prototype.fx = function () {
  if (this.fxCanvas) {
    this._texture.loadContentsOf(this.canvas);
    this.fxCanvas.draw(this._texture).zoomBlur(this.width / 2, this.height * 0.8, 0.02).update();
  }
}


document.addEventListener('DOMContentLoaded', function () {
  noise.seed(Math.random());

  // Background
  var canvasBackground = document.getElementById('bg');
  canvasBackground.width = WIDTH;
  canvasBackground.height = HEIGHT;
  drawGradation(canvasBackground);

  // Cloud
  cloud = new CloudGenerator(WIDTH, HEIGHT);
  cloud.draw(0, 0, WIDTH, HEIGHT);
  
  var container = document.getElementById('sky-container');
  container.appendChild(cloud.getCanvas());

  requestAnimationFrame(drawFrame);
});

function drawGradation (canvas) {
  var ctx = canvas.getContext('2d');

  var gradient = ctx.createRadialGradient(
    WIDTH / 2, HEIGHT, 0,
    WIDTH / 2, HEIGHT * 0.8, HEIGHT * 0.85
  );
  ctx.beginPath();
  gradient.addColorStop(1.00 , '#5C3048');
  gradient.addColorStop(0.95 , '#6E3D76');
  gradient.addColorStop(0.70 , '#895083');
  gradient.addColorStop(0.45 , '#B5A8AD');
  gradient.addColorStop(0.25 , '#E5D1D0');
  gradient.addColorStop(0.15 , '#F1F1ED');
  gradient.addColorStop(0.00 , '#FFFFFF');
  ctx.fillStyle = gradient;
  ctx.rect(0, 0, WIDTH, HEIGHT);
  ctx.fill();
}

function drawFrame() {
  cloud.move(SPEED);
  setTimeout(drawFrame, 20);
}
