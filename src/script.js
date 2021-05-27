import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loader 

const loader = new THREE.TextureLoader();

// Mesh
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32 ,32),
    new THREE.MeshPhongMaterial({
        map: loader.load('/earth.jpg'),
        bumpMap: loader.load('./bump.jpg'),
        bumpScale: 0.008,
        specularMap: loader.load('./water.png'),
        specular: new THREE.Color('grey'),
        shininess: 4,
        emissiveMap: loader.load('./lights.png'),
        emissive: new THREE.Color('white')
    })
)
scene.add(sphere)

const cloudCover = new THREE.Mesh(
    new THREE.SphereGeometry(.505, 32, 32),
    new THREE.MeshPhongMaterial({
        map: loader.load('./clouds.png'),
        transparent: true
    })
)
scene.add(cloudCover);

const starField = new THREE.BufferGeometry;
const particleCount = 5000;
const posArray = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * (Math.random() * 5);
}

starField.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMesh = new THREE.Points(
    starField,
    new THREE.PointsMaterial({
        size: 0.001
    })
)

scene.add(particlesMesh)


// Lights

const pointLight = new THREE.PointLight(0xffffff, 1)
pointLight.position.set(10, 10, 10);
scene.add(pointLight)

gui.add(pointLight.position, 'y')
gui.add(pointLight.position, 'x')
gui.add(pointLight.position, 'z')
gui.add(pointLight, 'intensity')


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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 2
scene.add(camera)


// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

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
    sphere.rotation.y = .05 * elapsedTime
    cloudCover.rotation.y = .08 * elapsedTime

    // Update Orbital Controls
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()