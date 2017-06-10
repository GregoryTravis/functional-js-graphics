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
  ctx.putImageData(imgData, 10, 10);
}

function anim(tf, width, height) {
  gen(tf(time()), width, height);
  setTimeout(() => anim(tf, width, height), 1000 * (1.0 / fps));
}

function coly(x, y) {
  return [x, y, x*y];
}

function check(x, y) {
  return ((Math.floor(x)%2)==0) != ((Math.floor(y)%2)==0) ? 1 : 0;
}

function gs(f) {
  return function(x, y) {
    const gsv = f(x, y);
    return [gsv, gsv, gsv];
  }
}

function coordtrans(f, cf) {
  return function(x, y) {
    const txy = cf(x, y);
    return f(txy[0], txy[1]);
  }
}

function coordtranso(f, cf) {
  return coordtrans(f, (x, y) => [cf(x), cf(y)]);
}

function scale(f, s) {
  return coordtranso(f, (x) => s*x)
}

function pixadd(a, b) {
  return [a[0]+b[0], a[1]+b[1], a[2]+b[2]];
}

function pixmul(a, b) {
  return [a[0]*b[0], a[1]*b[1], a[2]*b[2]];
}

function pixscale(a, s) {
  return [a[0]*s, a[1]*s, a[2]*s];
}

function mul(fa, fb) {
  return function(x, y) {
    return pixmul(fa(x, y), fb(x, y));
  }
}

const rotxy = (ang, x, y) => {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const rx = c*x + s*y;
  const ry = -s*x + c*y;
  return [rx, ry];
}

const rot = (f, ang) => coordtrans(f, (ang) => rotxy(ang, x, y))

const lenvec2 = (x, y) => Math.sqrt(x*x + y*y)

const swirl = (f, rm) => coordtrans(f, (x, y) => rotxy(lenvec2(x, y)*rm, x, y))

const trans = (f, dx, dy) => coordtrans(f, (x, y) => [x+dx, y+dy])

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

function main() {
  init();

  const width = 300;
  const height = width;

  //anim((t) => rot(mul(coly, scale(gs(check), 8)), t*.25*Math.PI), width, height);
  //gen(rot(mul(coly, scale(gs(check), 8)), Math.PI/8), width, height);

  var f = scale(gs(check), 8);
  f = swirl(f, 1);
  f = scale(f, 2);
  f = trans(f, -.5, -.5);
  //f = aa(f, width, height);

  gen(f, width, height);
}

main();
