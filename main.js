import * as THREE from 'https://cdn.skypack.dev/three@0.133.1/build/three.module'

const canvasEl = document.querySelector('#canvas')
const cleanBtn = document.querySelector('.clean-btn')

const pointer = { x: 0.66, y: 0.3, clicked: true }

let basicMaterial, shaderMaterial
let renderer = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

let sceneShader = new THREE.Scene()
let sceneBasic = new THREE.Scene()
let camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10)
let clock = new THREE.Clock()

let renderTargets = [
  new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight),
  new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight),
]

createPlane()
updateSize()
window.addEventListener('resize', () => { updateSize(); cleanCanvas() })
render()

window.addEventListener('click', e => {
  pointer.x = e.pageX / innerWidth
  pointer.y = e.pageY / innerHeight
  pointer.clicked = true
})

cleanBtn.addEventListener('click', cleanCanvas)

function cleanCanvas() {
  shaderMaterial.uniforms.u_clean.value = 0
  setTimeout(() => shaderMaterial.uniforms.u_clean.value = 1, 50)
}

function createPlane() {
  shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      u_time: { value: 0 },
      u_stop_time: { value: 0 },
      u_stop_randomizer: { value: new THREE.Vector2(Math.random(), Math.random()) },
      u_cursor: { value: new THREE.Vector2(pointer.x, pointer.y) },
      u_ratio: { value: innerWidth / innerHeight },
      u_texture: { value: null },
      u_clean: { value: 1 },
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
  })

  basicMaterial = new THREE.MeshBasicMaterial()
  const geo = new THREE.PlaneGeometry(2, 2)
  sceneBasic.add(new THREE.Mesh(geo, basicMaterial))
  sceneShader.add(new THREE.Mesh(geo, shaderMaterial))
}

function render() {
  shaderMaterial.uniforms.u_time.value = clock.elapsedTime
  shaderMaterial.uniforms.u_texture.value = renderTargets[0].texture

  if (pointer.clicked) {
    shaderMaterial.uniforms.u_cursor.value.set(pointer.x, 1 - pointer.y)
    shaderMaterial.uniforms.u_stop_randomizer.value.set(Math.random(), Math.random())
    shaderMaterial.uniforms.u_stop_time.value = 0
    pointer.clicked = false
  }

  shaderMaterial.uniforms.u_stop_time.value += clock.getDelta()

  renderer.setRenderTarget(renderTargets[1])
  renderer.render(sceneShader, camera)
  basicMaterial.map = renderTargets[1].texture
  renderer.setRenderTarget(null)
  renderer.render(sceneBasic, camera)

  ;[renderTargets[0], renderTargets[1]] = [renderTargets[1], renderTargets[0]]
  requestAnimationFrame(render)
}

function updateSize() {
  shaderMaterial.uniforms.u_ratio.value = innerWidth / innerHeight
  renderer.setSize(innerWidth, innerHeight)
}
