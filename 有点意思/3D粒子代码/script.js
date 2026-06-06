// ===========================
// 全局变量
// ===========================
let scene, camera, renderer, particles, particleMaterial, particleGeometry;
const PARTICLE_COUNT = 35000; // 再次增加粒子数，因为放大了需要更密

let currentShape = 'heart';
let targetDispersion = 1.0; 
let currentDispersion = 1.0; 

const shapePositions = { heart: [], saturn: [], flower: [], sphere: [] };
const shapeColors = {
    heart: '#ff0055',   // 爱心默认洋红
    saturn: '#c58b5e',  // 温暖棕色
    sphere: '#4fa6ff'   // 深空蓝
};

const cameraFeed = document.getElementById('camera-feed');
const videoElement = document.getElementById('input-video');
const handCanvas = document.getElementById('hand-overlay');
const handCtx = handCanvas.getContext('2d');
const shapeSelect = document.getElementById('shape-select');
const colorPicker = document.getElementById('color-picker');
const handStatus = document.getElementById('hand-status');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const cameraToggle = document.getElementById('camera-toggle');
const collapseBtn = document.getElementById('collapse-panel-btn');
const panelFab = document.getElementById('panel-fab');
const uiPanel = document.getElementById('ui-panel');

// ===========================
// 1. 数学算法 (修正核心：大小与朝向)
// ===========================

function getSpherePoint(radius) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    return new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
    );
}

// 【修复重点】实心爱心
function generateHeartPositions() {
    let count = 0;
    // 1. 暴力放大：从18改到45，让它足够大
    const scale = 200; 
    const bounds = 1.3;

    while (count < PARTICLE_COUNT) {
        // 在采样空间随机取点
        const x = (Math.random() * 2 - 1) * bounds;
        const y = (Math.random() * 2 - 1) * bounds;
        const z = (Math.random() * 2 - 1) * bounds;

        // 爱心不等式
        const a = x * x + (9/4) * y * y + z * z - 1;
        const result = a * a * a - x * x * z * z * z - (9/80) * y * y * z * z * z;

        if (result < 0) {
            // 【修复重点】：坐标旋转
            // 原始公式生成的爱心可能是沿着Z轴或Y轴扁平的。
            // 这里我们显式地调整坐标映射，强制它“站立”
            // 原始输出是: x, y, z. 
            // 我们为了让它直立面对屏幕：
            // 将 y 乘以 -1 (翻转) 并稍微调整重心
            // 将 z (深度) 和 y (高度) 的关系理顺
            
            let pX = x * scale;
            let pY = y * scale; 
            let pZ = z * scale;

            // 旋转修正：绕 X 轴旋转 -90 度
            // 简单模拟：原来的 y 变成 z，原来的 z 变成 -y
            // 这样原本“躺在桌子上”的面就会“立在墙上”
            const rotatedY = pZ; 
            const rotatedZ = -pY;

            // 存入数组，同时给Y轴加一点偏移量(10)，让它在屏幕正中央
            shapePositions.heart.push(pX, rotatedY + 10, rotatedZ);
            count++;
        }
    }
}

function generateSaturnPositions() {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        let v;
        if (i < PARTICLE_COUNT * 0.6) {
            v = getSpherePoint(80); // 稍微加大主体
        } else {
            const angle = Math.random() * Math.PI * 2;
            const r = 120 + Math.random() * 100; // 加大光环
            v = new THREE.Vector3(Math.cos(angle)*r, (Math.random()-0.5)*4, Math.sin(angle)*r);
            v.applyAxisAngle(new THREE.Vector3(1, 0, 1).normalize(), Math.PI / 5);
        }
        shapePositions.saturn.push(v.x, v.y, v.z);
    }
}

function generateFlowerPositions() {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI;
        // 放大花朵尺寸
        const r = 160 * Math.sin(3 * u) * Math.sin(v);
        shapePositions.flower.push(r * Math.cos(u), r * Math.sin(u), 100 * Math.cos(v) + (Math.random()-0.5)*10);
    }
}

function generateSpherePositions() {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        // 放大初始球体
        let v = getSpherePoint(150); 
        shapePositions.sphere.push(v.x, v.y, v.z);
    }
}

// ===========================
// 2. Three.js 初始化
// ===========================
function initScene() {
    scene = new THREE.Scene();
    
    // 调整相机位置，确保放大的爱心能被完全看清，但又足够有压迫感
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.z = 600; 

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0); 
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function initParticles() {
    generateHeartPositions();
    generateSaturnPositions();
    generateFlowerPositions();
    generateSpherePositions();

    particleGeometry = new THREE.BufferGeometry();
    const initialPos = new Float32Array(shapePositions[currentShape]);
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(initialPos.slice(), 3));
    particleGeometry.setAttribute('basePosition', new THREE.BufferAttribute(initialPos.slice(), 3));

    particleMaterial = new THREE.PointsMaterial({
        color: new THREE.Color(colorPicker.value),
        size: 2.5, // 粒子大小适中
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
    });

    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
}

// ===========================
// 3. MediaPipe 手势
// ===========================
function initMediaPipe() {
    const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });
    
    hands.onResults((results) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            handStatus.innerText = "👐 已捕获手势";
            handStatus.classList.add('active');

            const landmarks = results.multiHandLandmarks[0];
            const thumb = landmarks[4];
            const index = landmarks[8];
            const dist = Math.sqrt(Math.pow(thumb.x - index.x, 2) + Math.pow(thumb.y - index.y, 2));

            const minD = 0.05;
            const maxD = 0.35;
            const cleanDist = Math.max(minD, Math.min(maxD, dist));
            
            // 确保完全炸开：系数提高到 8.0
            targetDispersion = 1.0 + (cleanDist - minD) * (5.0 - 1.0) / (maxD - minD);
            
        } else {
            handStatus.innerText = "🔍 寻找手掌...";
            handStatus.classList.remove('active');
            targetDispersion = 1.0;
        }

        if (handCtx && handCanvas) {
            const width = videoElement.videoWidth || handCanvas.width || 640;
            const height = videoElement.videoHeight || handCanvas.height || 480;
            handCanvas.width = width;
            handCanvas.height = height;

            handCtx.save();
            handCtx.clearRect(0, 0, width, height);

            if (cameraToggle.checked && results.multiHandLandmarks) {
                for (const landmarks of results.multiHandLandmarks) {
                    handCtx.save();
                    handCtx.globalAlpha = 0.95;
                    handCtx.shadowColor = 'rgba(255, 51, 173, 0.9)';
                    handCtx.shadowBlur = 18;

                    if (typeof drawConnectors === 'function') {
                        drawConnectors(handCtx, landmarks, HAND_CONNECTIONS, {
                            color: '#ff66c4',   // 粉色霓虹线
                            lineWidth: 3
                        });
                    }

                    if (typeof drawLandmarks === 'function') {
                        // 先画淡一点的底层点
                        drawLandmarks(handCtx, landmarks, {
                            color: '#ffffff',
                            lineWidth: 0,
                            radius: 2.5
                        });
                        // 再给指尖稍微加大一点高亮
                        const tipIndexes = [4, 8, 12, 16, 20];
                        const tipLandmarks = tipIndexes.map(i => landmarks[i]);
                        drawLandmarks(handCtx, tipLandmarks, {
                            color: '#ffb3e4',
                            lineWidth: 0,
                            radius: 3.4
                        });
                    }

                    handCtx.restore();
                }
            }
            handCtx.restore();
        }
    });
    
    const cameraUtils = new Camera(videoElement, {
        onFrame: async () => { await hands.send({image: videoElement}); },
        width: 640, height: 480
    });
    cameraUtils.start();
}

// ===========================
// 4. 动画循环
// ===========================
function animate() {
    requestAnimationFrame(animate);

    // 平滑过渡
    currentDispersion += (targetDispersion - currentDispersion) * 0.08;

    const positions = particleGeometry.attributes.position.array;
    const basePositions = particleGeometry.attributes.basePosition.array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        // 核心逻辑：基于原点向外爆炸
        positions[i3]     = basePositions[i3]     * currentDispersion;
        positions[i3 + 1] = basePositions[i3 + 1] * currentDispersion;
        positions[i3 + 2] = basePositions[i3 + 2] * currentDispersion;
    }
    particleGeometry.attributes.position.needsUpdate = true;

    // 缓慢旋转：增加一点点 Y 轴旋转，让立体感更强
    particles.rotation.y += 0.003;
    
    // 增加一个微小的呼吸浮动效果
    particles.position.y = Math.sin(Date.now() * 0.001) * 5;

    renderer.render(scene, camera);
}

// ===========================
// 5. 事件监听
// ===========================
shapeSelect.addEventListener('change', (e) => {
    currentShape = e.target.value;
    const newBase = shapePositions[currentShape];
    const baseAttr = particleGeometry.attributes.basePosition;
    if (newBase.length > 0) {
        // 如果新形状点数不足（虽然我们都设为35000了），取余循环填充
        for(let i=0; i < PARTICLE_COUNT * 3; i++) baseAttr.array[i] = newBase[i % newBase.length];
        baseAttr.needsUpdate = true;
    }
    if (shapeColors[currentShape]) {
        const newColor = shapeColors[currentShape];
        colorPicker.value = newColor;
        particleMaterial.color.set(newColor);
    }
});

function setCameraDisplay(isEnabled) {
    const targetClass = isEnabled ? 'video-mode-pip' : 'video-mode-off';
    cameraFeed.className = targetClass;
}

cameraToggle.addEventListener('change', (e) => setCameraDisplay(e.target.checked));

// 初始化摄像头状态
setCameraDisplay(cameraToggle.checked);

colorPicker.addEventListener('input', (e) => particleMaterial.color.set(e.target.value));

fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
});

collapseBtn.addEventListener('click', () => {
    uiPanel.classList.add('panel-hidden');
    panelFab.classList.add('visible');
});

panelFab.addEventListener('click', () => {
    uiPanel.classList.remove('panel-hidden');
    panelFab.classList.remove('visible');
});

// ===========================
// 启动
// ===========================
initScene();
initParticles();
initMediaPipe();
animate();