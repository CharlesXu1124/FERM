import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { gsap } from 'gsap'
import { MeshToonMaterial } from 'three'
import { Raycaster } from 'three'


const axios = require('axios').default;


/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')
// const canvas = document.getElementById( 'mycanvas' );

// const axesHelper = new THREE.AxesHelper()
// axesHelper.position.set(0,2,0)

// function for converting latitude and longitude into local map coordinates
// dimension of map: 60 * 25
const convertCoord = (lat, lon) =>
{
    const cityZ = 50 - lat -25
    const cityX = 125 - lon - 30
    return [cityX, cityZ]

}

const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('/textures/matcaps/1.png')
/**
 * Fonts
 */

let textTitle = null
const fontLoader = new THREE.FontLoader()
fontLoader.load
(
    '/fonts/helvetiker_regular.typeface.json',
    (font) => {
        const textGeometry = new THREE.TextBufferGeometry(
            'F E R M',
            {
                font: font,
                size: 2.0,
                height: 0.1,
                curveSegments: 5,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 4
            }
            
        )

        textGeometry.center()
        const textMaterial = new THREE.MeshMatcapMaterial({matcap: matcapTexture})
        // textMaterial.wireframe = true
        textTitle = new THREE.Mesh(textGeometry, textMaterial)
        textTitle.position.set(-10, 2, -15)
        textTitle.rotation.y = - Math.PI / 4
        scene.add(textTitle)
    }
)


// Define some variables
let targetX = 0
let targetZ = 0

let city1OnFire = false
let city2OnFire = false
let city3OnFire = false



// Scene
const scene = new THREE.Scene()

const fog = new THREE.Fog('#262837', 1, 15)

// scene.add(axesHelper)

/**
 * Lines
 */
//create a blue LineBasicMaterial
const lineMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );
let line = null


/**
 * Particles effect
 */

/**
 * Textures
 */

const particleTexture = textureLoader.load('/textures/particles/5.png')
const particlesGeometry = new THREE.BufferGeometry()

const count = 1024

const positions = new Float32Array(count * 3)
const colors = new Float32Array(count * 3)

let [particleX, particleZ] = convertCoord(34.0522, 118.2437)

for (let i = 0; i < count * 3; i++) {

    positions[i] = (Math.random() - 0.5) * 5

    if (i % 3 === 0)
    {
        positions[i] += particleX
    }
    else
    if (i % 3 === 2)
    {
        positions[i] += particleZ
    }
    // else
    // {
    //     positions[i] 
    // }

    if (i % 3 === 0)
    {
        colors[i] = 1
    }
    else
    {
        colors[i] = 0
    }
    
}

particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
)

particlesGeometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colors, 3)
)

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.7,
    sizeAttenuation: true,
})
particlesMaterial.transparent = true
particlesMaterial.alphaMap = particleTexture
particlesMaterial.alphaTest = 0.001
particlesMaterial.dpethWrite = false
particlesMaterial.blending = THREE.AdditiveBlending
particlesMaterial.vertexColors = true


// Particles effect
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
particles.visible = false
scene.add(particles)



/**
 * Models
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null





/**
 * Load Seattle: 47.6062 N, 122.3321 W
 */
gltfLoader.load(
    '/models/moscow.glb',
    (gltf) =>
    {
        const cityLight = new THREE.PointLight('#ffffff', 2, 7)
        scene.add(cityLight)

        

        const [cityX, cityZ] = convertCoord(47.6062, 122.3321)
        
        cityLight.position.set(cityX, 4.0, cityZ)
        gltf.scene.position.set(cityX, -0.01, cityZ)
        gltf.scene.scale.set(0.2, 0.2, 0.2)
        gltf.scene.fog = fog
        scene.add(gltf.scene)
        console.log('loaded')
    }
)

/**
 * Load Portland
 */
gltfLoader.load(
    '/models/moscow.glb',
    (gltf) =>
    {
        const cityLight = new THREE.PointLight('#ffffff', 2, 7)
        scene.add(cityLight)


        let [cityX, cityZ] = convertCoord(45.5051, 122.6750)
        cityLight.position.set(cityX, 4.0, cityZ)
        targetX = cityX
        targetZ = cityZ
        gltf.scene.position.set(cityX, -0.01, cityZ)
        gltf.scene.scale.set(0.2, 0.2, 0.2)
        scene.add(gltf.scene)
        
    }
)

/**
 * Load LA
 */
gltfLoader.load(
    '/models/moscow.glb',
    (gltf) =>
    {
        const cityLight = new THREE.PointLight('#ffffff', 2, 7)
        scene.add(cityLight)


        let [cityX, cityZ] = convertCoord(34.0522, 118.2437)
        cityLight.position.set(cityX, 4.0, cityZ)
        targetX = cityX
        targetZ = cityZ
        gltf.scene.position.set(cityX, -0.01, cityZ)
        gltf.scene.scale.set(0.2, 0.2, 0.2)
        scene.add(gltf.scene)
        
    }
)

/**
 * Cloud seeding UAV
 */
// Load UAV1
const UAVs = new THREE.Group()
gltfLoader.load(
    '/models/UAV/scene.gltf',
    (gltf) =>
    {


        let [cityX, cityZ] = convertCoord(30.7617, 80.1918)

        gltf.scene.position.set(0, 0, 0)
        gltf.scene.rotation.set(0, 0, 0)

        UAVs.rotation.set(0, 0, 0)
        UAVs.position.x = cityX
        UAVs.position.z = cityZ
        UAVs.position.y = 2
        
        UAVs.add(gltf.scene)
    }
)

// Load UAV2
const UAV2 = new THREE.Group()
gltfLoader.load(
    '/models/UAV/scene.gltf',
    (gltf) =>
    {


        let [cityX, cityZ] = convertCoord(30.7617 + Math.random() * 5, 80.1918 + Math.random() * 5)

        gltf.scene.position.set(0, 0, 0)
        gltf.scene.rotation.set(0, 0, 0)

        UAV2.rotation.set(0, Math.random() * 3, 0)
        UAV2.position.x = cityX
        UAV2.position.z = cityZ
        UAV2.position.y = 2
        
        UAV2.add(gltf.scene)
    }
)

// Load UAV3
const UAV3 = new THREE.Group()
gltfLoader.load(
    '/models/UAV/scene.gltf',
    (gltf) =>
    {


        let [cityX, cityZ] = convertCoord(30.7617 + Math.random() * 5, 80.1918 + Math.random() * 5)


        gltf.scene.position.set(0, 0, 0)
        gltf.scene.rotation.set(0, 0, 0)

        UAV3.rotation.set(0, Math.random() * 3, 0)
        UAV3.position.x = cityX
        UAV3.position.z = cityZ
        UAV3.position.y = 2
        
        UAV3.add(gltf.scene)
    }
)

// Load UAV4
const UAV4 = new THREE.Group()
gltfLoader.load(
    '/models/UAV/scene.gltf',
    (gltf) =>
    {


        let [cityX, cityZ] = convertCoord(30.7617 + Math.random() * 5, 80.1918 + Math.random() * 5)

        gltf.scene.position.set(0, 0, 0)
        gltf.scene.rotation.set(0, 0, 0)

        UAV4.rotation.set(0, Math.random() * 3, 0)
        UAV4.position.x = cityX
        UAV4.position.z = cityZ
        UAV4.position.y = 2
        
        UAV4.add(gltf.scene)
    }
)

const UAV5 = new THREE.Group()
gltfLoader.load(
    '/models/UAV/scene.gltf',
    (gltf) =>
    {


        let [cityX, cityZ] = convertCoord(30.7617 + Math.random() * 5, 80.1918 + Math.random() * 5)


        gltf.scene.position.set(0, 0, 0)
        gltf.scene.rotation.set(0, 0, 0)

        UAV5.rotation.set(0, Math.random() * 3, 0)
        UAV5.position.x = cityX
        UAV5.position.z = cityZ
        UAV5.position.y = 2
        
        UAV5.add(gltf.scene)
    }
)


scene.add(UAVs)
scene.add(UAV2)
scene.add(UAV3)
scene.add(UAV4)
scene.add(UAV5)


/**
 * Textures
 */

/**
 * Textures
 */
const mapTexture = textureLoader.load('/textures/mapUS.png')

// Bushes
const bushGeometry = new THREE.SphereBufferGeometry(1,16,16)
const bushMaterial = new THREE.MeshStandardMaterial({color: '#89c854'})



const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.scale.set(0.5, 0.5, 0.5)
bush1.position.set(0.8,0.2,2.2)

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
bush2.scale.set(0.25, 0.25, 0.25)
bush2.position.set(1.4, 0.1, 2.1)

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
bush3.scale.set(0.4, 0.4, 0.4)
bush3.position.set(-0.8,0.1,2.2)


const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
bush4.scale.set(0.15,0.15,0.15)
bush4.position.set(-1,0.05,2.6)

console.log(bush4.position)

// scene.add(bush1, bush2, bush3, bush4)





// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(58, 25),
    new THREE.MeshStandardMaterial({
        map: mapTexture
    })
)



floor.geometry.setAttribute(
    'uv2',
    new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
)

floor.rotation.x = - Math.PI * 0.5
floor.position.y = 0

floor.position.x = -3
floor.position.z = -13

scene.add(floor)

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#b9d5ff', 1)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
scene.add(ambientLight)

// Directional light
const moonLight = new THREE.DirectionalLight('#b9d5ff', 0.5)
moonLight.position.set(4, 5, - 2)
gui.add(moonLight, 'intensity').min(0).max(1).step(0.001)
gui.add(moonLight.position, 'x').min(- 5).max(5).step(0.001)
gui.add(moonLight.position, 'y').min(- 5).max(5).step(0.001)
gui.add(moonLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(moonLight)


/**
 * Ghosts
 */
const ghost1 = new THREE.PointLight('#e25822', 10, 3)
scene.add(ghost1)

const ghost2 = new THREE.PointLight('#00ff00', 10, 3)
scene.add(ghost2)

const ghost3 = new THREE.PointLight('#ffff00', 10, 3)
scene.add(ghost3)




/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Raycaster
 */
const raycaster = new Raycaster()

const [city1X, city1Z] = convertCoord(47.6062, 122.3321)
const [city2X, city2Z] = convertCoord(45.5051, 122.6750)
const [city3X, city3Z] = convertCoord(34.0522, 118.2437)


const points = [
    {
        
        position: new THREE.Vector3(city1X, 3, city1Z),
        element: document.querySelector('.point-0')
    },
    {
        position: new THREE.Vector3(city2X, 3, city2Z),
        element: document.querySelector('.point-1')
    },
    {
        position: new THREE.Vector3(city3X, 3, city3Z),
        element: document.querySelector('.point-2')
    },
    {
        position: new THREE.Vector3(0, 20, -20),
        element: document.querySelector('.point-3')
    },
    {
        position: new THREE.Vector3(0, 15, -50),
        element: document.querySelector('.point-4')
    },
    {
        position: new THREE.Vector3(0, 10, 20),
        element: document.querySelector('.point-5')
    }
]

let chanceFireCity1 = 10
let chanceFireCity2 = 8
let chanceFireCity3 = 10

document.getElementById("city1FireChance").innerText = `Chance of fire: ${chanceFireCity1}%`


/**
 * City tag rod
 */

const city1Points = [];
city1Points.push(new THREE.Vector3(city1X, 2.8, city1Z));
city1Points.push(new THREE.Vector3(city1X, 0, city1Z));

const city2Points = [];
city2Points.push(new THREE.Vector3(city2X, 2.8, city2Z));
city2Points.push(new THREE.Vector3(city2X, 0, city2Z));

const city3Points = [];
city3Points.push(new THREE.Vector3(city3X, 2.8, city3Z));
city3Points.push(new THREE.Vector3(city3X, 0, city3Z));

const cityRodMaterial = new THREE.LineBasicMaterial( { color: 0x800080 } );
const cityRodGeometry1 = new THREE.BufferGeometry().setFromPoints( city1Points );
const cityRodGeometry2 = new THREE.BufferGeometry().setFromPoints( city2Points );
const cityRodGeometry3 = new THREE.BufferGeometry().setFromPoints( city3Points );



const cityLine1 = new THREE.Line( cityRodGeometry1, cityRodMaterial );
const cityLine2 = new THREE.Line( cityRodGeometry2, cityRodMaterial );
const cityLine3 = new THREE.Line( cityRodGeometry3, cityRodMaterial );

scene.add( cityLine1, cityLine2, cityLine3 );


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
camera.position.x = 4
camera.position.y = 2
camera.position.z = 5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor('#262837')



/**
 * Shadows
 */
renderer.shadowMap.enabled = true

moonLight.castShadow = true
ghost1.castShadow = true
ghost2.castShadow = true
ghost3.castShadow = true
UAVs.castShadow = true
UAV2.castShadow = true

// walls.castShadow = true
bush1.castShadow = true
bush2.castShadow = true
bush3.castShadow = true
bush4.castShadow = true

floor.receiveShadow = true


ghost1.shadow.mapSize.width = 256
ghost1.shadow.mapSize.height = 256
ghost1.shadow.camera.far = 7

ghost2.shadow.mapSize.width = 256
ghost2.shadow.mapSize.height = 256
ghost2.shadow.camera.far = 7

ghost3.shadow.mapSize.width = 256
ghost3.shadow.mapSize.height = 256
ghost3.shadow.camera.far = 7




renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap



/**
 * Animate
 */
const clock = new THREE.Clock()


let UAVLastPosX = 0.0
let UAVLastPoxZ = 0.0

let counter = 0
let resetCount = 0

let sceneReady = false

city1OnFire = true

const tick = () =>
{
    counter += 1
    if (counter === 500000)
    {
        // reset counter to prevent overflow
        counter = 0
    }

    if (counter % 300 === 0)
    {
        axios.get('http://usw-gp-vm.westus.cloudapp.azure.com:5000/getResourceInfo')
            .then(function (response) {
            const num_uav = response.data["resource_info"].length
            document.getElementById("uavStatus").innerText = `Idle: ${num_uav}, Deployed: 0%`
        })
    }
    
    if (counter > 300 && sceneReady === false)
    {
        sceneReady = true
    }

    if (sceneReady)
    {
        // Go through each point
        if (points !== null)
        {
            for (const point of points)
            {
                if (point.element !== null)
                {
                    const screenPosition = point.position.clone()
                    screenPosition.project(camera)
    
                    raycaster.setFromCamera(screenPosition, camera)
                    const intersects = raycaster.intersectObjects(scene.children, true)
    
                    if (intersects.length === 0)
                    {
                        if (point !== null)
                        {
                            if (point.element !== null)
                            {
                                point.element.classList.add('visible')
                            }
                        }
                        
                    }
                    else
                    {
    
                        const intersectionDistance = intersects[0].distance
                        const pointDistance = point.position.distanceTo(camera.position)
    
                        if (intersectionDistance < pointDistance)
                        {
                            point.element.classList.remove('visible')
                        }
                        else
                        {
                            point.element.classList.add('visible')
                        }
                        
                    }
    
                    const translateX = screenPosition.x * sizes.width * 0.5
                    const translateY = - screenPosition.y * sizes.height * 0.5
                    if (point.element !== null)
                    {
                        point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
    
                    }
                }
                
                
            }
        }
        
    }

    const elapsedTime = clock.getElapsedTime()

    // Ghost
    

    if (city1OnFire)
    {
        const ghost1Angle = elapsedTime * 0.5
        ghost1.position.x = city1X
        ghost1.position.z = city1Z
        ghost1.position.y = Math.sin(elapsedTime*3)
    }

    if (city2OnFire)
    {
        const ghost2Angle = -elapsedTime * 0.32
        ghost1.position.x = city2X
        ghost1.position.z = city2Z
        ghost1.position.y = Math.sin(elapsedTime*4) * Math.sin(elapsedTime * 2.5)
    }

    if (city3OnFire)
    {
        const ghost3Angle = -elapsedTime * 0.18
        ghost1.position.x = city3X
        ghost1.position.z = city3Z
        ghost1.position.y = Math.sin(elapsedTime * 5) * Math.sin(elapsedTime * 2)
    }
    
    if (textTitle !== null)
    {
        textTitle.rotation.y += 0.01
    }
    

    if (counter % 5 === 0)
    {

        const UAVpoints = [];
        if (line !== null)
        {
            scene.remove(line)
        }
        UAVpoints.push(UAVs.position);
        UAVpoints.push(UAV2.position);
        UAVpoints.push(UAV3.position);
        UAVpoints.push(UAV4.position);
        UAVpoints.push(UAV5.position);

        const geometry = new THREE.BufferGeometry().setFromPoints( UAVpoints );
        line = new THREE.Line( geometry, lineMaterial );
        
        scene.add( line );

        let currHeading = Math.atan2(targetX - UAVs.position.x, targetZ - UAVs.position.z)
        let currHeading2 = Math.atan2(targetX - UAV2.position.x, targetZ - UAV2.position.z)
        let currHeading3 = Math.atan2(targetX - UAV3.position.x, targetZ - UAV3.position.z)
        let currHeading4 = Math.atan2(targetX - UAV4.position.x, targetZ - UAV4.position.z)
        let currHeading5 = Math.atan2(targetX - UAV5.position.x, targetZ - UAV5.position.z)


        
        
        UAVs.position.x += Math.cos(UAVs.rotation.y) * 0.1 // speed 0.1
        UAVs.position.z -= Math.sin(UAVs.rotation.y) * 0.1 // speed 0.1

        UAV2.position.x += Math.cos(UAV2.rotation.y) * 0.1 // speed 0.1
        UAV2.position.z -= Math.sin(UAV2.rotation.y) * 0.1 // speed 0.1

        UAV3.position.x += Math.cos(UAV3.rotation.y) * 0.1 // speed 0.1
        UAV3.position.z -= Math.sin(UAV3.rotation.y) * 0.1 // speed 0.1

        UAV4.position.x += Math.cos(UAV4.rotation.y) * 0.1 // speed 0.1
        UAV4.position.z -= Math.sin(UAV4.rotation.y) * 0.1 // speed 0.1

        UAV5.position.x += Math.cos(UAV5.rotation.y) * 0.1 // speed 0.1
        UAV5.position.z -= Math.sin(UAV5.rotation.y) * 0.1 // speed 0.1

        let uavHeading = UAVs.rotation.y + Math.PI / 2
        let uavHeading2 = UAV2.rotation.y + Math.PI / 2
        let uavHeading3 = UAV3.rotation.y + Math.PI / 2
        let uavHeading4 = UAV4.rotation.y + Math.PI / 2
        let uavHeading5 = UAV5.rotation.y + Math.PI / 2

        
        if (currHeading < 0) {
            currHeading += 2 * Math.PI
        }
        if (currHeading2 < 0) {
            currHeading2 += 2 * Math.PI
        }
        if (currHeading3 < 0) {
            currHeading3 += 2 * Math.PI
        }
        if (currHeading4 < 0) {
            currHeading4 += 2 * Math.PI
        }
        if (currHeading5 < 0) {
            currHeading5 += 2 * Math.PI
        }
        // console.log(currHeading)
        
        
        if (uavHeading < 0) {
            
            uavHeading += 2 * Math.PI
        }
        if (uavHeading2 < 0) {
            
            uavHeading2 += 2 * Math.PI
        }
        if (uavHeading3 < 0) {
            
            uavHeading3 += 2 * Math.PI
        }
        if (uavHeading4 < 0) {
            
            uavHeading4 += 2 * Math.PI
        }
        if (uavHeading5 < 0) {
            
            uavHeading5 += 2 * Math.PI
        }

        

        if (Math.abs(currHeading - uavHeading) > 0.02)
        {
            

            let angleDiff = currHeading - uavHeading

            if (Math.sqrt(Math.pow(UAVs.position.x - targetX, 2) + Math.pow(UAVs.position.z - targetZ, 2)) < 5)
            {
                UAVs.rotation.y -= 0.1
            }
            else
            {
                UAVs.rotation.y += (angleDiff < 0 ? -1 : 1) * 0.1 
            }
        }

        if (Math.abs(currHeading2 - uavHeading2) > 0.02)
        {
            

            let angleDiff = currHeading2 - uavHeading2

            if (Math.sqrt(Math.pow(UAV2.position.x - targetX, 2) + Math.pow(UAV2.position.z - targetZ, 2)) < 5)
            {
                UAV2.rotation.y -= 0.1
            }
            else
            {
                UAV2.rotation.y += (angleDiff < 0 ? -1 : 1) * 0.1 
            }
        }

        if (Math.abs(currHeading3 - uavHeading3) > 0.02)
        {
            

            let angleDiff = currHeading3 - uavHeading3

            if (Math.sqrt(Math.pow(UAV3.position.x - targetX, 2) + Math.pow(UAV3.position.z - targetZ, 2)) < 5)
            {
                UAV3.rotation.y -= 0.1
            }
            else
            {
                UAV3.rotation.y += (angleDiff < 0 ? -1 : 1) * 0.1 
            }
        }

        if (Math.abs(currHeading4 - uavHeading4) > 0.02)
        {
            

            let angleDiff = currHeading4 - uavHeading4

            if (Math.sqrt(Math.pow(UAV4.position.x - targetX, 2) + Math.pow(UAV4.position.z - targetZ, 2)) < 5)
            {
                UAV4.rotation.y -= 0.1
            }
            else
            {
                UAV4.rotation.y += (angleDiff < 0 ? -1 : 1) * 0.1 
            }
        }

        if (Math.abs(currHeading5 - uavHeading5) > 0.02)
        {
            

            let angleDiff = currHeading5 - uavHeading5

            if (Math.sqrt(Math.pow(UAV5.position.x - targetX, 2) + Math.pow(UAV5.position.z - targetZ, 2)) < 5)
            {
                UAV5.rotation.y -= 0.1
            }
            else
            {
                UAV5.rotation.y += (angleDiff < 0 ? -1 : 1) * 0.1 
            }
        }




    }
    
    

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()