import './style.css'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger} from 'gsap/ScrollTrigger'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'


// Initialization Variables ------------------------------------------------------------

const clock = new THREE.Clock()
const gui = new dat.GUI()
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()
const sizes = { width: window.innerWidth, height: window.innerHeight }

let earthSpeed = 0.0001
let cloudSpeed = 0.00009
let bin;

const camera = new THREE.PerspectiveCamera(30, sizes.width / sizes.height, 0.1, 40000)
camera.position.set(0, 0, 1500);
scene.add(camera)

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,    
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const controls = new OrbitControls(camera, document.querySelector('.landing-container'))

// Loaders ------------------------------------------------------------


document.querySelector('body').style.overflow = 'hidden'
const manager = new THREE.LoadingManager()
const loadingSliderThumb = document.querySelector('.loading-slider-thumb');
const loadingText = document.querySelector('.loading h1');
manager.onProgress = (url, loaded, total) => {
    let progress = loaded / total * 100 - 100
    loadingSliderThumb.style.transform = `translate(${progress}px)`
    loadingText.innerText = 'Loading... ' + loaded + '/' + total;
}
manager.onLoad = () => {
    console.log('all items loaded succesfully...');
    document.querySelector('.loading').classList.add('hidden');
    document.querySelector('body').style.overflow = 'auto'
    tick();
    tl1.play();
    tl.play();
    scene.add(bin);
}

const modelLoader = new GLTFLoader(manager);

const recycleBin = modelLoader.load('./models/recycling_bin/scene.gltf', (gltf) => {
    bin = gltf.scene.children[0]
})




const texLoader = new THREE.TextureLoader(manager);
const waterpng = texLoader.load('./water.png');
const bumpjpg = texLoader.load('./bump.jpg');
const landjpg = texLoader.load('./earthmap10.jpg');
const clouds = texLoader.load('/clouds.jpg');
const star = texLoader.load('/star.png');
clouds.anisotropy = 8;
landjpg.anisotropy = 8;

// Mesh

let earthGeometry = new THREE.SphereGeometry(500, 64 ,64)
let earthMaterial = new THREE.MeshPhongMaterial({
    map: landjpg,
    bumpMap: bumpjpg,
    bumpScale: 1,
    // specularMap: waterpng,
    // specular: new THREE.Color('white'),
    // shininess: .1,
    emissiveMap: texLoader.load('./lights.png'),
    emissive: new THREE.Color('orange'),
    emissiveIntensity: .1
})
const earth = new THREE.Mesh(earthGeometry, earthMaterial)

let cloudGeometry = new THREE.SphereGeometry(502, 64, 64)
let cloudMaterial = new THREE.MeshPhongMaterial({
    alphaMap: clouds,
    transparent: true
})
const cloudCover = new THREE.Mesh(cloudGeometry, cloudMaterial)


scene.add(cloudCover, earth)



// stars 

const particleField = new THREE.BufferGeometry;
const particleCount = 1000;
const posArray = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i++) {
    posArray[i] = (Math.random() * 20000)
}

particleField.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMesh = new THREE.Points(
    particleField,
    new THREE.PointsMaterial({
        size: 1,
        map: star,
        transparent: true
    })
)

scene.add(particlesMesh)

// Lights

const pointLight = new THREE.DirectionalLight(0xfffad9, 1.2)
pointLight.position.set(200, 100, 100);

gui.add(pointLight.position, 'x')
gui.add(pointLight.position, 'y')
gui.add(pointLight.position, 'z')
gui.add(pointLight, 'intensity')

scene.add(pointLight);


window.addEventListener('resize', resizeHandler)

function resizeHandler() {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))   
}

/**
 * Animate
 */

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();
    
    // Update objects
    earth.rotation.y += earthSpeed;
    cloudCover.rotation.y += cloudSpeed;
     
    // Render
    renderer.render(scene, camera);

    // Controls
    controls.update();
    
    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
}


// Timeline

gsap.registerPlugin(ScrollTrigger)

let tl1 = gsap.timeline({
    pasued: true,
    scrollTrigger: {
        trigger: '.landing-container',
        markers: true,
        start: "top top",
        end: "+=100%",
        pin: true
    },    
});
tl1.to(camera.position, {
    x: -window.innerWidth / 10,
    z: 2000,
    duration: 10,
    ease: 'power1.inOut',
})


let tl = gsap.timeline({
    paused: true
});
tl.from(".landing-container div h1", { y: -100, opacity: 0, duration: 2, ease: 'power3.inOut'  })