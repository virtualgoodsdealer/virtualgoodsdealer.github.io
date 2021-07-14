import * as THREE from '../scripts/three/build/three.module.js';
import { GLTFLoader } from '../scripts/three/examples/jsm/loaders/GLTFLoader.js';

import { EffectComposer } from '../scripts/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../scripts/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../scripts/three/examples/jsm/postprocessing/UnrealBloomPass.js';

function createModel(element, site) {
 	const scene = new THREE.Scene();
 	const camera = new THREE.PerspectiveCamera(10, element.clientWidth / element.clientHeight, 1, 1000 );

 	const renderer = new THREE.WebGLRenderer();
    const composer = new EffectComposer( renderer );

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
          o.material.roughness = 0.7;
          o.material.metalness = 0;
        });

        scene.add( gltf.scene );


        var meshToRotate;
        if(site == 'pages'){
            gltf.scene.position.z=-0.5;
            gltf.scene.position.y=0.05;
            gltf.scene.position.x=-0.02;
            gltf.scene.rotation.x=0.5;

            var pivot = new THREE.Group();
            scene.add(pivot);
            pivot.add(gltf.scene);
            meshToRotate = pivot;
        }
        else{
            meshToRotate = gltf.scene;
        }

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
        //mroot.position.y+= (size.y * 0.25);
        gltf.scene.position.z = 0;

        const alight = new THREE.AmbientLight( 0xffffff ); // soft white light
        scene.add( alight );

        const plight = new THREE.PointLight( 0xffffff, 0.5, 50 );
        plight.position.set( 0, 0, 5 );
        plight.rotateX(-80*Math.PI/180);
        plight.rotateY(40*Math.PI/180);
        scene.add( plight );

        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(5, 10, 5);
        light.target.position.set(-5, 0, -5);
        scene.add(light);
        scene.add(light.target);

        // const geometry = new THREE.BoxGeometry();
        // const material = new THREE.MeshBasicMaterial( color );
        // const cube = new THREE.Mesh( geometry, material );
        // scene.add( cube );
        // cube.rotation.y = 1;
        // cube.rotation.x = 0.8;

        //Create a plane that receives shadows (but does not cast them)
        const textureLoader = new THREE.TextureLoader();
        const shadowTexture = textureLoader.load('../assets/roundshadow.png');
        
        const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false});
        const shadowGeo = new THREE.PlaneGeometry( 1, 1 );
        const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);

        shadowMesh.material.opacity = 0.8;

        shadowMesh.rotateX(-80*Math.PI/180);
        shadowMesh.position.set(0,-0.38,0);
        shadowMesh.scale.set(0.8,0.8,0.8);
        scene.add( shadowMesh );

        camera.position.z = 5;
        camera.position.y = -0.05;

        const renderPass = new RenderPass( scene, camera );
        composer.addPass( renderPass );

        const unrealBloomPass = new UnrealBloomPass();
        composer.addPass( unrealBloomPass );
        composer.render();

        var animation;
        var yincrease = true;
        const animate = function () {
            animation = requestAnimationFrame( animate );
            if (yincrease){
                meshToRotate.rotateOnWorldAxis(new THREE.Vector3(0,1,0).normalize(), 0.0005);
            }
            else{
                meshToRotate.rotateOnWorldAxis(new THREE.Vector3(0,1,0).normalize() ,-0.0005);
            }

            if(meshToRotate.rotation.y % 360 >= 40*Math.PI/180){
                yincrease = false;
            }
            else if (meshToRotate.rotation.y % 360 <= -40*Math.PI/180){
                yincrease = true;
            }
           
            composer.render();
        };

        var animationHover;
        const hoverAnimate = function () {
            cancelAnimationFrame( animation );
            animationHover = requestAnimationFrame( hoverAnimate );

            if(yincrease){
               meshToRotate.rotateOnWorldAxis(new THREE.Vector3(0,1,0).normalize(), 0.05); 
            }
            else{
               meshToRotate.rotateOnWorldAxis(new THREE.Vector3(0,1,0).normalize(), -0.05);
            }

            composer.render();
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
