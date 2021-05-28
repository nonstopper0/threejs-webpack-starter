import './style.css'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger} from 'gsap/ScrollTrigger'
import * as dat from 'dat.gui'

gsap.registerPlugin(ScrollTrigger);

// globals
let earthSpeed = 0.02
let cloudSpeed = 0.030

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
const landjpg = loader.load('/earth.jpg')


// Mesh
const earth = new THREE.Mesh(
    new THREE.SphereGeometry(10, 32 ,32),
    new THREE.MeshPhongMaterial({
        map: landjpg,
        bumpMap: bumpjpg,
        bumpScale: 0.005,
        specularMap: waterpng,
        specular: new THREE.Color('grey'),
        shininess: 1,
        // emissiveMap: loader.load('./lights.png'),
        // emissive: new THREE.Color('orange'),
        // emissiveIntensity: 1
    })
)
scene.add(earth)

const cloudCover = new THREE.Mesh(
    new THREE.SphereGeometry(10.05, 32, 32),
    new THREE.MeshPhongMaterial({
        map: loader.load('./clouds.png'),
        transparent: true
    })
)
scene.add(cloudCover);


// stars 

const particleField = new THREE.BufferGeometry;
const particleCount = 5000;
const posArray = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * (Math.random() * 300);
}

particleField.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMesh = new THREE.Points(
    particleField,
    new THREE.PointsMaterial({
        size: 0.01
    })
)

scene.add(particlesMesh)

// Lights

const pointLight = new THREE.DirectionalLight(0xfffad9, 1.2)
pointLight.position.set(100, 50, 100);

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
const camera = new THREE.PerspectiveCamera(90, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 20);
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
    alpha: true
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
    earth.rotation.y = earthSpeed * elapsedTime
    cloudCover.rotation.y = cloudSpeed * elapsedTime
    camera.position.z += 0.00005
    
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
        pin: true
    }
});

tl1.to(camera.position, {x: camera.position.x - 5, z: camera.position.z + 5, ease: 'power1.inOut'})
tl1.to('.landing-container h1', {y: '-100vh'}, '-100%')
