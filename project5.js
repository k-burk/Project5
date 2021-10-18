"use strict";

var canvas;
var gl;

var points = [];
var colors = [];
var normals = [];

var blanketMeshPoints = [];
var blanketMeshColors = [];

var near = 0.3;
var far = 9.5;
var radius = 4.0;
var theta  = 0.0;
var phi    = 0.0;

var  fovy = 80.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect = 1.0;       // Viewport aspect ratio

var lightPosition = vec4(5.0, 5.0, 10.0, 0.0 );
var lightAmbient = vec4(1.0, 1.0, 1.0, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0);
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 100.0;

var axis = 0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;
var camera = 2;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    var theCoffeeTable = coffeeTable(1, 1, 1, -0.1,0,-0.2);
    points = theCoffeeTable.TriangleVertices;
    colors = theCoffeeTable.TriangleVertexColors;
    normals = theCoffeeTable.TriangleNormals;

    var theLamp = lamp(1.5, 1.8, -1.6);
    points = points.concat(theLamp.TriangleVertices);
    colors = colors.concat(theLamp.TriangleVertexColors);
    normals = normals.concat(theLamp.TriangleNormals);

    var theSideTable = sideTable(1.5,1.2,-1.8);
    points = points.concat(theSideTable.TriangleVertices);
    colors = colors.concat(theSideTable.TriangleVertexColors);
    normals = normals.concat(theSideTable.TriangleNormals);

    var thePlantPot = plantPot();
    thePlantPot.translate(1.5, 1.6,-1.5);
    points = points.concat(thePlantPot.TriangleVertices);
    colors = colors.concat(thePlantPot.TriangleVertexColors);
    normals = normals.concat(thePlantPot.TriangleNormals);

    var tree = theTree(1,1,1,-1.65, 1.5, 0.0);
    points = points.concat(tree.TriangleVertices);
    colors = colors.concat(tree.TriangleVertexColors);
    normals = normals.concat(tree.TriangleNormals);

    var wallDecoration = theSphereCrap(1,1,1,-0.1,2.3, -1.8);
    points = points.concat(wallDecoration.TriangleVertices);
    colors = colors.concat(wallDecoration.TriangleVertexColors);
    normals = normals.concat(wallDecoration.TriangleNormals);

    var rightCouch = couch(1.5, 1.2, -0.8);
    points = points.concat(rightCouch.TriangleVertices);
    colors = colors.concat(rightCouch.TriangleVertexColors);
    normals = normals.concat(rightCouch.TriangleNormals);

    var backCouch = couch2(-0.1, 0.9, -1.3);
    points = points.concat(backCouch.TriangleVertices);
    colors = colors.concat(backCouch.TriangleVertexColors);
    normals = normals.concat(backCouch.TriangleNormals);

    var theWindows = blinds(0.0,1.9,-1.6);
    points = points.concat(theWindows.TriangleVertices);
    colors = colors.concat(theWindows.TriangleVertexColors);
    normals = normals.concat(theWindows.TriangleNormals);

    var theRug = rug();
    points = points.concat(theRug.TriangleVertices);
    colors = colors.concat(theRug.TriangleVertexColors);
    normals = normals.concat(theRug.TriangleNormals);

    var oneWall = leftWall();
    points = points.concat(oneWall.TriangleVertices);
    colors = colors.concat(oneWall.TriangleVertexColors);
    normals = normals.concat(oneWall.TriangleNormals);

    var twoWall = backWall();
    points = points.concat(twoWall.TriangleVertices);
    colors = colors.concat(twoWall.TriangleVertexColors);
    normals = normals.concat(twoWall.TriangleNormals);

    var threeWall = backkWall();
    points = points.concat(threeWall.TriangleVertices);
    colors = colors.concat(threeWall.TriangleVertexColors);
    normals = normals.concat(threeWall.TriangleNormals);

    var blanket = blanketMesh();
    blanket.scale(0.18, 0.18, 0.8);
    blanket.translate(1.65, 1.2, -0.9);
    blanketMeshPoints = blanket.TriangleVertices;
    blanketMeshColors = blanket.TriangleVertexColors;

    points = points.concat(blanketMeshPoints);
    colors = colors.concat(blanketMeshColors);

    gl.viewport( 0, 0, canvas.width, canvas.height );

    aspect =  canvas.width/canvas.height;

    gl.clearColor( 1.0, 0.976, 0.957, 1.0 );

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // color buffer
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    // normals buffer
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );


    // vertex buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
        flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
        flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
        flatten(specularProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
        flatten(lightPosition) );

    gl.uniform1f(gl.getUniformLocation(program,
        "shininess"),materialShininess);


    render();
}

var render = function()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // set eye of camera
    eye = vec3(radius * Math.sin((theta + 30.0)* Math.PI/180.0) * Math.cos((phi + 95.0) * Math.PI/180.0),
        radius * Math.sin((theta + 30.0)* Math.PI/180.0) * Math.sin((phi + 95.0) * Math.PI/180.0), radius * Math.cos((theta + 30.0)* Math.PI/180.0));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(fovy, aspect, near, far);

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    gl.drawArrays( gl.TRIANGLES, 0, points.length - blanketMeshPoints.length);

    gl.drawArrays(gl.LINE_LOOP, points.length - blanketMeshPoints.length, blanketMeshPoints.length);

    requestAnimFrame( render );

}