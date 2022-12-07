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
import {TTFLoader} from './jsm/loaders/TTFLoader.js';

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

init(); 

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
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 1000 );
    camera.position.set( 0, 0, 1 );

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
    light = new THREE.PointLight( 0xffffff, 2 );
    light.position.set( 0, 0, 20 );
    scene.add( light ); // children 1

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;
     container.appendChild( renderer.domElement );

    // renderer.render( scene, camera );
    const geometry = new THREE.BoxGeometry( 3, 3, 3 );
    const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    const cube = new THREE.Mesh( geometry, material );
    // scene.add( cube );
    
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
   */

    controls = new FlyControls( camera, renderer.domElement );

    controls.movementSpeed = 10;
    controls.domElement = renderer.domElement;
    controls.rollSpeed = Math.PI / 24 ;
    controls.autoForward = false;
    controls.dragToLook = false;
    
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
    
    const delta = clock.getDelta();
    
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
    
    controls.update(delta); 
    renderer.render( scene, camera );

}

function fuente(){
    
    const loader2 = new FontLoader(); 	    
    loader2.load( 'fonts/cimatics.json', function ( response ) {
	font = response;
	console.log("holi");
	texto(); 
    } );
}

function texto(){
    const materialT = new THREE.MeshStandardMaterial({color: 0xa0a0a0, metalnenss: 0.8, roughness: 0.2, flatShading: true});

    text.material = materialT; 
    
    const message = "holitas"; 
    const shapes = font.generateShapes( message, 1.25 );
    const geometry = new THREE.ShapeGeometry( shapes );
    textGeoClon = geometry.clone(); 
    geometry.computeBoundingBox();
    geometry.computeVertexNormals(); 
    const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
    geometry.translate( xMid, 0, 0 );
   
    text.geometry= geometry;
    scene.add(text); 

}
