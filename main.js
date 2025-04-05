let targetRotationX = 0.05;
let targetRotationY = 0.002;
let mouseX = 0, mouseXOnMouseDown = 0, mouseY = 0, mouseYOnMouseDown = 0;
const dragFactor = 0.00015;
const rotationDamping = 0.97;
let earthMesh;
let pinMeshes = [];

const basePath = window.location.hostname.includes("github.io")
  ? "/Real-Time-Sensor-Data-Visualization-Website/"
  : "/";

function onDocumentMouseDown(event) {
  event.preventDefault();
  document.addEventListener('mousemove', onDocumentMouseMove, false);
  document.addEventListener('mouseup', onDocumentMouseUp, false);
  mouseXOnMouseDown = event.clientX - window.innerWidth / 2;
  mouseYOnMouseDown = event.clientY - window.innerHeight / 2;
}

function onDocumentMouseMove(event) {
  mouseX = event.clientX - window.innerWidth / 2;
  targetRotationX = (mouseX - mouseXOnMouseDown) * dragFactor;
  mouseY = event.clientY - window.innerHeight / 2;
  targetRotationY = (mouseY - mouseYOnMouseDown) * dragFactor;
}

function onDocumentMouseUp() {
  document.removeEventListener('mousemove', onDocumentMouseMove, false);
  document.removeEventListener('mouseup', onDocumentMouseUp, false);
}

function addPinToGlobe(lat, lon) {
  const radius = 0.5;
  const pinHeight = 0.1;

  const latRad = (lat * Math.PI) / 180;
  const lonRad = (-lon * Math.PI) / 180;

  const x = radius * Math.cos(latRad) * Math.cos(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.sin(lonRad);
  const pinDirection = new THREE.Vector3(x, y, z).normalize();

  // Remove previous pins
  pinMeshes.forEach(pin => earthMesh.remove(pin));
  pinMeshes = [];

  const pinBody = new THREE.CylinderGeometry(0.005, 0.005, pinHeight, 16);
  const pinMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const pinBodyMesh = new THREE.Mesh(pinBody, pinMat);
  pinBodyMesh.position.set(
    (radius + pinHeight / 2) * pinDirection.x,
    (radius + pinHeight / 2) * pinDirection.y,
    (radius + pinHeight / 2) * pinDirection.z
  );
  pinBodyMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pinDirection);

  const pinHead = new THREE.BoxGeometry(0.02, 0.02, 0.02);
  const pinHeadMesh = new THREE.Mesh(pinHead, pinMat);
  pinHeadMesh.position.set(
    (radius + pinHeight + 0.01) * pinDirection.x,
    (radius + pinHeight + 0.01) * pinDirection.y,
    (radius + pinHeight + 0.01) * pinDirection.z
  );

  earthMesh.add(pinBodyMesh);
  earthMesh.add(pinHeadMesh);
  pinMeshes.push(pinBodyMesh, pinHeadMesh);
}

async function fetchGPSData() {
  try {
    const response = await fetch("gps_data.json");
    const data = await response.json();
    addPinToGlobe(data.latitude, data.longitude);
  } catch (error) {
    console.error("❌ Failed to fetch GPS data:", error);
  }
}

function main() {
  const scene = new THREE.Scene();
  const globeContainer = document.querySelector("#globe").parentElement;
  const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector("#globe") });
  renderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);

  const textureLoader = new THREE.TextureLoader();

  let texturesLoaded = 0;
  const textures = {};

  const textureList = {
    earthMap: "texture/earthmap.jpeg",
    bumpMap: "texture/earthbump.jpeg",
    cloudMap: "texture/earthCloud.png",
    galaxyMap: "texture/galaxy.png"
  };

  Object.entries(textureList).forEach(([key, path]) => {
    textureLoader.load(
      basePath + path,
      tex => {
        textures[key] = tex;
        texturesLoaded++;
        if (texturesLoaded === Object.keys(textureList).length) {
          initScene();
        }
      },
      undefined,
      err => console.error(`❌ Error loading texture: ${path}`, err)
    );
  });

  function initScene() {
    const earthGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: textures.earthMap,
      bumpMap: textures.bumpMap,
      bumpScale: 1,
    });
    earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthMesh);

    const cloudGeometry = new THREE.SphereGeometry(0.52, 32, 32);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: textures.cloudMap,
      transparent: true,
    });
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(cloudMesh);

    const starGeometry = new THREE.SphereGeometry(5, 64, 64);
    const starMaterial = new THREE.MeshBasicMaterial({
      map: textures.galaxyMap,
      side: THREE.BackSide,
    });
    const starMesh = new THREE.Mesh(starGeometry, starMaterial);
    scene.add(starMesh);

    const light = new THREE.PointLight(0xffffff, 2, 6);
    light.position.set(1, 0.3, 1);
    scene.add(light);

    const camera = new THREE.PerspectiveCamera(45, globeContainer.clientWidth / globeContainer.clientHeight, 0.1, 1000);
    camera.position.z = 1.7;

    fetchGPSData();
    setInterval(fetchGPSData, 5000);

    function render() {
      targetRotationX *= rotationDamping;
      targetRotationY *= rotationDamping;
      earthMesh.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), targetRotationX);
      earthMesh.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), targetRotationY);
      cloudMesh.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), targetRotationX);
      cloudMesh.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), targetRotationY);
      renderer.render(scene, camera);
    }

    function animate() {
      requestAnimationFrame(animate);
      render();
    }

    animate();
    document.addEventListener("mousedown", onDocumentMouseDown, false);

    window.addEventListener("resize", () => {
      renderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
      camera.aspect = globeContainer.clientWidth / globeContainer.clientHeight;
      camera.updateProjectionMatrix();
    });
  }
}

window.onload = main;
