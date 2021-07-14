import * as THREE from '../scripts/three/build/three.module.js';
import { GLTFLoader } from '../scripts/three/examples/jsm/loaders/GLTFLoader.js';

function createModel(element, site) {
 	const scene = new THREE.Scene();
 	const camera = new THREE.PerspectiveCamera(10, element.clientWidth / element.clientHeight, 1, 1000 );

 	const renderer = new THREE.WebGLRenderer();

 	renderer.setSize( element.clientWidth, element.clientHeight );
 	renderer.setClearColor(new THREE.Color('white'));
 	element.appendChild( renderer.domElement );

    const loader = new GLTFLoader();

    var file;
    if(site == 'pages'){
        file = '../assets/VGD_3D Commission_OPENBOOK_HR_06_25.glb';
    }
    else if(site == 'products'){
        file = '../assets/VGD_3D Commission_SHIPPINGBOX_HR_06_25.glb';
    }

    loader.load(file, function ( gltf ) {
        //gltf.scene.rotation.y = 1;
        //gltf.scene.rotation.x = 0.8;

        // set material
        var material = new THREE.MeshStandardMaterial();

        gltf.scene.traverse((o) => {
          if (!o.isMesh) return;
          o.material.roughness = 1;
          o.material.metalness = 0;
        });

        scene.add( gltf.scene );

        // center model
        var mroot = gltf.scene;
        var bbox = new THREE.Box3().setFromObject(mroot);
        var cent = bbox.getCenter(new THREE.Vector3());
        var size = bbox.getSize(new THREE.Vector3());

        //Rescale the object to normalized space
        var maxAxis = Math.max(size.x, size.y, size.z);
        mroot.scale.multiplyScalar(1.0 / maxAxis);
        bbox.setFromObject(mroot);
        bbox.getCenter(cent);
        bbox.getSize(size);
        //Reposition to 0,halfY,0
        mroot.position.copy(cent).multiplyScalar(-1);
        //mroot.position.y-= (size.y * 0.5);
        gltf.scene.position.z = 0;

        if(site == 'pages'){
            gltf.scene.position.z=1;
        }

        const light = new THREE.AmbientLight( 0xffffff ); // soft white light
        scene.add( light );

        const plight = new THREE.PointLight( 0xffffff, 1, 100 );
        plight.position.set( 0, 0, 10 );
        scene.add( plight );
        // const geometry = new THREE.BoxGeometry();
        // const material = new THREE.MeshBasicMaterial( color );
        // const cube = new THREE.Mesh( geometry, material );
        // scene.add( cube );
        // cube.rotation.y = 1;
        // cube.rotation.x = 0.8;

        camera.position.z = 5;
        renderer.render( scene, camera );

        var animation;
        var yincrease = true;
        const animate = function () {
            animation = requestAnimationFrame( animate );
            if (yincrease){
                gltf.scene.rotation.y += 0.0005;
            }
            else{
                gltf.scene.rotation.y -= 0.0005;
            }

            if(gltf.scene.rotation.y % 360 >= 40*Math.PI/180){
                yincrease = false;
            }
            else if (gltf.scene.rotation.y % 360 <= -40*Math.PI/180){
                yincrease = true;
            }
           
            console.log(gltf.scene.rotation.y);
            renderer.render( scene, camera );
        };

        var animationHover;
        const hoverAnimate = function () {
            cancelAnimationFrame( animation );
            animationHover = requestAnimationFrame( hoverAnimate );

            if(yincrease){
               gltf.scene.rotation.y += 0.05; 
            }
            else{
                gltf.scene.rotation.y -= 0.05; 
            }

            renderer.render( scene, camera );
        };

        const stopHoverAnimate = function () {
            cancelAnimationFrame( animationHover );
            animate();
        };

        animate();
        element.addEventListener("mouseenter", hoverAnimate);
        element.addEventListener("mouseout", stopHoverAnimate)

    }, undefined, function ( error ) {

        console.error( error );

    } );
}

var modelContainerPages = document.querySelector("#pages .model-container");
var modelContainerProducts = document.querySelector("#products .model-container");
createModel(modelContainerPages, 'pages');
createModel(modelContainerProducts, 'products');

//  	const scene = new THREE.Scene();
//  	const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

//  	const renderer = new THREE.WebGLRenderer();

//  	renderer.setClearColor(new THREE.Color('white'));
//  	document.body.appendChild( renderer.domElement );
//  	camera.position.z = 5;

// const loader = new GLTFLoader();

// loader.load( '../assets/VGD_3D Commission_OPENBOOK_HR_06_25.glb', function ( gltf ) {

// 	scene.add( gltf.scene );

// }, undefined, function ( error ) {

// 	console.error( error );

// } );

// const light = new THREE.AmbientLight( 0xffffff ); // soft white light
// scene.add( light );

// function animate() {
// 	requestAnimationFrame( animate );
// 	renderer.render( scene, camera );
// }
// animate();