var MATL_RED_PLASTIC = 		1;
var MATL_GRN_PLASTIC = 		2;
var MATL_BLU_PLASTIC = 		3;
var MATL_MIRROR =			4;
var MATL_GLASS =			5;
var MATL_BLACK_PLASTIC = 	6;
var MATL_WHITE_PLASTIC = 	7;
var MATL_DEFAULT = 			7;

function Light() {
	this.isLit = 1;
	this.I_pos = new vec4.create();		// x,y,z,w:   
										// w==1 for local 3D position,
										// w==0 for light at infinity in direction (x,y,z)
	// Default light color: white
	this.I_ambi = new vec4.fromValues(0.8, 0.8, 0.8, 1);
	this.I_diff = new vec4.fromValues(1.2, 1.2, 1.2, 1);
	this.I_spec = new vec4.fromValues(0.6, 0.6, 0.6, 1);
}


function Material(opt_Matl) {
	this.K_emit = vec4.create();
	this.K_ambi = vec4.create();
	this.K_diff = vec4.create();
	this.K_spec = vec4.create();
	this.K_shiny = 0.0;
	this.K_name = "Undefined Material";
	this.K_matlNum = 	MATL_DEFAULT;
	this.K_absorb = 0.4;
	this.setMatl(opt_Matl);
	return this;
}

Material.prototype.setMatl = function(numMatl) {
	switch(numMatl)
	{
		case MATL_RED_PLASTIC: // 1
			this.K_emit = vec4.fromValues(0.0,     0.0,    0.0,    1.0);
			this.K_ambi = vec4.fromValues(0.1,     0.1,    0.1,    1.0);
			this.K_diff = vec4.fromValues(1.0,     0.08,    0.08,    1.0);
			this.K_spec = vec4.fromValues(0.8,     0.8,    0.8,    1.0);
			this.K_shiny = 100.0;
			this.K_absorb = 0.4;
			this.K_name = "MATL_RED_PLASTIC";
			break;
		case MATL_GRN_PLASTIC: // 2
			this.K_emit = vec4.fromValues(0.0,     0.0,    0.0,    1.0);
			this.K_ambi = vec4.fromValues(0.05,    0.05,   0.05,   1.0);
			this.K_diff = vec4.fromValues(0.7,     1.0,    0.2,    1.0);
			this.K_spec = vec4.fromValues(0.2,     0.2,    0.2,    1.0);
			this.K_shiny = 60.0;
			this.K_absorb = 0.4;
			this.K_name = "MATL_GRN_PLASTIC";
			break;
		case MATL_BLU_PLASTIC: // 3
			this.K_emit = vec4.fromValues(0.0,     0.0,    0.0,    1.0);
			this.K_ambi = vec4.fromValues(0.05,    0.05,   0.05,   1.0);
			this.K_diff = vec4.fromValues(0.0,     0.4,    1.0,    1.0);
			this.K_spec = vec4.fromValues(0.1,     0.2,    0.3,    1.0);
			this.K_shiny = 100.0;
			this.K_absorb = 0.4;
			this.K_name = "MATL_BLU_PLASTIC";
			break;
		// case MATL_PPL_PLASTIC: // 1
		// 	this.K_emit = vec4.fromValues(0.0,     0.0,    0.0,    1.0);
		// 	this.K_ambi = vec4.fromValues(0.1,     0.1,    0.1,    1.0);
		// 	this.K_diff = vec4.fromValues(0.6,     0.05,    0.05,    1.0);
		// 	this.K_spec = vec4.fromValues(0.6,     0.6,    0.6,    1.0);
		// 	this.K_shiny = 100.0;
		// 	this.K_name = "MATL_RED_PLASTIC";
		// 	break;
		case MATL_MIRROR: // 4
			this.K_emit = vec4.fromValues(0.0,     0.0,    0.0,    1.0);
			this.K_ambi = vec4.fromValues(0.0,     0.0,    0.0,    1.0);
			this.K_diff = vec4.fromValues(0.0,     0.0,    0.0,    1.0);
			this.K_spec = vec4.fromValues(1.2,     1.2,    1.2,    1.0);
			this.K_shiny = 150.0;
			this.K_absorb = 1.0;
			this.K_name = "MATL_MIRROR";
			break;
		case MATL_GLASS: // 4
			this.K_emit = vec4.fromValues(0.0,     0.0,    0.0,    1.0);
			this.K_ambi = vec4.fromValues(0.05,    0.05,  0.05,    1.0);
			this.K_diff = vec4.fromValues(0.0,     0.0,    0.0,    1.0);
			this.K_spec = vec4.fromValues(1.2,     1.2,    1.2,    1.0);
			this.K_shiny = 400.0;
			this.K_absorb = 0.1;
			this.K_name = "MATL_MIRROR";
			break;
		case MATL_BLACK_PLASTIC: // 4
			this.K_emit = vec4.fromValues(0.0,     0.0,    0.0,    1.0);
			this.K_ambi = vec4.fromValues(0.0,     0.0,    0.0,    1.0);
			this.K_diff = vec4.fromValues(0.15,    0.15,   0.15,   1.0);
			this.K_spec = vec4.fromValues(0.5,     0.5,    0.5,    1.0);
			this.K_shiny = 32.0;
			this.K_absorb = 0.4;
			this.K_name = "MATL_BLACK_PLASTIC";
			break;
		case MATL_WHITE_PLASTIC: // 4
			this.K_emit = vec4.fromValues(0.0,     0.0,    0.0,    1.0);
			this.K_ambi = vec4.fromValues(0.1,     0.1,    0.1,    1.0);
			this.K_diff = vec4.fromValues(0.5,     0.5,    0.5,    1.0);
			this.K_spec = vec4.fromValues(0.0,     0.0,    0.0,    1.0);
			this.K_shiny = 32.0;
			this.K_absorb = 0.4;
			this.K_name = "MATL_WHITE_PLASTIC";
			break;


	}
	return this;
}
