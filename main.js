var textureURL = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/lroc_color_poles_1k.jpg";
var displacementURL = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/ldem_3_8bit.jpg";
var worldURL = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/hipp8_s.jpg";

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio); // High-resolution rendering
document.body.appendChild(renderer.domElement);

// Set up OrbitControls
if (THREE.OrbitControls) {
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enablePan = true; // Allows panning
    controls.enableZoom = true; // Allows zooming
    controls.enableRotate = true; // Allows rotation
} else {
    console.error('OrbitControls is not available.');
}

var geometry = new THREE.SphereGeometry(2, 128, 128);

var textureLoader = new THREE.TextureLoader();
var texture = textureLoader.load(textureURL, function() {
    render();
});
var displacementMap = textureLoader.load(displacementURL);
var worldTexture = textureLoader.load(worldURL);

var material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    map: texture,
    displacementMap: displacementMap,
    displacementScale: 0.1,
    bumpMap: displacementMap,
    bumpScale: 0.05,
    reflectivity: 0,
    shininess: 0
});

var moon = new THREE.Mesh(geometry, material);
scene.add(moon);

var light = new THREE.DirectionalLight(0xFFFFFF, 1);
light.position.set(-100, 10, 50);
scene.add(light);

var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1);
hemiLight.color.setHSL(0.6, 1, 0.6);
hemiLight.groundColor.setHSL(0.095, 1, 0.75);
hemiLight.position.set(0, 0, 0);
scene.add(hemiLight);

var worldGeometry = new THREE.SphereGeometry(1000, 60, 60);
var worldMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: worldTexture,
    side: THREE.BackSide
});
var world = new THREE.Mesh(worldGeometry, worldMaterial);
scene.add(world);

moon.rotation.x = 3.1415 * 0.02;
moon.rotation.y = 3.1415 * 1.54;

function animate() {
    requestAnimationFrame(animate);
    moon.rotation.y += 0.002;
    moon.rotation.x += 0.0001;
    world.rotation.y += 0.0001;
    world.rotation.x += 0.0005;

    // Update controls
    if (controls) controls.update();

    renderer.render(scene, camera);
}

function render() {
    renderer.render(scene, camera);
}

animate();

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onResize, false);

// Adding UI elements for enhanced functionality
var controlPanel = document.createElement('div');
controlPanel.style.position = 'absolute';
controlPanel.style.top = '10px';
controlPanel.style.left = '10px';
controlPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
controlPanel.style.color = '#fff';
controlPanel.style.padding = '15px';
controlPanel.style.borderRadius = '10px';
controlPanel.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
controlPanel.style.fontFamily = 'Arial, sans-serif';
controlPanel.style.fontSize = '14px';
controlPanel.style.zIndex = '100';
document.body.appendChild(controlPanel);

// Lighting controls
var lightIntensitySlider = document.createElement('input');
lightIntensitySlider.type = 'range';
lightIntensitySlider.min = 0;
lightIntensitySlider.max = 2;
lightIntensitySlider.step = 0.1;
lightIntensitySlider.value = 1;
lightIntensitySlider.style.width = '100%';
lightIntensitySlider.oninput = function() {
    light.intensity = parseFloat(lightIntensitySlider.value);
};
controlPanel.appendChild(document.createTextNode('Light Intensity: '));
controlPanel.appendChild(lightIntensitySlider);
controlPanel.appendChild(document.createElement('br'));

// Simulate moon phases
var phaseSlider = document.createElement('input');
phaseSlider.type = 'range';
phaseSlider.min = 0;
phaseSlider.max = 1;
phaseSlider.step = 0.01;
phaseSlider.value = 0.5;
phaseSlider.style.width = '100%';
phaseSlider.oninput = function() {
    var phase = parseFloat(phaseSlider.value);
    hemiLight.intensity = 1 - phase;
    light.intensity = phase;
};
controlPanel.appendChild(document.createTextNode('Moon Phase: '));
controlPanel.appendChild(phaseSlider);
controlPanel.appendChild(document.createElement('br'));

// Adding atmosphere effect
var atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(2.05, 60, 60),
    new THREE.MeshBasicMaterial({
        color: 0x4444ff,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide
    })
);
scene.add(atmosphere);

// Real-time lunar phase simulation
var lunarPhaseButton = document.createElement('button');
lunarPhaseButton.innerHTML = 'Simulate Real-Time Lunar Phase';
lunarPhaseButton.style.backgroundColor = '#007bff';
lunarPhaseButton.style.color = '#fff';
lunarPhaseButton.style.border = 'none';
lunarPhaseButton.style.borderRadius = '5px';
lunarPhaseButton.style.padding = '10px 15px';
lunarPhaseButton.style.cursor = 'pointer';
lunarPhaseButton.style.marginTop = '10px';
lunarPhaseButton.style.fontSize = '14px';
lunarPhaseButton.onmouseover = function() {
    lunarPhaseButton.style.backgroundColor = '#0056b3';
};
lunarPhaseButton.onmouseout = function() {
    lunarPhaseButton.style.backgroundColor = '#007bff';
};
lunarPhaseButton.onclick = function() {
    var now = new Date();
    var lunarPhase = calculateLunarPhase(now);
    hemiLight.intensity = 1 - lunarPhase;
    light.intensity = lunarPhase;
};
controlPanel.appendChild(lunarPhaseButton);

function calculateLunarPhase(date) {
    // Algorithm to calculate the current lunar phase
    var lp = 2551443; // Lunar period in seconds
    var new_moon = new Date('2000-01-06T18:14:00Z'); // Reference new moon date
    var phase = ((date - new_moon) / 1000) % lp;
    return Math.abs(Math.sin((phase / lp) * Math.PI));
}

// Performance optimization
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Cursor control for moon rotation
var isDragging = false;
var previousMousePosition = {
    x: 0,
    y: 0
};

renderer.domElement.addEventListener('mousedown', function(e) {
    isDragging = true;
});

renderer.domElement.addEventListener('mousemove', function(e) {
    var deltaMove = {
        x: e.offsetX - previousMousePosition.x,
        y: e.offsetY - previousMousePosition.y
    };

    if (isDragging) {
        var deltaRotationQuaternion = new THREE.Quaternion()
            .setFromEuler(new THREE.Euler(
                toRadians(deltaMove.y * 1),
                toRadians(deltaMove.x * 1),
                0,
                'XYZ'
            ));

        moon.quaternion.multiplyQuaternions(deltaRotationQuaternion, moon.quaternion);
    }

    previousMousePosition = {
        x: e.offsetX,
        y: e.offsetY
    };
});

renderer.domElement.addEventListener('mouseup', function(e) {
    isDragging = false;
});

renderer.domElement.addEventListener('mouseleave', function(e) {
    isDragging = false;
});

function toRadians(angle) {
    return angle * (Math.PI / 180);
}

function toDegrees(angle) {
    return angle * (180 / Math.PI);
}
