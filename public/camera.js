import * as THREE from 'three';
// 引入轨道控制器扩展库OrbitControls.js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// 定义相机输出画布的尺寸(单位:像素px)
const width = 800; //宽度
const height = 500; //高度

// 定义对象，设置需要修改的数据
var options = {
  fov: 50,
  near: 50,
  far: 100,
  aspect: width / height,
};
// 实例化dat.GUI对象
var gui = new GUI();
// 把需要修改的配置添加dat.GUI对象中
//gui.add(修改的配置对象, 配置对象中修改的数据名称, 修改数据边界的起始点, 修改数据边界的终止点)
// onChange: 只要数据发生了变化 就会触发onchange方法
gui.add(options, "fov", 30, 150).onChange(updatePosition);
gui.add(options, "near", 50, 100).onChange(updatePosition);
gui.add(options, "far", 100, 150).onChange(updatePosition);

// 定义更新模型位置函数
function updatePosition() {

  const { rightTop: rightTop1, rightBottom: rightBottom1, leftBottom: leftBottom1, leftTop: leftTop1 } = calePoints(options.fov, options.aspect, options.near);
  const vertices1 = new Float32Array([...rightTop1, ...rightBottom1, ...leftBottom1, ...leftTop1])
  const attribue1 = new THREE.BufferAttribute(vertices1, 3);
  geometry1.attributes.position = attribue1;

  const { rightTop: rightTop2, rightBottom: rightBottom2, leftBottom: leftBottom2, leftTop: leftTop2 } = calePoints(options.fov, options.aspect, options.far);
  const vertices2 = new Float32Array([...rightTop2, ...rightBottom2, ...leftBottom2, ...leftTop2])
  const attribue2 = new THREE.BufferAttribute(vertices2, 3);
  geometry2.attributes.position = attribue2;

  const vertices3 = new Float32Array([0, 0, 0, ...rightTop1, ...rightTop2])
  const attribue3 = new THREE.BufferAttribute(vertices3, 3);
  geometry3.attributes.position = attribue3;

  const vertices4 = new Float32Array([0, 0, 0, ...rightBottom1, ...rightBottom2])
  const attribue4 = new THREE.BufferAttribute(vertices4, 3);
  geometry4.attributes.position = attribue4;

  const vertices5 = new Float32Array([0, 0, 0, ...leftBottom1, ...leftBottom2])
  const attribue5 = new THREE.BufferAttribute(vertices5, 3);
  geometry5.attributes.position = attribue5;

  const vertices6 = new Float32Array([0, 0, 0, ...leftTop1, ...leftTop2])
  const attribue6 = new THREE.BufferAttribute(vertices6, 3);
  geometry6.attributes.position = attribue6;

  renderer.render(scene, camera)
}

// 创建3D场景对象Scene
const scene = new THREE.Scene();

//创建一个长方体几何对象Geometry
const geometry = new THREE.BoxGeometry(10, 10, 10)
const material = new THREE.MeshLambertMaterial({
  color: 0x00ff00, //设置材质颜色
  // wireframe:true,//线条模式渲染mesh对应的三角形数据
});
const mesh = new THREE.Mesh(geometry, material)
mesh.position.set(70, 0, 0)

//创建一个空的几何体对象
const geometry1 = new THREE.BufferGeometry();
//类型化数组创建顶点数据
const { rightTop: rightTop1, rightBottom: rightBottom1, leftBottom: leftBottom1, leftTop: leftTop1 } = calePoints(50, width / height, 50);
const vertices1 = new Float32Array([...rightTop1, ...rightBottom1, ...leftBottom1, ...leftTop1])
// 创建属性缓冲区对象
//3个为一组，表示一个顶点的xyz坐标
const attribue1 = new THREE.BufferAttribute(vertices1, 3);
// 设置几何体attributes属性的位置属性
geometry1.attributes.position = attribue1;
// 定义面的三角形索引（两个三角形组成四边形）
const indices = [0, 3, 2, 2, 1, 0];
geometry1.setIndex(indices);

const material11 = new THREE.PointsMaterial({
  color: 0xffff00,
  size: 10.0 //点对象像素尺寸
});
const points1 = new THREE.Points(geometry1, material11); //点模型对象
scene.add(points1);

//创建一个空的几何体对象
const geometry2 = new THREE.BufferGeometry();
//类型化数组创建顶点数据
const { rightTop: rightTop2, rightBottom: rightBottom2, leftBottom: leftBottom2, leftTop: leftTop2 } = calePoints(50, width / height, 100);
const vertices2 = new Float32Array([...rightTop2, ...rightBottom2, ...leftBottom2, ...leftTop2])
// 创建属性缓冲区对象
//3个为一组，表示一个顶点的xyz坐标
const attribue2 = new THREE.BufferAttribute(vertices2, 3);
// 设置几何体attributes属性的位置属性
geometry2.attributes.position = attribue2;
geometry2.setIndex(indices);

const points2 = new THREE.Points(geometry2, material11); //点模型对象
scene.add(points2);

//创建一个材质对象Material
const material1 = new THREE.MeshLambertMaterial({
  color: 0x0000ff, //设置材质颜色
  transparent: true,//开启透明
  opacity: 0.5,//设置透明度
  side: THREE.DoubleSide,
});

const vertices3 = new Float32Array([0, 0, 0, ...rightTop1, ...rightTop2])
const attribue3 = new THREE.BufferAttribute(vertices3, 3);
const geometry3 = new THREE.BufferGeometry();
geometry3.attributes.position = attribue3;
// 线材质对象
const material2 = new THREE.LineBasicMaterial({
  color: 0xff0000 //线条颜色
});
// 创建线模型对象
// const line1 = new THREE.Line(geometry3, material2);
const line1 = new THREE.LineLoop(geometry3, material2);
// const line1 = new THREE.LineSegments(geometry3, material2);

const vertices4 = new Float32Array([0, 0, 0, ...rightBottom1, ...rightBottom2])
const attribue4 = new THREE.BufferAttribute(vertices4, 3);
const geometry4 = new THREE.BufferGeometry();
geometry4.attributes.position = attribue4;
// 创建线模型对象
const line2 = new THREE.Line(geometry4, material2);

const vertices5 = new Float32Array([0, 0, 0, ...leftBottom1, ...leftBottom2])
const attribue5 = new THREE.BufferAttribute(vertices5, 3);
const geometry5 = new THREE.BufferGeometry();
geometry5.attributes.position = attribue5;
// 创建线模型对象
const line3 = new THREE.Line(geometry5, material2);

const vertices6 = new Float32Array([0, 0, 0, ...leftTop1, ...leftTop2])
const attribue6 = new THREE.BufferAttribute(vertices6, 3);
const geometry6 = new THREE.BufferGeometry();
geometry6.attributes.position = attribue6;
// 创建线模型对象
const line4 = new THREE.Line(geometry6, material2);

// 两个参数分别为几何体geometry、材质material
const normals = new Float32Array([
  1, 0, 0, //顶点1法线( 法向量 )
  1, 0, 0, //顶点2法线
  1, 0, 0, //顶点3法线
  1, 0, 0, //顶点4法线
  1, 0, 0, //顶点5法线
  1, 0, 0, //顶点6法线
]);
geometry1.attributes.normal = new THREE.BufferAttribute(normals, 3);
geometry2.attributes.normal = new THREE.BufferAttribute(normals, 3);
const mesh1 = new THREE.Mesh(geometry1, material1); //网格模型对象Mesh
console.log(mesh1);
const mesh2 = new THREE.Mesh(geometry2, material1);
//设置网格模型在三维空间中的位置坐标，默认是坐标原点
mesh1.position.set(0, 0, 0);
scene.add(mesh1);
mesh2.position.set(0, 0, 0);
scene.add(mesh2);
scene.add(line1);
scene.add(line2);
scene.add(line3);
scene.add(line4);
scene.add(mesh);

// AxesHelper：辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(500);
scene.add(axesHelper);

//环境光:没有特定方向，整体改变场景的光照明暗
const ambient = new THREE.AmbientLight(0xffffff, 2.0);
scene.add(ambient);

// 实例化一个透视投影相机对象
// 30:视场角度, width / height:Canvas画布宽高比, 1:近裁截面, 3000：远裁截面
const camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000);
// 相机在Three.js三维坐标系中的位置
// 根据需要设置相机位置具体值
camera.position.set(300, 300, 300);
camera.lookAt(0, 0, 0); // 指向mesh对应的位置

// 创建渲染器对象
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height); //设置three.js渲染区域的尺寸(像素px)
document.body.appendChild(renderer.domElement);
renderer.render(scene, camera); //执行渲染操作

// 设置相机控件轨道控制器OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
// 如果OrbitControls改变了相机参数，重新调用渲染器渲染三维场景
controls.addEventListener('change', function () {
  renderer.render(scene, camera); //执行渲染操作
});//监听鼠标、键盘事件

function calePoints(fov, aspect, nearOrFar) {
  const radians = Math.PI / 180 * fov / 2;
  const h = Math.tan(radians) * nearOrFar;
  const w = h * aspect;
  return {
    rightTop: [nearOrFar, h, w],
    rightBottom: [nearOrFar, -h, w],
    leftBottom: [nearOrFar, -h, -w],
    leftTop: [nearOrFar, h, -w],
  }
}
