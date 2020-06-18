/* eslint-disable */


/*
 * Imports
 */
// npm
import * as THREE from 'three';
const createInputEvents = require('simple-input-events');

// shaders
import fragment from './shaders/volcano_fragment.glsl';
import vertex from './shaders//volcano_vertex.glsl';


/*
 * Declarations
 */
// Constants
const mouse = new THREE.Vector2(-1, -1);
const raycaster = new THREE.Raycaster();
const volcanoProps = {
  particles: 5000,
  positionFactor: 0.1,
  angleFactor: 1,
  livesFactor: 5,
  livesBias: 4,
  offsetFactor: 100,
};

// Variables
let camera; let scene; let renderer; let dotsMaterial; let clearingPlane; let mouseEvent;
let time = 0;


/*
 * Functions
 */
function init() {

  /* Setup THREE boilerplate */
  const container = document.getElementById('container');
  mouseEvent = createInputEvents(container);

  scene = new THREE.Scene();
  scene.destination = { x: 0, y: 0 };

  renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true, alpha: true, antialias: true });
  renderer.autoClear = false;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.offsetWidth, container.offsetHeight);

  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    70,
    container.offsetWidth / container.offsetHeight,
    0.001, 1000
  );
  camera.position.set(0, 0, 3);

  /* Start custom stuff */
  dotsMaterial = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
      time: { type: 'f', value: 0 },
      uMouse: { type: "v2", value: new THREE.Vector2(0, 0) },
    },
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthWrite: false,
  });

  const { particles, positionFactor, angleFactor, livesBias, livesFactor, offsetFactor } = volcanoProps;
  const dotsGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particles * 3);
  const angles = new Float32Array(particles);
  const lives = new Float32Array(particles);
  const offsets = new Float32Array(particles);

  for (let i = 0; i < particles; i++) {
    positions.set(
      [
        Math.random() * positionFactor,
        Math.random() * positionFactor,
        Math.random() * positionFactor
      ],
      3 * i
    );
    angles.set([angleFactor * Math.random() * 2 * Math.PI], i);
    lives.set([livesBias + Math.random() * livesFactor], i);
    offsets.set([offsetFactor * Math.random()], i);
  }

  dotsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  dotsGeometry.setAttribute("angle", new THREE.BufferAttribute(angles, 1));
  dotsGeometry.setAttribute("life", new THREE.BufferAttribute(lives, 1));
  dotsGeometry.setAttribute("offset", new THREE.BufferAttribute(offsets, 1));

  const dots = new THREE.Points(dotsGeometry, dotsMaterial);

  clearingPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(container.offsetWidth, container.offsetHeight),
    new THREE.MeshBasicMaterial({
      transparent: true,
      color: 0xFFFFFF,
      opacity: 0.01
    })
  );
  scene.add(dots, clearingPlane);

  /* Call functions */
  resize();
  window.addEventListener('resize', resize);

  mouseEvent.on('move', ({ position, event, inside, dragging }) => {
    mouse.x = position[0] / container.offsetWidth * 2 - 1;
    mouse.y = 1 - position[1] / container.offsetHeight * 2;
  });

}


function animate() {
  time += 0.05;
  dotsMaterial.uniforms.time.value = time;

  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects([clearingPlane]);

  if (intersects[0]) {
    let p = intersects[0].point;
    dotsMaterial.uniforms.uMouse.value = new THREE.Vector2(p.x, p.y);
  }

  requestAnimationFrame(animate);
  render();
}

function render() {
  renderer.render(scene, camera);
}

/*
 * Helper functions and event listeners
 */
function resize() {
  const w = container.offsetWidth;
  const h = container.offsetHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

/*
 * Calls
 */
init();
animate();
