const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const fps = 20;

function init() {
  ctx.fillStyle = "#9ea7b8";
  const h = parseInt(document.getElementById("myCanvas").getAttribute("height"));
  const w = parseInt(document.getElementById("myCanvas").getAttribute("width"));
  ctx.fillRect(0, 0, w, h);
}

var startTime = null;
function time() {
  const now = new Date().getTime();
  if (startTime == null) {
    startTime = now;
  }
  return (now - startTime) / 1000;
}

function gen(f, width, height) {
  const imgData = ctx.createImageData(width, height);
  for (var x = 0; x < width; x++) {
    for (var y = 0; y < width; y++) {
      const pix = f(x/width, y/height);
      const offset = (y*width+x)*4;
      imgData.data[offset+0] = pix[0] * 255;
      imgData.data[offset+1] = pix[1] * 255;
      imgData.data[offset+2] = pix[2] * 255;
      imgData.data[offset+3] = 255;
    }
  }
  return imgData;
}

function show(f, width, height) {
  const imgData = gen(f, width, height);
  ctx.putImageData(imgData, 10, 10);
}

var paused = false;
var pausedCBs = [];
function setupPause() {
  $(document).keypress(function(e) {
    console.log(e.keyCode);
    if (e.keyCode == 32) {
      paused = !paused;
      if (!paused) {
        _.map(pausedCBs, (cb) => setTimeout(cb));
        pausedCBs = [];
      }
    }
    return false;
  });
}

function setTimeoutOrPause(cb) {
  if (paused) {
    pausedCBs.push(cb);
  } else {
    setTimeout(cb);
  }
}

function anim(tf, width, height) {
  show(tf(time()), width, height);
  setTimeoutOrPause(() => anim(tf, width, height), 1000 * (1.0 / fps));
}

function feedback(f, ftr, width, height) {
  show(f, width, height);
  const im = gen(f, width, height);
  f = ftr(imgfun(im, width, height), time());
  setTimeoutOrPause(() => feedback(f, ftr, width, height));
}

const coly = (x, y) => [x, y, x*y]

const gs = (f) => (x, y) => {
  const gsv = f(x, y);
  return [gsv, gsv, gsv];
}

const check = gs((x, y) => ((Math.floor(x)%2)==0) != ((Math.floor(y)%2)==0) ? 1 : 0)

const coordtrans = (f, cf) => (x, y) => {
  const txy = cf(x, y);
  return f(txy[0], txy[1]);
}

const coordtranso = (f, cf) => coordtrans(f, (x, y) => [cf(x), cf(y)])

const scale = (f, s) => coordtranso(f, (x) => s*x)

const  pixadd = (a, b) => [a[0]+b[0], a[1]+b[1], a[2]+b[2]]

const pixmul = (a, b) => [a[0]*b[0], a[1]*b[1], a[2]*b[2]]

const pixscale = (a, s) => [a[0]*s, a[1]*s, a[2]*s]

const mul = (fa, fb) => (x, y) => pixmul(fa(x, y), fb(x, y))

const rotxy = (ang, x, y) => {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const rx = c*x + s*y;
  const ry = -s*x + c*y;
  return [rx, ry];
}

const rot = (f, ang) => coordtrans(f, (x, y) => rotxy(ang, x, y))

const lenvec2 = (x, y) => Math.sqrt(x*x + y*y)

const swirl = (f, rm) => coordtrans(f, (x, y) => rotxy(lenvec2(x, y)*rm, x, y))

const trans = (f, dx, dy) => coordtrans(f, (x, y) => [x+dx, y+dy])

const col4list = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [0, 1, 1]
];
const col4 = trans(scale((x, y) => col4list[(x<0?1:0)*2 + (y<0?1:0)], .5), -.5, -.5)

function aa(f, width, height) {
  const halfpixx = 1/width;
  const halfpixy = 1/height;
  return function(x, y) {
    return pixscale(
      pixadd(
        pixadd(f(x-halfpixx, y-halfpixy), f(x+halfpixx, y-halfpixy)),
        pixadd(f(x+halfpixx, y+halfpixy), f(x-halfpixx, y+halfpixy))),
      .25);
  }
}

const hsplice = (a, b) => (x, y) => (y > 0 ? a : b)(x, y)

const imgfun = (imgData, width, height) => (x, y) => {
  if (x < 0 || x>= 1 || y < 0 || y >= 1) {
    return [0, 0, 0];
  }
  const ix = Math.floor(x*width);
  const iy = Math.floor(y*height);
  const offset = (iy * width + ix) * 4;
  return [
    imgData.data[offset+0],
    imgData.data[offset+1],
    imgData.data[offset+2]];
}

function main() {
  init();
  setupPause();

  const width = 300;
  const height = width;

  var f = scale(check, 8);
  f = mul(f, coly);
  f = swirl(f, 1);
  f = scale(f, 2);
  f = trans(f, -.5, -.5);
  //f = aa(f, width, height);

  //f = scale(check, 4);
  var f2 = rot(scale(check, 4), Math.PI/8);
  f = hsplice(f, f2);
  f = trans(f, -.5, -.5);
  //f = rot(f, Math.PI/4);

  f = col4;
  //f = coordtrans(f, (x, y) => [x, y+.125*Math.cos(x*Math.PI*4)])
  //f = coordtrans(f, (x, y) => [x+.125*Math.cos(y*Math.PI*4), y])
  //f = coordtrans(f, (x, y) => [x+.125*Math.cos(y*Math.PI*4), y+.125*Math.cos(x*Math.PI*4)])
  show(f, width, height);

  const whoa = (f, t) => trans(rot(trans(f, .5, .5), Math.PI/17*(1+t/5)), -.5, -.5);
  //whoa = (f) => rot(f, Math.PI/16)
  feedback(col4, whoa, width, height);

  //const a = (t) => trans(hsplice(rot(scale(check, 4), t), rot(scale(check, 7), -2*t)), -.5, -.5)
  //const a = (t) => trans(rot(trans(f, .5, .5), t), -.5, -.5);
  // sloshy
  //a = (t) => coordtrans(f, (x, y) => [x+Math.sin(t*6)*.125*Math.cos(y*Math.PI*4), y+Math.cos(t*5)*.125*Math.cos(x*Math.PI*4)])
  //anim(a, width, height);
}

main();
