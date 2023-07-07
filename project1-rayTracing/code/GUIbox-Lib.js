
//==============================================================================
//=============================================================================
function GUIbox() {	
//=============================================================================
//==============================================================================
// CONSTRUCTOR for one re-usable 'GUIbox' object that holds all data and fcns 
// needed to capture and respond to all user inputs/outputs.

  this.isDrag = false;	// mouse-drag: true while user holds down mouse button
  
  this.xCVV=1.0;			// Results found from last call to this.MouseToCVV()
  this.yCVV=0.0;

  this.xMpos=0.0;			// last recorded mouse position (in CVV coords)
  this.yMpos=0.0;   

  this.xMdragTot=0.0; // total (accumulated) mouse-drag amounts(in CVV coords).
  this.yMdragTot=0.0;  
}

GUIbox.prototype.init = function() {
  var that = this;
  window.addEventListener("mousedown", 
        function(mev) {return that.mouseDown(mev);     } ); 
  window.addEventListener("mousemove", 
        function(mev) {return that.mouseMove(mev);     } ); 
	window.addEventListener("mouseup",   
	      function(mev) {return that.mouseUp(mev);       } );	
	window.addEventListener("keydown", 
	      function(kev) {return that.keyDown(kev);  }, false);
	window.addEventListener("keyup", 
	      function(kev) {return that.keyUp(kev);    }, false);
  // slider_I_ambi_r.addEventListener("input", that.mySlider, false)
  // slider_I_ambi_g.addEventListener("input", that.mySlider, false)
  // slider_I_ambi_b.addEventListener("input", that.mySlider, false)
  // slider_I_diff_r.addEventListener("input", that.mySlider, false)
  // slider_I_diff_g.addEventListener("input", that.mySlider, false)
  // slider_I_diff_b.addEventListener("input", that.mySlider, false)
  // slider_I_spec_r.addEventListener("input", that.mySlider, false)
  // slider_I_spec_g.addEventListener("input", that.mySlider, false)
  // slider_I_spec_b.addEventListener("input", that.mySlider, false)


		this.xMdragTot.toFixed(5) + ', \t' + this.yMdragTot.toFixed(5);	

  // Camera-Navigation:----------------------------------
  // Initialize our camera aiming parameters using yaw-pitch sphere method.
  // Camera aiming point stays on a unit-radius sphere centered at the camera's
  // eye point, specified by:
  // --'yaw' angle(longitude) increasing CCW in xy plane measured from +x axis;
  // --'pitch' angle(latitude) increasing upwards above horizon.
  // This is BETTER than 'glass tube' because it lets us pitch camera up/down
  // in equal-angle increments, and even go past +/-90 degrees if we wish.
  // I limited 'pitch' to +/- 90 deg (+/- PI/2 radians) to avoid confusing
	// counter-intuitive images possible with past-vertical pitch.
	// (see GUIbox.mouseMove() function )
  this.camYaw = Math.PI*0.27;              // (initially I aim in +y direction)
                              // Yaw angle (radians) measured from world +x 
                              // direction to the x,y components of the camera's
                              // aiming direction.
                              // HORIZONTAL mouse-drag increases/decreases this.
  this.camYawInit = this.camYaw;  // save initial value for use in mouseMove().
  this.camPitch = -Math.PI/9;             // (initially I look straight down)         
                              // Pitch angle (radians) measured upwards from the 
                              // horizon (the xy plane at camera's eyepoint z)
                              // upwards to the camera's aiming direction.
                              // VERTICAL mouse-drag increases/decreases this.
  this.camPitchInit = this.camPitch;  // save initial value for mouseMove().
  this.camEyePt = vec4.fromValues(-7,-9,7.5,1); // initial camera position
  this.camAimPt = vec4.fromValues(       // point on yaw-pitch sphere around eye:
                this.camEyePt[0] + Math.cos(this.camYaw)*Math.cos(this.camPitch), // x
                this.camEyePt[1] + Math.sin(this.camYaw)*Math.cos(this.camPitch), // y
                this.camEyePt[2] + Math.sin(this.camPitch),  // z
                1.0); // w. 
  // Yaw & pitch angles let us specify an 'up' vector always perpendicular to
  // the camera aiming direction. (same yaw, but increase pitch by +90 degrees)
  this.camUpVec = vec4.fromValues(   // +90deg == Math.PI/2
      Math.cos(this.camYaw)*Math.cos(this.camPitch + Math.PI/2),  // x 
      Math.sin(this.camYaw)*Math.cos(this.camPitch + Math.PI/2),  // y
                            Math.sin(this.camPitch + Math.PI/2),  // z
      1.0);   // w
  this.camSpeed = 0.5;	      // world-space distance moved per keystroke
}

GUIbox.prototype.mouseDown = function(mev) {
  //==============================================================================
  // Called when user PRESSES down any mouse button;
  // 									(Which button?  console.log('mev.button=' + mev.button);  )
  // 	mev.clientX, mev.clientY == mouse pointer location, but measured in webpage 
  //	pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS(!)  

  //console.log("called GUIbox.mouseDown(mev)");
  //  That's not good for us -- convert to CVV coordinates instead:
	this.mouseToCVV(mev);									// convert to CVV coordinates:
																			// (result in  this.xCVV, this.yCVV)
	this.xMpos = this.xCVV;             // save current position, and...
	this.yMpos = this.yCVV;
	this.isDrag = true;						  		// set our mouse-dragging flag
}

GUIbox.prototype.mouseMove = function(mev) {	
  //=============================================================================
  // Called when user MOVES the mouse, with or without a button  pressed down.
  // 									(Which button?   console.log('mev.button=' + mev.button); )
  // 	mev.clientX, mev.clientY == mouse pointer location, but measured in webpage 
  //	pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  
  //  That's not good for us -- convert to CVV coordinates instead:

  //console.log("GUIbox.mouseMove(): isDrag==", this.isDrag);
	if(this.isDrag==false) return;		// IGNORE all mouse-moves except 'dragging'
  //	console.log("called GUIbox.mouseMove(mev)");	
  this.mouseToCVV(mev);							// convert to CVV coordinates:
	                                  // (result in this.xCVV, this.yCVV)
	// find how far we dragged the mouse:
	this.xMdragTot += (this.xCVV - this.xMpos); // Accumulate change-in-mouse-position,&
	this.yMdragTot += (this.yCVV - this.yMpos);
	this.xMpos = this.xCVV;	                    // Make next drag-measurement from here.
	this.yMpos = this.yCVV;
  
  //-------------------------
  // Camera navigation:
  // update camera aiming angles:
  this.camYaw = this.camYawInit + this.xMdragTot * 1.0; // Horiz drag in radians
  this.camPitch = this.camPitchInit - this.yMdragTot * 1.0; // Vert drag in radians
  if(this.camYaw < -Math.PI) {  // keep yaw angle values between +/- PI
    this.camYaw += 2*Math.PI;   
    }
  else if(this.camYaw > Math.PI) {
    this.camYaw -= 2*Math.PI;
    }
  if(this.camPitch < -Math.PI/2) {    // ALSO, don't let pitch go below -90deg 
    this.camPitch = -Math.PI/2;       // (-Z aiming direction)
    // We want y-axis mouse-dragging to set camera pitch. When pitch reaches its
    // lowermost limit of -PI/2, what's the mouse-drag value yMdragTot?
    // camPitch = camPitchInit - yMdragTot == -PI/2; add yMdragTot to both sides:
    //            camPitchInit == yMdragTot -PI/2;  then add PI/2 to both sides:
    //            (camPitchInit + PI/2) == yMdragTot;  
    // THUS ANY mouse-drag totals > than this amount will get ignored!
    this.yMdragTot = this.camPitchInit + Math.PI/2; // upper limit on yMdragTot.
    }
  else if(this.camPitch > Math.PI/2) {  // AND never let pitch go above +90deg:
    this.camPitch = Math.PI/2;          // (+Z aiming direction)
    this.yMdragTot = this.camPitchInit -Math.PI/2; // lower limit on yMdragTot.
    }
  // update camera aim point: using spherical coords:
  this.camAimPt[0] = this.camEyePt[0] + Math.cos(this.camYaw)*Math.cos(this.camPitch);  // x
  this.camAimPt[1] = this.camEyePt[1] + Math.sin(this.camYaw)*Math.cos(this.camPitch);  // y
  this.camAimPt[2] = this.camEyePt[2] + Math.sin(this.camPitch); // z
  // update the 'up' vector too (pitch an additional +90 degrees)
  this.camUpVec[0] = Math.cos(this.camYaw)*Math.cos(this.camPitch + Math.PI/2); 
  this.camUpVec[1] = Math.sin(this.camYaw)*Math.cos(this.camPitch + Math.PI/2);
  this.camUpVec[2] = Math.sin(this.camPitch + Math.PI/2); 

  drawAll();		// we MOVED the camera -- re-draw everything!
}

GUIbox.prototype.mouseUp = function(mev) {
  //=============================================================================
  // Called when user RELEASES mouse button pressed previously.
  // 									(Which button?   console.log('mev.button=' + mev.button); )
  // 	mev.clientX, mev.clientY == mouse pointer location, but measured in webpage 
  //	pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  
  //  That's not good for us -- convert to CVV coordinates instead:

  //	console.log("called GUIbox.mouseUp(mev)");
	this.mouseToCVV(mev);               // CONVERT event to CVV coord system 
	this.isDrag = false;								// CLEAR our mouse-dragging flag, and
	// accumulate any final portion of mouse-dragging we did:
	this.xMdragTot += (this.xCVV - this.xMpos);
	this.yMdragTot += (this.yCVV - this.yMpos);
	this.xMpos = this.xCVV;             // RECORD this latest mouse-position.
	this.yMpos = this.yCVV;

}

GUIbox.prototype.mouseToCVV = function(mev) {
  //==============================================================================
  // CONVERT mouse event 'mev' from the given 'client' coordinates (left-handed
  // pixel coordinates within the browser window, with origin at upper left) 
  // to Canonical View Volume (CVV) coords GUIbox.xCVV, GUIbox.yCVV.
  // Define these 'CVV' coords using the HTML-5 'canvas' object in our webpage:
  // -- right handed (x increases rightwards, y increases upwards on-screen)
  // -- origin at the center of the canvas object in the browser client area;
  // -- GUIbox.xCVV== -1 at left edge of canvas, +1.0 at right edge of canvas;
  // -- GUIbox.yCVV== -1 at bottom edge of canvas, +1 at top edge of canvas.

  //	console.log("called GUIbox.mouseToCVV(mev)");
  var rect = g_canvasID.getBoundingClientRect(); // get canvas corners in pixels
  var xp = mev.clientX - rect.left;						   // x==0 at canvas left edge
  var yp = g_canvasID.height -(mev.clientY -rect.top); 
     																							// y==0 at canvas bottom edge
  //  console.log('GUIbox.mousetoCVV()--in pixel coords: xp,yp=\t',xp,',\t',yp);

  	// Then convert to Canonical View Volume (CVV) coordinates:
    this.xCVV = (xp - g_canvasID.width/2)  /  // move origin to center of canvas and
                (g_canvasID.width/2);	  // normalize canvas to -1 <= x < +1,
  	this.yCVV = (yp - g_canvasID.height/2) /  //							 -1 <= y < +1.
  	            (g_canvasID.height/2);
}
/*
GUIbox.prototype.mouseClick = function(mev) {
//==============================================================================
// User made a single mouse-click in the client area of browser window.
//
// NOTE:  I don't use this, but you might want it in your program.
// I avoid using this.mouseClick() and this.mouseDblClick() because they combine 
// multiple events -- I prefer separate mousedown, mouseup, mousemove event
// handlers because they let me respond more adeptly to users' mouse actions,
// especially 'dragging' actions.

// console.log("called GUIbox.mouseClick(mev).");


 // USEFUL TRICK: REPORT ALL FUNCTION ARGUMENTS
	console.log("GUIbox.mouseClick()---------REPORT ALL ARGUMENTS!");
	for(var i=0; i< arguments.length; i++) {// LIST all function-call arguments:
		console.log('\targ[' + i + '] == ' + arguments[i]);
	}
	console.log("---------------------(end this.MouseClick() argument list)");		

	// display contents of the 'mouseEvent' object passed as argument. See:
	// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent 
	console.log(   mev.altKey + ',\t'     + mev.ctrlKey + 
	         '\t== mev.altKey, ctrlKey');		// true/false
	console.log(   mev.shiftKey + ',\t'   + mev.metaKey +
	         '\t== mev.shiftKey, metaKey');	// true/false
	console.log(   mev.button   + ',\t\t' + mev.buttons +
	         '\t\t== ev.button, buttons');		// >1 button?
	console.log(   mev.clientX  + ',\t'   + mev.clientY +
	       '\t\t== mev.clientX,Y');	
	 				// Mouse pointer x,y pixel position in browser-window 'client' 
	 				// coordinates, with origin at UPPER LEFT corner, integer 
	 				// x increases rightwards, y increases DOWNWARDS, in pixel units.
	console.log( mev.movementX + ',\t\t'  + mev.movementY + 
	         '\t\t== mev.movementX,Y');

}

GUIbox.prototype.mouseDblClick = function(mev) {
//==============================================================================
// User made a double mouse-click in the client area of browser window.
//
// NOTE:  I don't use this, but you might want it in your program.
// I avoid using GUIbox.mouseClick() and GUIbox.mouseDblClick() because they 
// combine multiple events -- I prefer separate mousedown, mouseup, mousemove 
// event handlers because they let me respond more adeptly to users' mouse 
// actions, especially 'dragging' actions.

// console.log("called GUIbox.mouseDblClick(mev).");

	// print contents of the 'mouseEvent' object passed as argument. See:
	// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent 
	console.log(   mev.altKey + ',\t'     + mev.ctrlKey + 
	         '\t== mev.altKey, ctrlKey');		// true/false
	console.log(   mev.shiftKey + ',\t'   + mev.metaKey +
	         '\t== mev.shiftKey, metaKey');	// true/false
	console.log(   mev.button   + ',\t\t' + mev.buttons +
	         '\t\t== ev.button, buttons');		// >1 button?
	console.log(   mev.clientX  + ',\t'   + mev.clientY +
	       '\t\t== mev.clientX,Y');	
	 				// Mouse pointer x,y pixel position in browser-window 'client' 
	 				// coordinates, with origin at UPPER LEFT corner, integer 
	 				// x increases rightwards, y increases DOWNWARDS, in pixel units.
	console.log( mev.movementX + ',\t\t'  + mev.movementY + 
	         '\t\t== mev.movementX,Y');
}

GUIbox.prototype.canvasClick = function(mev) {
//=============================================================================
// Called when user CLICKS mouse button within the HTML-5 canvas
// 									(Which button?  console.log('mev.button=' + mev.button); )
// 	mev.clientX, mev.clientY == mouse pointer location, but measured in webpage 
//	pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS(!)  
//  That's not good for us -- convert to CVV coordinates instead:

//	console.log("called GUIbox.canvasClick(mev)");
	
	this.mouseToCVV(mev);							// convert to CVV coordinates:
	                                  // (result in this.xCVV, this.yCVV)
	// display it on our webpage, too...
	document.getElementById('MouseCanvas').innerHTML = 
	  'gui.canvasClick() at CVV coords xCVV,yCVV = ' + 
	  gui.xCVV.toFixed(5) + ', ' + gui.yCVV.toFixed(5);
///	console.log('gui.canvasClick(): xCVV,yCVV== ' + 
//              gui.xCVV.toFixed(5) + ', ' + gui.yCVV.toFixed(5));

}
*/
//=====================
//
//    KEYBOARD
//
//=====================


GUIbox.prototype.keyDown = function(kev) {
  //============================================================================
  // Called when user presses down ANY key on the keyboard;
  //
  // For a light, easy explanation of keyboard events in JavaScript,
  // see:    http://www.kirupa.com/html5/keyboard_events_in_javascript.htm
  // For a thorough explanation of mess of JavaScript keyboard event handling,
  // see:    http://javascript.info/tutorial/keyboard-events
  //
  // NOTE: Mozilla deprecated the 'keypress' event entirely, and in the
  //        'keydown' event deprecated several read-only properties I used
  //        previously, including kev.charCode, kev.keyCode. 
  //        Revised 5/2019:  use kev.key and kev.code instead.
  //
  /*
  	// On console, report EVERYTHING about this key-down event:  
    console.log("--kev.code:",      kev.code,   "\t\t--kev.key:",     kev.key, 
                "\n--kev.ctrlKey:", kev.ctrlKey,  "\t--kev.shiftKey:",kev.shiftKey,
                "\n--kev.altKey:",  kev.altKey,   "\t--kev.metaKey:", kev.metaKey);
  */
  // On webpage, report EVERYTHING about this key-down event:              
	

  switch(kev.code) {
    case "Digit0":
			g_partA.runMode = 0;			// RESET!
			console.log("digit 0 key.(UNUSED)");              // print on console.
      break;
    case "Digit1":
			g_partA.runMode = 1;			// PAUSE!
			console.log("digit 1 key.(UNUSED)");              // print on console.
      break;
    case "KeyT":                                // 't' or 'T' key: ray-trace!
	  console.log("t/T key: TRACE a new image!");         // print on console,
      g_myScene.makeRayTracedImage(); // (near end of traceSupplement.js)			
      rayView.switchToMe(); // be sure OUR VBO & shaders are in use, then
      rayView.reload();     // re-transfer VBO contents and texture-map contents
      drawAll();
      break;
		//------------------WASD navigation-----------------
		case "KeyA":
			this.camStrafe_L();
			break;
		case "KeyD":
			this.camStrafe_R();
			break;
		case "KeyS":
			this.camRev();
			break;
		case "KeyW":
			this.camFwd();
			break;		
		case "ArrowLeft": 	
				break;
		case "ArrowRight":
				break;
		case "ArrowUp":		
			break;
		case "ArrowDown":
				break;	
  }
}

GUIbox.prototype.keyUp = function(kev) {
  //

}

// GUIbox.prototype.mySlider = function() {
//   optLight.I_ambi = [];
//   optLight.I_diff = [];
//   optLight.I_spec = [];
//   optLight.I_ambi.push(slider_I_ambi_r.value/255, slider_I_ambi_g.value/255, slider_I_ambi_b.value/255, 1.0)
//   optLight.I_diff.push(slider_I_diff_r.value/255, slider_I_diff_g.value/255, slider_I_diff_b.value/255, 1.0)
//   optLight.I_spec.push(slider_I_spec_r.value/255, slider_I_spec_g.value/255, slider_I_spec_b.value/255, 1.0)
// }

GUIbox.prototype.camFwd = function() {
  //==============================================================================
  // Move the camera FORWARDS in the aiming direction, but without changing
  // the aiming direction. (If you're tilting up or down, you'll move up or down)
  var fwd = vec4.create();
  vec4.sub(fwd, this.camAimPt, this.camEyePt);  // Eye-to-Aim point vector (w=0)
  vec4.normalize(fwd, fwd);                     // make vector unit-length
  vec4.scale(fwd, fwd, this.camSpeed);          // scale length to set velocity
  vec4.add(this.camAimPt, this.camAimPt, fwd);  // add to BOTH points.
  vec4.add(this.camEyePt, this.camEyePt, fwd);
  drawAll();          // show new result on-screen.
}

GUIbox.prototype.camRev = function() {
  //==============================================================================
  // Move the camera BACKWARDS, in the reverse aiming direction (don't change aim)
  var rev = vec4.create();
  vec4.sub(rev,this.camEyePt, this.camAimPt);   // Aim-to-Eye point vector (w=0)
  vec4.normalize(rev,rev);                      // make it unit-length
  vec4.scale(rev, rev, this.camSpeed);          // scale length to set velocity
  vec4.add(this.camAimPt, this.camAimPt, rev);  // add to BOTH points.
  vec4.add(this.camEyePt, this.camEyePt, rev);
  drawAll();          // show new result on-screen.
}

GUIbox.prototype.camStrafe_L = function() {
  //==============================================================================
  // Move horizontally left-wards, perpendicular to aiming direction, without
  // changing aiming direction or height above ground.
    // 'rtSide' vector points rightwards, perpendicular to aiming direction.
  var rtSide = vec4.fromValues(  Math.sin(this.camYaw), // x
                                -Math.cos(this.camYaw), // y
                                0.0, 0.0); // z, w (==0; vector, not point!)
  // rtSide is already unit length.
  vec4.scale(rtSide, rtSide, -this.camSpeed);  // scale length to set velocity,
  vec4.add(this.camAimPt, this.camAimPt, rtSide);  // add to BOTH points.
  vec4.add(this.camEyePt, this.camEyePt, rtSide);
  drawAll();
}

GUIbox.prototype.camStrafe_R = function() {
  //==============================================================================
  // Move horizontally left-wards, perpendicular to aiming direction, without
  // changing aiming direction or height above ground.
  // 'rtSide' vector points rightwards, perpendicular to aiming direction.
  var rtSide = vec4.fromValues(  Math.sin(this.camYaw), // x
                                -Math.cos(this.camYaw), // y
                                0.0, 0.0); // z, w (==0; vector, not point!)
  // rtSide is already unit length.
  vec4.scale(rtSide, rtSide, this.camSpeed);  // scale length to set velocity,
  vec4.add(this.camAimPt, this.camAimPt, rtSide);  // add to BOTH points.
  vec4.add(this.camEyePt, this.camEyePt, rtSide);
  drawAll();
}


// GUIbox.prototype.setLightColor0 = function() {
//   slider_I_ambi_r.value = 0.8*255;
//   slider_I_ambi_g.value = 0.8*255;
//   slider_I_ambi_b.value = 0.8*255;
//   slider_I_diff_r.value = 1.0*255;
//   slider_I_diff_g.value = 1.0*255;
//   slider_I_diff_b.value = 1.0*255;
//   slider_I_spec_r.value = 0.6*255;
//   slider_I_spec_g.value = 0.6*255;
//   slider_I_spec_b.value = 0.6*255;
//   this.mySlider();
// }
// GUIbox.prototype.setLightColor1 = function() {
//   slider_I_ambi_r.value = 0.8*255;
//   slider_I_ambi_g.value = 0.8*255;
//   slider_I_ambi_b.value = 0.8*255;
//   slider_I_diff_r.value = 1.0*255;
//   slider_I_diff_g.value = 0.5*255;
//   slider_I_diff_b.value = 0.5*255;
//   slider_I_spec_r.value = 1.0*255;
//   slider_I_spec_g.value = 0.5*255;
//   slider_I_spec_b.value = 0.5*255;
//   this.mySlider()
// }
// GUIbox.prototype.setLightColor2 = function() {
//   slider_I_ambi_r.value = 0.8*255;
//   slider_I_ambi_g.value = 0.8*255;
//   slider_I_ambi_b.value = 0.8*255;
//   slider_I_diff_r.value = 0.5*255;
//   slider_I_diff_g.value = 1.0*255;
//   slider_I_diff_b.value = 0.5*255;
//   slider_I_spec_r.value = 0.5*255;
//   slider_I_spec_g.value = 1.0*255;
//   slider_I_spec_b.value = 0.5*255;
//   this.mySlider()
// }
// GUIbox.prototype.setLightColor3 = function() {
//   slider_I_ambi_r.value = 0.8*255;
//   slider_I_ambi_g.value = 0.8*255;
//   slider_I_ambi_b.value = 0.8*255;
//   slider_I_diff_r.value = 0.5*255;
//   slider_I_diff_g.value = 0.5*255;
//   slider_I_diff_b.value = 1.0*255;
//   slider_I_spec_r.value = 0.5*255;
//   slider_I_spec_g.value = 0.5*255;
//   slider_I_spec_b.value = 1.0*255;
//   this.mySlider()
// }