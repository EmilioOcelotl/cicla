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

// RenderTarget 

const rtWidth = 1920*2;
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

message[0] = "La gran movilidad del capital y la reproducción sexual no pueden restringir las libertades que quieren otorgar al uso de IRC no se pueden hacer";

message[1] = "Otra cosa mariposa miau miau"; 

let loaders = [];

console.log(message[Math.floor(Math.random()*2)]); 

var dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '/js/draco/' );

for(var i = 0; i < 3; i++){
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

console.log(lineasInicio); 
 
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
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    
    camera.position.set(0, 0, 40 );

    const path = 'img/';
    const format = '.jpg';
    const urls = [
	path + 'px' + format, path + 'nx' + format,
	path + 'py' + format, path + 'ny' + format,
	path + 'pz' + format, path + 'nz' + format
    ];

    const reflectionCube = new THREE.CubeTextureLoader().load( urls );
    const refractionCube = new THREE.CubeTextureLoader().load( urls );
    refractionCube.mapping = THREE.CubeRefractionMapping;
    scene.background = reflectionCube;

    light = new THREE.PointLight( 0xffffff, 1 );
    light.position.set( 0, 20, 10 );
    scene.add( light ); 
    //light = new THREE.DirectionalLight( 0xffaa33 );
    //light.position.set( - 10, 10, 10 );
    //light.intensity = 1.0;
    //scene.add( light )
    
    //const light2 = new THREE.AmbientLight( 0x003973 );
    //light2.intensity = 1.0;
    //scene.add( light2 );

    const materialrt = new THREE.MeshBasicMaterial({
	map: renderTarget.texture,
	transparent: true
    });

    const geometry = new THREE.BoxGeometry( 1920, 1080/2, 1 );
    const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    const cube = new THREE.Mesh( geometry, materialrt );
    scene.add( cube );
    
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
    
    controls = new PointerLockControls( camera, document.body );
    controls.lock();

    scene.add( controls.getObject() );
    
    const onKeyDown = function ( event ) {
	
	switch ( event.code ) {	    
	case 'Digit1':
	    add1();
	    // texto(message[0]); 
	    break;
	case 'Digit2':
	    add2(); 
	    rm1(); 
	    break;
	case 'Digit3':
	    //Texto como textura en un objeto, revisar el tutorial de kinetic scupture
	    console.log("escena 3");
	    break;
	case 'Digit4':
	    // Todo lo anterior pero con feedback
	    console.log("escena 4");
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
    animate();
    fuente(); 
    
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

    controles(); 

    switch( escena ) {
    case 0:
	// inicio
	break; 
    case 0:
	// No hay actualización
	break;
    case 1:
	// Ya hay actualización
    case 2:
	up2();
	break; 
    }

    
    renderer.setRenderTarget(renderTarget);
    
    renderer.setClearColor(0x000000, 0);
    renderer.render(rtScene, rtCamera);
    renderer.setRenderTarget(null);
    
    renderer.render( scene, camera );

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

function rm1(){
    scene.remove(texto2); 
}

// segunda escena si necesita actualización 

function add2(){
    
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
	const time = Date.now() * 0.0001;
	let perlin = new ImprovedNoise();
	for( var i = 0; i < text.geometry.attributes.position.count; i++){
	    let d = perlin.noise(text.geometry.attributes.position.getX(i)+time,
				 text.geometry.attributes.position.getY(i)+time,
				 text.geometry.attributes.position.getZ(i)+time ) * 0.1
	    text.geometry.attributes.position.setX(i, clonX[i] * (d+1));
	    text.geometry.attributes.position.setY(i, clonY[i] * (d+1));
	    text.geometry.attributes.position.setZ(i, clonZ[i] * (d+1));

    }	
	text.geometry.attributes.position.needsUpdate = true;
	text.geometry.computeVertexNormals();
    }
}

function rm2(){
    scene.remove(texto); 
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
    text.position.y = 2.5;
    text.position.x = -10.5; 

    //let lineasSelectas = [];
}

function texto2( mensaje ){
    //const materialT = new THREE.MeshStandardMaterial({color: 0xffffff, metalnenss: 0.8, roughness: 0.2, flatShading: true});

    const materialT = new THREE.MeshBasicMaterial({color: 0xffffff});
    text.material = materialT; 
    const shapes = font.generateShapes( mensaje, 2 );
    const geometry = new THREE.ShapeGeometry( shapes );
    textGeoClon = geometry.clone(); // para modificar
    text.geometry.dispose(); 
    text.geometry= geometry;
    geometry.computeBoundingBox();
    geometry.computeVertexNormals(); 
    // const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
    geometry.translate( 0,40, 0 );
    text.geometry= geometry;
    scene.add(text); 
    text.position.y = 10;
    booltext = true;

    textClone = text.clone(); 
    
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
