'use strict';

(function () {
    let scene, camera, renderer, laptop, screen, codeText;
    let codeLines = [
        '&lt;?php',
        'function my_theme_setup() {',
        '    add_theme_support("title-tag");',
        '    add_theme_support("post-thumbnails");',
        '    register_nav_menus(array(',
        '        "primary" => "Primary Menu"',
        '    ));',
        '}',
        'add_action("after_setup_theme", "my_theme_setup");',
        '?&gt;'
    ];
    let currentLine = 0;
    let currentChar = 0;
    let typingSpeed = 100;
    let lineDelay = 800;
    let typingTimeout = null;

    function init() {
        const canvas = document.getElementById('laptop-canvas');
        if (!canvas) {
            // Retry after a short delay if canvas not found
            setTimeout(init, 100);
            return;
        }

        // Check if canvas is visible
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            setTimeout(init, 100);
            return;
        }

        const container = canvas.parentElement;
        // Get dimensions from container or use defaults
        let width = container.offsetWidth;
        let height = container.offsetHeight;

        // If container has no size, use canvas computed style or defaults
        if (width === 0 || height === 0) {
            const computedStyle = window.getComputedStyle(canvas);
            width = parseInt(computedStyle.width) || 600;
            height = parseInt(computedStyle.height) || 400;
        }

        // Ensure minimum size
        width = Math.max(width, 400);
        height = Math.max(height, 300);

        // Scene
        scene = new THREE.Scene();
        // Keep background transparent for particles to show through

        // Camera
        camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        camera.position.set(0, 1.5, 6);
        camera.lookAt(0, 0.5, 0);

        // Renderer
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true
        });
        renderer.setSize(width, height, false);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0); // Transparent background

        // Ensure canvas has proper dimensions
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const directionalLight1 = new THREE.DirectionalLight(0x61dafb, 1.0);
        directionalLight1.position.set(5, 8, 5);
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight2.position.set(-5, 3, -5);
        scene.add(directionalLight2);

        // Create laptop
        createLaptop();

        // Add a simple test to verify rendering
        console.log('Three.js initialized, laptop created');

        // Start typing animation
        setTimeout(() => {
            startTyping();
        }, 500);

        // Animation loop
        animate();

        // Force initial render
        renderer.render(scene, camera);

        // Handle resize
        window.addEventListener('resize', onWindowResize);
    }

    function createLaptop() {
        const laptopGroup = new THREE.Group();
        const scale = 1.2; // Scale up for better visibility

        // Laptop base
        const baseGeometry = new THREE.BoxGeometry(6 * scale, 0.2 * scale, 4 * scale);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x3d3d3d, metalness: 0.3, roughness: 0.7 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0;
        laptopGroup.add(base);

        // Screen
        const screenGeometry = new THREE.BoxGeometry(5.5 * scale, 3.5 * scale, 0.1 * scale);
        const screenMaterial = new THREE.MeshStandardMaterial({ color: 0x2d2d2d, metalness: 0.2, roughness: 0.8 });
        screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(0, 1.8 * scale, -2 * scale);
        screen.rotation.x = -0.25;
        laptopGroup.add(screen);

        // Screen content (code display)
        const screenContentGeometry = new THREE.PlaneGeometry(5.3 * scale, 3.3 * scale);
        const screenContentMaterial = new THREE.MeshBasicMaterial({
            color: 0x252526,
            transparent: true,
            opacity: 0.95
        });
        const screenContent = new THREE.Mesh(screenContentGeometry, screenContentMaterial);
        screenContent.position.set(0, 0, 0.06 * scale);
        screen.add(screenContent);

        // Code text canvas
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#252526';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        const codePlane = new THREE.PlaneGeometry(5.2 * scale, 3.2 * scale);
        const codeMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
        });
        codeText = new THREE.Mesh(codePlane, codeMaterial);
        codeText.position.set(0, 0, 0.07 * scale);
        screen.add(codeText);

        // Store canvas context for typing animation
        codeText.userData.canvas = canvas;
        codeText.userData.ctx = ctx;

        laptop = laptopGroup;
        scene.add(laptop);

        // Initial rotation and position
        laptop.rotation.y = 0.15;
        laptop.position.y = 0;
    }

    function startTyping() {
        if (!codeText || !codeText.userData.ctx) return;

        // Clear any existing typing timeout
        if (typingTimeout) {
            clearTimeout(typingTimeout);
            typingTimeout = null;
        }

        // Reset typing state
        currentLine = 0;
        currentChar = 0;

        const ctx = codeText.userData.ctx;
        const canvas = codeText.userData.canvas;

        // Clear screen
        ctx.fillStyle = '#252526';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        codeText.material.map.needsUpdate = true;

        function typeNextChar() {
            if (currentLine >= codeLines.length) {
                currentLine = 0;
                currentChar = 0;
                // Clear screen
                ctx.fillStyle = '#252526';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                codeText.material.map.needsUpdate = true;
            }

            const line = codeLines[currentLine];
            if (currentChar < line.length) {
                // Clear and redraw all text
                ctx.fillStyle = '#252526';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.font = 'bold 18px "Courier New", monospace';
                ctx.fillStyle = '#61dafb';
                ctx.textBaseline = 'top';

                // Draw all previous lines
                for (let i = 0; i < currentLine; i++) {
                    ctx.fillText(codeLines[i], 40, 50 + i * 30);
                }

                // Draw current line up to current char
                const currentText = line.substring(0, currentChar + 1);
                ctx.fillText(currentText, 40, 50 + currentLine * 30);

                // Add cursor
                ctx.fillStyle = '#61dafb';
                ctx.fillRect(40 + ctx.measureText(currentText).width, 50 + currentLine * 30, 2, 18);

                // Update texture
                codeText.material.map.needsUpdate = true;

                currentChar++;
                typingTimeout = setTimeout(typeNextChar, typingSpeed);
            } else {
                currentLine++;
                currentChar = 0;
                typingTimeout = setTimeout(typeNextChar, lineDelay);
            }
        }

        // Start typing after a short delay
        typingTimeout = setTimeout(typeNextChar, 500);
    }

    // Expose restart function globally
    window.restartLaptopAnimation = function() {
        if (codeText && codeText.userData.ctx) {
            startTyping();
        }
    };

    function animate() {
        if (!renderer || !scene || !camera) {
            return;
        }

        requestAnimationFrame(animate);

        if (laptop) {
            laptop.rotation.y += 0.002;
        }

        try {
            renderer.render(scene, camera);
        } catch (e) {
            console.error('Three.js render error:', e);
        }
    }

    function onWindowResize() {
        const canvas = document.getElementById('laptop-canvas');
        if (!canvas) return;

        const container = canvas.parentElement;
        const width = container.offsetWidth || 600;
        const height = container.offsetHeight || 400;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    // Check if canvas is visible and in active slide
    function isCanvasVisible() {
        const canvas = document.getElementById('laptop-canvas');
        if (!canvas) return false;

        // Check if canvas has dimensions
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;

        // Check if parent slide is active
        const heroItem = canvas.closest('.hero-item');
        if (!heroItem) return false;

        // Check if the slide is visible (not display: none)
        const itemRect = heroItem.getBoundingClientRect();
        if (itemRect.width === 0 || itemRect.height === 0) return false;

        // Check if it's in an active owl-item
        const owlItem = heroItem.closest('.owl-item');
        if (owlItem && !owlItem.classList.contains('active')) {
            return false;
        }

        return true;
    }

    // Initialize when DOM is ready
    function startInit() {
        // Wait for Three.js to be available
        if (typeof THREE === 'undefined') {
            setTimeout(startInit, 100);
            return;
        }

        function tryInit() {
            const canvas = document.getElementById('laptop-canvas');
            if (!canvas) {
                setTimeout(tryInit, 200);
                return;
            }

            // Only initialize if canvas is visible and in active slide
            if (!isCanvasVisible()) {
                setTimeout(tryInit, 200);
                return;
            }

            // Initialize if not already initialized
            if (!scene) {
                init();
            }
        }

        // Listen for Owl Carousel slide changes
        if (typeof jQuery !== 'undefined') {
            jQuery(document).ready(function ($) {
                // Wait for slider to be initialized
                setTimeout(function () {
                    // Listen for slide changes
                    $('.hero-slider').on('changed.owl.carousel', function (event) {
                        // Check if the WordPress slide (index 1) is active
                        const activeIndex = event.item.index;
                        const heroItems = $('.hero-item');
                        
                        // Check if active slide contains the canvas
                        const activeItem = $('.hero-slider .owl-item.active .hero-item');
                        if (activeItem.find('#laptop-canvas').length > 0) {
                            setTimeout(function() {
                                if (!scene) {
                                    tryInit();
                                }
                            }, 300);
                        }
                    });

                    // Check initial slide after slider is ready
                    setTimeout(function () {
                        const activeItem = $('.hero-slider .owl-item.active .hero-item');
                        if (activeItem.find('#laptop-canvas').length > 0) {
                            setTimeout(tryInit, 300);
                        }
                    }, 1500);
                }, 1000);
            });
        }

        // Fallback: try after longer delay
        setTimeout(tryInit, 2000);
    }

    startInit();
})();

