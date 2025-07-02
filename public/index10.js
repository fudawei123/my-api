
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'

const projection = d3.geoMercator()
  .center([121.6, 38.9]) // 大连中心经纬度
  .scale(10000);

const scene = new THREE.Scene()
const texture = new THREE.TextureLoader().load('./earth.png')
texture.mapping = THREE.EquirectangularReflectionMapping;
scene.background = texture

const axesHelper = new THREE.AxesHelper(10)
scene.add(axesHelper)

const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 200);
camera.lookAt(0, 0, 0);
// camera.up.set(0, -1, 0)

const ambient = new THREE.AmbientLight(0xffffff, 100);
scene.add(ambient);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.render(scene, camera);

const css2Renderer = new CSS2DRenderer();
css2Renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(css2Renderer.domElement);
css2Renderer.domElement.style.position = 'absolute';
css2Renderer.domElement.style.top = '0px';
css2Renderer.domElement.style.pointerEvents = 'none';

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const v2 = new THREE.Vector2(window.innerWidth, window.innerHeight);
const outlinePass = new OutlinePass(v2, scene, camera);
composer.addPass(outlinePass);

const controls = new OrbitControls(camera, renderer.domElement);
function render() {
  css2Renderer.render(scene, camera);
  composer.render();
  // renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render()

function renderMultiPolygon(coordinates){
  const group = new THREE.Group();
  for (let i = 0; i < coordinates.length; i++) {
    const arr = []
    for (let j = 0; j < coordinates[i][0].length; j++) {
      const item = coordinates[i][0][j];
      const [lng, lat] = item
      const [x, y] = projection([lng, lat]);
      arr.push(new THREE.Vector2(x, y))
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints(arr);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 'red',
      linewidth: 1
    });
    const line = new THREE.LineLoop(geometry, lineMaterial);
    group.add(line)
  }
  return group
}

function renderLineString(coordinates) {
  const arr = []
  for (let i = 0; i < coordinates.length; i++) {
    const item = coordinates[i]
    const [lng, lat] = item
    const [x, y] = projection([lng, lat]);
    arr.push(new THREE.Vector2(x, y))
  }
  const shape = new THREE.Shape(arr)
  const geometry = new THREE.ShapeGeometry(shape);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh
}
function renderPoint(coordinates) {
  const [lng, lat] = coordinates
  const [x, y] = projection([lng, lat]);

  const geometry = new THREE.CircleGeometry(0.07, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
  const point = new THREE.Mesh(geometry, material);
  point.position.set(x, y, 0.01)
  return point
}

function renderHTML(name) {
  const span = document.createElement('span')
  span.innerHTML = name
  span.style.color = "white"
  const tag = new CSS2DObject(span);
  return tag
}

function getCenter(mesh){
  const box3 = new THREE.Box3();
  box3.expandByObject(mesh);
  const center = new THREE.Vector3();
  box3.getCenter(center);
  return center
}

const meshArr = []
const pointArr = []
const select = document.getElementById('select')
select.onchange = handleChange
fetch('./临时数据表.geojson').then(response => response.json()).then(data => {
  console.log(data)
  const { features } = data
  for (let i = 0; i < features.length; i++) {
    const { geometry, properties } = features[i];
    const { type, coordinates } = geometry
    const { gid, name, pid, isWater, blank } = properties

    if (type === 'LineString') {
      const mesh = renderLineString(coordinates)
      if('1' == blank){
        mesh.material.transparent = true
        mesh.material.opacity = 0.5
        mesh.material.color.setHex(0xffffff)
      }
      mesh.name = name
      mesh.gid = gid
      mesh.isWater = isWater
      const center = getCenter(mesh)
      const tag = renderHTML(name)
      tag.position.copy(center)
      mesh.add(tag)
      meshArr.push(mesh)
      if('1' === isWater){
        select.innerHTML += `<option value="${gid}">${name}</option>`
      }
    } else if (type === 'Point') {
      const point = renderPoint(coordinates)
      point.name = name
      point.gid = gid
      point.pid = pid
      point.visible = false
      point.isSite = true
      const tag = renderHTML(name)
      tag.visible = false
      point.add(tag)
      pointArr.push(point)
    } else if (type === 'MultiPolygon') {
      const group = renderMultiPolygon(coordinates)
      group.name = name
      group.gid = gid
      meshArr.push(group)
      const center = getCenter(group)
      const tag = renderHTML(name)
      tag.position.copy(center)
      group.add(tag)
    }
  }

  for (let i = 0; i < meshArr.length; i++) {
    const mesh = meshArr[i];
    const points = pointArr.filter(({ pid }) => pid == mesh.gid)
    if(points.length){
      mesh.add(...points)
    }
  }

  const group = new THREE.Group()
  group.add(...meshArr)
  group.rotation.x = Math.PI
  const center = getCenter(group)
  group.position.copy(center).multiplyScalar(-1)

  scene.add(group);
});


function renderDetail(pid) {
  fetch('./detail.json').then(response => response.json()).then(data => {
    delDetail()
    const detail = data[pid]
    if(!detail)return
    const { name, desc, site } = detail
    const div = document.createElement('div')
    div.id = 'detail'
    const h2 = document.createElement('h2')
    h2.innerHTML = name
    div.appendChild(h2)
    const p = document.createElement('p')
    p.innerHTML = desc
    div.appendChild(p)
    if(site.length){
      for (let i = 0; i < site.length; i++) {
        const { name, fish } = site[i];
        const dl = document.createElement('dl')
        const dt = document.createElement('dt')
        dt.innerHTML = name;
        const dd = document.createElement('dd')
        dd.innerHTML = fish.join(",");
        dl.appendChild(dt)
        dl.appendChild(dd)
        div.appendChild(dl)
      }
    }else {
      const p = document.createElement('p')
      p.innerHTML = "暂无数据"
      div.appendChild(p)
    }
    css2Renderer.domElement.appendChild(div)
  })
}

function delDetail(){
  const detail = document.querySelector('#detail')
  if(detail){
    detail.remove()
  }
}

function delPoint(object){
  if(!object)return
  object.children.forEach(point => {
    if(point.isSite){
      point.visible = false
      point.children[0].visible = false
    }
  })
}

function switchCameraPosition(object){
  const center = getCenter(object)
  camera.position.set(center.x, center.y, 10)
  camera.lookAt(center)

  controls.target.copy(center)
}

let selected

function selectObject(object){
  if(selected){
    delPoint(selected)
  }
  selected = object;
  outlinePass.selectedObjects = [object];
  object.children.forEach(point => {
    if(point.isSite){
      point.visible = true
      point.children[0].visible = true
    }
  })
  renderDetail(object.gid)

  switchCameraPosition(object)
}

renderer.domElement.addEventListener('click', function (event) {
  const px = event.offsetX;
  const py = event.offsetY;
  const x = (px / window.innerWidth) * 2 - 1;
  const y = -(py / window.innerHeight) * 2 + 1;
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
  const intersects = raycaster.intersectObjects(meshArr);
  if (intersects.length > 0) {
    const object = intersects[0].object;
    if('1' === object.isWater){
      selectObject(object)
    }
  } else {
    outlinePass.selectedObjects = [];
    delDetail()
    delPoint(selected)
  }
})

function handleChange(e){
  const value = e.target.value
  if('' == value) {
    camera.position.set(0, 0, 200);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    return
  }
  for (let i = 0; i < meshArr.length; i++) {
    const mesh = meshArr[i];
    if(value == mesh.gid){
      selectObject(mesh)
      return
    }
  }
}