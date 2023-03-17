import * as THREE from 'three';
import * as Tone from 'tone';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from './jsm/loaders/DRACOLoader.js';
import { ImprovedNoise } from './jsm/math/ImprovedNoise.js'; 
import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './jsm/postprocessing/UnrealBloomPass.js';
import { FlyControls } from './jsm/controls/FlyControls.js';
import { PointerLockControls } from './jsm/controls/PointerLockControls.js';
import { FontLoader } from './jsm/loaders/FontLoader.js';
// import {TTFLoader} from './jsm/loaders/TTFLoader.js';
import { Flow } from './jsm/modifiers/CurveModifier.js';
import { TextGeometry } from './jsm/geometries/TextGeometry.js';

const osc2 = new OSC();
osc2.open();

// document.body.style.cursor = 'none'; 

let texture;
let dpr = window.devicePixelRatio; 
let textureSize = 1024 * dpr;
const vector = new THREE.Vector2();
let megamesh;
let retroBool = true; 
let analisisBool = false; 
let creditos; 
let torusClone, torusKnot; 

let audioBool = false; 
var audioCtx = new AudioContext();
let analyser, dataArray, microphone;

let modelos = []; 
let materialVit; 

// hydra

let switchhydra = 0;
let refractionCube; 

var hydra = new Hydra({
    canvas: document.getElementById("myCanvas"),
    detectAudio: false,
    //makeGlobal: false
}) // antes tenía .synth aqui 

const elCanvas = document.getElementById( 'myCanvas');
elCanvas.style.display = 'none';     
let vit = new THREE.CanvasTexture(elCanvas);

// RenderTarget 

let cubort; 
const rtWidth = 1080;
const rtHeight = 1080;
const renderTarget = new THREE.WebGLRenderTarget(rtWidth, rtHeight, { format: THREE.RGBAFormat } );
const rtFov = 75;
const rtAspect = rtWidth / rtHeight;
const rtNear = 0.1;
const rtFar = 5;
const rtCamera = new THREE.PerspectiveCamera(rtFov, rtAspect, rtNear, rtFar);
rtCamera.position.z = 4;

const rtScene = new THREE.Scene();

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let escena = 0; 
let booltext = false; 
let textClone; 
let lineasSelectas = []; 

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

const curveHandles = [];
let flow, curve; 

let camera, renderer; 
let gamepads;
const scene = new THREE.Scene();
var light;
var controls; 

let message = [];
let achim = []; 

message[0] = "La gran movilidad del capital y la reproducción sexual no pueden restringir las libertades que quieren otorgar al uso de IRC no se pueden hacer";

message[1] = "Otra cosa mariposa miau miau"; 

let loaders = [];

console.log(message[Math.floor(Math.random()*2)]); 

var dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '/js/draco/' );

for(var i = 0; i < 15; i++){
    loaders[i] = new GLTFLoader();
    loaders[i].setDRACOLoader( dracoLoader );
}
// new GLTFLoader();
const clock = new THREE.Clock();
let objetos = []; 
let clonados = []; 
let clonX=[], clonY=[], clonZ=[]; 
let boolMesh = false; 
let font; 
let text = new THREE.Mesh();
let textGeoClon; 

const startButton = document.getElementById( 'startButton' );
startButton.addEventListener( 'click', init );

let lineasInicio = []; 

const loadertext = new THREE.FileLoader();

loadertext.load(
	'txt/inicio.txt',
	function ( data ) {
	    var arrLines = data.split("\n");
	    for (var i = 0; i < arrLines.length; i++) {
		lineasInicio.push(arrLines[i]);
	    }
	}
);
 
function init(){
    
    document.body.style.cursor = 'none'; 
    const overlay = document.getElementById( 'overlay' );
    overlay.remove();
    const blocker = document.getElementById( 'blocker' );
    const instructions = document.getElementById( 'instructions' );
    instructions.remove(); 
    blocker.remove();
    const container = document.createElement( 'div' );
    document.body.appendChild( container );
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 2000 );
    
    camera.position.set(0, 0, 40 );

    retro(); 

    /*
    const path = 'maps/1-cueva/';
    const format = '.png';
    const urls = [
	path + 'px' + format, path + 'nx' + format,
	path + 'py' + format, path + 'ny' + format,
	path + 'pz' + format, path + 'nz' + format
    ];

    const reflectionCube = new THREE.CubeTextureLoader().load( urls );
    const refractionCube = new THREE.CubeTextureLoader().load( urls );
    refractionCube.mapping = THREE.CubeRefractionMapping;
    scene.background = reflectionCube;
    */
    
    light = new THREE.PointLight( 0xffffff, 4 );
    light.position.set( 0, 0, 10 );
    scene.add( light ); 

    //light = new THREE.DirectionalLight( 0xffaa33 );
    //light.position.set( - 10, 10, 10 );
    //light.intensity = 1.0;
    //scene.add( light )
    
    const light2 = new THREE.AmbientLight( 0x003973 );
    light2.intensity = 1.0;
    scene.add( light2 );

    // const geometryTor = new THREE.SphereGeometry( 20, 32, 16 );
    
    const geometryTor = new THREE.TorusKnotGeometry( 20, 3, 100, 100 );
    materialVit = new THREE.MeshStandardMaterial( { color: 0xffffff, map: vit, envMap: refractionCube, roughness: 0.1, metalness:0.7 } );
    //const materialTor = new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: refractionCube, map: vit } );
    torusKnot = new THREE.Mesh( geometryTor, materialVit );
    
    torusClone = torusKnot.clone(); 
    // scene.add( torusKnot );

    swhydra();

    const materialrt = new THREE.MeshBasicMaterial({
	map: renderTarget.texture,
	transparent: true
    });

    //const geometry = new THREE.BoxGeometry( 1920, 1080/2, 1 );
    const geometry = new THREE.PlaneGeometry( 1080/2, 1080/2, 10, 20 );

    const cubeMaterial3 = new THREE.MeshBasicMaterial( { color: 0xff6600, side: THREE.DoubleSide } );
    cubort = new THREE.Mesh( geometry, materialrt );
 
    scene.add( cubort ); 

    const texturecred = new THREE.TextureLoader().load( "img/nx.jpg" );

    const geometrycred = new THREE.PlaneGeometry( 40, 40 );
    const materialcred = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide, map: texturecred} );
    creditos = new THREE.Mesh( geometrycred, materialcred );
    creditos.position.y = 10; 
    // scene.add( creditos );
    
    renderer = new THREE.WebGLRenderer( { antialias: true, alpha:true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    /*
    loaders[0].load(
	 '3d/01-corteza/0000000.gltf',
	function ( gltf ) {
	    gltf.scene.position.x = Math.random() * 2 -1;
	    gltf.scene.position.z = Math.random() * 2 -1; 
	    gltf.scene.lookAt(0, 0, 0);
	    gltf.scene.scale.x = 16;
	    gltf.scene.scale.y = 16;
	    gltf.scene.scale.z = 16; 
	    // coloresMesh = gltf.scene.children[0];
	    objetos[0] = gltf.scene.children[0];

	    clonados[0] = objetos[0].clone(); 
	    scene.add( objetos[0] );

            // console.log(scene.children[1]); 
    	    for(let i = 0; i < clonados[0].geometry.attributes.position.count; i++){
		clonX[i] = clonados[0].geometry.attributes.position.getX(i);
		clonY[i] = clonados[0].geometry.attributes.position.getY(i);
		clonZ[i] = clonados[0].geometry.attributes.position.getZ(i);
	    }

	    scene.children[1].geometry.attributes.position.needsUpdate = true;
	    boolMesh = true;
	    fuente();
	    animate();
	})
	    
    loaders[1].load(
	'3d/02-nopal/0000000.gltf',
	function ( gltf ) {
	    gltf.scene.position.x = Math.random() * 2 -1;
	    gltf.scene.position.z = Math.random() * 2 -1; 
	    gltf.scene.lookAt(0, 0, 0);
	    gltf.scene.scale.x = 16;
	    gltf.scene.scale.y = 16;
	    gltf.scene.scale.z = 16;
	    objetos[1] = gltf.scene; 
	    // coloresMesh = gltf.scene.children[0];
	    scene.add( objetos[1] );
	    
	})
    */

    /*
    for(let i = 0; i < 72; i++){
	achim[i] = new THREE.TextureLoader().load( "img/achim/"+(i+1)+".JPG" );
	}
    */

    const materialDoble = new THREE.MeshBasicMaterial( {
	color: 0xffffff,
	map:texture,
	side: THREE.DoubleSide} );
    
    const megacubo = new THREE.BoxGeometry(1500, 1500, 1500);
    megamesh = new THREE.Mesh( megacubo, materialDoble );
    scene.add(megamesh); 

    /*
    controls = new PointerLockControls( camera, document.body );
    controls.lock();
    scene.add( controls.getObject() );
  
    */
    
    controls = new OrbitControls( camera, renderer.domElement );
    controls.maxDistance = 300;

    
    const onKeyDown = function ( event ) {
	
	switch ( event.code ) {	    
	case 'Digit1':
	    add1();
	    //text.position.x = 10;
	    //text.position.z = 10;
	    // text.lookAt(0, 0, 0); 
	    // texto(message[0]); 
	    break;
	case 'Digit2':
	    add2(); 
	    rm1(); 
	    break;
	case 'Digit3':
	    //Texto como textura en un objeto, revisar el tutorial de kinetic scupture
	    console.log("escena 3");
	    // fondos();
	    add3();
	    break;
	case 'Digit4':
	    // Todo lo anterior pero con feedback
	    console.log("escena 4");
	    final(); 
	    break; 
	    
	case 'Digit5':
	    // Equirectangular y objetos escaneados
	    console.log("escena 5");
	    break; 
	    
	case 'Digit6':
	    // Disolvencia modo consola
	    console.log("escena 6");
	    break;

	case 'Digit7':
	    // Eliminar todo
	    console.log("escena 7");
	    break; 
	    
	case 'ArrowUp':
	case 'KeyW':
	    moveForward = true;
	    break;
	    
	case 'ArrowLeft':
	case 'KeyA':
	    moveLeft = true;
	    break;
	    
	case 'ArrowDown':
	case 'KeyS':
	    moveBackward = true;
	    break;
	    
	case 'ArrowRight':
	case 'KeyD':
	    moveRight = true;
	    break;

	case 'KeyC':
	    swhydra();
	    break;

	case 'KeyR':
	    rm3(); 
	    break; 
	    
	case 'Space':
	    if ( canJump === true ) velocity.y += 350;
	    canJump = false;
	    break;
	    
	}
	
    };
    
    const onKeyUp = function ( event ) {
	
	switch ( event.code ) {
	    
	case 'ArrowUp':
	case 'KeyW':
	    moveForward = false;
	    break;
	    
	case 'ArrowLeft':
	case 'KeyA':
	    moveLeft = false;
	    break;
	    
	case 'ArrowDown':
	case 'KeyS':
	    moveBackward = false;
	    break;
	    
	case 'ArrowRight':
	case 'KeyD':
	    moveRight = false;
	    break;
	    
	}
	
    };

    document.addEventListener( 'keydown', onKeyDown );
    document.addEventListener( 'keyup', onKeyUp );
    window.addEventListener( 'resize', onWindowResize );
    // oscSend();    
    
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    let bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    analyser.getByteTimeDomainData(dataArray)
    analyser.smoothingTimeConstant = 0.9; 

    	
    // const audioCtx = new AudioContext();
    if (navigator.mediaDevices) {
	navigator.mediaDevices.getUserMedia({"audio": true}).then((stream) => {

	    
	    microphone = audioCtx.createMediaStreamSource(stream);
	    console.log("hay mic");
	    microphone.connect(analyser);
	    audioBool = true;
	    animate(); 
	    // samples();
	    
	    // `microphone` can now act like any other AudioNode
	}).catch((err) => {
	    // browser unable to access microphone
	    // (check to see if microphone is attached)
	});
    } else {
	// browser unable to access media devices
	// (update your browser)
	}

    //animate()
    fuente();

    // primer osc 
    osc2.on('/switchHydra', message => {
	swhydra(); 
    });

    //segundo osc reseteo. Esto no funciona siempre

    osc2.on('/reset', message => {
	add3(); 
    });
    
    //tercer osc rotación en xyz
	
    osc2.on('/camX', message => {
	camera.position.x = message.args[0];
    })

    osc2.on('/camY', message => {
	camera.position.y = message.args[0];
    })

    osc2.on('/camZ', message => {
	camera.position.z = message.args[0];
    })
   
    
}


function retro() {
    // const data = new Uint8Array( textureSize * textureSize * 3 );
    texture = new THREE.FramebufferTexture( textureSize, textureSize, THREE.RGBAFormat );
    //texture.minFilter = THREE.NearestFilter;
    // texture.magFilter = THREE.NearestFilter;
    //texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    //texture.offset.set( 0, 0 );
    // texture.repeat.set( 2, 3 );
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate(){
    render();
    requestAnimationFrame ( animate );
}

function render() {

    // controles(); 

    /*
    for ( var i = 0; i < torusKnot.geometry.attributes.position.count; i++){
	torusKnot.geometry.attributes.position.setX(i, torusClone.geometry.attributes.position.getX(i) * (dataArray[i])); 
	torusKnot.geometry.attributes.position.setY(i, torusClone.geometry.attributes.position.getY(i) * (dataArray[i])); 
	torusKnot.geometry.attributes.position.setZ(i, torusClone.geometry.attributes.position.getZ(i) * (dataArray[i])); 

    }

    */

    var time2 = Date.now() * 0.005;
    
    // para cuando no hay pads 
    //camera.position.x = Math.sin( time2 * 0.125/16 ) * ( 75 + Math.sin( time2 * 0.125 )* 4) * 4; 
    //camera.position.y = Math.cos( time2 * 0.125/16 ) * 230; 
    //camera.position.z = Math.cos( time2 * 0.125/16 ) * - 230;
   
    camera.lookAt(0, 0, 0);

    /*
    if(analisisBool) {


	
	analyser.getByteFrequencyData(dataArray);
	for(let i = 0; i < 14; i++){
	    scene.children[i+6].children[0].scale.x = 1*dataArray[i] / 70;
	    scene.children[i+6].children[0].scale.y = 1*dataArray[i] / 70; 
	    scene.children[i+6].children[0].scale.z = 1*dataArray[i] / 70; 
	    scene.children[i+6].children[0].geometry.attributes.position.needsUpdate = true;
	    }
	    }
	    */
	/*
    //console.log(dataArray[0]);
	scene.children[10].children[0].scale.x = dataArray[0] / 70;
	scene.children[10].children[0].scale.y = dataArray[0] / 70; 
	scene.children[10].children[0].scale.z = dataArray[0] / 70; 

	scene.children[10].children[0].geometry.attributes.position.needsUpdate = true;

	scene.children[12].children[0].scale.x = dataArray[1] /100;
	scene.children[12].children[0].scale.y = dataArray[1] /100; 
	scene.children[12].children[0].scale.z = dataArray[1] / 100; 

	// console.log(dataArray[1]); 
	scene.children[12].children[0].geometry.attributes.position.needsUpdate = true;

	scene.children[7].children[0].scale.x = dataArray[2] / 100;
	scene.children[7].children[0].scale.y = dataArray[2] / 100; 
	scene.children[7].children[0].scale.z = dataArray[2] / 100; 

	scene.children[7].children[0].geometry.attributes.position.needsUpdate = true;
    }
	*/
    
    megamesh.rotation.x += 0.0001; 
    megamesh.rotation.y -= 0.0001; 

    // con análisis, por alguna razon no funciona
    //megamesh.rotation.x += -0.0000125 * (dataArray[1] - (dataArray[1]/2) );
    //megamesh.rotation.y += -0.0000125 * (dataArray[1] - (dataArray[1]/2) ); 
    //megamesh.rotation.z += -0.0000125 * (dataArray[1] - (dataArray[1]/2) ); 

    
    vit.needsUpdate = true; 

    switch( escena ) {
    case 0:
	// inicio
	break; 
    case 1:
	up1(); 
	break; 
    case 2:
	up2();
	break; 
    }


    //if(audioBool){
 
    renderer.setRenderTarget(renderTarget);
    
    renderer.setClearColor(0x000000, 0);
    renderer.render(rtScene, rtCamera);
    renderer.setRenderTarget(null);
    
    renderer.render( scene, camera );
    if (retroBool ){
	vector.x = ( window.innerWidth * dpr / 2 ) - ( textureSize / 2 );
	vector.y = ( window.innerHeight * dpr / 2 ) - ( textureSize / 2 );	
	renderer.copyFramebufferToTexture( vector, texture );
    }



}

function fuente(){
    
    const loader2 = new FontLoader(); 	    
    loader2.load( 'fonts/square.json', function ( response ) {
	font = response;
	//console.log("holi");
	// texto();
    } );
}

// la primera escena no necesita actualización

function add1(){
    console.log("Primera");
    escena = 1;
    booltext = false;
    
    let numero = Math.floor(Math.random()*lineasInicio.length); 
    lineasSelectas.unshift( lineasInicio[numero]+"\n");
    if( lineasSelectas.length > 12){
	lineasSelectas.pop(); 
    }

    // console.log(lineasSelectas.join());

    texto(lineasSelectas.join());
}

function up1(){
    var time2 = Date.now() * 0.0005;
    
    cubort.position.x = Math.sin( time * 0.01 ) * ( 75 + Math.sin( time * 0.5 )* 400); 
    cubort.position.y = Math.cos( time * 0.1 ) * 100; 
    cubort.position.z = Math.cos( time * 0.01 ) * - 400; 

    cubort.lookAt(0, 0, 0);
}

function rm1(){
    scene.remove(texto2); 
}

// segunda escena si necesita actualización 

function add2(){

    console.log("segunda");
    escena = 2; 
    let numero = Math.floor(Math.random()*lineasInicio.length); 
    lineasSelectas.unshift( lineasInicio[numero]+"\n");
    if( lineasSelectas.length > 12){
	lineasSelectas.pop(); 
    }

    // console.log(lineasSelectas.join());

    texto2(lineasSelectas.join());
}

function up2(){
    if(booltext){
	const time = Date.now() * 0.001;
	let perlin = new ImprovedNoise();
	for( var i = 0; i < cubort.geometry.attributes.position.count; i++){
	    let d = perlin.noise(cubort.geometry.attributes.position.getX(i)*0.01+time,
				 cubort.geometry.attributes.position.getY(i)*0.01,time,
				 cubort.geometry.attributes.position.getZ(i)*0.01+time ) * 0.2
	    cubort.geometry.attributes.position.setX(i, clonX[i] * (d+1));
	    cubort.geometry.attributes.position.setY(i, clonY[i] * (d+1));
	    cubort.geometry.attributes.position.setZ(i, clonZ[i] * (d+1));

    }	
	cubort.geometry.attributes.position.needsUpdate = true;
	cubort.geometry.computeVertexNormals();

	
    var time2 = Date.now() * 0.0005;
    
    cubort.position.x = Math.sin( time * 0.01 ) * ( 75 + Math.sin( time * 0.5 )* 400); 
    cubort.position.y = Math.cos( time * 0.1 ) * 100; 
    cubort.position.z = Math.cos( time * 0.01 ) * - 400; 

    cubort.lookAt(0, 0, 0); 

    }
    
    
}

function rm2(){
    scene.remove(texto); 
}

function add3(){
    
    let modelosNombres = ['01-corteza', '02-nopal', '03-agave', '04-cactus', '05-flor', '06-suculenta', '08-maguey', '09-hojas', '10-grid', '11-estrella', '12-roca', '13-hojas', '14-grid', '15-tronco', '16-hojas']

    for(let i = 0; i < 14; i++){
	scene.remove(scene.children[i+5]); 
    }
    
    
    loaders[0].load(
	    '3d/'+modelosNombres[0]+'/0000000.gltf',
	    function ( gltf ){
		gltf.scene.scale.x = 400;
		gltf.scene.scale.y = 400;
		gltf.scene.scale.z = 400;
		gltf.scene.position.x = Math.random()*100-50;
		gltf.scene.position.z = Math.random()*100-50;
		gltf.scene.lookAt(0, 0, 0);

		let rando = Math.floor(Math.random() * 3) + 1;
		if(rando == 1){
		    //gltf.scene.children[0].material.map = cubort.material.map;
		    //gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		if(rando == 2){
		    gltf.scene.children[0].material.map = materialVit.map;
		    //gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		
		//modelos[i] = gltf.scene.children[0];
		scene.add(gltf.scene);
	    
	    }
	)

    loaders[1].load(
	    '3d/'+modelosNombres[1]+'/0000000.gltf',
	    function ( gltf ){

		gltf.scene.scale.x = 400;
		gltf.scene.scale.y = 400;
		gltf.scene.scale.z = 400;
		gltf.scene.position.x = Math.random()*100-50;
		gltf.scene.position.z = Math.random()*100-50;
		gltf.scene.position.y = 0; 
		gltf.scene.lookAt(0, 0, 0);
		gltf.scene.children[0].material.map = materialVit.map;

		let rando = Math.floor(Math.random() * 3)+1;

		if(rando == 1){
		    gltf.scene.children[0].material.map = cubort.material.map;
		    //gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		if(rando == 2){
		    gltf.scene.children[0].material.map = materialVit.map;
		    //gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		
		//modelos[i] = gltf.scene.children[0];
		scene.add(gltf.scene);
	    
	    }
    )

    loaders[2].load(
	    '3d/'+modelosNombres[2]+'/0000000.gltf',
	    function ( gltf ){

		gltf.scene.scale.x = 400;
		gltf.scene.scale.y = 400;
		gltf.scene.scale.z = 400;
		gltf.scene.position.x = Math.random()*100-50;
		gltf.scene.position.z = Math.random()*100-50;
		gltf.scene.position.y = 0; 
		gltf.scene.lookAt(0, 0, 0);

		let rando = Math.floor(Math.random() * 3)+1;

				if(rando == 1){
		    gltf.scene.children[0].material.map = cubort.material.map;
		    //gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		if(rando == 2){
		    gltf.scene.children[0].material.map = materialVit.map;
		    //gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		
		//modelos[i] = gltf.scene.children[0];
		scene.add(gltf.scene);
	    
	    }
    )
    

    loaders[3].load(
	    '3d/'+modelosNombres[3]+'/0000000.gltf',
	    function ( gltf ){

		gltf.scene.scale.x = 400;
		gltf.scene.scale.y = 400;
		gltf.scene.scale.z = 400;
		gltf.scene.position.x = Math.random()*100-50;
		gltf.scene.position.z = Math.random()*100-50;
		gltf.scene.position.y = 0; 
		gltf.scene.lookAt(0, 0, 0);

		let rando = Math.floor(Math.random() * 3)+1;

				if(rando == 1){
		    gltf.scene.children[0].material.map = cubort.material.map;
		    // gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		if(rando == 2){
		    gltf.scene.children[0].material.map = materialVit.map;
		    //gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		
		//modelos[i] = gltf.scene.children[0];
		scene.add(gltf.scene);
	    
	    }
    )

    
    loaders[4].load(
	    '3d/'+modelosNombres[4]+'/0000000.gltf',
	    function ( gltf ){

		gltf.scene.scale.x = 400;
		gltf.scene.scale.y = 400;
		gltf.scene.scale.z = 400;
		gltf.scene.position.x = Math.random()*100-50;
		gltf.scene.position.z = Math.random()*100-50;
		gltf.scene.position.y = 0; 
		gltf.scene.lookAt(0, 0, 0);

		let rando = Math.floor(Math.random() * 3)+1;
		if(rando == 1){
		    gltf.scene.children[0].material.map = cubort.material.map;
		    // gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		if(rando == 2){
		    gltf.scene.children[0].material.map = materialVit.map;
		    //gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
			
		//modelos[i] = gltf.scene.children[0];
		scene.add(gltf.scene);
	    
	    }
    )

    
    loaders[5].load(
	    '3d/'+modelosNombres[5]+'/0000000.gltf',
	    function ( gltf ){

		gltf.scene.scale.x = 400;
		gltf.scene.scale.y = 400;
		gltf.scene.scale.z = 400;
		gltf.scene.position.x = Math.random()*100-50;
		gltf.scene.position.z = Math.random()*100-50;
		gltf.scene.position.y = 0; 
		gltf.scene.lookAt(0, 0, 0);

		let rando = Math.floor(Math.random() * 3)+1;

		if(rando == 1){
		    gltf.scene.children[0].material.map = cubort.material.map;
		    //gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		if(rando == 2){
		    gltf.scene.children[0].material.map = materialVit.map;
		    //gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		
		//modelos[i] = gltf.scene.children[0];
		scene.add(gltf.scene);
	    
	    }
    )


    loaders[5].load(
	    '3d/'+modelosNombres[5]+'/0000000.gltf',
	    function ( gltf ){

		gltf.scene.scale.x = 400;
		gltf.scene.scale.y = 400;
		gltf.scene.scale.z = 400;
		gltf.scene.position.x = Math.random()*100-50;
		gltf.scene.position.z = Math.random()*100-50;
		gltf.scene.position.y = 0; 
		gltf.scene.lookAt(0, 0, 0);

		let rando = Math.floor(Math.random() * 3)+1;

		if(rando == 1){
		    gltf.scene.children[0].material.map = cubort.material.map;
		    //gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		if(rando == 2){
		    gltf.scene.children[0].material.map = materialVit.map;
		    //gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		
		//modelos[i] = gltf.scene.children[0];
		scene.add(gltf.scene);
	    
	    }
    )

    
    loaders[6].load(
	    '3d/'+modelosNombres[6]+'/0000000.gltf',
	    function ( gltf ){

		gltf.scene.scale.x = 400;
		gltf.scene.scale.y = 400;
		gltf.scene.scale.z = 400;
		gltf.scene.position.x = Math.random()*100-50;
		gltf.scene.position.z = Math.random()*100-50;
		gltf.scene.position.y = 0; 
		gltf.scene.lookAt(0, 0, 0);

		let rando = Math.floor(Math.random() * 3)+1;

		if(rando == 1){
		    gltf.scene.children[0].material.map = cubort.material.map;
		    //gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		if(rando == 2){
		    gltf.scene.children[0].material.map = materialVit.map;
		    //gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		
		//modelos[i] = gltf.scene.children[0];
		scene.add(gltf.scene);
	    
	    }
    )

    
    loaders[7].load(
	    '3d/'+modelosNombres[7]+'/0000000.gltf',
	    function ( gltf ){

		gltf.scene.scale.x = 400;
		gltf.scene.scale.y = 400;
		gltf.scene.scale.z = 400;
		gltf.scene.position.x = Math.random()*100-50;
		gltf.scene.position.z = Math.random()*100-50;
		gltf.scene.position.y = 0; 
		gltf.scene.lookAt(0, 0, 0);

		let rando = Math.floor(Math.random() * 3)+1;
			if(rando == 1){
		    gltf.scene.children[0].material.map = cubort.material.map;
		    // gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		if(rando == 2){
		    gltf.scene.children[0].material.map = materialVit.map;
		    //gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		
		//modelos[i] = gltf.scene.children[0];
		scene.add(gltf.scene);
	    
	    }
    )

    
    loaders[8].load(
	    '3d/'+modelosNombres[8]+'/0000000.gltf',
	    function ( gltf ){

		gltf.scene.scale.x = 400;
		gltf.scene.scale.y = 400;
		gltf.scene.scale.z = 400;
		gltf.scene.position.x = Math.random()*100-50;
		gltf.scene.position.z = Math.random()*100-50;
		gltf.scene.position.y = 0; 
		gltf.scene.lookAt(0, 0, 0);

		let rando = Math.floor(Math.random() * 3)+1;
				if(rando == 1){
		    gltf.scene.children[0].material.map = cubort.material.map;
		    // gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		if(rando == 2){
		    gltf.scene.children[0].material.map = materialVit.map;
		    //gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		
		//modelos[i] = gltf.scene.children[0];
		scene.add(gltf.scene);
	    
	    }
    )

        loaders[9].load(
	    '3d/'+modelosNombres[9]+'/0000000.gltf',
	    function ( gltf ){

		gltf.scene.scale.x = 400;
		gltf.scene.scale.y = 400;
		gltf.scene.scale.z = 400;
		gltf.scene.position.x = Math.random()*100-50;
		gltf.scene.position.z = Math.random()*100-50;
		gltf.scene.position.y = 0; 
		gltf.scene.lookAt(0, 0, 0);

		let rando = Math.floor(Math.random() * 3)+1;
		if(rando == 1){
		    gltf.scene.children[0].material.map = cubort.material.map;
		    // gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		if(rando == 2){
		    gltf.scene.children[0].material.map = materialVit.map;
		    //gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		
		//modelos[i] = gltf.scene.children[0];
		scene.add(gltf.scene);
	    
	    }
	)

        loaders[10].load(
	    '3d/'+modelosNombres[10]+'/0000000.gltf',
	    function ( gltf ){

		gltf.scene.scale.x = 400;
		gltf.scene.scale.y = 400;
		gltf.scene.scale.z = 400;
		gltf.scene.position.x = Math.random()*100-50;
		gltf.scene.position.z = Math.random()*100-50;
		gltf.scene.position.y = 0; 
		gltf.scene.lookAt(0, 0, 0);

		let rando = Math.floor(Math.random() * 3)+1;
		if(rando == 1){
		    gltf.scene.children[0].material.map = cubort.material.map;
		    // gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		if(rando == 2){
		    gltf.scene.children[0].material.map = materialVit.map;
		    //gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		
		//modelos[i] = gltf.scene.children[0];
		scene.add(gltf.scene);
	    
	    }
    )

    
        loaders[11].load(
	    '3d/'+modelosNombres[11]+'/0000000.gltf',
	    function ( gltf ){

		gltf.scene.scale.x = 400;
		gltf.scene.scale.y = 400;
		gltf.scene.scale.z = 400;
		gltf.scene.position.x = Math.random()*100-50;
		gltf.scene.position.z = Math.random()*100-50;
		gltf.scene.position.y = 0; 
		gltf.scene.lookAt(0, 0, 0);

		let rando = Math.floor(Math.random() * 2)+1;
		if(rando == 1){
		    gltf.scene.children[0].material.map = cubort.material.map;
		    // gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		if(rando == 2){
		    gltf.scene.children[0].material.map = materialVit.map;
		    //gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		
		//modelos[i] = gltf.scene.children[0];
		scene.add(gltf.scene);
	    
	    }
    )


        loaders[12].load(
	    '3d/'+modelosNombres[12]+'/0000000.gltf',
	    function ( gltf ){

		gltf.scene.scale.x = 400;
		gltf.scene.scale.y = 400;
		gltf.scene.scale.z = 400;
		gltf.scene.position.x = Math.random()*100-50;
		gltf.scene.position.z = Math.random()*100-50;
		gltf.scene.position.y = 0; 
		gltf.scene.lookAt(0, 0, 0);

		let rando = Math.floor(Math.random() * 3)+1;
				if(rando == 1){
		    gltf.scene.children[0].material.map = cubort.material.map;
		    //gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		if(rando == 2){
		    gltf.scene.children[0].material.map = materialVit.map;
		    //gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		
		
		//modelos[i] = gltf.scene.children[0];
		scene.add(gltf.scene);
	    
	    }
    )

    
        loaders[13].load(
	    '3d/'+modelosNombres[13]+'/0000000.gltf',
	    function ( gltf ){

		gltf.scene.scale.x = 400;
		gltf.scene.scale.y = 400;
		gltf.scene.scale.z = 400;
		gltf.scene.position.x = Math.random()*100-50;
		gltf.scene.position.z = Math.random()*100-50;
		gltf.scene.position.y = 0; 
		gltf.scene.lookAt(0, 0, 0);

		let rando = Math.floor(Math.random() * 3)+1;
		if(rando == 1){
		    gltf.scene.children[0].material.map = cubort.material.map;
		    // gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		if(rando == 2){
		    gltf.scene.children[0].material.map = materialVit.map;
		    //gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
				//modelos[i] = gltf.scene.children[0];
		scene.add(gltf.scene);
	    
	    }
    )

    
        loaders[14].load(
	    '3d/'+modelosNombres[14]+'/0000000.gltf',
	    function ( gltf ){

		gltf.scene.scale.x = 400;
		gltf.scene.scale.y = 400;
		gltf.scene.scale.z = 400;
		gltf.scene.position.x = Math.random()*100-50;
		gltf.scene.position.z = Math.random()*100-50;
		gltf.scene.position.y = 0; 
		gltf.scene.lookAt(0, 0, 0);

		let rando = Math.floor(Math.random() * 3)+1;
				if(rando == 1){
		    gltf.scene.children[0].material.map = cubort.material.map;
		    //gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
		if(rando == 2){
		    gltf.scene.children[0].material.map = materialVit.map;
		    //gltf.scene.children[0].material.map = achim[Math.floor(Math.random() * 73)]; 
		    
		}
				
		//modelos[i] = gltf.scene.children[0];
		scene.add(gltf.scene);
		analisisBool = true; 
	    
	    }
    )


}

function up3(){
}

function rm3(){
   
   console.log(scene.children.length); 

    for(let i = 0; i < 14; i++){
	scene.remove(scene.children[i+6]); 
    }
    
}


function texto( mensaje ){
    //const materialT = new THREE.MeshStandardMaterial({color: 0xffffff, metalnenss: 0.8, roughness: 0.2, flatShading: true});

    const materialT = new THREE.MeshBasicMaterial({color: 0xffffff});
    text.material = materialT; 
    const shapes = font.generateShapes( mensaje, 0.2 );
    const geometry = new THREE.ShapeGeometry( shapes );
    // textGeoClon = geometry.clone(); // para modificar
    text.geometry.dispose(); 
    text.geometry= geometry;
    geometry.computeBoundingBox();
    geometry.computeVertexNormals(); 
    // const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
    //geometry.translate( xMid, 0, 0 );
    text.geometry= geometry;
    rtScene.add(text); 
    text.position.y = 1.5;
    text.position.x = -10.5; 

    //let lineasSelectas = [];
}

function texto2( mensaje ){

        //const materialT = new THREE.MeshStandardMaterial({color: 0xffffff, metalnenss: 0.8, roughness: 0.2, flatShading: true});

    const materialT = new THREE.MeshBasicMaterial({color: 0xffffff});
    text.material = materialT; 
    const shapes = font.generateShapes( mensaje, 0.2 );
    const geometry = new THREE.ShapeGeometry( shapes );
    // textGeoClon = geometry.clone(); // para modificar
    text.geometry.dispose(); 
    text.geometry= geometry;
    geometry.computeBoundingBox();
    geometry.computeVertexNormals(); 
    // const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
    //geometry.translate( xMid, 0, 0 );
    text.geometry= geometry;
    rtScene.add(text); 
    text.position.y = 1.5;
    text.position.x = -10.5; 

    booltext = true;

    textClone = cubort.clone(); 
    
    for(let i = 0; i < textClone.geometry.attributes.position.count; i++){
	clonX[i] = textClone.geometry.attributes.position.getX(i);
	clonY[i] = textClone.geometry.attributes.position.getY(i);
	clonZ[i] = textClone.geometry.attributes.position.getZ(i);
    }

    text.geometry.attributes.position.needsUpdate = true;
    
}

function controles(){
    const time = performance.now();
    const delta = ( time - prevTime ) / 1000;
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
    
    direction.z = Number( moveForward ) - Number( moveBackward );
    direction.x = Number( moveRight ) - Number( moveLeft );
    direction.normalize(); // this ensures consistent movements in all directions

    if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
    if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;
    
    
    controls.moveRight( - velocity.x * delta );
    controls.moveForward( - velocity.z * delta );
    
    controls.getObject().position.y += ( velocity.y * delta ); // new behavior
    
    if ( controls.getObject().position.y < 10 ) {
	
	velocity.y = 0;
	controls.getObject().position.y = 10;
	
	canJump = true;	
    }
        prevTime = time;

}


function swhydra( ) {

    let rand = Math.floor(Math.random() * 10);
    
    switch( rand ){
    case 0:
    src(o1).layer(
	src(o1).mask(
	    noise(2,.01).sub(noise(2,.01).modulate(solid(1,0),.003)).r().thresh(0.01,0))
	    .colorama(.01))
	.modulate(
	    osc(Math.PI*2,0,Math.PI/2).scale(1/2).brightness(-.5).modulate(
		noise(2,.01).sub(gradient())
		,1),.01)
	.modulatePixelate(
	    osc(Math.PI*2,0,Math.PI/2).r().thresh(.15,0).color(1,0,0).add(
		osc(Math.PI*2,0,Math.PI).g().thresh(.15,0).color(0,1,0))
		.scale(.25)
		.modulate(noise(2,.01).sub(gradient()),1),10400,128)
	.layer(
	    osc(15,0.1,1.5)
		.mask(
		    shape(4,.2,0))
	)
	.out(o1)
    
    solid().layer(o1).out()
    break;
    
    case 1:
	osc(5, 0.15, 9)
	    .rotate(.5)
	    .mult(osc(25, .05, 9))
	    .modulate(voronoi()
		      .modulateScale(voronoi()
				     .brightness(0.5)
				     .contrast(1.95), 0.1)
		      .modulate(voronoi(1.5, .1)
				.brightness(0.15)
				.contrast(1.95)
              			, .5), 1.)
	    .sub(gradient())
	    .modulateHue(src(o0), 500)
	    .out()
	break;
	
    case 2:
	osc(22, 0.3, 2)
	    .modulateScale(osc()
			   .rotate(Math.PI / 2))
	    .rotate(0.1, 1)
	    .modulate(noise(), [0.1, 0.5, 0.6, 1, 0.2])
	    .out(o1)
	
	src(o0)
	    .layer(src(o1)
		   .mask(shape(2)
			 .scale(4, 0.001)
			 .scrollX(0.5)))
	    .scrollX(0.00075)
	    .out() 

	break;
	
    case 3:
	src(o0)
	    .modulate(
		gradient()
		    .pixelate(2,2)
		    .brightness(-0.5)
		    .mult(o0,1)
		    .color([0,0,1/128,-1/128,1/64,-1/64,3/32,-1/32].fast(1/2).smooth(),[0,0,1/128,-1/128,1/64,-1/64,1/32,-1/32].fast(1/2.1).smooth())
		, -0.75
	    )
	    .layer(
		osc(Math.PI*16,1/48,Math.PI/1.5)
		    .rotate(Math.PI/4,1/128)
		    .mask(
			shape(99,[1/256,1/32].fast(1/32).smooth(),0)
		    )
	    )
	    .modulate(o0,-1/512)
	    .hue(0.001)
	    .out()
	break;
    case 4:
	const width = window.innerWidth;
	const height = window.innerHeight;
	var a = 900;
	var b = 1600;
	let w = width / b;
	let h = height / a;
	
	let delta = (l, m) => gradient(l)
	    .diff(solid("st.x", "st.y", () => Math.sin(time * m)))
	
	let synth = (i, j, k, l, m) => osc(i, j, k)
	    .diff(delta(l, m))
	
	function form(f, g, i, j, k, l, m, n) {
	    if (n % 2 === 1) {
   		return shape(n, "st.y+st.y", f)
   		    .mult(synth(i, j, k, l, m)
   			  .kaleid(n)
   			  .rotate(Math.PI / 2))
   		 .scale(1 / 2 + f)
   		    .rotate(1 / 10, 1 / 10)
   		    .scale(g);
	    } else if (n % 2 === 0) {
   		if (n % 4 === 0) {
   		    return shape(n, "st.y+st.y", f)
   			.mult(synth(i, j, k, l, m)
   			      .kaleid(n)
   			      .rotate(Math.PI / n))
   			.scale(1 / 2 + f)
   			.rotate(1 / 10, 1 / 10)
   			.scale(g);
   		} else {
   		    return shape(n, "st.y+st.y", f)
   			.mult(synth(i, j, k, l, m)
   			      .kaleid(n)
   			      .rotate(Math.PI / (n / 2)))
   			.scale(1 / 2 + f)
   			 .rotate(1 / 10, 1 / 10)
   			.scale(g);
   		}
	    }
	}
	
	function axis(f, g, h, i, j, k, l, m, n, o, v, w) {
	    if (v === "x0") {
   		return form(f, g, i, j, k, l, m, n)
   		    .scrollX(() => (time / o))
   		    .scale("st.x+st.x")
   		    .scale(h, width / height, w);
	    } else if (v === "x1") {
   		return form(f, g, i, j, k, l, m, n)
   		    .scrollX(() => (time / o))
   		 .scale("st.x*st.x")
   		    .scale(h, width / height, w);
	    } else if (v === "y0") {
   		return form(f, g, i, j, k, l, m, n)
   		    .scrollY(() => (time / o))
   		    .scale("st.y+st.y")
   		    .scale(h, width / height, w);
	    } else if (v === "y1") {
   	 return form(f, g, i, j, k, l, m, n)
   		 .scrollY(() => (time / o))
   		 .scale("st.y*st.y")
   		 .scale(h, width / height, w);
    } else if (v === "z0") {
   	 return form(f, g, i, j, k, l, m, n)
   		 .scroll(() => (time / o), () => (time / o))
   		 .scale("st.x+st.y")
   		 .scale(h, width / height, w);
    } else if (v === "z1") {
   	 return form(f, g, i, j, k, l, m, n)
   		 .scroll(() => (time / o), () => (time / o))
   		 .scale("st.x*st.y")
   		 .scale(h, width / height, w);
    };
};

	axis(1 / 4, 1 / 2, a, 15, 1 / 16, 300, 1 / 2, 1, 4, 10, "y1", b)
	    .scale(1 / 50)
	    .diff(gradient(2)
   		  .luma())
	    .modulateScale(osc(Math.PI + Math.E))
	    .blend(o0, 9 / 10)
	    .out()

	break;
    case 5:
	let k=()=>100
	let d=(x)=>Math.PI*x/k()
	
	src(o1).hue(.01)
	    .modulate(
		osc(30,0,1.5).brightness(-.5).modulate(noise().sub(gradient())
						       ,1),.003)
	    .layer(
		osc(5,0,1.5)
	  .mask(
	      shape(9,()=>d(.5),0)).scrollY(()=>d(.5)/2).rotate(()=>Math.atan2(d(.5),1))
		    .scrollY(()=>-d(.5)/2-.5)
		    .kaleid(()=>k()*.25).scale(.25)
		    .mask(shape(999,.5).rotate(Math.PI/8))
		    .scale("st.y+st.x")
		    .modulate(osc(30,0,1.5).brightness(-.5).modulate(noise().sub(gradient()),1),.01)
)
	    .out(o1)


solid().layer(o1).out()

	break;
    case 6:
	src(o0)
    .saturate(9)
    .brightness([-1, 1].smooth(1 / 9)
   	 .fast(1 / 2))
    .contrast([0, 3].smooth(1 / 3)
   	 .fast(1 / 9))
    .modulateHue(src(o0)
   	 .scale("st.x+st.x")
   	 .scale("st.y+st.y")
   	 .scale(1.01), () => Math.tan(time / 100))
    .layer(osc(1, 2, 9)
   	   .sub(gradient(3)
   		.mask(src(o0)
   		      .diff(src(o0)
   			    .pixelate(5, 1)
   			    .mult(shape(9, 0, 1)
   				  .repeat(5, 2)
   				  .invert())
   			    .diff(src(o0)
   				  .scale("st.x+st.y")
   				  .diff(src(o0)
   					.scale(1.01))))
   		      .mask(shape(4, 1 /2, 1 / 2))
   		      .colorama(9), 3 / 10)))
	    .out()
	
	break;
    case 7:
	speed = 1;
	shape(20, 0.2, 0.3)
	    .color(0.5, 1.4,100)
	    .scale(1.01)
	    .repeat(9,9)
	    .modulateScale(osc(5,1.5).modulate(o0,2))
	    .scale(0.99)
	    .modulate(noise(4, 4))
	    .rotate(1, .2)
	    .out(o0)
	break;
    case 8:
	let k1=()=>100
	let d1=(x)=>Math.PI*x/k1()
	
	src(o1).colorama(.001)
	    .modulate(
		osc(6,0,1.5).brightness(-.5).modulate(noise().sub(gradient())
						      .add(
							  solid(1,1,1).mask(
							      shape(2,()=>d1(1),0.1)).scrollY(()=>d1(2)/2).rotate(()=>Math.atan2(d1(2),1))
							      .scrollY(()=>-d1(2)/2-.5)
							      .kaleid(()=>k1()*.25).scale(.25)
							      .mask(shape(999,.5).rotate(Math.PI/8))
							      .modulateRotate(shape(999,0,1),1).scale(2),-1
						      ),3.14),.003)
	    .layer(
		osc(5,0,1.5)
		    .modulateScale(osc(1,0),-.2,1)
		    .pixelate(5)
		    .scrollX(.3)
		    .scale(1,1.25)
		    .mask(
			shape(2,()=>d1(.5),0)).scrollY(()=>d1(.5)/2).rotate(()=>Math.atan2(d1(.5),1))
		    .scrollY(()=>-d1(.5)/2-.5)
		    .kaleid(()=>k1()*.25).scale(.25)
		    .mask(shape(999,.5).rotate(Math.PI/8))
		    .modulateRotate(shape(999,0,1),1).scale(2)
	    )
	    .out(o1)
	
	solid().layer(o1).out()

	break;
    case 9:
	let k2=()=>100
	let d2=(x)=>Math.PI*x/k2()

	src(o1).colorama(.001)
	    .modulate(
		osc(6,0,1.5).brightness(-.5).modulate(noise().sub(gradient())
						      .add(
							  solid(1,1,1).mask(
							      shape(2,()=>d2(1),0.1)).scrollY(()=>d2(2)/2).rotate(()=>Math.atan2(d2(2),1))
							      .scrollY(()=>-d2(2)/2-.5)
							      .kaleid(()=>k2()*.25).scale(.25)
							      .mask(shape(999,.5).rotate(Math.PI/8))
	.modulateRotate(shape(999,0,1),1).scale(2),-1
  ),3.14),.003)
  .layer(
  osc(5,0,1.5)
  .modulateScale(osc(1,0),-.2,1)
  .pixelate(5)
  .scrollX(.3)
  .scale(1,1.25)
  .mask(
  shape(2,()=>d2(.5),0)).scrollY(()=>d2(.5)/2).rotate(()=>Math.atan2(d2(.5),1))
  .scrollY(()=>-d2(.5)/2-.5)
  .kaleid(()=>k2()*.25).scale(.25)
  .mask(shape(999,.5).rotate(Math.PI/8))
  .modulateRotate(shape(999,0,1),1).scale(2)
)
  .out(o1)

solid().layer(o1).out()
	break; 
    }
}

function fondos( ) {

    const patharray = ['1-cueva', '2-piedras', '3-sol', '4-verde', '5-espacio', '6-pasto', '7-tronco', '8-lago']; 

    let rand = Math.floor(Math.random()*7); 
    
    const path = 'maps/' + patharray[rand]+'/';
    const format = '.png';
    const urls = [
	path + 'px' + format, path + 'nx' + format,
	path + 'py' + format, path + 'ny' + format,
	path + 'pz' + format, path + 'nz' + format
    ];

    const reflectionCube = new THREE.CubeTextureLoader().load( urls );
    refractionCube = new THREE.CubeTextureLoader().load( urls );
    refractionCube.mapping = THREE.CubeReflectionMapping;
    scene.background = reflectionCube;
    
}

function plantas(){

    // son 16 objetos ¿ Se pueden cargar desde el inicio ? 

    plantContador = 0;

    if(plantContador > 16){
	plantContador = 0;
	// eliminar todos o eliminar solamente el último 
    }
    
    plantContador++; 
    
    const patharray = [];
    
}

function final(){

    scene.background = new THREE.Color( 0x000000 );

    scene.background = color
    scene.add( creditos ); 
    /*
    for(let i = 0; i < 15; i++){
	scene.remove(scene.children[i+5]); 
	}
	*/

    scene.remove(torusKnot);
    
}

