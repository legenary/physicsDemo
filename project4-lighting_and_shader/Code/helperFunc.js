// for camera
var posCam = new Vector4();
var posLook = new Vector4();
var upVec = new Vector4();
var cam2look = new Vector4();
var uu = new Vector4();
var vv = new Vector4();
var ww = new Vector4();
// for cam nav
var rotMatrix = new Matrix4();
var rotVelocity = 1.5, transVelocity = 0.4;

// for mouse
var isDrag = false;
var xMclik = 0.0, yMclik = 0.0, xMdrag = 0, xMdrag = 0;
var xMdragTot = 0.0, yMdragTot = 0.0;
var qNew = new Quaternion(0,0,0,1);
var qTot = new Quaternion(0,0,0,1);
var quatMatrix = new Matrix4();

var slider_I_ambi_r = document.getElementById("I_ambi_r");
var slider_I_ambi_g = document.getElementById("I_ambi_g");
var slider_I_ambi_b = document.getElementById("I_ambi_b");
var slider_I_diff_r = document.getElementById("I_diff_r");
var slider_I_diff_g = document.getElementById("I_diff_g");
var slider_I_diff_b = document.getElementById("I_diff_b");
var slider_I_spec_r = document.getElementById("I_spec_r");
var slider_I_spec_g = document.getElementById("I_spec_g");
var slider_I_spec_b = document.getElementById("I_spec_b");

function initCam(){
  posCam.setValue(30, 30, 30, 1);
  posLook.setValue(0, 0, 2, 1);
  upVec.setValue(0, 0, 1, 1);
}
function initInput(){
  canvas.onmousedown  = function(ev){myMouseDown( ev, gl, canvas) };
  canvas.onmousemove =  function(ev){myMouseMove( ev, gl, canvas) };
  canvas.onmouseup =    function(ev){myMouseUp(   ev, gl, canvas)};
  window.addEventListener("keydown", myKeyDown, false);
  window.addEventListener("keyup", myKeyUp, false);
  window.addEventListener("keypress", myKeyPress, false);
  slider_I_ambi_r.addEventListener("input", mySlider, false)
  slider_I_ambi_g.addEventListener("input", mySlider, false)
  slider_I_ambi_b.addEventListener("input", mySlider, false)
  slider_I_diff_r.addEventListener("input", mySlider, false)
  slider_I_diff_g.addEventListener("input", mySlider, false)
  slider_I_diff_b.addEventListener("input", mySlider, false)
  slider_I_spec_r.addEventListener("input", mySlider, false)
  slider_I_spec_g.addEventListener("input", mySlider, false)
  slider_I_spec_b.addEventListener("input", mySlider, false)
}
function updateLight(gl, shader){
  shader.u_LampHead = shader.u_LampHead.setLight(optLight, LIGHT_HEAD);
  shader.u_LampPoint = shader.u_LampPoint.setLight(optLight, LIGHT_POINT);

  gl.uniform3f(shader.u_LampHead.uI_pos, posCam.elements[0],
                                         posCam.elements[1],
                                         posCam.elements[2]);

  gl.uniform3f(shader.u_LampPoint.uI_pos, 5.0, 5.0, lightHeight);

  gl.uniform3fv(shader.u_LampHead.uI_ambi, shader.u_LampHead.I_ambi.slice(0,3));
  gl.uniform3fv(shader.u_LampHead.uI_diff, shader.u_LampHead.I_diff.slice(0,3));
  gl.uniform3fv(shader.u_LampHead.uI_spec, shader.u_LampHead.I_spec.slice(0,3));
  gl.uniform3fv(shader.u_LampPoint.uI_ambi, shader.u_LampPoint.I_ambi.slice(0,3));
  gl.uniform3fv(shader.u_LampPoint.uI_diff, shader.u_LampPoint.I_diff.slice(0,3));
  gl.uniform3fv(shader.u_LampPoint.uI_spec, shader.u_LampPoint.I_spec.slice(0,3));

  gl.uniform1i(shader.u_PHONG, isPHONG);
  gl.uniform1f(shader.u_ATT, ATT);
}
function updateMaterial(gl, shader, numMatl){
  shader.u_MatlSet = shader.u_MatlSet.setMatl(numMatl);
  gl.uniform3fv(shader.u_MatlSet.uK_emit, shader.u_MatlSet.K_emit.slice(0,3));
  gl.uniform3fv(shader.u_MatlSet.uK_ambi, shader.u_MatlSet.K_ambi.slice(0,3));
  gl.uniform3fv(shader.u_MatlSet.uK_diff, shader.u_MatlSet.K_diff.slice(0,3));
  gl.uniform3fv(shader.u_MatlSet.uK_spec, shader.u_MatlSet.K_spec.slice(0,3));
  gl.uniform1i(shader.u_MatlSet.uK_shiny, parseInt(shader.u_MatlSet.K_shiny, 10));
}

function initVBOContent() {
  makeAxes();
  makeGroundGrid();
  makeBase();
  makeBar();
  makeHead();
  makeCube();
  makeOcthedron();
  makeSphere();

  var mySiz = gndVerts.length + cubeVerts.length + octVerts.length + sphVerts.length + baseVerts.length
        + headVerts.length + barVerts.length + axVerts.length;
  var nn = mySiz / floatsPerVertex;

  // initialize a giant array for shapes and colors (and potentially surface normal)
  var colorShapes = new Float32Array(mySiz);
  axStart = 0;
  for(var i=0,j=0; j< axVerts.length; i++,j++) {
    colorShapes[i] = axVerts[j];
    }
  gndStart = i;
  for(j=0; j< gndVerts.length; i++,j++) {
    colorShapes[i] = gndVerts[j];
    }
  baseStart = i;
  for(j=0; j<baseVerts.length; i++,j++) {
    colorShapes[i] = baseVerts[j];
  }
  barStart = i;
  for(j=0; j<barVerts.length; i++,j++) {
    colorShapes[i] = barVerts[j];
  }
  headStart = i;
  for(j=0; j<headVerts.length; i++,j++) {
    colorShapes[i] = headVerts[j];
  }
  cubeStart = i;
  for(j=0; j<cubeVerts.length; i++,j++) {
    colorShapes[i] = cubeVerts[j];
  }
  octStart = i;
  for(j=0; j<octVerts.length; i++,j++) {
    colorShapes[i] = octVerts[j];
  }
  sphStart = i;
  for(j=0; j<sphVerts.length; i++,j++) {
    colorShapes[i] = sphVerts[j];
  }
  return colorShapes;
}

function makeAxes(){
  var len = 5;
  axVerts = new Float32Array([
    len,0,0,1, 1,0,0, 0,0,1,
    0,0,0,1, 1,0,0, 0,0,1,                  // x
    0,0,0,1, 0,1,0, 0,0,1,
    0,len,0,1, 0,1,0, 0,0,1,                  // y
    0,0,0,1, 0,0,1, 0,0,1,
    0,0,len,1, 0,0,1, 0,0,1                   // z
  ])
}

function makeBase(){
  var a = 2.5, b = 2.5, h = 0.5;
  var rr = 0.7, gg = 0.7, bb = 0.7;
  baseVerts = new Float32Array([
    a,-b,h,1,   rr,gg,bb,  a,b,h,1,    rr,gg,bb,
    -a,-b,h,1,  rr,gg,bb,  -a,b,h,1,   rr,gg,bb,
    -a,b,h,1,   rr,gg,bb,  -a,b,-h,1,  rr,gg,bb,
    -a,-b,h,1,  rr,gg,bb,  -a,-b,-h,1, rr,gg,bb,
    a,-b,h,1,   rr,gg,bb,  a,-b,-h,1,  rr,gg,bb,
    a,b,h,1,    rr,gg,bb,  a,b,-h,1,   rr,gg,bb,
    -a,b,h,1,   rr,gg,bb,  -a,b,-h,1,  rr,gg,bb,
    -a,b,-h,1,  rr,gg,bb,  a,b,-h,1,   rr,gg,bb,
    -a,-b,-h,1, rr,gg,bb,  a,-b,-h,1,  rr,gg,bb // surfaces
  ]);
  baseVerts = addNormal(strip2sequence(baseVerts));
}
function makeBar(){
  var a = 0.5, b = 0.5, h = 2.5;
  var rr = 0.7, gg = 0.7, bb = 0.7;
  barVerts = new Float32Array([
    a,-b,h,1,   rr,gg,bb,  a,b,h,1,    rr,gg,bb,
    -a,-b,h,1,  rr,gg,bb,  -a,b,h,1,   rr,gg,bb,
    -a,b,h,1,   rr,gg,bb,  -a,b,-h,1,  rr,gg,bb,
    -a,-b,h,1,  rr,gg,bb,  -a,-b,-h,1, rr,gg,bb,
    a,-b,h,1,   rr,gg,bb,  a,-b,-h,1,  rr,gg,bb,
    a,b,h,1,    rr,gg,bb,  a,b,-h,1,   rr,gg,bb,
    -a,b,h,1,   rr,gg,bb,  -a,b,-h,1,  rr,gg,bb,
    -a,b,-h,1,  rr,gg,bb,  a,b,-h,1,   rr,gg,bb,
    -a,-b,-h,1, rr,gg,bb,  a,-b,-h,1,  rr,gg,bb // surfaces
  ]);
  barVerts = addNormal(strip2sequence(barVerts));
}
function makeHead(){
  var rrr = 2.5, r = 1.5, d = 1.5;
  var rr = 0.7, gg = 0.7, bb = 0.7;
  var v = 0, j = 0;
  var capVerts = 30;

  headVerts = new Float32Array((capVerts*6+4) * floatsPerVertex);
  // smaller cap
  for (v=0; v<=2*capVerts; v++,j+=floatsPerVertex){
    if (v%2==0) {
      headVerts[j   ] = r*Math.cos(Math.PI*(v)/capVerts);
      headVerts[j+1 ] = r*Math.sin(Math.PI*(v)/capVerts);
      headVerts[j+2 ] = -d;
      headVerts[j+3 ] = 1;
      headVerts[j+4 ] = rr;
      headVerts[j+5 ] = gg;
      headVerts[j+6 ] = bb;
      headVerts[j+7 ] = 0;
      headVerts[j+8 ] = 0;
      headVerts[j+9 ] = -1;
    } else {
      headVerts[j   ] = 0;
      headVerts[j+1 ] = 0;
      headVerts[j+2 ] = -d;
      headVerts[j+3 ] = 1;
      headVerts[j+4 ] = rr;
      headVerts[j+5 ] = gg;
      headVerts[j+6 ] = bb;
      headVerts[j+7 ] = 0;
      headVerts[j+8 ] = 0;
      headVerts[j+9 ] = -1;
    }
  }
  //Side
  for (v=0; v<=2*capVerts+1; v++,j+=floatsPerVertex){
    if (v%2==0) {
      headVerts[j   ] = r*Math.cos(Math.PI*(v)/capVerts);
      headVerts[j+1 ] = r*Math.sin(Math.PI*(v)/capVerts);
      headVerts[j+2 ] = -d;
      headVerts[j+3 ] = 1;
      headVerts[j+4 ] = rr;
      headVerts[j+5 ] = gg;
      headVerts[j+6 ] = bb;
      headVerts[j+7 ] = headVerts[j   ];
      headVerts[j+8 ] = headVerts[j+1 ];
      headVerts[j+9 ] = 0;
    } else {
      headVerts[j   ] = rrr*Math.cos(Math.PI*(v-1)/capVerts);
      headVerts[j+1 ] = rrr*Math.sin(Math.PI*(v-1)/capVerts);
      headVerts[j+2 ] = d;
      headVerts[j+3 ] = 1;
      headVerts[j+4 ] = rr;
      headVerts[j+5 ] = gg;
      headVerts[j+6 ] = bb;
      headVerts[j+7 ] = headVerts[j   ];
      headVerts[j+8 ] = headVerts[j+1 ];
      headVerts[j+9 ] = 0;
    }
  }
  // bigger cap
  for (v=0; v<=2*capVerts; v++,j+=floatsPerVertex){
    if (v%2==0) {
      headVerts[j   ] = rrr*Math.cos(Math.PI*(v)/capVerts);
      headVerts[j+1 ] = rrr*Math.sin(Math.PI*(v)/capVerts);
      headVerts[j+2 ] = d;
      headVerts[j+3 ] = 1;
      headVerts[j+4 ] = 1;
      headVerts[j+5 ] = 1;
      headVerts[j+6 ] = 1;
      headVerts[j+7 ] = 0;
      headVerts[j+8 ] = 0;
      headVerts[j+9 ] = 1;
    } else {
      headVerts[j   ] = 0;
      headVerts[j+1 ] = 0;
      headVerts[j+2 ] = d;
      headVerts[j+3 ] = 1;
      headVerts[j+4 ] = 1;
      headVerts[j+5 ] = 1;
      headVerts[j+6 ] = 0;
      headVerts[j+7 ] = 0;
      headVerts[j+8 ] = 0;
      headVerts[j+9 ] = 1;
    }
  }
  headVerts = strip2sequence10(headVerts);
}
function makeGroundGrid(){

  var xcount = 100;     // # of lines to draw in x,y to make the grid.
  var ycount = 100;
  var xymax = 50.0;     // grid size; extends to cover +/-xymax in x and y.
  var xColr = new Float32Array([1.0, 1.0, 0.3]);  // bright yellow
  var yColr = new Float32Array([0.5, 1.0, 0.5]);  // bright green.

  gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
  var xgap = xymax/(xcount-1);    // HALF-spacing between lines in x,y;
  var ygap = xymax/(ycount-1);    // (why half? because v==(0line number/2))

  // First, step thru x values as we make vertical lines of constant-x:
  for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
    if(v%2==0) {  // put even-numbered vertices at (xnow, -xymax, 0)
      gndVerts[j  ] = -xymax + (v  )*xgap;  // x
      gndVerts[j+1] = -xymax;               // y
      gndVerts[j+2] = 0.0;                  // z
      gndVerts[j+3] = 1.0;                  // w.
    }
    else {        // put odd-numbered vertices at (xnow, +xymax, 0).
      gndVerts[j  ] = -xymax + (v-1)*xgap;  // x
      gndVerts[j+1] = xymax;                // y
      gndVerts[j+2] = 0.0;                  // z
      gndVerts[j+3] = 1.0;                  // w.
    }
    gndVerts[j+4] = xColr[0];     // red
    gndVerts[j+5] = xColr[1];     // grn
    gndVerts[j+6] = xColr[2];     // blu
    gndVerts[j+7] = 0;
    gndVerts[j+8] = 0;
    gndVerts[j+9] = 1;
  }
  // Second, step thru y values as wqe make horizontal lines of constant-y:
  // (don't re-initialize j--we're adding more vertices to the array)
  for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
    if(v%2==0) {    // put even-numbered vertices at (-xymax, ynow, 0)
      gndVerts[j  ] = -xymax;               // x
      gndVerts[j+1] = -xymax + (v  )*ygap;  // y
      gndVerts[j+2] = 0.0;                  // z
      gndVerts[j+3] = 1.0;                  // w.
    }
    else {          // put odd-numbered vertices at (+xymax, ynow, 0).
      gndVerts[j  ] = xymax;                // x
      gndVerts[j+1] = -xymax + (v-1)*ygap;  // y
      gndVerts[j+2] = 0.0;                  // z
      gndVerts[j+3] = 1.0;                  // w.
    }
    gndVerts[j+4] = yColr[0];     // red
    gndVerts[j+5] = yColr[1];     // grn
    gndVerts[j+6] = yColr[2];     // blu
    gndVerts[j+7] = 0;
    gndVerts[j+8] = 0;
    gndVerts[j+9] = 1;
  }
}
function makeCube(){
  var a = 2, b = 2, h = 2;
  var rr1 = 118/255, gg1 = 93/255, bb1 = 160/255;
  var rr2 = 144/255, gg2 = 238/255, bb2 = 144/255;
  var rr3 = 1,      gg3 = 165/255, bb3 = 0;
  cubeVerts = new Float32Array([
    a,-b,h,1,   rr3,gg3,bb3,  a,b,h,1,    rr3,gg3,bb3,
    -a,-b,h,1,  rr3,gg3,bb3,  -a,b,h,1,   rr3,gg3,bb3,
    -a,b,h,1,   rr1,gg1,bb1,  -a,b,-h,1,  rr1,gg1,bb1,
    -a,-b,h,1,  rr1,gg1,bb1,  -a,-b,-h,1, rr1,gg1,bb1,
    a,-b,h,1,   rr2,gg2,bb2,  a,-b,-h,1,  rr2,gg2,bb2,
    a,b,h,1,    rr2,gg2,bb2,  a,b,-h,1,   rr2,gg2,bb2,
    -a,b,h,1,   rr1,gg1,bb1,  -a,b,-h,1,  rr1,gg1,bb1,
    -a,b,-h,1,  rr3,gg3,bb3,  a,b,-h,1,   rr3,gg3,bb3,
    -a,-b,-h,1, rr3,gg3,bb3,  a,-b,-h,1,  rr3,gg3,bb3 // surfaces
  ]);
  cubeVerts = addNormal(strip2sequence(cubeVerts));
}
function makeOcthedron(){
  var a = 2, h = 1.3;
  var rr1 = 30/255, gg1 = 144/255, bb1 = 255/255;  // light blue
  // var rr2 = 30/255,  gg2 = 30/255,  bb2 = 195/255; //dark blue
  var rr2 = 30/255, gg2 = 144/255, bb2 = 255/255;  // light blue

  octVerts = new Float32Array([
    0,0,-h*a,1, rr2,gg2,bb2, a,a,0,1, rr2,gg2,bb2,
    0,0,-h*a,1, rr2,gg2,bb2, a,-a,0,1, rr2,gg2,bb2,
    0,0,-h*a,1, rr2,gg2,bb2, -a,-a,0,1, rr2,gg2,bb2,
    0,0,-h*a,1, rr2,gg2,bb2, -a,a,0,1, rr2,gg2,bb2,
    a,a,0,1,  rr1,gg1,bb1, a,a,0,1,  rr1,gg1,bb1,
    a,-a,0,1, rr1,gg1,bb1, 0,0,h*a,1, rr1,gg1,bb1,
    -a,-a,0,1,rr1,gg1,bb1, 0,0,h*a,1, rr1,gg1,bb1,
    -a,a,0,1, rr1,gg1,bb1, 0,0,h*a,1, rr1,gg1,bb1,
    a,a,0,1,  rr1,gg1,bb1, 0,0,h*a,1, rr1,gg1,bb1,
  ]);
  octVerts = addNormal(strip2sequence(octVerts));
}
function makeSphere(){
  var rr1 = 1, gg1 = 0, bb1 = 0;
  var rr2 = 1, gg2 = 0, bb2 = 0;
  var n = 20, r = 5, i = 0;
  var sliceAngle = 0, polarAngle = 0;
  var highZ = 0, lowZ = 0, highAngle = 0, lowAngle = 0;

  sliceAngle = Math.PI/2.0/n;
  polarAngle = Math.PI*2/n;
  sphVerts = new Float32Array(2*(n+1)*(n+1)*floatsPerVertex);
  for (var slice=0; slice<n; slice++) {
    highAngle = Math.PI/2-slice*sliceAngle;
    lowAngle = highAngle-sliceAngle;
    highZ = r*Math.sin(highAngle);
    lowZ = r*Math.sin(lowAngle);
    // side
    for (var v=0; v<2*(n+1); v++,i+=floatsPerVertex) {
      if (v%2==0) { //high
        sphVerts[i]   = r*Math.cos(highAngle)*Math.cos(v/2*polarAngle);
        sphVerts[i+1] = r*Math.cos(highAngle)*Math.sin(v/2*polarAngle);
        sphVerts[i+2] = highZ;
        sphVerts[i+3] = 1;
        sphVerts[i+4] = rr1;
        sphVerts[i+5] = gg1;
        sphVerts[i+6] = bb1;
        sphVerts[i+7] = sphVerts[i];
        sphVerts[i+8] = sphVerts[i+1];
        sphVerts[i+9] = sphVerts[i+2];
      } else {  //low
        sphVerts[i]   = r*Math.cos(lowAngle)*Math.cos((v-1)/2*polarAngle);
        sphVerts[i+1] = r*Math.cos(lowAngle)*Math.sin((v-1)/2*polarAngle);
        sphVerts[i+2] = lowZ;
        sphVerts[i+3] = 1;
        sphVerts[i+4] = rr2;
        sphVerts[i+5] = gg2;
        sphVerts[i+6] = bb2;
        sphVerts[i+7] = sphVerts[i];
        sphVerts[i+8] = sphVerts[i+1];
        sphVerts[i+9] = sphVerts[i+2];
      }
    }
  }
  // bottom
  for (v=0; v<2*(n+1); v++,i+=floatsPerVertex) {
    if (v%2==0) {
      sphVerts[i]   = r*Math.cos(v/2*polarAngle);
      sphVerts[i+1] = r*Math.sin(v/2*polarAngle);
      sphVerts[i+2] = 0;
      sphVerts[i+3] = 1;
      sphVerts[i+4] = rr1;
      sphVerts[i+5] = gg1;
      sphVerts[i+6] = bb1;
      sphVerts[i+7] = 0;
      sphVerts[i+8] = 0;
      sphVerts[i+9] = -1;
    } else {
      sphVerts[i]   = 0;
      sphVerts[i+1] = 0;
      sphVerts[i+2] = 0;
      sphVerts[i+3] = 1;
      sphVerts[i+4] = rr1;
      sphVerts[i+5] = gg1;
      sphVerts[i+6] = bb1;
      sphVerts[i+7] = 0;
      sphVerts[i+8] = 0;
      sphVerts[i+9] = -1;
    }
  }
  sphVerts = strip2sequence10(sphVerts);
}
function strip2sequence(arr, n){
  n = arr.length/7;
  arr3 = new Float32Array(3*(n-2)*7);
  for(var i=0; i<(n-2); i++){
    for(var j=0; j<3*7; j++){
      arr3[i*3*7+j] = arr[i*7+j];
    }
  }
  return arr3;
}
function strip2sequence10(arr, n){
  n = arr.length/10;
  arr3 = new Float32Array(3*(n-2)*10);
  for(var i=0; i<(n-2); i++){
    for(var j=0; j<3*10; j++){
      arr3[i*3*10+j] = arr[i*10+j];
    }
  }
  return arr3;
}
function addNormal(arr){
  var res = new Float32Array(arr.length*10/7);
  // flag: whether it is outward face or inward face
  for (var i=0, flag=1; i<arr.length; i+= 3*7, flag=-flag){
    j = i*10/7;
    res[j+0] = arr[i+0]; res[j+1] = arr[i+1]; res[j+2] = arr[i+2]; res[j+3] = arr[i+3];
    res[j+4] = arr[i+4]; res[j+5] = arr[i+5]; res[j+6] = arr[i+6];
    res[j+7] = flag*((arr[i+8]-arr[i+1])*(arr[i+16]-arr[i+9])-(arr[i+15]-arr[i+8])*(arr[i+9]-arr[i+2]));
    res[j+8] = flag*((arr[i+9]-arr[i+2])*(arr[i+14]-arr[i+7])-(arr[i+16]-arr[i+9])*(arr[i+7]-arr[i+0]));
    res[j+9] = flag*((arr[i+7]-arr[i+0])*(arr[i+15]-arr[i+8])-(arr[i+14]-arr[i+7])*(arr[i+8]-arr[i+1]));

    res[j+10] = arr[i+7]; res[j+11] = arr[i+8]; res[j+12] = arr[i+9]; res[j+13] = arr[i+10];
    res[j+14] = arr[i+11]; res[j+15] = arr[i+12]; res[j+16] = arr[i+13];
    res[j+17] = flag*((arr[i+8]-arr[i+1])*(arr[i+16]-arr[i+9])-(arr[i+15]-arr[i+8])*(arr[i+9]-arr[i+2]));
    res[j+18] = flag*((arr[i+9]-arr[i+2])*(arr[i+14]-arr[i+7])-(arr[i+16]-arr[i+9])*(arr[i+7]-arr[i+0]));
    res[j+19] = flag*((arr[i+7]-arr[i+0])*(arr[i+15]-arr[i+8])-(arr[i+14]-arr[i+7])*(arr[i+8]-arr[i+1]));

    res[j+20] = arr[i+14]; res[j+21] = arr[i+15]; res[j+22] = arr[i+16]; res[j+23] = arr[i+17];
    res[j+24] = arr[i+18]; res[j+25] = arr[i+19]; res[j+26] = arr[i+20];
    res[j+27] = flag*((arr[i+8]-arr[i+1])*(arr[i+16]-arr[i+9])-(arr[i+15]-arr[i+8])*(arr[i+9]-arr[i+2]));
    res[j+28] = flag*((arr[i+9]-arr[i+2])*(arr[i+14]-arr[i+7])-(arr[i+16]-arr[i+9])*(arr[i+7]-arr[i+0]));
    res[j+29] = flag*((arr[i+7]-arr[i+0])*(arr[i+15]-arr[i+8])-(arr[i+14]-arr[i+7])*(arr[i+8]-arr[i+1]));
  }
  return res;
}



function myKeyDown(ev) {
  // left right up down
  switch(ev.keyCode) {
    case 37: console.log('left');
      rotMatrix.setRotate(rotVelocity, 0, 0, 1);
      cam2look = rotMatrix.multiplyVector4(cam2look);
      posLook = posCam.add(cam2look);
      // document.getElementById('Result').innerHTML = ' Left: keyCode = '+ev.keyCode;
    break;
    case 38: console.log('up');
      rotMatrix.setRotate(rotVelocity, uu.elements[0], uu.elements[1], uu.elements[2]);
      cam2look = rotMatrix.multiplyVector4(cam2look);
      posLook = posCam.add(cam2look);
      // document.getElementById('Result').innerHTML = '   Up: keyCode = '+ev.keyCode;
    break;
    case 39: console.log('right');
      rotMatrix.setRotate(-rotVelocity, 0, 0, 1);
      cam2look = rotMatrix.multiplyVector4(cam2look);
      posLook = posCam.add(cam2look);
      // document.getElementById('Result').innerHTML = 'Right: keyCode = '+ev.keyCode;
    break;
    case 40: console.log('down');
      rotMatrix.setRotate(-rotVelocity, uu.elements[0], uu.elements[1], uu.elements[2]);
      cam2look = rotMatrix.multiplyVector4(cam2look);
      posLook = posCam.add(cam2look);
      // document.getElementById('Result').innerHTML = ' Down: keyCode = '+ev.keyCode;
    break;
    case 87: console.log('W');
      posCam = posCam.add(cam2look.normalize().scale(transVelocity));
      posLook = posLook.add(cam2look.normalize().scale(transVelocity));
      // document.getElementById('Result').innerHTML = '    W: keyCode = '+ev.keyCode;
    break;
    case 65: console.log('A');
      posCam = posCam.minus(uu.normalize().scale(transVelocity));
      posLook = posLook.minus(uu.normalize().scale(transVelocity));
      // document.getElementById('Result').innerHTML = '    A: keyCode = '+ev.keyCode;
    break;
    case 83: console.log('S');
      posCam = posCam.minus(cam2look.normalize().scale(transVelocity));
      posLook = posLook.minus(cam2look.normalize().scale(transVelocity));
      // document.getElementById('Result').innerHTML = '    S: keyCode = '+ev.keyCode;
    break;
    case 68: console.log('D');
      posCam = posCam.add(uu.normalize().scale(transVelocity));
      posLook = posLook.add(uu.normalize().scale(transVelocity));
      // document.getElementById('Result').innerHTML = '    D: keyCode = '+ev.keyCode;
    break;
    case 66: console.log('B');
      posCam.elements[2] = posCam.elements[2]+transVelocity;
      posLook.elements[2] = posLook.elements[2]+transVelocity;
      // document.getElementById('Result').innerHTML = 'space: keyCode = '+ev.keyCode;
    break;
    case 67: console.log('C');
      posCam.elements[2] = posCam.elements[2]-transVelocity;
      posLook.elements[2] = posLook.elements[2]-transVelocity;
      // document.getElementById('Result').innerHTML = 'space: keyCode = '+ev.keyCode;
    break;
    case 80: console.log('P');
      runStop();
      // document.getElementById('Result').innerHTML = 'space: keyCode = '+ev.keyCode;
    break;
    case 84: console.log('T');
      if (SHADER=='G') {SHADER='P';} else {SHADER='G';}
      // document.getElementById('Result').innerHTML = 'space: keyCode = '+ev.keyCode;
    break;
    case 77: console.log('M');
      numMatl = (numMatl)%22+1;
      console.log(numMatl)
      // document.getElementById('Result').innerHTML = 'space: keyCode = '+ev.keyCode;
    break;
    case 33: console.log('PageUp');
      lightHeight = lightHeight + 0.3;
      // document.getElementById('Result').innerHTML = 'space: keyCode = '+ev.keyCode;
    break;
    case 34: console.log('PageDown');
      lightHeight = lightHeight - 0.5;
      // document.getElementById('Result').innerHTML = 'space: keyCode = '+ev.keyCode;
    break;
    default:
      // document.getElementById('Result').innerHTML = 'You pressed some other key';
    break;
  }
}
function myKeyUp(ev) {}
function myKeyPress(ev) {}

function myMouseDown(ev, gl, canvas) {
	// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
	var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
	var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
	// console.log('myMouseDown(pixel coords): xp,yp=\t',xp,',\t',yp);

	// Convert to Canonical View Volume (CVV) coordinates too:
	var x = (xp-canvas.width/2)/(canvas.width/2);
	var y = (yp-canvas.height/2)/(canvas.height/2);
	// console.log('myMouseDown(CVV coords  ):  x, y=\t',x,',\t',y);

	isDrag = true;											// set our mouse-dragging flag
	xMclik = x;													// record where mouse-dragging began
	yMclik = y;
};
function myMouseMove(ev, gl, canvas) {
	if(isDrag==false) return;
  var rect = ev.target.getBoundingClientRect();	    // get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge

  var x = (xp-canvas.width/2)/(canvas.width/2);
	var y = (yp-canvas.height/2)/(canvas.height/2);

	// find how far we dragged the mouse:
  xMdrag = x - xMclik;
  yMdrag = y - yMclik;
	xMdragTot += xMdrag;
  yMdragTot += yMdrag;
  updateQuat(xMdrag, yMdrag);
	xMclik = x;
  yMclik = y;
};
function myMouseUp(ev, gl, canvas) {

  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge

  var x = (xp-canvas.width/2)/(canvas.width/2);
	var y = (yp-canvas.height/2)/(canvas.height/2);

	isDrag = false;

  xMdrag = x - xMclik;
  yMdrag = y - yMclik;
	xMdragTot += xMdrag;
  yMdragTot += yMdrag;
  updateQuat(xMdrag, yMdrag);
	console.log(`xMdrag, yMdrag = \
		${xMdragTot.toPrecision(3)}, ${yMdragTot.toPrecision(3)}`);
}
function updateQuat(xMdrag, yMdrag) {
  var dist = Math.sqrt(xMdrag*xMdrag + yMdrag*yMdrag);
	var qTmp = new Quaternion(0,0,0,1);
  var axis = new Float32Array([1, 0, 0])
  qNew.setFromAxisAngle(-yMdrag + 0.0001, xMdrag + 0.0001, 0.0, dist*120.0);
	qTmp.multiply(qNew,qTot);
	qTot.copy(qTmp);
}
function lookAtMatrix(){
  var res = new Matrix4();
  var m = res.elements;
  m[0] = uu.elements[0]; m[1] = uu.elements[1]; m[2] = uu.elements[2]; m[3] = 0;
  m[4] = vv.elements[0]; m[5] = vv.elements[1]; m[6] = vv.elements[2]; m[7] = 0;
  m[8] = ww.elements[0]; m[9] = ww.elements[1]; m[10]= ww.elements[2]; m[11]= 0;
  m[12]= 0;     m[13]= 0;     m[14]= 0;     m[15]= 1;
  return res;
}
function runStop() {
	if (PAUSE == 0) {PAUSE = 1; console.log('Paused.')}
	else {PAUSE = 0; console.log('Resumed.')}
}
function headLightControl() {
  LIGHT_HEAD = -LIGHT_HEAD;
}
function pointLightControl() {
  LIGHT_POINT = -LIGHT_POINT;
}
function shaderControl() {
  if (SHADER=='G') {
    SHADER='P';
    document.getElementById('Shader').innerHTML = ' Now: Phong shading';
  } else {
    SHADER='G';
    document.getElementById('Shader').innerHTML = ' Now: Gauraud shading';
  }
}
function lightingControl() {
  isPHONG = -isPHONG
  if (isPHONG==1){
    document.getElementById('Lighting').innerHTML = ' Now: Phong lighting';
  } else {
    document.getElementById('Lighting').innerHTML = ' Now: Blinn-Phong lighting';
  }
}
function ATT0() {
  ATT = 0.0;
}
function ATT1() {
  ATT = 1.0;
}
function ATT2() {
  ATT = 2.0;
}
function setLightColor0() {

  slider_I_ambi_r.value = 0.8*255;
  slider_I_ambi_g.value = 0.8*255;
  slider_I_ambi_b.value = 0.8*255;
  slider_I_diff_r.value = 1.0*255;
  slider_I_diff_g.value = 1.0*255;
  slider_I_diff_b.value = 1.0*255;
  slider_I_spec_r.value = 0.6*255;
  slider_I_spec_g.value = 0.6*255;
  slider_I_spec_b.value = 0.6*255;
  mySlider();
}
function setLightColor1() {

  slider_I_ambi_r.value = 0.8*255;
  slider_I_ambi_g.value = 0.8*255;
  slider_I_ambi_b.value = 0.8*255;
  slider_I_diff_r.value = 1.0*255;
  slider_I_diff_g.value = 0.5*255;
  slider_I_diff_b.value = 0.5*255;
  slider_I_spec_r.value = 1.0*255;
  slider_I_spec_g.value = 0.5*255;
  slider_I_spec_b.value = 0.5*255;
  mySlider()
}
function setLightColor2() {

  slider_I_ambi_r.value = 0.8*255;
  slider_I_ambi_g.value = 0.8*255;
  slider_I_ambi_b.value = 0.8*255;
  slider_I_diff_r.value = 0.5*255;
  slider_I_diff_g.value = 1.0*255;
  slider_I_diff_b.value = 0.5*255;
  slider_I_spec_r.value = 0.5*255;
  slider_I_spec_g.value = 1.0*255;
  slider_I_spec_b.value = 0.5*255;
  mySlider()
}
function setLightColor3() {

  slider_I_ambi_r.value = 0.8*255;
  slider_I_ambi_g.value = 0.8*255;
  slider_I_ambi_b.value = 0.8*255;
  slider_I_diff_r.value = 0.5*255;
  slider_I_diff_g.value = 0.5*255;
  slider_I_diff_b.value = 1.0*255;
  slider_I_spec_r.value = 0.5*255;
  slider_I_spec_g.value = 0.5*255;
  slider_I_spec_b.value = 1.0*255;
  mySlider()
}
function mySlider(){
  optLight.I_ambi = [];
  optLight.I_diff = [];
  optLight.I_spec = [];
  optLight.I_ambi.push(slider_I_ambi_r.value/255, slider_I_ambi_g.value/255, slider_I_ambi_b.value/255, 1.0)
  optLight.I_diff.push(slider_I_diff_r.value/255, slider_I_diff_g.value/255, slider_I_diff_b.value/255, 1.0)
  optLight.I_spec.push(slider_I_spec_r.value/255, slider_I_spec_g.value/255, slider_I_spec_b.value/255, 1.0)
}



// homemade math library for Vector4
Vector4.prototype.setValue = function(v0, v1, v2, v3) {
  var res = this.elements;
  res[0] = v0; res[1] = v1; res[2] = v2; res[3] = v3;
  return this;
}
Vector4.prototype.add = function(other) {
  var v1 = this.elements;
  var v2 = other.elements;
  var v = new Vector4();
  var res = v.elements;
  res[0] = v1[0]+v2[0];
  res[1] = v1[1]+v2[1];
  res[2] = v1[2]+v2[2];
  res[3] = 1;
  return v;
}
Vector4.prototype.minus = function(other) {
  var v1 = this.elements;
  var v2 = other.elements;
  var v = new Vector4();
  var res = v.elements;
  res[0] = v1[0]-v2[0];
  res[1] = v1[1]-v2[1];
  res[2] = v1[2]-v2[2];
  res[3] = 1;
  return v;
}
Vector4.prototype.scale = function(s) {
  var v = this.elements
  v[0] = v[0]*s; v[1] = v[1]*s; v[2] = v[2]*s; v[3] = 1;
  return this;
}
Vector4.prototype.cross = function(other) {
  var v1 = this.elements;
  var v2 = other.elements;
  var v = new Vector4();
  var res = v.elements;
  res[0] = v1[1]*v2[2]-v1[2]*v2[1];
  res[1] = v1[2]*v2[0]-v1[0]*v2[2];
  res[2] = v1[0]*v2[1]-v1[1]*v2[0];
  res[3] = 1;
  return v;
}
Vector4.prototype.dot = function(other) {
  var v1 = this.elements;
  var v2 = other.elements;
  return v1[0]*v2[0] + v1[1]+v2[1] + v1[2]*v2[2];
}
Vector4.prototype.normalize = function() {
  var v = this.elements;
  v[3] = 1;
  var c = v[0], d = v[1], e = v[2], g = Math.sqrt(c*c+d*d+e*e);
  if(g){
    if(g == 1)
        return this;
   } else {
     v[0] = 0; v[1] = 0; v[2] = 0;
     return this;
   }
   g = 1/g;
   v[0] = c*g; v[1] = d*g; v[2] = e*g;
   return this;
}












function nothing(){}
