var RAY_EPSILON = 1.0e-5;

function CRay() {
  //=============================================================================
  // Object for a ray in an unspecified coord. system (usually 'world' coords).
	this.orig = vec4.fromValues(0,0,0,1);			// Ray starting point (x,y,z,w)
																						// (default: at origin
	this.dir = 	vec4.fromValues(0,0,-1,1);			// The ray's direction vector 
																						// (default: look down -z axis)
}

CRay.prototype.copy = function(other) {
	vec4.copy(this.orig, other.orig);
	vec4.copy(this.dir, other.dir);
	return this;
}

CRay.prototype.printMe = function() {
  //=============================================================================
  // print ray's values in the console window:
	if(name == undefined) name = ' ';

	console.log('CRay::' + this.constructor.name + '.origin:\t' + this.orig[0] 
	+',\t'+ this.orig[1] +',\t'+ this.orig[2] +',\t'+ this.orig[3]);
	console.log('     ', + this.constructor.name + '.direction:\t' + this.dir[0] 
	+',\t'+  this.dir[1] + '\t'+  this.dir[2] +',\t'+ this.dir[3]);
}


function CCamera() {
  //=============================================================================
  this.eyePt = vec4.create();
  this.aimPt = vec4.create();
  this.upVec = vec4.create();

  // LOOK STRAIGHT DOWN:
  
  this.uAxis = vec3.fromValues(0,0,0);	// camera U axis == world x axis			
  this.vAxis = vec3.fromValues(0,0,0);	// camera V axis == world y axis
  this.nAxis = vec3.fromValues(0,0,0);	// camera N axis == world z axis.
  this.rayLookAt(gui.camEyePt, gui.camAimPt, gui.camUpVec);
		  	// (and thus we're gazing down the -Z axis with default camera). 

	this.iNear =  1.0;
	this.iLeft = -1.0;		
	this.iRight = 1.0;
	this.iBot =  -1.0;
	this.iTop =   1.0; 

  // And the lower-left-most corner of the image is at (u,v,n) = (iLeft,iBot,-iNear).
	this.xmax = g_resolution;			// horizontal,
	this.ymax = g_resolution;			// vertical image resolution.

  // Divide the image plane into rectangular tiles, one for each pixel:
	this.ufrac = (this.iRight - this.iLeft) / this.xmax;	// pixel tile's width
	this.vfrac = (this.iTop   - this.iBot ) / this.ymax;	// pixel tile's height.
}

CCamera.prototype.rayFrustum = function(left, right, bot, top, near) {
  //==============================================================================
  // Set the camera's viewing frustum with the same arguments used by the OpenGL 
  // 'glFrustum()' fucntion

  // UNTESTED!!!
  this.iLeft = left;
  this.iRight = right;
  this.iBot = bot;
  this.iTop = top;
  this.iNear = near;
}

CCamera.prototype.rayPerspective = function(fovy, aspect, zNear) {
  //==============================================================================
  // Set the camera's viewing frustum with the same arguments used by the OpenGL
  // 'gluPerspective()' function

  this.iNear = zNear;
  this.iTop = zNear * Math.tan(0.5*fovy*(Math.PI/180.0)); // tan(radians)
  this.iBot = -iTop;
  this.iRight = iTop*aspect;
  this.iLeft = -iRight;
}

CCamera.prototype.rayLookAt = function(eyePt, aimPt, upVec) {
  //==============================================================================
  // Adjust the orientation and position of this ray-tracing camera 
  // in 'world' coordinate system.
  // Update eyePt, aimPt, upVec, uAxis, vAxis, nAxis for the camera object
  vec4.copy(this.eyePt, eyePt);
  vec4.copy(this.aimPt, aimPt);
  vec4.copy(this.upVec, upVec);

  vec3.subtract(this.nAxis, eyePt, aimPt);  // aim-eye == MINUS N-axis direction
  vec3.normalize(this.nAxis, this.nAxis);   // N-axis must have unit length.
  vec3.cross(this.uAxis, upVec, this.nAxis);  // U-axis == upVec cross N-axis
  vec3.normalize(this.uAxis, this.uAxis);   // make it unit-length.
  vec3.cross(this.vAxis, this.nAxis, this.uAxis); // V-axis == N-axis cross U-axis
}

CCamera.prototype.setEyeRay = function(myeRay, xpos, ypos) {
  //=============================================================================

  // Convert image-plane location (xpos,ypos) in the camera's U,V,N coords:
  var posU = this.iLeft + xpos*this.ufrac; 	// U coord,
  var posV = this.iBot  + ypos*this.vfrac;	// V coord,
  //  and the N coord is always -1, at the image-plane (zNear) position.
  // Then convert this point location to world-space X,Y,Z coords using our 
  // camera's unit-length coordinate axes uAxis,vAxis,nAxis
  xyzPos = vec4.create();    // make vector 0,0,0,0.	
	vec4.scaleAndAdd(xyzPos, xyzPos, this.uAxis, posU); // xyzPos += Uaxis*posU;
	vec4.scaleAndAdd(xyzPos, xyzPos, this.vAxis, posV); // xyzPos += Vaxis*posU;
  vec4.scaleAndAdd(xyzPos, xyzPos, this.nAxis, -this.iNear); 
  xyzPos[3] = 1;
  // 																								xyzPos += Naxis * (-1)
  // The eyeRay we want consists of just 2 world-space values:
  //  	-- the ray origin == camera origin == eyePt in XYZ coords
  //		-- the ray direction TO image-plane point FROM ray origin;
  //				myeRay.dir = (xyzPos + eyePt) - eyePt = xyzPos; thus
	vec4.copy(myeRay.orig, this.eyePt);	
	vec4.copy(myeRay.dir, xyzPos);
}

//=============================================================================
// Allowable values for CGeom.shapeType variable.  Add some of your own!
const JT_GNDPLANE = 0;    // An endless 'ground plane' surface.
const JT_SPHERE   = 1;    // A sphere.
const JT_BOX      = 2;    // An axis-aligned cube.
const JT_GLASS    = 3;    // a glass ball
const JT_TRIANGLE = 4;    // a triangle with 3 vertices.
const JT_BLOBBIES = 5;    // Implicit surface:Blinn-style Gaussian 'blobbies'.
const JT_DISK     = 6;

// =============================================================================
function CGeom(shapeSelect, matSelect, input) {
  // Generic object for a geometric shape.  
	if(shapeSelect == undefined) shapeSelect = JT_GND_PLANE;	// default
	this.shapeType = shapeSelect;
	this.material = new Material(matSelect);
  // this.thisHit = new CHit();
	
	// this.model2world = mat4.create();
  this.worldVec2model = mat4.create();
	this.worldPt2model = mat4.create();	// the matrix used to transform rays from
	                                  // 'world' coord system to 'model' coords;
	                                  // Use this to set shape size, position,
	                                  // orientation, and squash/stretch amount.

	// Ground-plane 'Line-grid' parameters:
	this.xgap = input;	// line-to-line spacing
	this.ygap = input;
	this.lineWidth = 0.1;	// fraction of xgap used for grid-line width
	// (use skyColor when ray does not hit anything, not even the ground-plane)
  this.xyRad = input;
  // sphere and glass
  this.sphR = input;
}

CGeom.prototype.traceGrid = function(inRay) {
  var thisHit = new CHit();
  this.rayTransform(inRay);
  var t0 = (0 -inRay.orig[2])/inRay.dir[2];    
          // find ray/grid-plane intersection: t0 == value where ray hits plane.
  if(t0 < 0) {
    return thisHit;      // ray is BEHIND eyepoint.
  }
  // compute the x,y,z point where inRay hit the grid-plane
  var hitPt = vec4.fromValues(inRay.orig[0] + inRay.dir[0]*t0,
                              inRay.orig[1] + inRay.dir[1]*t0,
                              RAY_EPSILON+0, 1.0);
  var normVec = vec3.fromValues(0, 0, 1);
  // remember, hit-point x,y could be positive or negative:
  var locx = Math.abs(hitPt[0]/this.xgap); // how many 'xgaps' from the origin?
  var locy = Math.abs(hitPt[1]/this.ygap);
  if((locx%1 < this.lineWidth) || (locy%1 < this.lineWidth)) {    // hit a line of constant-x?
    return thisHit.set(inRay, hitPt, normVec, this.shapeType, new Material(MATL_BLACK_PLASTIC));       // yes.
  }
  return thisHit.set(inRay, hitPt, normVec, this.shapeType, this.material);       // yes.
}

CGeom.prototype.traceDisk = function(inRay) {
	//=============================================================================
  var thisHit = new CHit();
	this.rayTransform(inRay);
  var t0 = (0 -inRay.orig[2])/inRay.dir[2];    
          // find ray/grid-plane intersection: t0 == value where ray hits plane.
  if(t0 < 0) {
    return thisHit;      // ray is BEHIND eyepoint.
  }
  // compute the x,y,z point where inRay hit the grid-plane
  var hitPt = vec4.fromValues(inRay.orig[0] + inRay.dir[0]*t0,
                              inRay.orig[1] + inRay.dir[1]*t0,
                              RAY_EPSILON, 1.0);
  var normVec = vec3.fromValues(0, 0, 1);
  if ((hitPt[0]**2+hitPt[1]**2) <= this.xyRad**2) {
    return thisHit.set(inRay, hitPt, normVec, this.shapeType, this.material);
  } else {
  	return thisHit;
  }
}

CGeom.prototype.traceSphere = function(inRay) {
  //=============================================================================
  var thisHit = new CHit();
  this.rayTransform(inRay);
  var r2s = new vec3.create();
  vec3.subtract(r2s, vec3.fromValues(0,0,0), inRay.orig);
  var L2 = vec3.dot(r2s, r2s);
  var tcaS = vec3.dot(inRay.dir, r2s);
  if(L2 < this.sphR**2) {
    return thisHit;      // ray is BEHIND eyepoint.
  } else if (tcaS < 0) {
  	return thisHit;
  } else {
  	var DL2 = vec3.dot(inRay.dir, inRay. dir);
  	var tca2 = tcaS*tcaS/DL2;
  	var LM2 = L2 - tca2;
  	if (LM2 > this.sphR**2) {
  		return thisHit;
  	} else {
  		var Lhc2 = this.sphR*this.sphR - LM2;
  		var t0 = tcaS/DL2 - Math.sqrt(Lhc2/DL2);
  		var t1 = tcaS/DL2 + Math.sqrt(Lhc2/DL2);
  		var hitPt = new vec4.create();
  		vec4.scaleAndAdd(hitPt, inRay.orig, inRay.dir, t0-RAY_EPSILON); hitPt[3] = 1;
  		var normVec = new vec3.create();
  		vec3.normalize(normVec, hitPt);
  		thisHit.set(inRay, hitPt, normVec, this.shapeType, this.material);
  	}
  }
  return thisHit;
}

CGeom.prototype.rayTranslate = function(x, y, z){
  this.worldPt2model[12] -= x;
  this.worldPt2model[13] -= y;
  this.worldPt2model[14] -= z;
}

CGeom.prototype.rayRotateX = function(theta){
  var temp = mat4.create();
  mat4.rotateX(temp, temp, -theta);
  mat4.multiply(this.worldPt2model, temp, this.worldPt2model);
  mat4.multiply(this.worldVec2model, temp, this.worldVec2model);
}

CGeom.prototype.rayRotateY = function(theta){
  var temp = mat4.create();
  mat4.rotateY(temp, temp, -theta);
  mat4.multiply(this.worldPt2model, temp, this.worldPt2model);
  mat4.multiply(this.worldVec2model, temp, this.worldVec2model);
}

CGeom.prototype.rayRotateZ = function(theta){
  var temp = mat4.create();
  mat4.rotateZ(temp, temp, -theta);
  mat4.multiply(this.worldPt2model, temp, this.worldPt2model);
  mat4.multiply(this.worldVec2model, temp, this.worldVec2model);
}

CGeom.prototype.rayScale = function(v){
  mat4.scale(this.worldPt2model, this.worldPt2model, vec3.fromValues(1/v[0],1/v[1],1/v[2]));
  mat4.scale(this.worldVec2model, this.worldVec2model, vec3.fromValues(1/v[0],1/v[1],1/v[2]));
}

CGeom.prototype.rayTransform = function(inRay){
  // before tracing everyray, convert ray coord from world -> model
  vec4.transformMat4(inRay.orig, inRay.orig, this.worldPt2model);
  vec4.transformMat4(inRay.dir, inRay.dir, this.worldVec2model);
}

//=============================================================================
function CImgBuf(wide, tall) {
  //=============================================================================
  // Construct an 'image-buffer' object to hold a floating-pt ray-traced image.
  //  Contains BOTH:
  //	iBuf -- 2D array of 8-bit RGB pixel values we can display on-screen, AND
  //	fBuf -- 2D array of floating-point RGB pixel values we often CAN'T display,
  //          but contains full-precision results of ray-tracing.
  //			--Both buffers hold the same numbers of pixel values (xSiz,ySiz,pixSiz)
  //			--imgBuf.int2float() copies/converts current iBuf contents to fBuf
  //			--imgBuf.float2int() copies/converts current fBuf contents to iBuf

	this.xSiz = wide;							// image width in pixels
	this.ySiz =	tall;							// image height in pixels
	this.pixSiz = 3;							// pixel size (3 for RGB, 4 for RGBA, etc)
	this.iBuf = new Uint8Array(  this.xSiz * this.ySiz * this.pixSiz);	
	this.fBuf = new Float32Array(this.xSiz * this.ySiz * this.pixSiz);
}

CImgBuf.prototype.int2float = function() {
  //=============================================================================
  // Convert the integer RGB image in iBuf into floating-point RGB image in fBuf
  for(var j=0; j< this.ySiz; j++) {		// for each scanline
  	for(var i=0; i< this.xSiz; i++) {		// for each pixel on that scanline
  		var idx = (j*this.xSiz + i)*this.pixSiz;// Find array index @ pixel (i,j)
			// convert integer 0 <= RGB <= 255 to floating point 0.0 <= R,G,B <= 1.0
  		this.fBuf[idx   ] = this.iBuf[idx   ] / 255.0;	// red
  		this.fBuf[idx +1] = this.iBuf[idx +1] / 255.0;	// grn
  		this.fBuf[idx +2] = this.iBuf[idx +2] / 255.0;	// blu  		
  	}
  }
}

CImgBuf.prototype.float2int = function() {
  //=============================================================================
  // Convert the floating-point RGB image in fBuf into integer RGB image in iBuf
  for(var j=0; j< this.ySiz; j++) {		// for each scanline,
  	for(var i=0; i< this.xSiz; i++) {	 // for each pixel on that scanline,
  		var idx = (j*this.xSiz + i)*this.pixSiz; //Find array index @ pixel(i,j):
			// find 'clamped' color values that stay >=0.0 and <=1.0:
  		var rval = Math.min(1.0, Math.max(0.0, this.fBuf[idx   ]));
  		var gval = Math.min(1.0, Math.max(0.0, this.fBuf[idx +1]));
  		var bval = Math.min(1.0, Math.max(0.0, this.fBuf[idx +2]));
			// Divide [0,1] span into 256 equal-sized parts:  Math.floor(rval*256)
			// In the rare case when rval==1.0 you get unwanted '256' result that 
			// won't fit into the 8-bit RGB values.  Fix it with Math.min():
  		this.iBuf[idx   ] = Math.min(255,Math.floor(rval*256.0));	// red
  		this.iBuf[idx +1] = Math.min(255,Math.floor(gval*256.0));	// grn
  		this.iBuf[idx +2] = Math.min(255,Math.floor(bval*256.0));	// blu
  	}
  }
}

//=============================================================================
function CScene() {
  //=============================================================================
  // A complete ray tracer object prototype (formerly a C/C++ 'class').
  //      My code uses just one CScene instance (g_myScene) to describe the entire 
  //			ray tracer.  Note that I could add more CScene objects to make multiple
  //			ray tracers (perhaps on different threads or processors) and then 
  //			combine their results into a giant video sequence, a giant image, or 
  //			use one ray-traced result as input to make the next ray-traced result.
  this.myPic = new CImgBuf(g_resolution, g_resolution);
  this.depth = 1;
}

CScene.prototype.init = function(){
	this.eyeRay = new CRay(); // the ray we trace from our camera for each pixel\
	this.myHit = new CHit();
  this.myCam = new CCamera();  // the 3D camera that sets eyeRay values

  // initialize CGeom List
  this.geomList = [];
  var myGrid = new CGeom(JT_GNDPLANE, MATL_WHITE_PLASTIC, 1);
  myGrid.rayTranslate(0,0,1)
  var myDisk1 = new CGeom(JT_DISK, MATL_RED_PLASTIC, 1.5);
  myDisk1.rayTranslate(-7,-1,2)
  myDisk1.rayRotateY(Math.PI/5)
  var mySphere1 = new CGeom(JT_SPHERE, MATL_MIRROR, 3);
  mySphere1.rayTranslate(-3,1,4);
  var mySphere2 = new CGeom(JT_GLASS, MATL_GLASS, 3);
  mySphere2.rayTranslate(-1,-6,4);
  // mySphere2.rayScale(vec3.fromValues(0.7,0.7,0.7))
  var mySphere3 = new CGeom(JT_SPHERE, MATL_GRN_PLASTIC, 1);
  mySphere3.rayTranslate(-4.5,-3.5,2);
  var mySphere4 = new CGeom(JT_SPHERE, MATL_BLU_PLASTIC, 0.5);
  mySphere4.rayTranslate(-6,-4.5,1.5);
  var mySphere5 = new CGeom(JT_SPHERE, MATL_RED_PLASTIC, 2);
  mySphere5.rayTranslate(1, 0, 8.5);


  this.geomList.push(mySphere1);
  this.geomList.push(mySphere2);
  this.geomList.push(mySphere3);
  this.geomList.push(mySphere4);
  this.geomList.push(mySphere5);
  this.geomList.push(myGrid);
  this.geomList.push(myDisk1);
  
  // initialize lighting
  var lightPoint = new Light();
  // var lightPoint2 = new Light();
  var lightHead = new Light();
  lightPoint.I_pos = vec4.fromValues(-5, -1, 10, 1);
  // lightPoint2.I_pos = vec4.fromValues(0, -10, 10, 1);
  this.lightList = [];
  this.lightList.push(lightHead);
  this.lightList.push(lightPoint);
  // this.lightList.push(lightPoint2);
}

CScene.prototype.makeRayTracedImage = function(){
	// update lighting
	vec4.copy(this.lightList[0].I_pos, gui.camEyePt);
	// update camera
  this.myCam.rayLookAt(gui.camEyePt, gui.camAimPt, gui.camUpVec);
	var colr = vec4.fromValues(0,0,0,0);	// floating-point RGBA color value
	var isHit = 0;
	var idx = 0;  // CImgBuf array index(i,j) == (j*this.xSiz + i)*this.pixSiz
  var i,j,ii,jj,uPos,vPos;      // pixel x,y coordinate (origin at lower left; integer values)
  for(j=0; j<this.myPic.ySiz; j++) {       // for the j-th row of pixels.
  	for(i=0; i<this.myPic.xSiz; i++) {	    // and the i-th pixel on that row,
        // super-sampling
        colr = vec4.fromValues(0,0,0,0)
        for(ii=0; ii<g_AAcode; ii++){
          for(jj=0; jj<g_AAcode; jj++){
            // if isJetter, add noise
            if (g_isJitter){
              uPos = i + (ii+Math.random())/g_AAcode;
              vPos = j + (jj+Math.random())/g_AAcode;
            } else {
              uPos = i + ii/g_AAcode;
              vPos = j + jj/g_AAcode;
            }
            // create a ray thru this sampling point on screen
            this.myCam.setEyeRay(this.eyeRay,uPos,vPos);
            // fidn the nearest hit
            // this.myHit.clear()
            this.myHit = this.traceRay(this.eyeRay);
          	vec4.add(colr, colr, this.findShade(this.depth));
          } // end of this ray
        } // end of super sampling for one pixel, normalize the color
        vec4.scale(colr, colr, 1/g_AAcode/g_AAcode);
  		  idx = (j*this.myPic.xSiz + i)*this.myPic.pixSiz;	// Array index at pixel (i,j) 
  	  	this.myPic.fBuf[idx   ] = colr[0];
  	  	this.myPic.fBuf[idx +1] = colr[1];
  	  	this.myPic.fBuf[idx +2] = colr[2];
  	}
	}
  this.myPic.float2int();		// create integer image from floating-point buffer.
}

CScene.prototype.traceRay = function(inRay){
  // Trace the ray and return a list of CHit objects
  // loop thru all geom objects
  var localRay = new CRay();
  var thisHit = new CHit();
  var resHit = new CHit();
  for(var geom=0; geom<this.geomList.length; geom++){
    switch(this.geomList[geom].shapeType){
      case JT_SPHERE:
      case JT_GLASS:
        thisHit = this.geomList[geom].traceSphere(localRay.copy(inRay));
        break;
      case JT_GNDPLANE:
        thisHit = this.geomList[geom].traceGrid(localRay.copy(inRay));
        // if(thisHit.shapeType = JT_GNDPLANE){console.log('1')}
        break;
      case JT_DISK:
        thisHit = this.geomList[geom].traceDisk(localRay.copy(inRay));
        break;
    }
    // if hitted one of the geoms
    if (thisHit.isHit==1) {
    	thisHit.model2world(this.geomList[geom].worldPt2model, 
    												 this.geomList[geom].worldVec2model);
    	// now every CHit object member should be in the world space
      resHit.update(thisHit);
    }
  }
  return resHit;
}

CScene.prototype.findShade = function(level) {
  // find the color of the current sampling point
  // Use a lot of parameters from the CHit object in the future.
  var res = new vec4.create();
  var L = new vec3.create();
  var R = new vec3.create();
  var NdL, RdV;
  var thisColor = new vec4.create();
  var shadowRay = new CRay();
  var shadowHit = new CHit();
  var isATT = 0;
  // lighting
  for (var l=0; l<this.lightList.length; l++){
    // check lighting condition
    if(this.lightList[l].isLit!=1){continue;}
    vec4.copy(shadowRay.orig, this.myHit.loc);
    vec4.subtract(shadowRay.dir, this.lightList[l].I_pos, this.myHit.loc);
    shadowRay.dir[3] = 1;
    shadowHit = this.traceRay(shadowRay);
    // if not in shadow of this light: one of the two:
    // (1) shadow ray didn't hit any object
    // (2) shadow ray hit something but is beyond the light source
    if(shadowHit.isHit!=1 || shadowHit.dist2>this.myHit.dist2){
    	vec3.subtract(L, this.myHit.loc, this.lightList[l].I_pos);
    	vec3.normalize(L, L);
    	NdL = Math.max(vec3.dot(L, this.myHit.N)*(-1), 0)
    	vec3.scaleAndAdd(R, L, this.myHit.N, 2*NdL);
    	RdV = Math.max(vec3.dot(R, this.myCam.nAxis), 0);
    	// diffuse
  	  vec4.multiply(thisColor, this.myHit.matl.K_diff, this.lightList[l].I_diff);
  	  vec4.scaleAndAdd(res, res, thisColor, NdL/Math.pow(this.myHit.dist2, isATT/2));
  	  // ambient
  	  vec4.multiply(thisColor, this.myHit.matl.K_ambi, this.lightList[l].I_ambi);
  	  vec4.add(res, res, thisColor)
  	  // specular
  	  vec4.multiply(thisColor, this.myHit.matl.K_spec, this.lightList[l].I_spec);
  	  vec4.scaleAndAdd(res, res, thisColor, Math.pow(RdV, this.myHit.matl.K_shiny)
                                            /Math.pow(this.myHit.dist2, isATT/2))
    } 
  }
  // reflection/refraction
  var reflectionRay = new CRay();
  var refractionRay = new CRay();
  if (level>0 && this.myHit.shapeType!=JT_GNDPLANE){
    --level;
    var absorb = this.myHit.matl.K_absorb;
    //////////////////////////////////////////////////////////////////////////////////////////
    // find reflection ray
  	vec4.copy(reflectionRay.orig, this.myHit.loc);
  	vec4.copy(reflectionRay.dir, this.myHit.R); reflectionRay.dir[3] = 1;
    // find refraction ray
    if (this.myHit.shapeType==JT_GLASS){
      // find r ray orig and dir here...
      // find r ray orig and dir here...
      var tempV = vec4.fromValues(this.myHit.V[0], this.myHit.V[1], this.myHit.V[2], 1);
      var tempRf = vec4.fromValues(this.myHit.Rf[0], this.myHit.Rf[1], this.myHit.Rf[2], 1);
      vec4.scaleAndAdd(refractionRay.orig, this.myHit.loc, tempV, 3*this.myHit.x);
      vec4.scaleAndAdd(refractionRay.orig, refractionRay.orig, tempRf, 3*this.myHit.x); refractionRay.orig[3] = 1;
      vec4.copy(refractionRay.dir, this.myHit.Rf); refractionRay.dir[3] = 1;
      this.myHit = this.traceRay(refractionRay);
      vec4.copy(thisColor, this.findShade(level));
      vec4.scaleAndAdd(res, res, thisColor, 0.8)
    }
    // find hit color
  	this.myHit = this.traceRay(reflectionRay);
  	vec4.copy(thisColor, this.findShade(level));
    vec4.scaleAndAdd(res, res, thisColor, absorb)
    
  } // end of this level
	res[3] = 1;
  return res;
}



// ============================================================================
function CHit() {
  // Describes one ray/object intersection point that was found by 'tracing' one
  // ray through one shape
  // All quantities are in the model reference frame
  this.isHit = 0;
  this.x = NaN;
  this.dist2 = NaN;
  this.shapeType = NaN;
  this.matl = new Material(1);
  this.loc = vec4.create();
  this.V = vec3.create();
  this.N = vec3.create();
  this.R = vec3.create();
  this.Rf = vec3.create();
}

CHit.prototype.set = function(inRay, location, normal, shapeType, matl) {
	// all vectors are temporarily in model space
	// hit point
	vec4.copy(this.loc, location);
	// view vector
  vec3.subtract(this.V, this.loc, inRay.orig);
  this.dist2 = vec3.dot(this.V, this.V);
  vec3.normalize(this.V, this.V)
  // surface normal
  vec3.copy(this.N, normal);
  // reflection ray
  var NdV = (-1)*vec3.dot(this.V, this.N); 
  vec3.scaleAndAdd(this.R, this.V, this.N, 2*NdV);
  // refraction ray
  if (shapeType == JT_GLASS){
    var theta1 = Math.acos(NdV);
    var theta2 = Math.asin(Math.sin(theta1)/1.2);
    var phi = 2*(theta1 - theta2);
    var axis = new vec3.create();
    vec3.cross(axis, this.V, this.N);
    var mat = new mat4.create();
    mat4.fromRotation(mat, -phi, axis);
    vec4.transformMat4(this.Rf, vec4.fromValues(this.V[0], this.V[1], this.V[2], 1), mat);
    vec3.normalize(this.Rf, this.Rf);

    this.x = Math.sin(Math.PI/2-theta2)/Math.sin(Math.PI/2-theta1+theta2);
  }


  
  // other
	this.isHit = 1;
  this.shapeType = shapeType;
  this.matl = matl;
	return this;
}

CHit.prototype.update = function(thisHit){
	if ((thisHit.dist2 < this.dist2) || (this.isHit==0)){
		this.isHit = 1;
    this.x = thisHit.x;
		this.dist2 = thisHit.dist2;
		this.shapeType= thisHit.shapeType;
		this.matl = thisHit.matl;
		vec4.copy(this.loc, thisHit.loc);
		vec3.copy(this.V, thisHit.V);
		vec3.copy(this.R, thisHit.R);
    vec3.copy(this.Rf, thisHit.Rf);
		vec3.copy(this.N, thisHit.N);
	}
}

CHit.prototype.model2world = function(worldPt2model, worldVec2model) {
	// transform loc, V, N, R to world space
	var V4 = vec4.fromValues(this.V[0], this.V[1], this.V[2], 1);
	var N4 = vec4.fromValues(this.N[0], this.N[1], this.N[2], 1);
	var R4 = vec4.fromValues(this.R[0], this.R[1], this.R[2], 1);
  var Rf4 = vec4.fromValues(this.Rf[0], this.Rf[1], this.Rf[2], 1);
	var modelPt2world = mat4.create();
	mat4.invert(modelPt2world, worldPt2model);
	var modelVec2world = mat4.create();
	mat4.invert(modelVec2world, worldVec2model);
	var normalVec2world = mat4.create();
	mat4.transpose(normalVec2world, worldVec2model);
	vec4.transformMat4(V4, V4, modelVec2world);
	vec4.transformMat4(R4, R4, modelVec2world);
  vec4.transformMat4(Rf4, Rf4, modelVec2world);
	vec4.transformMat4(N4, N4, normalVec2world);
	vec4.transformMat4(this.loc, this.loc, modelPt2world);
	vec3.copy(this.V, V4);
	vec3.copy(this.N, N4);
	vec3.copy(this.R, R4);
  vec3.copy(this.Rf, Rf4);
}


// // ==============================================================================
// function CHitList() {
// 	// a list of CHit objects that is sorted by the distance from near to far
//   this.lst = [];
//   this.length = 0;
// }

// CHitList.prototype.clear = function(){
// 	this.lst = [];
// 	this.length = 0;
// }

// CHitList.prototype.add = function(hit){
//   // this function will work as long as there is dist2 member for CHit
// 	// add a hit point into the hitList, sorted by distence
// 	var flag = 0;
// 	for (var h=0; h<this.length; h++){
// 		if (hit.dist2 <= this.lst[h].dist2) {
// 			this.lst.splice(h,0,hit);
// 			this.length++;
// 			flag = 1; break;
// 		}
// 	}
// 	// if the list is still empty OR new hit point is not nearer than any
// 	if (flag == 0){
// 		this.lst.push(hit);
// 		this.length++;
// 	}
// }
