 var floatsPerVertex = 10;

var VERT_SHADER_G =
  'struct MatlT {\n' +    // Describes one Phong material by its reflectances:
  '   vec3 emit;\n' +     // Ke: emissive -- surface 'glow' amount (r,g,b);
  '   vec3 ambi;\n' +     // Ka: ambient reflectance (r,g,b)
  '   vec3 diff;\n' +     // Kd: diffuse reflectance (r,g,b)
  '   vec3 spec;\n' +     // Ks: specular reflectance (r,g,b)
  '   int shiny;\n' +     // Kshiny: specular exponent (integer >= 1; typ. <200)
  '};\n' +
  'struct LampT {\n' +    // Describes one point-like Phong light source
  '   vec3 pos;\n' +      // (x,y,z,w); w==1.0 for local light at x,y,z position
  '   vec3 ambi;\n' +     // Ia ==  ambient light source strength (r,g,b)
  '   vec3 diff;\n' +     // Id ==  diffuse light source strength (r,g,b)
  '   vec3 spec;\n' +     // Is == specular light source strength (r,g,b)
  '};\n' +
  'uniform MatlT u_MatlSet;\n' +
  'uniform LampT u_LampHead;\n' +
  'uniform LampT u_LampPoint;\n' +

  'attribute vec4 a_Position;\n' +
  // 'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform int u_PHONG;\n' +
  'uniform float u_ATT;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  vec4 vertexPosition = u_ModelMatrix * a_Position;\n' +
  '  vec3 lightDirectionHead = normalize(u_LampHead.pos - vec3(vertexPosition));\n' +
  '  vec3 lightDirectionPoint = normalize(u_LampPoint.pos - vec3(vertexPosition));\n' +
  '  float nDotLHead = max(dot(lightDirectionHead, normal), 0.0);\n' +
  '  float nDotLPoint = max(dot(lightDirectionPoint, normal), 0.0);\n' +
  '  vec3 reflecDirectionHead = normalize(2.0*normal*nDotLHead - lightDirectionHead);\n' +
  '  vec3 reflecDirectionPoint = normalize(2.0*normal*nDotLPoint - lightDirectionPoint);\n' +
  '  vec3 viewDirection = normalize(u_LampHead.pos - vec3(vertexPosition));\n' +
  '  float rDotVHead = max(dot(reflecDirectionHead, viewDirection), 0.0);\n' +
  '  float rDotVPoint = max(dot(reflecDirectionPoint, viewDirection), 0.0);\n' +
  '  float nDotHHead = max(dot(normal, normalize(lightDirectionHead + viewDirection)), 0.0);\n' +
  '  float nDotHPoint = max(dot(normal, normalize(lightDirectionPoint + viewDirection)), 0.0);\n' +
  '  float distHead = distance(u_LampHead.pos, vec3(vertexPosition));\n' +
  '  float distPoint = distance(u_LampPoint.pos, vec3(vertexPosition));\n' +
  '  vec3 diffuseHead = u_LampHead.diff * u_MatlSet.diff * nDotLHead;\n' +
  '  vec3 diffusePoint = u_LampPoint.diff * u_MatlSet.diff * nDotLPoint;\n' +
  '  vec3 ambientHead = u_LampHead.ambi * u_MatlSet.ambi;\n' +
  '  vec3 ambientPoint = u_LampPoint.ambi * u_MatlSet.ambi;\n' +
  '  vec3 specularHead;\n' +
  '  vec3 specularPoint;\n' +
  '  if (u_PHONG > 0) {\n' +
  '    specularHead = u_LampHead.spec*pow(rDotVHead, float(u_MatlSet.shiny));\n' +
  '    specularPoint = u_LampPoint.spec*pow(rDotVPoint,float(u_MatlSet.shiny));\n' +
  '  } else {\n' +
  '    specularHead = u_LampHead.spec*pow(nDotHHead,float(u_MatlSet.shiny));\n' +
  '    specularPoint = u_LampPoint.spec*pow(nDotHPoint,float(u_MatlSet.shiny));\n' +
  '  }\n' +
  '  v_Color = vec4(diffuseHead/pow(distHead,u_ATT) + specularHead/pow(distHead,u_ATT) + ambientHead +' +
  '  diffusePoint/pow(distPoint,u_ATT) + specularPoint/pow(distPoint,u_ATT) + ambientPoint, 1.0);\n' +
  '}\n';

var FRAG_SHADER_G =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

var VERT_SHADER_P =
  // 'struct MatlT {\n' +    // Describes one Phong material by its reflectances:
  // '   vec3 emit;\n' +     // Ke: emissive -- surface 'glow' amount (r,g,b);
  // '   vec3 ambi;\n' +     // Ka: ambient reflectance (r,g,b)
  // '   vec3 diff;\n' +     // Kd: diffuse reflectance (r,g,b)
  // '   vec3 spec;\n' +     // Ks: specular reflectance (r,g,b)
  // '   int shiny;\n' +     // Kshiny: specular exponent (integer >= 1; typ. <200)
  // '};\n' +
  // 'uniform MatlT u_MatlSet;\n' +
  'attribute vec4 a_Position;\n' +
  // 'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  v_Color = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '}\n';

var FRAG_SHADER_P =
  '#ifdef GL_ES\n' +
  'precision highp float;\n' +
  '#endif\n' +
  'struct MatlT {\n' +    // Describes one Phong material by its reflectances:
  '   vec3 emit;\n' +     // Ke: emissive -- surface 'glow' amount (r,g,b);
  '   vec3 ambi;\n' +     // Ka: ambient reflectance (r,g,b)
  '   vec3 diff;\n' +     // Kd: diffuse reflectance (r,g,b)
  '   vec3 spec;\n' +     // Ks: specular reflectance (r,g,b)
  '   int shiny;\n' +     // Kshiny: specular exponent (integer >= 1; typ. <200)
  '};\n' +
  'struct LampT {\n' +    // Describes one point-like Phong light source
  '   vec3 pos;\n' +      // (x,y,z,w); w==1.0 for local light at x,y,z position
  '   vec3 ambi;\n' +     // Ia ==  ambient light source strength (r,g,b)
  '   vec3 diff;\n' +     // Id ==  diffuse light source strength (r,g,b)
  '   vec3 spec;\n' +     // Is == specular light source strength (r,g,b)
  '};\n' +
  'uniform MatlT u_MatlSet;\n' +
  'uniform LampT u_LampHead;\n' +
  'uniform LampT u_LampPoint;\n' +

  'uniform float u_ATT;\n' +
  'uniform int u_PHONG;\n' +
  'varying vec4 v_Color;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'void main() {\n' +
  '  vec3 normal = normalize(v_Normal);\n' +
  '  vec3 lightDirectionHead = normalize(u_LampHead.pos - v_Position);\n' +
  '  vec3 lightDirectionPoint = normalize(u_LampPoint.pos - v_Position);\n' +
  '  float nDotLHead = max(dot(lightDirectionHead, normal), 0.0);\n' +
  '  float nDotLPoint = max(dot(lightDirectionPoint, normal), 0.0);\n' +
  '  vec3 reflecDirectionHead = normalize(2.0*normal*nDotLHead - lightDirectionHead);\n' +
  '  vec3 reflecDirectionPoint = normalize(2.0*normal*nDotLPoint - lightDirectionPoint);\n' +
  '  vec3 viewDirection = normalize(u_LampHead.pos - v_Position);\n' +
  '  float rDotVHead = max(dot(reflecDirectionHead, viewDirection), 0.0);\n' +
  '  float rDotVPoint = max(dot(reflecDirectionPoint, viewDirection), 0.0);\n' +
  '  float nDotHHead = max(dot(normal, normalize(lightDirectionHead + viewDirection)), 0.0);\n' +
  '  float nDotHPoint = max(dot(normal, normalize(lightDirectionPoint + viewDirection)), 0.0);\n' +
  '  float distHead = distance(u_LampHead.pos, v_Position);\n' +
  '  float distPoint = distance(u_LampPoint.pos, v_Position);\n' +
  '  vec3 diffuseHead = u_LampHead.diff * u_MatlSet.diff * nDotLHead;\n' +
  '  vec3 diffusePoint = u_LampPoint.diff * u_MatlSet.diff * nDotLPoint;\n' +
  '  vec3 ambientHead = u_LampHead.ambi * u_MatlSet.ambi;\n' +
  '  vec3 ambientPoint = u_LampPoint.ambi * u_MatlSet.ambi;\n' +
  '  vec3 specularHead;\n' +
  '  vec3 specularPoint;\n' +
  '  if (u_PHONG > 0) {\n' +
  '    specularHead = u_LampHead.spec*pow(rDotVHead,float(u_MatlSet.shiny));\n' +
  '    specularPoint = u_LampPoint.spec*pow(rDotVPoint,float(u_MatlSet.shiny));\n' +
  '  } else {\n' +
  '    specularHead = u_LampHead.spec*pow(nDotHHead,float(u_MatlSet.shiny));\n' +
  '    specularPoint = u_LampPoint.spec*pow(nDotHPoint,float(u_MatlSet.shiny));\n' +
  '  }\n' +
  '  gl_FragColor = vec4(diffuseHead/pow(distHead,u_ATT) + specularHead/pow(distHead,u_ATT) + ambientHead + ' +
  '  diffusePoint/pow(distPoint,u_ATT) + specularPoint/pow(distPoint,u_ATT) + ambientPoint, 1.0);\n' +
  '}\n';


function VBObox(SHADER) {
  if (SHADER=='G'){
  	this.VERT_SRC =	VERT_SHADER_G;
  	this.FRAG_SRC = FRAG_SHADER_G;
  } else if (SHADER=='P'){
    this.VERT_SRC = VERT_SHADER_P;
    this.FRAG_SRC = FRAG_SHADER_P;
  } else {
    console.log('Specify SHADER type incorrectly.')
    return -1;
  }

	this.vboLoc;										// Vertex Buffer Object location# on the GPU
	this.shaderLoc;									// Shader-program location # on the GPU, made
	this.a_Position;									// GPU location for 'a_Pos' attribute
	// this.a_Color;									// GPU location for 'a_Colr' attribute
	this.a_Normal;

	this.modelMatrix = new Matrix4();
	this.mvpMatrix = new Matrix4();
	this.normalMatrix = new Matrix4();
	this.u_ModelMatrix;								// GPU location for u_ModelMat uniform
	this.u_MvpMatrix;
	this.u_NormalMatrix;

  this.u_ATT;
  this.u_PHONG;
	this.u_MatlSet = new Material(MATL_GRN_PLASTIC);
  this.u_LampHead = new Light();
  this.u_LampPoint = new Light();
}

VBObox.prototype.init = function(myGL, data) {
	this.shaderLoc = createProgram(myGL, this.VERT_SRC, this.FRAG_SRC);
	myGL.program = this.shaderLoc;
	this.vboLoc = myGL.createBuffer();

  myGL.bindBuffer(myGL.ARRAY_BUFFER, this.vboLoc);
  myGL.bufferData(myGL.ARRAY_BUFFER, data, myGL.STATIC_DRAW);
  var FSIZE = data.BYTES_PER_ELEMENT;

  this.a_Position = myGL.getAttribLocation(this.shaderLoc, 'a_Position');
 	// this.a_Color = myGL.getAttribLocation(this.shaderLoc, 'a_Color');
  this.a_Normal = myGL.getAttribLocation(this.shaderLoc, 'a_Normal');
  myGL.vertexAttribPointer(this.a_Position, 4, myGL.FLOAT, false, floatsPerVertex*FSIZE, 0*FSIZE);
  // myGL.vertexAttribPointer(this.a_Color,    3, myGL.FLOAT, false, floatsPerVertex*FSIZE, 4*FSIZE);
  myGL.vertexAttribPointer(this.a_Normal,   3, myGL.FLOAT, false, floatsPerVertex*FSIZE, 7*FSIZE);
  myGL.enableVertexAttribArray(this.a_Position);
  // myGL.enableVertexAttribArray(this.a_Color);
  myGL.enableVertexAttribArray(this.a_Normal);
  myGL.bindBuffer(myGL.ARRAY_BUFFER, null);

  this.u_ATT = myGL.getUniformLocation(this.shaderLoc, 'u_ATT');
  this.u_PHONG = myGL.getUniformLocation(this.shaderLoc, 'u_PHONG');
	this.u_ModelMatrix = myGL.getUniformLocation(this.shaderLoc, 'u_ModelMatrix');
  this.u_MvpMatrix = myGL.getUniformLocation(this.shaderLoc, 'u_MvpMatrix');
  this.u_NormalMatrix = myGL.getUniformLocation(this.shaderLoc, 'u_NormalMatrix');

  this.u_MatlSet.uK_emit = myGL.getUniformLocation(this.shaderLoc, 'u_MatlSet.emit');
  this.u_MatlSet.uK_ambi = myGL.getUniformLocation(this.shaderLoc, 'u_MatlSet.ambi');
  this.u_MatlSet.uK_diff = myGL.getUniformLocation(this.shaderLoc, 'u_MatlSet.diff');
  this.u_MatlSet.uK_spec = myGL.getUniformLocation(this.shaderLoc, 'u_MatlSet.spec');
  this.u_MatlSet.uK_shiny = myGL.getUniformLocation(this.shaderLoc, 'u_MatlSet.shiny');
  this.u_LampHead.uI_pos = myGL.getUniformLocation(this.shaderLoc, 'u_LampHead.pos');
  this.u_LampHead.uI_ambi = myGL.getUniformLocation(this.shaderLoc, 'u_LampHead.ambi');
  this.u_LampHead.uI_diff = myGL.getUniformLocation(this.shaderLoc, 'u_LampHead.diff');
  this.u_LampHead.uI_spec = myGL.getUniformLocation(this.shaderLoc, 'u_LampHead.spec');
  this.u_LampPoint.uI_pos = myGL.getUniformLocation(this.shaderLoc, 'u_LampPoint.pos');
  this.u_LampPoint.uI_ambi = myGL.getUniformLocation(this.shaderLoc, 'u_LampPoint.ambi');
  this.u_LampPoint.uI_diff = myGL.getUniformLocation(this.shaderLoc, 'u_LampPoint.diff');
  this.u_LampPoint.uI_spec = myGL.getUniformLocation(this.shaderLoc, 'u_LampPoint.spec');
}
