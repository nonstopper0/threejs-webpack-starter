import './style.css'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger} from 'gsap/ScrollTrigger'
import * as dat from 'dat.gui'
import { WebGLCapabilities, WebGLRenderer } from 'three'

gsap.registerPlugin(ScrollTrigger);

// globals
let earthSpeed = 0.0001
let cloudSpeed = 0.00009

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


// Loaders

const manager = new THREE.LoadingManager()
manager.onProgress = (url, loaded, total) => {
    console.log(url + ' loaded... ' + loaded + '/' + total);
}
manager.onLoad = () => {
    console.log('all items loaded succesfully...');
    document.querySelector('.loading').classList.add('hidden');
}

const loader = new THREE.TextureLoader(manager);
const waterpng = loader.load('./water.png');
const bumpjpg = loader.load('./bump.jpg');
const landjpg = loader.load('./earthmap10.jpg');
const clouds = loader.load('/clouds.jpg');
const star = loader.load('/star.png');
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
    emissiveMap: loader.load('./lights.png'),
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




scene.add(earth, cloudCover)
// stars 

const particleField = new THREE.BufferGeometry;
const particleCount = 1000;
const posArray = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i++) {
    posArray[i] = (Math.random() - 0.05) * (Math.random() * 20000);
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

const ambientLight = new THREE.AmbientLight(0xffffff, 0.06);
scene.add(ambientLight, pointLight);



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(30, sizes.width / sizes.height, 0.1, 40000)
camera.position.set(0, 0, 1500);
scene.add(camera)


// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true
// controls.enableRotate = false;
// controls.maxDistance = 10;
// controls.zoomSpeed = 0.05

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,    
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    
    // Update objects
    earth.rotation.y += earthSpeed;
    cloudCover.rotation.y += cloudSpeed;
    
    // Update Orbital Controls
    // controls.update()
    
    // Render
    renderer.render(scene, camera)
    
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}


tick()


// Timeline

let tl1 = gsap.timeline({
    scrollTrigger: {
        trigger: '.landing-container',
        markers: true,
        start: "bottom 100%",
        end: "bottom 0%",
        scrub: true,
        pin: false,
    },    
});

tl1.to(earth.rotation, {
    scrollTrigger: {
        trigger: '.landing-container',
        markers: true,
        start: "top 100%",
        end: "bottom 0%",
        scrub: true,
    },
    y: earth.rotation.y + 5,
    ease: 'power1.inOut'
})



