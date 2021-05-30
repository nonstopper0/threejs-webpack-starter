import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'dat.gui'
import { NoToneMapping, Vector3 } from 'three'
import { TweenLite } from 'gsap/all'
import { gsap } from 'gsap'
import { ScrollTrigger} from 'gsap/ScrollTrigger'



// Initialization Variables ------------------------------------------------------------

const clock = new THREE.Clock()
const gui = new dat.GUI()
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()
const sizes = { width: window.innerWidth, height: window.innerHeight }

let earthSpeed = 0.0001
let cloudSpeed = 0.00009
let bin;
let phone;
let earth;
let cloudCover;
let pointLight;
let binLight;

const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 40000)
camera.position.set(0, 0, 1500);
scene.add(camera)

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,    
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

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
    scene.add(bin, cloudCover, earth, phone);
    lights();
    console.log('all items loaded succesfully...');
    document.querySelector('.loading').classList.add('hidden');
    document.querySelector('body').style.overflow = 'auto'
    tick();
    timeline();
}

const modelLoader = new GLTFLoader(manager);

modelLoader.load('./models/recycling_bin/scene.gltf', (gltf) => {
    bin = gltf.scene.children[0]
    bin.position.set(1, 0, 1496);
    bin.rotation.y = .4
    bin.rotation.x = -1.5;
    bin.castShadow = true;
    bin.receiveShadow = true;
})

modelLoader.load('./models/apple_iphone_11_pro/scene.gltf', (gltf) => {
    phone = gltf.scene.children[0];
    phone.position.set(-(window.innerWidth / 300), 0, 1075);
    phone.rotation.set(0, 0, 0);
    phone.scale.set(0, 0, 0);
})




const texLoader = new THREE.TextureLoader(manager);
const waterpng = texLoader.load('./water.png');
const bumpjpg = texLoader.load('./bump.jpg');
const landjpg = texLoader.load('./earthmap10.jpg');
const clouds = texLoader.load('./clouds.jpg');
const star = texLoader.load('./star.png');
clouds.anisotropy = 8;
landjpg.anisotropy = 8;

// Mesh

let earthGeometry = new THREE.SphereGeometry(500, 64 ,64)
let earthMaterial = new THREE.MeshPhongMaterial({
    map: landjpg,
    bumpMap: bumpjpg,
    bumpScale: 1.5,
    specularMap: waterpng,
    specular: 0.5,
})

earth = new THREE.Mesh(earthGeometry, earthMaterial)

let cloudGeometry = new THREE.SphereGeometry(502, 64, 64)
let cloudMaterial = new THREE.MeshPhongMaterial({
    alphaMap: clouds,
    transparent: true
})

cloudCover = new THREE.Mesh(cloudGeometry, cloudMaterial)


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

function lights() {
    pointLight = new THREE.DirectionalLight(0xfffad9, 1)
    pointLight.position.set(200, 100, 100);
    pointLight.castShadow = true;

    binLight = new THREE.PointLight(0xffffff, 2)
    binLight.position.set(0, 200, 1500);
    binLight.distance = 500;

    gui.add(binLight.position, 'x');
    gui.add(binLight.position, 'y');
    gui.add(binLight.position, 'z');

    
    scene.add(pointLight, binLight);
}


window.addEventListener('resize', resizeHandler)
window.addEventListener('mousemove', mouseMoveHanlder)

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
    

    phone.position.x = -(window.innerWidth / 300)
    // Update Model scale
    // if (sizes.width < 480) {
    //     earth.scale.set(0.2, 0.2, 0.2);
    //     bin.scale.set(0.2, 0.2, 0.2);
    //     cloudCover.scale.set(0.2, 0.2, 0.2);
    // } else if (sizes.width > 480 && earth.scale.y === 0.2) {
    //     earth.scale.set(1, 1, 1);
    //     bin.scale.set(1, 1, 1);
    //     cloudCover.scale.set(1, 1, 1);
    // }
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
    bin.position.y != camera.position.y && (bin.position.y = camera.position.y)
    phone.position.y != camera.position.y && (phone.position.y = camera.position.y);

    // Render
    renderer.render(scene, camera);
    
    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
}

let lastMove = 0
function mouseMoveHanlder(e) {
    // Debouncer
    if (e.timeStamp - lastMove < 10) {
        return
    }

    let x = (e.clientX / window.innerWidth).toFixed(2)
    let y = (e.clientY / window.innerHeight).toFixed(2)
    console.log(x, y);
    lastMove = e.timeStamp
}

function timeline() {

    gsap.registerPlugin(ScrollTrigger)

    ScrollTrigger.defaults({
        scrub: 1,
        markers: true
    })

    let textTL = gsap.timeline({});
    textTL.from(".landing-container div h1", { y: -100, opacity: 0, duration: 3, ease: 'expo.out'})
        .from(".landing-container div p", {y: -10, duration: 2, opacity: 0, ease: 'expo.out'}, "-=2")
        .from(".landing-container div button", {y: 20, duration: 2, opacity: 0, ease: 'expo.out'}, "-=2")



    let binTrigger = ScrollTrigger.create({
        trigger: '.landing-container',
        start: 'bottom bottom',
        end: '+=100%',
        immediateRender: false,
        scrub: 1
    })

    
    let tl = gsap.timeline({});

    tl.from(camera.rotation, {
        x: .05,
        duration: 5
    })
        .to('.landing-container div', {
            y: '-100%',
            ease: 'none',
            scrollTrigger: {
                trigger: '.landing-container',
                start: 'top top',
                end: '+=100%',
                anticipatePin: 4,
                pin: true
            }
        })
    // section-one inbetween
        .from(bin.position, {
            x: 10,
            scrollTrigger: binTrigger
        })
        .from(bin.scale, {
            x: 0,
            y: 0,
            z: 0,
            scrollTrigger: binTrigger
        })
        .to(bin.rotation, {
            x: -8.5,
            z: .6,
            scrollTrigger: binTrigger      
        })
        .from('.section-one .left', {
            ease: 'none',
            opacity: 0,
            scrollTrigger: {
                trigger: '.section-one',
                start: 'bottom bottom',
                end: 'bottom bottom',
                immediateRender: false,
                scrub: 1
            }
        })
    // section-one
        .to('.section-one .left', {
            ease: 'none',
            y: '-100%',
            duration: 1,
            scrollTrigger: {
                immediateRender: false,
                trigger: '.section-one',
                start: 'top top',
                end: '+=100%',
                pin: true,
                anticipatePin: 1,
            }
        })
        .to(binLight.position, {
            y: 100,
            x: 150,
            scrollTrigger: {
                immediateRender: false,
                trigger: '.section-one',
                start: 'top top',
                end: '+=100%',
            }
        })
        .to('.section-one .left', {
            ease: 'none',
            opacity: 0,
            scrollTrigger: {
                trigger: '.section-two',
                start: 'top bottom',
                end: 'top bottom',
                immediateRender: false,
                scrub: 1     
            }
        })
    // section-two In-betweeen
        .to(camera.position, {
            z: camera.position.z - 400,
            scrollTrigger: {
                immediateRender: false,
                trigger: '.section-two',
                start: 'top bottom',
                end: '+=100%',
                scrub: 1
            },
        })
        .to(pointLight.position, {
            x: -500,
            z: -100,
            scrollTrigger: {
                immediateRender: false,
                trigger: '.section-two',
                start: 'top bottom',
                end: '+=100%',
                scrub: 1
            },            
        })
        .to(phone.scale, {
            x: .1,
            y: .1,
            z: .1,
            ease: 'power1.out',
            scrollTrigger: {
                immediateRender: false,
                trigger: '.section-two',
                start: 'top top',
                end: '+=50%',
                scrub: 3
            },            
        })
        .to(phone.rotation, {
            x: -1.1,
            y: 6.7,
            z: .1,
            ease: 'power1.out',
            scrollTrigger: {
                immediateRender: false,
                trigger: '.section-two',
                start: 'top top',
                end: '+=50%',
                scrub: 3
            },            
        })
        .from('.section-two .right', {
            ease: 'none',
            opacity: 0,
            scrollTrigger: {
                trigger: '.section-two',
                start: 'bottom bottom',
                end: 'bottom bottom',
                immediateRender: false,
                scrub: 1,
            }
        })
    // section-two
        .to('.section-two', {
            scrollTrigger: {
                immediateRender: false,
                trigger: '.section-two',
                start: 'top top',
                end: '+=100%',
                pin: true,
            }
        })
        .to(camera.position, {
            y: camera.position.y + 100,
            scrollTrigger: {}
        })

}