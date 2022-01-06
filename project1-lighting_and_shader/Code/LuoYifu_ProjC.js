// Project C ------ Yifu Luo

var canvas;

// for animation
var g_last = Date.now();
var angleBase = 0, angleBar1 = 30, angleBar2 = 90, angleHead = 0;
var jump = 0, jumpstep = 0, jumpstepA = 0;
var STAGE = 1;
var angleAnimation = 0;
var PAUSE = 0;


// for lighting/shading
var SHADER = 'G';
var Gshader = new VBObox('G');
var Pshader = new VBObox('P');
var LIGHT_HEAD = 1;
var LIGHT_POINT = 1;
var isPHONG = 1;
var ATT = 0;
var numMatl = 1;
var optLight = new Light();
var lightHeight = 10;

function main() {
  canvas = document.getElementById('webgl');
  gl = getWebGLContext(canvas);

  // pass VBO contents to Gshader
  var data = initVBOContent();
  Gshader.init(gl, data);
  Pshader.init(gl, data);
  var shader = Gshader;
  initCam();
  initInput();

  // Set clear color and enable hidden surface removal
  gl.clearColor(0.15, 0.15, 0.15, 1.0);
  gl.enable(gl.DEPTH_TEST);
  setLightColor0(optLight);

  drawResize(shader);
  var tick = function(){
    requestAnimationFrame(tick, canvas);
    if (!PAUSE) {Animate();} else {g_last = Date.now()}
    if (SHADER=='G') {shader=Gshader;} else {shader=Pshader;}
    drawResize(shader);
  }; tick(); // call tick repeatedly
}

function Animate(){
  var now = Date.now()
  var elapsed = now - g_last;
  g_last = now;

  // Pixar Lamp: Check which stage
  if (STAGE==1){
  	angleBasestep = 0;
  	angleBar1step = 20;
  	angleBar2step = 60;
	  angleBar1 += (angleBar1step/800.0) * elapsed;
	  angleBar2 += (angleBar2step/800.0) * elapsed;
	  if (angleBar1>=50 | angleBar2>=150){
	  	angleBar1 = 50;
	  	angleBar2 = 150;
	  	jumpstep = 4;
	  	jumpstepA = -4;
	  	STAGE = 2;
	  }
  } else if (STAGE==2){
  	angleBasestep = 15;
  	angleBar1step = -20;
  	angleBar2step = -110;
  	angleBase += (angleBasestep/300.0) * elapsed;
  	angleBar1 += (angleBar1step/300.0) * elapsed;
	  angleBar2 += (angleBar2step/300.0) * elapsed;
	  jump += (jumpstep/300) * elapsed;
	  jumpstep += (jumpstepA/300) *elapsed;
	  if (angleBar1<=30 | angleBar2<=40 | angleBase>=15){
	  	angleBase = 15;
	  	angleBar1 = 30;
	  	angleBar2 = 40;
	  	jumpstep = 0;
	  	jumpstepA = -4;
	  	STAGE = 3;
	  }
  } else if (STAGE==3){
  	angleBasestep = -15;
  	angleBar1step = 0;
  	angleBar2step = 50;
  	angleBase += (angleBasestep/200.0) * elapsed;
  	angleBar1 += (angleBar1step/200.0) * elapsed;
	  angleBar2 += (angleBar2step/200.0) * elapsed;
	  jump += (jumpstep/200) * elapsed;
	  jumpstep += (jumpstepA/200) *elapsed;
	  if (angleBar2>=90 | angleBase<=0){
	  	angleBase = 0;
	  	angleBar1 = 30;
	  	angleBar2 = 90;
	  	jump = 0;
	  	STAGE = 1;
	  }
	}

  // cube
    angleAnimation += elapsed/10.0;
}
function drawResize(shader) {
  var nuCanvas = document.getElementById('webgl');  // get current canvas
  var nuGL = getWebGLContext(nuCanvas);             // and context:

  //Make canvas fill the top 3/4 of our browser window:
  nuCanvas.width = innerWidth*29/30;
  // nuCanvas.height = innerHeight*3/5;
  nuCanvas.height = innerHeight-400;
  perspection(nuGL, shader);  //set perspective and view matrix
}
function perspection(gl, shader) {
  cam2look = posLook.minus(posCam);
  uu = cam2look.cross(upVec).normalize();
  vv = uu.cross(cam2look).normalize();
  ww = uu.cross(vv).normalize();

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // first window: perspective
  gl.viewport(0,0, gl.drawingBufferWidth,gl.drawingBufferHeight);
  var vpAspect = gl.drawingBufferWidth/gl.drawingBufferHeight;
  shader.mvpMatrix.setPerspective(35,     // fovy: y-axis field-of-view in degrees
                            vpAspect, // aspect ratio: width/height
                            1, 100);  // near, far (always >0).
  shader.mvpMatrix.lookAt(  posCam.elements[0],  posCam.elements[1],  posCam.elements[2],
                      posLook.elements[0], posLook.elements[1], posLook.elements[2],
                      upVec.elements[0],   upVec.elements[1],   upVec.elements[2]);

  drawCall(gl, shader);
}
function drawCall(gl, shader){
  gl.useProgram(shader.shaderLoc);
  // update light position
  updateLight(gl, shader);
  updateMaterial(gl, shader, numMatl)

  // draw ground
  shader.modelMatrix.setTranslate(0,0,0);
  shader.mvpMatrix.multiply(shader.modelMatrix);
  // shader.mvpMatrix.multiply(shader.modelMatrix);
  gl.uniformMatrix4fv(shader.u_MvpMatrix, false, shader.mvpMatrix.elements);
  gl.uniformMatrix4fv(shader.u_ModelMatrix, false, shader.modelMatrix.elements);
  shader.normalMatrix.setInverseOf(shader.modelMatrix);
  shader.normalMatrix.transpose();
  gl.uniformMatrix4fv(shader.u_NormalMatrix, false, shader.normalMatrix.elements);
  gl.drawArrays(gl.LINES,
                gndStart/floatsPerVertex,
                gndVerts.length/floatsPerVertex);
  pushMatrix(shader.modelMatrix); // save world axis
  pushMatrix(shader.mvpMatrix);

  /////////////////////////////////////////////////////////////////////
  shader.mvpMatrix = popMatrix();
  shader.modelMatrix = popMatrix();
  pushMatrix(shader.modelMatrix);
  pushMatrix(shader.mvpMatrix);
  // Draw world axis
  shader.mvpMatrix.multiply(shader.modelMatrix);
  gl.uniformMatrix4fv(shader.u_MvpMatrix, false, shader.mvpMatrix.elements);
  gl.uniformMatrix4fv(shader.u_ModelMatrix, false, shader.modelMatrix.elements);
  shader.normalMatrix.setInverseOf(shader.modelMatrix);
  shader.normalMatrix.transpose();
  gl.uniformMatrix4fv(shader.u_NormalMatrix, false, shader.normalMatrix.elements);
  gl.drawArrays(gl.LINES,
                axStart/floatsPerVertex,
                axVerts.length/floatsPerVertex);

  /////////////////////////////////////////////////////////////////////
  updateMaterial(gl, shader, 9)
  shader.mvpMatrix = popMatrix();
  shader.modelMatrix = popMatrix();
  pushMatrix(shader.modelMatrix);
  pushMatrix(shader.mvpMatrix);
  // Starting to draw Lamp...
  // draw Base: start with world matrix
  shader.modelMatrix.translate(-5,3,jump+0.5);
  shader.modelMatrix.rotate(-angleBase, 1, 0, 0);
  shader.mvpMatrix.multiply(shader.modelMatrix);
  gl.uniformMatrix4fv(shader.u_MvpMatrix, false, shader.mvpMatrix.elements);
  gl.uniformMatrix4fv(shader.u_ModelMatrix, false, shader.modelMatrix.elements);
  shader.normalMatrix.setInverseOf(shader.modelMatrix);
  shader.normalMatrix.transpose();
  gl.uniformMatrix4fv(shader.u_NormalMatrix, false, shader.normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,
                baseStart/floatsPerVertex,
                baseVerts.length/floatsPerVertex);

  shader.mvpMatrix = popMatrix();
  pushMatrix(shader.mvpMatrix);
  shader.modelMatrix.translate(0,0,0.5);
  // draw Bar1: start with base top
  shader.modelMatrix.rotate(angleBar1, 1, 0, 0)
  shader.modelMatrix.translate(0,0,2.52);
  shader.mvpMatrix.multiply(shader.modelMatrix);
  gl.uniformMatrix4fv(shader.u_MvpMatrix, false, shader.mvpMatrix.elements);
  gl.uniformMatrix4fv(shader.u_ModelMatrix, false, shader.modelMatrix.elements);
  shader.normalMatrix.setInverseOf(shader.modelMatrix);
  shader.normalMatrix.transpose();
  gl.uniformMatrix4fv(shader.u_NormalMatrix, false, shader.normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,
                barStart/floatsPerVertex,
                barVerts.length/floatsPerVertex);

  shader.mvpMatrix = popMatrix();
  pushMatrix(shader.mvpMatrix);
  shader.modelMatrix.translate(0,0,2.48);
  // draw Bar2: start with bar1 end
  shader.modelMatrix.rotate(-angleBar2, 1, 0, 0);
  shader.modelMatrix.translate(0,0,2.52);
  shader.mvpMatrix.multiply(shader.modelMatrix);
  gl.uniformMatrix4fv(shader.u_MvpMatrix, false, shader.mvpMatrix.elements);
  gl.uniformMatrix4fv(shader.u_ModelMatrix, false, shader.modelMatrix.elements);
  shader.normalMatrix.setInverseOf(shader.modelMatrix);
  shader.normalMatrix.transpose();
  gl.uniformMatrix4fv(shader.u_NormalMatrix, false, shader.normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,
                barStart/floatsPerVertex,
                barVerts.length/floatsPerVertex);

  shader.mvpMatrix = popMatrix();
  pushMatrix(shader.mvpMatrix);
  shader.modelMatrix.translate(0,0,2.48);
  temp = shader.modelMatrix.elements.slice(12,15); // now store all trans info
  // draw Head: start with bar2 end
  shader.modelMatrix.rotate(-angleBar1+angleBar2, 1, 0, 0);

  // force the head look at the look at point, so as to have nice axis position
  shader.modelMatrix.multiply(lookAtMatrix());
  // rotate the head by dragging
  quatMatrix.setFromQuat(qTot.x, qTot.y, qTot.z, qTot.w);
  shader.modelMatrix.multiply(quatMatrix);

  shader.mvpMatrix.multiply(shader.modelMatrix);
  gl.uniformMatrix4fv(shader.u_MvpMatrix, false, shader.mvpMatrix.elements);
  gl.uniformMatrix4fv(shader.u_ModelMatrix, false, shader.modelMatrix.elements);
  shader.normalMatrix.setInverseOf(shader.modelMatrix);
  shader.normalMatrix.transpose();
  gl.uniformMatrix4fv(shader.u_NormalMatrix, false, shader.normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,
                headStart/floatsPerVertex,
                headVerts.length/floatsPerVertex);
  // End of drawing Lamp, restore the world coordinates system

  /////////////////////////////////////////////////////////////////////
  updateMaterial(gl, shader, 16)
  shader.mvpMatrix = popMatrix();
  shader.modelMatrix = popMatrix();
  pushMatrix(shader.modelMatrix);
  pushMatrix(shader.mvpMatrix);
  // Starting to draw Lamp...
  // draw Base: start with world matrix
  shader.modelMatrix.translate(-5,-10,jump+0.5);
  shader.modelMatrix.rotate(-90, 0, 0, 1);
  shader.modelMatrix.rotate(-angleBase, 1, 0, 0);
  shader.mvpMatrix.multiply(shader.modelMatrix);
  gl.uniformMatrix4fv(shader.u_MvpMatrix, false, shader.mvpMatrix.elements);
  gl.uniformMatrix4fv(shader.u_ModelMatrix, false, shader.modelMatrix.elements);
  shader.normalMatrix.setInverseOf(shader.modelMatrix);
  shader.normalMatrix.transpose();
  gl.uniformMatrix4fv(shader.u_NormalMatrix, false, shader.normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,
                baseStart/floatsPerVertex,
                baseVerts.length/floatsPerVertex);

  shader.mvpMatrix = popMatrix();
  pushMatrix(shader.mvpMatrix);
  shader.modelMatrix.translate(0,0,0.5);
  // draw Bar1: start with base top
  shader.modelMatrix.rotate(angleBar1, 1, 0, 0)
  shader.modelMatrix.translate(0,0,2.52);
  shader.mvpMatrix.multiply(shader.modelMatrix);
  gl.uniformMatrix4fv(shader.u_MvpMatrix, false, shader.mvpMatrix.elements);
  gl.uniformMatrix4fv(shader.u_ModelMatrix, false, shader.modelMatrix.elements);
  shader.normalMatrix.setInverseOf(shader.modelMatrix);
  shader.normalMatrix.transpose();
  gl.uniformMatrix4fv(shader.u_NormalMatrix, false, shader.normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,
                barStart/floatsPerVertex,
                barVerts.length/floatsPerVertex);

  shader.mvpMatrix = popMatrix();
  pushMatrix(shader.mvpMatrix);
  shader.modelMatrix.translate(0,0,2.48);
  // draw Bar2: start with bar1 end
  shader.modelMatrix.rotate(-angleBar2, 1, 0, 0);
  shader.modelMatrix.translate(0,0,2.52);
  shader.mvpMatrix.multiply(shader.modelMatrix);
  gl.uniformMatrix4fv(shader.u_MvpMatrix, false, shader.mvpMatrix.elements);
  gl.uniformMatrix4fv(shader.u_ModelMatrix, false, shader.modelMatrix.elements);
  shader.normalMatrix.setInverseOf(shader.modelMatrix);
  shader.normalMatrix.transpose();
  gl.uniformMatrix4fv(shader.u_NormalMatrix, false, shader.normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,
                barStart/floatsPerVertex,
                barVerts.length/floatsPerVertex);

  shader.mvpMatrix = popMatrix();
  pushMatrix(shader.mvpMatrix);
  shader.modelMatrix.translate(0,0,2.48);

  shader.mvpMatrix.multiply(shader.modelMatrix);
  gl.uniformMatrix4fv(shader.u_MvpMatrix, false, shader.mvpMatrix.elements);
  gl.uniformMatrix4fv(shader.u_ModelMatrix, false, shader.modelMatrix.elements);
  shader.normalMatrix.setInverseOf(shader.modelMatrix);
  shader.normalMatrix.transpose();
  gl.uniformMatrix4fv(shader.u_NormalMatrix, false, shader.normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,
                headStart/floatsPerVertex,
                headVerts.length/floatsPerVertex);
  // End of drawing Lamp, restore the world coordinates system

  /////////////////////////////////////////////////////////////////////
  updateMaterial(gl, shader, numMatl%22+5)
  shader.mvpMatrix = popMatrix();
  shader.modelMatrix = popMatrix();
  pushMatrix(shader.modelMatrix);
  pushMatrix(shader.mvpMatrix);
  // Starting to draw cube:
  shader.modelMatrix.translate(10, -10,2);
  shader.modelMatrix.rotate(angleAnimation,1,-1,1);
  shader.mvpMatrix.multiply(shader.modelMatrix);
  gl.uniformMatrix4fv(shader.u_MvpMatrix, false, shader.mvpMatrix.elements);
  gl.uniformMatrix4fv(shader.u_ModelMatrix, false, shader.modelMatrix.elements);
  shader.normalMatrix.setInverseOf(shader.modelMatrix);
  shader.normalMatrix.transpose();
  gl.uniformMatrix4fv(shader.u_NormalMatrix, false, shader.normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,
                cubeStart/floatsPerVertex,
                cubeVerts.length/floatsPerVertex);

  updateMaterial(gl, shader, numMatl%22+7)
  shader.mvpMatrix = popMatrix();
  pushMatrix(shader.mvpMatrix);
  shader.modelMatrix.translate(2,2,2);
  shader.modelMatrix.rotate(angleAnimation,1,1,1);
  shader.modelMatrix.translate(0,0,2.6);
  // Starting to draw octhedron:
  shader.modelMatrix.rotate(angleAnimation*2,0,0,1);
  shader.mvpMatrix.multiply(shader.modelMatrix);
  gl.uniformMatrix4fv(shader.u_MvpMatrix, false, shader.mvpMatrix.elements);
  gl.uniformMatrix4fv(shader.u_ModelMatrix, false, shader.modelMatrix.elements);
  shader.normalMatrix.setInverseOf(shader.modelMatrix);
  shader.normalMatrix.transpose();
  gl.uniformMatrix4fv(shader.u_NormalMatrix, false, shader.normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,
                octStart/floatsPerVertex,
                octVerts.length/floatsPerVertex);
  // End of drawing oct, restore the world coordinates system

  /////////////////////////////////////////////////////////////////////
  updateMaterial(gl, shader, numMatl)
  shader.mvpMatrix = popMatrix();
  shader.modelMatrix = popMatrix();
  pushMatrix(shader.modelMatrix);
  pushMatrix(shader.mvpMatrix);
  // Starting to draw sphere:
  shader.modelMatrix.translate(0,10,0);
  shader.modelMatrix.rotate(90, 1,0,0);
  shader.modelMatrix.rotate(angleAnimation, 0,1,0);
  shader.mvpMatrix.multiply(shader.modelMatrix);
  gl.uniformMatrix4fv(shader.u_MvpMatrix, false, shader.mvpMatrix.elements);
  gl.uniformMatrix4fv(shader.u_ModelMatrix, false, shader.modelMatrix.elements);
  shader.normalMatrix.setInverseOf(shader.modelMatrix);
  shader.normalMatrix.transpose();
  gl.uniformMatrix4fv(shader.u_NormalMatrix, false, shader.normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,
                sphStart/floatsPerVertex,
                sphVerts.length/floatsPerVertex);

  updateMaterial(gl, shader, numMatl%22+1)
  shader.mvpMatrix = popMatrix();
  shader.modelMatrix = popMatrix();
  pushMatrix(shader.modelMatrix);
  pushMatrix(shader.mvpMatrix);
  // Starting to draw sphere:
  shader.modelMatrix.translate(7,0,0);
  shader.modelMatrix.rotate(angleAnimation, 0,0,1);
  shader.mvpMatrix.multiply(shader.modelMatrix);
  gl.uniformMatrix4fv(shader.u_MvpMatrix, false, shader.mvpMatrix.elements);
  gl.uniformMatrix4fv(shader.u_ModelMatrix, false, shader.modelMatrix.elements);
  shader.normalMatrix.setInverseOf(shader.modelMatrix);
  shader.normalMatrix.transpose();
  gl.uniformMatrix4fv(shader.u_NormalMatrix, false, shader.normalMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,
                sphStart/floatsPerVertex,
                sphVerts.length/floatsPerVertex);

}













function nothing(){};
