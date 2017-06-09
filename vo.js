function gen(f, width, height) {
  const c = document.getElementById("myCanvas");
  const ctx = c.getContext("2d");
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
  return (x < .5 != y < .5) ? 1 : 0
}

function gs(f) {
  return function(x, y) {
    const gsv = f(x, y);
    return [gsv, gsv, gsv]
  }
}

function main() {
  //gen(coly, 300, 300);
  //gen(check, 300, 300);
  gen(gs(check2), 300, 300);
}

main();
