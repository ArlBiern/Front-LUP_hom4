import {visibleHeightAtZDepth, visibleWidthAtZDepth, lerp} from "../utils.js"
import {nextSlide, prevSlide} from "../main.js"

const raycaster = new THREE.Raycaster()
const objLoader = new THREE.OBJLoader()
let arrowBoxes = []
let arrowBoxRotation = 0

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight)

const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
renderer.setSize(window.innerWidth, window.innerHeight)

document.body.append(renderer.domElement)

objLoader.load(
    'models/cube.obj',
    ({children}) => {
      const screenBorderRight = visibleWidthAtZDepth(-10, camera) / 2
      const screenBottom = -visibleHeightAtZDepth(-10, camera) / 2
      
      addCube(children[0], nextSlide, screenBorderRight - 1.5, screenBottom + 1, [90, 0, 0])
      addCube(children[0], prevSlide, screenBorderRight - 10.2, screenBottom + 1, [90, 180, 0])
      
      animate()
    }
)

const addCube = (object, callbackFn, x, y, rotation) => {
  const cubeMesh = object.clone()
  const [rotX, rotY, rotZ] = rotation; 

  cubeMesh.scale.setScalar(.3)
  cubeMesh.rotation.set(THREE.Math.degToRad(rotX), THREE.Math.degToRad(rotY), THREE.Math.degToRad(rotZ))

  const boundingBox = new THREE.Mesh(
      new THREE.BoxGeometry(.7, .7, .7),
      new THREE.MeshBasicMaterial({transparent: true, opacity: 0})
  )

  boundingBox.position.x = x
  boundingBox.position.y = y
  boundingBox.position.z = -10

  boundingBox.add(cubeMesh)
  boundingBox.callbackFn = callbackFn
  arrowBoxes.push(boundingBox);
  scene.add(boundingBox)
}

const animate = () => {
  arrowBoxRotation = lerp(arrowBoxRotation, 0, .07)
  const interesctedObjects = raycaster.intersectObjects(scene.children)
  
  if(interesctedObjects.length) {
    arrowBoxes.forEach(arrowBox => {
      if (arrowBox.uuid === interesctedObjects[0].object.uuid) {
        arrowBox.rotation.set(THREE.Math.degToRad(arrowBoxRotation), 0, 0)
      }
    })
  }

  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

export const handleThreeAnimation = (degree) => {
  arrowBoxRotation = degree
}

window.addEventListener('click', () => {
  const mousePosition = new THREE.Vector2()
  mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1
  mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mousePosition, camera)

  const interesctedObjects = raycaster.intersectObjects(scene.children)
  console.log(interesctedObjects)
  interesctedObjects.length && interesctedObjects[0].object.callbackFn()
})
