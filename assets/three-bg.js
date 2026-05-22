// Three.js 3D Background
let scene, camera, renderer, canvas, particles, geometry, material, torus, grid;
let isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let mouseX = 0;
let mouseY = 0;

function initThreeJS() {
    canvas = document.getElementById('three-bg');
    if (!canvas) return;

    // Check for WebGL support
    if (!window.WebGLRenderingContext) {
        console.warn('WebGL not supported, falling back to static background');
        return;
    }

    try {
        // Scene
        scene = new THREE.Scene();

        // Camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        // Renderer with antialiasing off for mobile
        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: !isMobile });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0); // Transparent background
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2)); // Limit pixel ratio on mobile

        // Set canvas height to full document height
        const updateCanvasSize = () => {
            canvas.style.display = 'block';
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = window.innerHeight + 'px';
            canvas.style.zIndex = '-1';
            canvas.style.pointerEvents = 'none';
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        updateCanvasSize();

        // Particles - reduce count on mobile
        const numParticles = isMobile ? 300 : 1000;
        geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];

        for (let i = 0; i < numParticles; i++) {
            positions.push((Math.random() - 0.5) * 20);
            positions.push((Math.random() - 0.5) * 20);
            positions.push((Math.random() - 0.5) * 20);

            colors.push(Math.random() * 0.5 + 0.5); // R
            colors.push(Math.random() * 0.5 + 0.5); // G
            colors.push(1); // B
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        material = new THREE.PointsMaterial({ size: isMobile ? 0.05 : 0.02, vertexColors: true, transparent: true, opacity: 0.8 });

        particles = new THREE.Points(geometry, material);
        scene.add(particles);

        // Add rotating cubes - reduce on mobile
        const numCubes = isMobile ? 20 : 50;
        const cubeGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x6b7dff, transparent: true, opacity: 0.3 });
        for (let i = 0; i < numCubes; i++) {
            const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            cube.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
            scene.add(cube);
        }

        // Geometry shapes (Ring, Sphere, Grid)
        // These are now enabled on all devices and positioned to stay centered on mobile
        const torusGeometry = new THREE.TorusGeometry(isMobile ? 1.5 : 2, isMobile ? 0.3 : 0.5, 16, isMobile ? 40 : 100);
        const torusMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.2 });
        torus = new THREE.Mesh(torusGeometry, torusMaterial);
        torus.position.set(0, 0, -5);
        scene.add(torus);

        const sphereGeometry = new THREE.SphereGeometry(isMobile ? 1.0 : 1.5, isMobile ? 16 : 32, isMobile ? 16 : 32); // Increased sphere size
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff6b6b, transparent: true, opacity: 0.3 });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        // Center horizontally on mobile to ensure visibility on narrow screens
        sphere.position.set(isMobile ? 0 : 3, isMobile ? 2.5 : 2, -3);
        scene.add(sphere);

        grid = new THREE.GridHelper(40, 40, 0x6b7dff, 0x6b7dff);
        grid.rotation.x = Math.PI / 2;
        grid.position.z = -10;
        grid.material.transparent = true;
        grid.material.opacity = 0.03;
        scene.add(grid);

        animate();
    } catch (error) {
        console.warn('Three.js initialization failed:', error);
        // Fallback: hide canvas or show static background
        canvas.style.display = 'none';
    }
}

function animate() {
    requestAnimationFrame(animate);

    const speed = isMobile ? 0.5 : 1;

    if (particles) {
        particles.rotation.x += 0.001 * speed;
        particles.rotation.y += 0.001 * speed;

        // Subtle particle reaction to mouse
        particles.position.x += (mouseX * 0.15 - particles.position.x) * 0.02;
        particles.position.y += (mouseY * 0.15 - particles.position.y) * 0.02;
    }

    // Ultra-slow parallax for torus
    if (torus) {
        torus.position.x += (mouseX * 0.4 - torus.position.x) * 0.005;
        torus.position.y += (mouseY * 0.4 - torus.position.y) * 0.005;

        // Subtle color cycle animation for the torus ring over time
        const hue = (Date.now() * 0.00005) % 1;
        torus.material.color.setHSL(hue, 0.8, 0.5);
    }

    // Grid animation
    if (grid) {
        grid.rotation.z += 0.0002 * speed;
    }

    // Rotate cubes, torus, sphere
    scene.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
            child.rotation.x += 0.01 * speed;
            child.rotation.y += 0.01 * speed;
            if (child.geometry instanceof THREE.TorusGeometry) {
                child.rotation.z += 0.005 * speed;
            }
        }
    });

    renderer.render(scene, camera);
}

function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onTouchMove(event) {
    if (event.touches.length > 0) {
        const touch = event.touches[0];
        mouseX = (touch.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(touch.clientY / window.innerHeight) * 2 + 1;
    }
}

window.addEventListener('mousemove', onMouseMove);
window.addEventListener('touchmove', onTouchMove, { passive: true });

function onWindowResize() {
    if (!camera || !renderer || !canvas) {
        return;
    }
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    canvas.style.width = '100%';
    canvas.style.height = window.innerHeight + 'px';
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

const startThree = () => {
    if (typeof THREE === 'undefined') {
        const checkThree = setInterval(() => {
            if (typeof THREE !== 'undefined') {
                clearInterval(checkThree);
                initThreeJS();
            }
        }, 100);
    } else {
        initThreeJS();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startThree);
} else {
    startThree();
}