const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

function init() {
  ctx.fillStyle = "#9ea7b8";
  const h = parseInt(document.getElementById("myCanvas").getAttribute("height"));
  const w = parseInt(document.getElementById("myCanvas").getAttribute("width"));
  ctx.fillRect(0, 0, w, h);
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

function scale(f, s) {
  return function(x, y) {
    return f(s*x, s*y);
  }
}

function pixmul(a, b) {
  return [a[0]*b[0], a[1]*b[1], a[2]*b[2]];
}

function mul(fa, fb) {
  return function(x, y) {
    return pixmul(fa(x, y), fb(x, y));
  }
}

function rot(f, ang) {
  return function(x, y) {
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    const rx = c*x + s*y;
    const ry = -s*x + c*y;
    return f(rx, ry);
  }
}

function main() {
  init();

  const width = 300;
  const height = width;

  gen(rot(mul(coly, scale(gs(check), 8)), Math.PI/8), width, height);
}

main();
