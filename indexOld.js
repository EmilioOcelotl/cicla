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

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

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

let loaders = [];

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

/*
let fuentes = ["corteza", "nopal", "agave", "cactus", "flor", "suculenta"];
//let pruebas = [[0, 100, 200, 300], [1, 100, 200, 300]]; 
console.log(fuentes.length); 
let pruebas = [];
let con=0;
fuentes.forEach(fuente => {
    pruebas[fuente] = [con++, Math.random(), Math.random(), Math.random()];
})
console.log(pruebas.corteza); 
*/

// init(); 

const startButton = document.getElementById( 'startButton' );

startButton.addEventListener( 'click', init );


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
    camera.position.y = -10; 
    // camera.position.set(0, 0, 0 );

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
    scene.add( light ); // children 1
    //light = new THREE.DirectionalLight( 0xffaa33 );
    //light.position.set( - 10, 10, 10 );
    //light.intensity = 1.0;
    //scene.add( light )
    
    //const light2 = new THREE.AmbientLight( 0x003973 );
    //light2.intensity = 1.0;
    //scene.add( light2 );

    let radio = 10;
    let curvePosX=[], curvePosY=[]; 

    let initialPoints = []; 

    let contador = 0;
    
    for(let i = 0; i < 10; i+=1){
	// initialPoints.push(contador);
	initialPoints[contador] = {x:0, y:0, z:0};
	contador++; 
    }

   contador = 0; 

    for(let i = 0; i < 10; i+=1){
	let s = i * (Math.PI * 2);
	let theta = s/radio;
	let xa = radio * Math.cos(theta);
	let ya = radio * Math.sin(theta);
	curvePosX.push(xa);
	curvePosY.push(ya);
	initialPoints[contador].x = curvePosX[contador];
	initialPoints[contador].y = 10;
	initialPoints[contador].z = curvePosY[contador]; 
	contador++
    }

   
    console.log(initialPoints); 


   /*
    const initialPoints = [
	{ x: -1, y: 10, z: 1 },
	{ x: 1, y: 10, z: 1 },
	{ x: 1, y: 10, z: -1 },
	{ x: -1, y: 10, z: -1 },
	];
    console.log(initialPoints); 
   */
    
    const boxGeometry = new THREE.BoxGeometry( 2, 2, 2 );
    const boxMaterial = new THREE.MeshBasicMaterial();
    
    for ( const handlePos of initialPoints ) {
	const handle = new THREE.Mesh( boxGeometry, boxMaterial );
	handle.position.copy( handlePos );
	curveHandles.push( handle );
	scene.add( handle );

    }
    
    curve = new THREE.CatmullRomCurve3(
	curveHandles.map( ( handle ) => handle.position )
    );
    curve.curveType = 'centripetal';
    curve.closed = true;

    
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    //renderer.toneMapping = THREE.ACESFilmicToneMapping;
    //renderer.toneMappingExposure = 1;
    //renderer.outputEncoding = THREE.sRGBEncoding;
     container.appendChild( renderer.domElement );
    
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
    /*
    loader.load(
	'3d/03-agave/0000014.gltf',
	function ( gltf ) {
	    gltf.scene.position.x = Math.random() * 2 -1;
	    gltf.scene.position.z = Math.random() * 2 -1; 
	    gltf.scene.lookAt(0, 0, 0);
	    gltf.scene.scale.x = 16;
	    gltf.scene.scale.y = 16;
	    gltf.scene.scale.z = 16; 
	    // coloresMesh = gltf.scene.children[0];
	    scene.add( gltf.scene );	    
	    })
    */

    /*
    controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 0, 0 );
    controls.update();
   
    controls = new FlyControls( camera, renderer.domElement );

    controls.movementSpeed = 10;
    controls.domElement = renderer.domElement;
    controls.rollSpeed = Math.PI / 24 ;
    controls.autoForward = false;
    controls.dragToLook = false;

    */

    controls = new PointerLockControls( camera, document.body );
    controls.lock();

    scene.add( controls.getObject() );
    
    const onKeyDown = function ( event ) {
	
	switch ( event.code ) {
	    
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
    // animate();

    
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate(){
    requestAnimationFrame ( animate );
    
    
    render();
}

function render() {
    
    // const delta = clock.getDelta();

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

    
    if(boolMesh){
	const time = Date.now() * 0.001;
	
	let perlin = new ImprovedNoise();
 
	for( var i = 0; i < scene.children[1].geometry.attributes.position.count; i++){
	    let d = perlin.noise( (scene.children[1].geometry.attributes.position.getX(i))+time,
				  scene.children[1].geometry.attributes.position.getY(i)+time,
				  scene.children[1].geometry.attributes.position.getZ(i)+time ) * 0.1
	    scene.children[1].geometry.attributes.position.setX(i, 4*clonX[i] * (d*4+1));
	    scene.children[1].geometry.attributes.position.setY(i, 4*clonY[i] * (d*4+1));
	    scene.children[1].geometry.attributes.position.setZ(i, 4*clonZ[i] * (d+1));

    }
	
	scene.children[1].geometry.attributes.position.needsUpdate = true;
	scene.children[1].geometry.computeVertexNormals(); 
    }
    prevTime = time;

    // controls.update(delta); 
    renderer.render( scene, camera );

}

function fuente(){
    
    const loader2 = new FontLoader(); 	    
    loader2.load( 'fonts/cimatics.json', function ( response ) {

	font = response;
	//console.log("holi");
	// texto(); 
	
	const geometryss = new TextGeometry( 'La gran movilidad del capital', {
	    font: font,
	    size:0.5,
	    height: 0.01,
	    
	    curveSegments: 12,
	    bevelEnabled: true,
	    bevelThickness: 0.02,
	    bevelSize: 0.01,
	    bevelOffset: 0,
	    bevelSegments: 5,
	    
	} );

	geometryss.computeBoundingBox();
	geometryss.computeVertexNormals(); 
 
	geometryss.rotateX( Math.PI );
	
	const materialss = new THREE.MeshStandardMaterial( {
	    color: 0xffffff
	} );
	
	const objectToCurve = new THREE.Mesh( geometryss, materialss );
	
	flow = new Flow( objectToCurve );
	flow.updateCurve( 0, curve );
	scene.add( flow.object3D );
	
	// texto();
	
    } );
}

function texto(){
    // const materialT = new THREE.MeshStandardMaterial({color: 0xa0a0a0, metalnenss: 0.8, roughness: 0.2, flatShading: true});

    // text.material = materialT; 
    
    const message = "La gran movilidad del capital y la reproducción sexual no pueden restringir las libertades que quieren otorgar al uso de IRC no se pueden hacer"; 
    const shapes = font.generateShapes( message, 1 );
    const geometry = new THREE.ShapeGeometry( shapes );
    textGeoClon = geometry.clone(); 
    geometry.computeBoundingBox();
    geometry.computeVertexNormals(); 
    const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
    geometry.translate( xMid, 0, 0 );
   
    text.geometry= geometry;
    // scene.add(text); 

}
