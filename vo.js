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
  return (x < .5 != y < .5) ? [1, 1, 1] : [0, 0, ];
}

function check2(x, y) {
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

function main() {
  init();

  const width = 300;
  const height = width;

  gen(scale(gs(check2), 8), width, height);
}

main();
