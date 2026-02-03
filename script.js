// ========================================
// INITIALIZE EVERYTHING ON DOM LOAD
// ========================================

document.addEventListener('DOMContentLoaded', function() {

    // ========================================
    // NAVBAR AND CENTER TITLE ANIMATIONS
    // Using regular scroll events (NOT affected by ScrollSmoother)
    // ========================================

    const navbar = document.getElementById('navbar');
    const navbarBrand = document.getElementById('navbarBrand');
    const centerTitle = document.getElementById('centerTitle');
    let isScrolled = false;
    
    // Calculate 70vh in pixels
    const compactStartThreshold = window.innerHeight * 0.1; // Start reducing after initial scroll
    const compactEndThreshold = window.innerHeight * 0.7; // Fully compact at 70vh
    
    // Handle scroll effect with regular scroll listener
    window.addEventListener('scroll', function() {
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        
        // First stage: Initial scroll - shrink title and show navbar
        if (scrollPosition > 10 && !isScrolled) {
            isScrolled = true;
            
            // Add shrinking class to center title
            centerTitle.classList.add('shrinking');
            
            // Add glass effect to navbar with slight delay
            setTimeout(() => {
                navbar.classList.add('scrolled');
                navbarBrand.classList.add('visible');
            }, 400);
            
        } else if (scrollPosition <= 10 && isScrolled) {
            isScrolled = false;
            
            // Remove glass effect from navbar
            navbar.classList.remove('scrolled');
            navbarBrand.classList.remove('visible');
            
            // Remove shrinking class from center title
            centerTitle.classList.remove('shrinking');
        }
        
        // Progressive width reduction as we scroll
        if (scrollPosition > compactStartThreshold && scrollPosition <= compactEndThreshold) {
            // Calculate progress (0 to 1) between start and end thresholds
            const progress = (scrollPosition - compactStartThreshold) / (compactEndThreshold - compactStartThreshold);
            
            // Calculate width: from 70vw to auto (approximately 20vw for 3 icons)
            const startWidth = 70;
            const endWidth = 20;
            const currentWidth = startWidth - (progress * (startWidth - endWidth));
            
            // Apply progressive width
            navbar.style.width = `${currentWidth}vw`;
            
            // Fade out brand text faster (disappears at 40% progress)
            const brandOpacity = Math.max(0, 1 - (progress * 2.5));
            navbarBrand.style.opacity = brandOpacity;
            
            // Hide brand text completely at 40% progress
            if (progress > 0.4) {
                navbarBrand.classList.add('hidden');
            } else {
                navbarBrand.classList.remove('hidden');
            }
            
            // Progressive icon spacing and layout changes
            // Gradually reduce flex and increase spacing/margins
            const navbarLeft = document.querySelector('.navbar-left');
            const navbarIcons = document.querySelector('.navbar-icons');
            
            // Reduce flex from 1 to 0 progressively
            const flexValue = Math.max(0, 1 - progress);
            navbarLeft.style.flex = `${flexValue} ${flexValue} auto`;
            navbarIcons.style.flex = `${flexValue} ${flexValue} auto`;
            
            // Increase gap/margin from 1vw to 1.5vw progressively
            const gapValue = 1 + (progress * 0.5);
            navbarIcons.style.gap = `${gapValue}vw`;
            
            // Progressively center justify-content
            if (progress > 0.7) {
                navbar.style.justifyContent = 'center';
            } else {
                const spaceBetweenWeight = Math.max(0, 1 - (progress * 1.5));
                navbar.style.justifyContent = spaceBetweenWeight > 0.5 ? 'space-between' : 'center';
            }
            
            // Apply compact class for icon margins
            if (progress > 0.8) {
                navbar.classList.add('compact');
            } else {
                navbar.classList.remove('compact');
            }
            
        } else if (scrollPosition > compactEndThreshold) {
            // Fully compact mode
            navbar.style.width = 'auto';
            navbar.style.justifyContent = 'center';
            navbar.classList.add('compact');
            navbarBrand.style.opacity = '0';
            navbarBrand.classList.add('hidden');
            
            const navbarLeft = document.querySelector('.navbar-left');
            const navbarIcons = document.querySelector('.navbar-icons');
            navbarLeft.style.flex = '0 0 auto';
            navbarIcons.style.flex = '0 0 auto';
            navbarIcons.style.gap = '1.5vw';
            
        } else if (scrollPosition <= compactStartThreshold) {
            // Reset to full width
            navbar.style.width = '70vw';
            navbar.style.justifyContent = 'space-between';
            navbar.classList.remove('compact');
            
            const navbarLeft = document.querySelector('.navbar-left');
            const navbarIcons = document.querySelector('.navbar-icons');
            navbarLeft.style.flex = '1 1 auto';
            navbarIcons.style.flex = '1 1 auto';
            navbarIcons.style.gap = '1vw';
            
            if (scrollPosition > 10) {
                navbarBrand.style.opacity = '1';
                navbarBrand.classList.remove('hidden');
            }
        }
    });

    // Search button functionality
    const searchBtn = document.querySelector('.icon-btn[aria-label="Search"]');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            console.log('Search clicked');
            // Add your search functionality here
        });
    }

    // Menu button functionality
    const menuBtn = document.querySelector('.icon-btn[aria-label="Menu"]');
    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            console.log('Menu clicked');
            // Add your menu toggle functionality here
        });
    }

    // ========================================
    // HERO BANNER PARALLAX - MOUSE MOVEMENT
    // ========================================

    const heroBanner = document.getElementById('heroBanner');
    const heroLayers = document.querySelectorAll('.hero-layer');
    
    console.log('Hero banner:', heroBanner);
    console.log('Hero layers found:', heroLayers.length);
    
    if (!heroBanner || heroLayers.length === 0) {
        console.error('Hero banner or layers not found!');
        return;
    }
    
    // Speed multipliers for each layer (higher = more movement)
    // Sky moves slowest, JCB moves fastest
    const speedMultipliers = {
        sky: 0.5,      // Slowest - background layer
        quarry: 1,     // Medium slow
        footing: 1.5,  // Medium fast
        jcb: 2         // Fastest - most depth
    };
    
    // Maximum movement range (in pixels) - increased for more visibility
    const maxMovement = 50;
    
    // Smooth interpolation values
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    const ease = 0.15; // Increased for more responsiveness
    
    // Track mouse movement on entire document for better coverage
    document.addEventListener('mousemove', function(e) {
        // Get mouse position relative to center of viewport
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Calculate offset from center (normalized to -1 to 1)
        const offsetX = (e.clientX - centerX) / centerX;
        const offsetY = (e.clientY - centerY) / centerY;
        
        // Set target positions (inverted for parallax effect)
        targetX = -offsetX * maxMovement;
        targetY = -offsetY * maxMovement;
        
        console.log('Mouse move - targetX:', targetX, 'targetY:', targetY);
    });
    
    // Reset on mouse leave - removed as we're tracking on document now
    
    // Smooth animation loop using requestAnimationFrame
    function animateParallax() {
        // Interpolate current position towards target (smooth easing)
        currentX += (targetX - currentX) * ease;
        currentY += (targetY - currentY) * ease;
        
        // Apply transforms to each layer with different speeds
        heroLayers.forEach(layer => {
            // Get speed from data attribute or class name
            let speed = parseFloat(layer.dataset.speed) || 1;
            
            // Calculate layer movement
            const moveX = currentX * speed;
            const moveY = currentY * speed;
            
            // Apply transform with translate3d for GPU acceleration
            layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
        });
        
        // Continue animation loop
        requestAnimationFrame(animateParallax);
    }
    
    // Start the parallax animation
    animateParallax();

    // ========================================
    // TEXT FILL ON SCROLL ANIMATION
    // ========================================
    
    // Wait for GSAP to load
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        
        const target = document.querySelector(".js-fill > span");
        const highlightTexts = document.querySelectorAll(".js-fill .highlight-text");
        const fillText = document.querySelector(".js-fill");
        const textFillSection = document.querySelector(".text-fill-section");
        
        if (target && textFillSection && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            // Create ScrollTrigger timeline for pinning and animation
            let tl = gsap.timeline({
                scrollTrigger: {
                    trigger: textFillSection,
                    start: "top top",
                    end: "+=100%",
                    pin: textFillSection,
                    scrub: 1,
                    anticipatePin: 1,
                    markers: false, // Set to true for debugging
                    onUpdate: (self) => {
                        // When scroll progress reaches 80%, add 'filled' class
                        if (self.progress > 0.8 && fillText) {
                            fillText.classList.add('filled');
                        } else if (fillText) {
                            fillText.classList.remove('filled');
                        }
                    }
                }
            });
            
            // Animate the text color change for parent span and all highlight texts
            tl.to([target, ...highlightTexts], {
                backgroundPosition: "0% 0",
                ease: "none"
            }, 0);
        }

        // ========================================
        // PARALLAX VIDEO SECTIONS WITH STICKY CONTENT
        // ScrollSmoother removed - it's a premium plugin that requires a license
        // Using regular ScrollTrigger for sticky content instead
        // ========================================
        
        gsap.utils.toArray('.content').forEach(content => {
            const section = content.parentElement;
            ScrollTrigger.create({
                trigger: content,
                start: "top top",
                end: () => `+=${section.offsetHeight - content.offsetHeight}`,
                pin: true,
            });
        });

        // Refresh ScrollTrigger after a brief delay to ensure everything is set up
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 100);

        // ========================================
        // NUMBERS SECTION ANIMATION
        // Numbers fly in from different directions with counting animation
        // ========================================
        
        // Animate numbers counting up
        function animateNumber(element) {
            const target = parseInt(element.getAttribute('data-target'));
            const duration = 1500; // 1.5 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;
            
            const updateNumber = () => {
                current += increment;
                if (current < target) {
                    element.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(updateNumber);
                } else {
                    element.textContent = target.toLocaleString();
                }
            };
            
            updateNumber();
        }
        
        // Define entry directions for each number item (8 items total)
        const entryDirections = [
            { x: -200, y: -200, rotation: -45 },  // Top-left
            { x: 0, y: -300, rotation: 0 },       // Top
            { x: 200, y: -200, rotation: 45 },    // Top-right
            { x: -300, y: 0, rotation: -90 },     // Left
            { x: 300, y: 0, rotation: 90 },       // Right
            { x: -200, y: 200, rotation: -135 },  // Bottom-left
            { x: 0, y: 300, rotation: 180 },      // Bottom
            { x: 200, y: 200, rotation: 135 }     // Bottom-right
        ];
        
        // Set initial states for number items
        const numberItems = document.querySelectorAll('.number-item');
        const numbersSection = document.querySelector('.numbers-section');
        console.log('Found number items:', numberItems.length);
        console.log('Numbers section found:', !!numbersSection);
        
        // Set initial GSAP states for animations
        numberItems.forEach((item, index) => {
            const direction = entryDirections[index % entryDirections.length];
            gsap.set(item, {
                x: direction.x,
                y: direction.y,
                rotation: direction.rotation,
                opacity: 0,
                scale: 0.5
            });
        });
        
        // Create scroll-driven animation for numbers section
        if (numbersSection && numberItems.length > 0) {
            console.log('Setting up numbers animation...');
            const timeline = gsap.timeline({
                scrollTrigger: {
                    trigger: numbersSection,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    scrub: 1,
                    markers: false, // Set to true to debug
                    invalidateOnRefresh: true
                }
            });
            
            // Animate each number item with staggered timing
            numberItems.forEach((item, index) => {
                const startProgress = 0.1 + (index * 0.08); // Stagger start times
                const endProgress = startProgress + 0.2;   // Animation duration
                
                timeline.to(item, {
                    x: 0,
                    y: 0,
                    rotation: 0,
                    opacity: 1,
                    scale: 1,
                    ease: 'back.out(1.2)',
                    duration: 0.2
                }, startProgress);
                
                // Trigger number counting when item becomes visible
                ScrollTrigger.create({
                    trigger: item,
                    start: 'top 60%',
                    once: true,
                    onEnter: () => {
                        console.log('Number entering view:', index);
                        const number = item.querySelector('.number');
                        if (number && !number.classList.contains('counted')) {
                            number.classList.add('counted');
                            animateNumber(number);
                        }
                    }
                });
            });
        }
        
        // Video background control for numbers section
        const numbersVideo = document.querySelector('.numbers-video-bg');
        if (numbersVideo && numbersSection) {
            // Pause video and hide initially
            numbersVideo.pause();
            numbersVideo.style.opacity = '0';
            
            ScrollTrigger.create({
                trigger: numbersSection,
                start: 'top center',
                end: 'bottom center',
                onEnter: () => {
                    console.log('Video section entered');
                    numbersVideo.style.opacity = '0.4';
                    numbersVideo.play().catch(err => console.log('Video play error:', err));
                },
                onLeave: () => {
                    numbersVideo.style.opacity = '0';
                    numbersVideo.pause();
                },
                onEnterBack: () => {
                    numbersVideo.style.opacity = '0.4';
                    numbersVideo.play().catch(err => console.log('Video play error:', err));
                },
                onLeaveBack: () => {
                    numbersVideo.style.opacity = '0';
                    numbersVideo.pause();
                }
            });
        }

    } else {
        console.warn('GSAP not loaded');
    }

    // ========================================
    // 3D PAVING STONES SECTION ANIMATION
    // Model rotates into view, moves to LEFT, text appears on right
    // ========================================
    
    // Check if Three.js is loaded
    if (typeof THREE !== 'undefined') {
        const pavingSection = document.querySelector('.model-3d-section-paving');
        const pavingCanvas = document.getElementById('paving-model-canvas');
        const pavingApp = document.getElementById('paving-app');
        
        if (pavingSection && pavingCanvas) {
            // Scene setup
            const pavingScene = new THREE.Scene();
            pavingScene.background = new THREE.Color(0x000000);
            
            // Camera setup
            const pavingCamera = new THREE.PerspectiveCamera(
                45,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            pavingCamera.position.z = 5;
            
            // Renderer setup
            const pavingRenderer = new THREE.WebGLRenderer({ 
                canvas: pavingCanvas,
                antialias: true 
            });
            pavingRenderer.setSize(window.innerWidth, window.innerHeight);
            pavingRenderer.setPixelRatio(window.devicePixelRatio);
            
            // Lighting
            const pavingAmbientLight = new THREE.AmbientLight(0xffffff, 0.8);
            pavingScene.add(pavingAmbientLight);
            
            const pavingDirectionalLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
            pavingDirectionalLight1.position.set(5, 5, 5);
            pavingScene.add(pavingDirectionalLight1);
            
            const pavingDirectionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
            pavingDirectionalLight2.position.set(-5, -5, -5);
            pavingScene.add(pavingDirectionalLight2);
            
            // Load 3D paving stones model
            let pavingModel = null;
            const pavingLoader = new THREE.GLTFLoader();
            
            pavingLoader.load(
                '3D model/pile_of_paving_stones_on_a_wooden_pallet.glb',
                function(gltf) {
                    pavingModel = gltf.scene;
                    
                    // Center and scale the model
                    const box = new THREE.Box3().setFromObject(pavingModel);
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());
                    
                    // Scale model to fit nicely in view
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale = 2 / maxDim;
                    pavingModel.scale.multiplyScalar(scale);
                    
                    // Center the model
                    pavingModel.position.sub(center.multiplyScalar(scale));
                    
                    // Initial position (below viewport)
                    pavingModel.position.y = -3;
                    pavingModel.position.x = 0;
                    
                    // Tilt the model down 5 degrees towards viewer
                    pavingModel.rotation.x = Math.PI / 9; // -5 degrees in radians
                    
                    pavingScene.add(pavingModel);
                    console.log('3D Paving Stones Model loaded successfully');
                    
                    // Setup scroll animation with GSAP
                    setupPavingScrollAnimation();
                },
                function(xhr) {
                    console.log('Paving stones: ' + (xhr.loaded / xhr.total * 100) + '% loaded');
                },
                function(error) {
                    console.error('Error loading paving stones 3D model:', error);
                }
            );
            
            // Animation setup
            function setupPavingScrollAnimation() {
                if (!pavingModel) return;
                
                const elPavingProducts = document.querySelectorAll('.paving-product');
                const numProducts = elPavingProducts.length;
                
                // Calculate section progress: 
                // 50% for model animation to reach left
                // 50% for text transitions through all products
                const modelAnimationProgress = 0.5;
                
                // Pin the section while animating
                ScrollTrigger.create({
                    trigger: pavingSection,
                    start: 'top top',
                    end: 'bottom bottom',
                    pin: '.model-container-paving',
                    pinSpacing: false,
                    markers: false,
                    scrub: 1
                });
                
                // Main timeline for model and text animations
                const pavingTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: pavingSection,
                        start: 'top top',
                        end: 'bottom bottom',
                        scrub: 1,
                        markers: false,
                        onUpdate: (self) => {
                            const progress = self.progress;
                            
                            // Show product showcase ONLY when model animation completes (after 50%)
                            if (progress >= modelAnimationProgress) {
                                if (pavingApp) {
                                    pavingApp.classList.add('visible');
                                }
                                
                                // Calculate which product should be active based on scroll progress
                                // Map remaining 50% of scroll to product transitions
                                const textProgress = (progress - modelAnimationProgress) / (1 - modelAnimationProgress);
                                const activeIndex = Math.min(
                                    Math.floor(textProgress * numProducts),
                                    numProducts - 1
                                );
                                
                                // Update active product
                                elPavingProducts.forEach((product, index) => {
                                    if (index === activeIndex) {
                                        product.dataset.active = true;
                                    } else {
                                        delete product.dataset.active;
                                    }
                                });
                                
                                // Update counter
                                if (pavingApp) {
                                    pavingApp.dataset.product = activeIndex + 1;
                                    pavingApp.dataset.productCount = numProducts;
                                }
                            } else {
                                // Hide text while model is still animating
                                if (pavingApp) {
                                    pavingApp.classList.remove('visible');
                                }
                            }
                        }
                    }
                });
                
                // Animate model properties - MOVES TO LEFT
                // This animation takes the first 50% of the scroll
                pavingTl.to(pavingModel.position, {
                    y: -0.5, // Rise to slightly below center
                    duration: modelAnimationProgress * 0.4,
                    ease: 'power2.out'
                }, 0)
                .to(pavingModel.rotation, {
                    y: Math.PI * 4, // Rotate on vertical (Y) axis - 4 full rotations during rise
                    duration: modelAnimationProgress * 0.4,
                    ease: 'power1.inOut'
                }, 0)
                .to(pavingModel.position, {
                    x: -1.8, // Move to LEFT (negative X)
                    duration: modelAnimationProgress * 0.6,
                    ease: 'power2.inOut'
                }, modelAnimationProgress * 0.4)
                .to(pavingModel.rotation, {
                    y: Math.PI * 6, // Continue rotating as it moves left (2 more rotations)
                    duration: modelAnimationProgress * 0.6,
                    ease: 'power1.inOut'
                }, modelAnimationProgress * 0.4);
            }
            
            // Animation loop
            function animatePaving() {
                requestAnimationFrame(animatePaving);
                pavingRenderer.render(pavingScene, pavingCamera);
            }
            animatePaving();
            
            // Handle window resize
            window.addEventListener('resize', () => {
                pavingCamera.aspect = window.innerWidth / window.innerHeight;
                pavingCamera.updateProjectionMatrix();
                pavingRenderer.setSize(window.innerWidth, window.innerHeight);
            });
        }
    }

    // ========================================
    // 3D MODEL SECTION ANIMATION
    // Model rotates into view, moves to right, text appears on left
    // ========================================
    
    // Check if Three.js is loaded
    if (typeof THREE !== 'undefined') {
        const modelSection = document.querySelector('.model-3d-section');
        const canvas = document.getElementById('model-canvas');
        const slicedTextContainer = document.querySelector('.sliced-text-container');
        
        if (modelSection && canvas) {
            // Scene setup
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x000000);
            
            // Camera setup
            const camera = new THREE.PerspectiveCamera(
                45,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            camera.position.z = 5;
            
            // Renderer setup
            const renderer = new THREE.WebGLRenderer({ 
                canvas: canvas,
                antialias: true 
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            
            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
            scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
            directionalLight.position.set(5, 5, 5);
            scene.add(directionalLight);
            
            const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
            directionalLight2.position.set(-5, -5, -5);
            scene.add(directionalLight2);
            
            // Load 3D model
            let model = null;
            const loader = new THREE.GLTFLoader();
            
            loader.load(
                '3D model/seamless_portuguese_tile_texture_1.glb',
                function(gltf) {
                    model = gltf.scene;
                    
                    // Center and scale the model
                    const box = new THREE.Box3().setFromObject(model);
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());
                    
                    // Scale model to fit nicely in view
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale = 2 / maxDim;
                    model.scale.multiplyScalar(scale);
                    
                    // Center the model
                    model.position.sub(center.multiplyScalar(scale));
                    
                    // Initial position (below viewport)
                    model.position.y = -3;
                    model.position.x = 0;
                    
                    scene.add(model);
                    console.log('3D Model loaded successfully');
                    
                    // Setup scroll animation with GSAP
                    setupScrollAnimation();
                },
                function(xhr) {
                    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                },
                function(error) {
                    console.error('Error loading 3D model:', error);
                }
            );
            
            // Animation setup
            function setupScrollAnimation() {
                if (!model) return;
                
                // Pin the section while animating
                ScrollTrigger.create({
                    trigger: modelSection,
                    start: 'top top',
                    end: 'bottom bottom',
                    pin: '.model-container',
                    pinSpacing: false,
                    markers: false, // Set to true for debugging
                    scrub: 1
                });
                
                // Create timeline for model animation
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: modelSection,
                        start: 'top top',
                        end: 'bottom bottom',
                        scrub: 1,
                        markers: false,
                        onUpdate: (self) => {
                            // Calculate progress
                            const progress = self.progress;
                            
                            // Show text only when model reaches right (after 100% of animation)
                            if (progress >= 0.99) {
                                $('.slide.is-active').addClass('text-visible');
                                // Enable slider interaction
                                window.sliderEnabled = true;
                            } else {
                                // Hide text and disable slider during 3D animation
                                $('.slide').removeClass('text-visible');
                                window.sliderEnabled = false;
                            }
                        }
                    }
                });
                
                // Animate model properties
                tl.to(model.position, {
                    y: -0.5, // Rise to slightly below center
                    duration: 0.4,
                    ease: 'power2.out'
                }, 0)
                .to(model.rotation, {
                    y: Math.PI * 4, // Rotate 4 times during rise
                    duration: 0.4,
                    ease: 'power1.inOut'
                }, 0)
                .to(model.position, {
                    x: 1.8, // Move to right but stay away from nav buttons
                    duration: 0.6,
                    ease: 'power2.inOut'
                }, 0.4)
                .to(model.rotation, {
                    y: Math.PI * 6, // Continue rotating as it moves right (2 more rotations)
                    duration: 0.6,
                    ease: 'power1.inOut'
                }, 0.4);
            }
            
            // Animation loop
            function animate() {
                requestAnimationFrame(animate);
                renderer.render(scene, camera);
            }
            animate();
            
            // Handle window resize
            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
            
            // ========================================
            // SLICE SLIDER FUNCTIONALITY
            // ========================================
            // Initialize slider enabled flag
            window.sliderEnabled = false;
            
            (function($) {
                var SliceSlider = {
                    settings: {
                        delta: 0,
                        currentSlideIndex: 0,
                        scrollThreshold: 40,
                        slides: $('.slide'),
                        numSlides: $('.slide').length,
                        navPrev: $('.js-prev'),
                        navNext: $('.js-next'),
                    },
                    
                    init: function() {
                        s = this.settings;
                        this.bindEvents();
                    },
                    
                    bindEvents: function() {
                        // Scrollwheel & trackpad - bind to model section for full screen control
                        $('.model-3d-section').on({
                            'DOMMouseScroll mousewheel': SliceSlider.handleScroll
                        });
                        // On click prev
                        s.navPrev.on({
                            'click': SliceSlider.prevSlide
                        });
                        // On click next
                        s.navNext.on({
                            'click': SliceSlider.nextSlide
                        });
                        // On Arrow keys - only when slider is enabled
                        $(document).keyup(function(e) {
                            if (!window.sliderEnabled) return;
                            
                            // Left or back arrows
                            if ((e.which === 37) || (e.which === 38)) {
                                SliceSlider.prevSlide();
                            }
                            // Down or right
                            if ((e.which === 39) || (e.which === 40)) {
                                SliceSlider.nextSlide();
                            }
                        });
                    },
                    
                    handleScroll: function(e) {
                        // Only handle slider scrolling if it's enabled (after 3D animation completes)
                        if (!window.sliderEnabled) {
                            // Allow normal page scrolling during 3D animation
                            return true;
                        }
                        
                        var scrollingUp = e.originalEvent.detail < 0 || e.originalEvent.wheelDelta > 0;
                        
                        // Scrolling up
                        if (scrollingUp) {
                            // If on first slide, allow scrolling back to 3D animation
                            if (s.currentSlideIndex === 0) {
                                s.delta = 0;
                                return true; // Allow page scroll
                            }
                            
                            s.delta--;
                            if (Math.abs(s.delta) >= s.scrollThreshold) {
                                SliceSlider.prevSlide();
                            }
                        }
                        // Scrolling Down
                        else {
                            // If on last slide, allow scrolling to next section
                            if (s.currentSlideIndex === s.numSlides - 1) {
                                s.delta = 0;
                                return true; // Allow page scroll
                            }
                            
                            s.delta++;
                            if (s.delta >= s.scrollThreshold) {
                                SliceSlider.nextSlide();
                            }
                        }
                        // Prevent page from scrolling when slider is active (between slides)
                        return false;
                    },
                    
                    showSlide: function(direction) {
                        // reset
                        s.delta = 0;
                        // Bail if we're already sliding
                        if ($('body').hasClass('is-sliding')) {
                            return;
                        }
                        
                        // Add and remove is-sliding class
                        $('body').addClass('is-sliding');
                        
                        // Loop through our slides to update active states
                        s.slides.each(function(i, slide) {
                            // Toggle the is-active class to show slide
                            $(slide).toggleClass('is-active', (i === s.currentSlideIndex));
                            $(slide).toggleClass('is-prev', (i === s.currentSlideIndex - 1));
                            $(slide).toggleClass('is-next', (i === s.currentSlideIndex + 1));
                            
                            // Keep text-visible class on all slides after initial animation
                            if (i === s.currentSlideIndex) {
                                $(slide).addClass('text-visible');
                            }
                        });
                        
                        // Get the now-active slide for flip animation
                        const activeSlide = s.slides.eq(s.currentSlideIndex);
                        const flipCardPlane = activeSlide.find('.flip-card-plane')[0];
                        const frontFace = activeSlide.find('.flip-card-front img')[0];
                        const backFace = activeSlide.find('.flip-card-back img')[0];
                        
                        // Only animate flip if there's a direction (not initial load)
                        if ((direction === 'next' || direction === 'prev') && flipCardPlane && frontFace && backFace) {
                            const frontSrc = frontFace.src;
                            const backSrc = backFace.src;
                            
                            let rotation = 0;
                            const duration = 800;
                            const interval = 16;
                            const steps = duration / interval;
                            const increment = direction === 'next' ? 180 / steps : -180 / steps;
                            let step = 0;
                            let imageSwapped = false;
                            
                            // Disable CSS transition for manual animation (like CodePen)
                            flipCardPlane.style.transition = 'none';
                            
                            function animate() {
                                if (step >= steps) {
                                    // Animation complete - reset to 0 degrees instantly
                                    flipCardPlane.style.transform = 'rotateX(0deg)';
                                    
                                    // Update front image to what was on back
                                    frontFace.src = backSrc;
                                    
                                    // Prepare next image for back face (for next flip)
                                    // This keeps the cycle going
                                    
                                    // Re-enable CSS transition
                                    setTimeout(() => {
                                        flipCardPlane.style.transition = 'transform 0.8s ease-in-out';
                                    }, 50);
                                    
                                    return;
                                }
                                
                                rotation += increment;
                                
                                // Swap image at 90 degrees (mid-flip) - only once
                                if (!imageSwapped) {
                                    if ((direction === 'next' && rotation >= 90) ||
                                        (direction === 'prev' && rotation <= -90)) {
                                        frontFace.src = backSrc;
                                        imageSwapped = true;
                                    }
                                }
                                
                                flipCardPlane.style.transform = `rotateX(${rotation}deg)`;
                                step++;
                                requestAnimationFrame(animate);
                            }
                            
                            animate();
                        }
                        
                        setTimeout(function() {
                            $('body').removeClass('is-sliding');
                        }, 1000);
                    },
                    
                    prevSlide: function() {
                        // If on first slide, don't loop - let it scroll back
                        if (s.currentSlideIndex <= 0) {
                            return;
                        }
                        s.currentSlideIndex--;
                        SliceSlider.showSlide('prev');
                    },
                    
                    nextSlide: function() {
                        // If on last slide, don't loop - let it scroll forward
                        if (s.currentSlideIndex >= s.numSlides - 1) {
                            return;
                        }
                        s.currentSlideIndex++;
                        SliceSlider.showSlide('next');
                    },
                };
                SliceSlider.init();
            })(jQuery);
        }
    } else {
        console.warn('Three.js not loaded');
    }
});


// ========================================
// SCROLLING TEXT ANIMATION
// ========================================
(function() {
    // Check if browser supports scroll-driven animations
    const supportsScrollDriven = CSS.supports('(animation-timeline: scroll()) and (animation-range: 0% 100%)');
    
    if (!supportsScrollDriven && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        // Fallback for browsers without scroll-driven animation support
        gsap.registerPlugin(ScrollTrigger);
        
        const items = gsap.utils.toArray('.scroll-text-content ul li');
        
        if (items.length > 0) {
            // Set initial opacity
            gsap.set(items, { opacity: (i) => (i !== 0 ? 0.2 : 1) });
            
            // Create dimming animation timeline
            const dimmer = gsap
                .timeline()
                .to(items.slice(1), {
                    opacity: 1,
                    stagger: 0.5,
                })
                .to(
                    items.slice(0, items.length - 1),
                    {
                        opacity: 0.2,
                        stagger: 0.5,
                    },
                    0
                );
            
            // Apply scroll trigger to dimmer
            ScrollTrigger.create({
                trigger: items[0],
                endTrigger: items[items.length - 1],
                start: 'center center',
                end: 'center center',
                animation: dimmer,
                scrub: 0.2,
            });
        }
    }
})();

// ========================================
// TEAM CAROUSEL FUNCTIONALITY - SCROLL DRIVEN
// ========================================

const teamMembers = [
    { name: "Calacatta Oro", role: "Italian Marble" },
    { name: "Metal", role: "Material Collection" },
    { name: "Brasilia", role: "Moroccan Tiles" },
    { name: "Gemstone", role: "Other Stone" },
    { name: "Kauri", role: "Wooden Collection" },
    { name: "Statuario", role: "Italian Marble" }
];

const teamCards = document.querySelectorAll(".team-card");
const teamDots = document.querySelectorAll(".team-dot");
const teamMemberName = document.querySelector(".team-member-name");
const teamMemberRole = document.querySelector(".team-member-role");
const teamCarouselSection = document.querySelector('.team-carousel-section');

if (teamCards.length > 0 && teamCarouselSection && typeof gsap !== 'undefined') {
    let currentTeamIndex = 0;
    
    function updateTeamCarouselVisuals(index) {
        teamCards.forEach((card, i) => {
            const offset = (i - index + teamCards.length) % teamCards.length;

            card.classList.remove(
                "center",
                "up-1",
                "up-2",
                "down-1",
                "down-2",
                "hidden"
            );

            if (offset === 0) {
                card.classList.add("center");
            } else if (offset === 1) {
                card.classList.add("down-1");
            } else if (offset === 2) {
                card.classList.add("down-2");
            } else if (offset === teamCards.length - 1) {
                card.classList.add("up-1");
            } else if (offset === teamCards.length - 2) {
                card.classList.add("up-2");
            } else {
                card.classList.add("hidden");
            }
        });

        teamDots.forEach((dot, i) => {
            dot.classList.toggle("active", i === index);
        });

        if (teamMemberName && teamMemberRole) {
            gsap.to([teamMemberName, teamMemberRole], {
                opacity: 0,
                duration: 0.2,
                onComplete: () => {
                    teamMemberName.textContent = teamMembers[index].name;
                    teamMemberRole.textContent = teamMembers[index].role;
                    gsap.to([teamMemberName, teamMemberRole], {
                        opacity: 1,
                        duration: 0.3
                    });
                }
            });
        }
    }

    // Initialize first card
    updateTeamCarouselVisuals(0);

    // Setup scroll-driven animation with GSAP ScrollTrigger
    ScrollTrigger.create({
        trigger: teamCarouselSection,
        start: 'top top',
        end: 'bottom bottom',
        pin: '.team-main-container',
        pinSpacing: false,
        markers: false,
        scrub: 1,
        onUpdate: (self) => {
            const progress = self.progress;
            
            // Calculate which card should be active based on scroll progress
            // Divide the scroll range into equal sections for each team member
            const newIndex = Math.min(
                Math.floor(progress * teamCards.length),
                teamCards.length - 1
            );
            
            // Only update if index changed
            if (newIndex !== currentTeamIndex) {
                currentTeamIndex = newIndex;
                updateTeamCarouselVisuals(newIndex);
            }
        }
    });

    // Optional: Allow dot clicking for quick navigation (scroll to position)
    teamDots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
            const targetProgress = i / (teamCards.length - 1);
            const sectionHeight = teamCarouselSection.offsetHeight;
            const sectionTop = teamCarouselSection.offsetTop;
            const targetScroll = sectionTop + (sectionHeight * targetProgress);
            
            window.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
        });
    });
}

// ========================================
// WAVE ANIMATION SECTION
// ========================================

(function initWaveAnimation() {
    const waveCanvas = document.getElementById('wave-canvas');
    const waveSection = document.querySelector('.wave-section-container');
    
    if (!waveCanvas || !waveSection || typeof THREE === 'undefined') {
        return;
    }
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({
        canvas: waveCanvas,
        antialias: true,
        alpha: true
    });
    
    // Set canvas to match container size
    const updateCanvasSize = () => {
        const rect = waveSection.getBoundingClientRect();
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    };
    
    updateCanvasSize();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Wave parameters
    const waveSize = 300;
    const pointSpacing = 5;
    const pointCount = Math.floor(waveSize / pointSpacing);
    const totalPoints = pointCount * pointCount;

    // Create points geometry
    const pointsGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(totalPoints * 3);
    const colors = new Float32Array(totalPoints * 3);

    // Fill positions and colors with improved gradient
    let index = 0;
    for (let i = 0; i < pointCount; i++) {
        for (let j = 0; j < pointCount; j++) {
            const x = (i - pointCount / 2) * pointSpacing;
            const z = (j - pointCount / 2) * pointSpacing;
            
            positions[index * 3] = x;
            positions[index * 3 + 1] = 0;
            positions[index * 3 + 2] = z;
            
            // Enhanced color gradient
            const distance = Math.sqrt(x*x + z*z) / (waveSize/2);
            const intensity = 1 - Math.min(distance, 1) * 0.8;
            
            // Add subtle blue tint
            colors[index * 3] = intensity * 0.8;     // R
            colors[index * 3 + 1] = intensity * 0.9; // G
            colors[index * 3 + 2] = intensity;       // B
            
            index++;
        }
    }

    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Enhanced points material
    const pointsMaterial = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        alphaTest: 0.1,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending
    });

    const wavePoints = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(wavePoints);

    // Create lines geometry with improved appearance
    const linesGeometry = new THREE.BufferGeometry();
    const lineIndices = [];
    
    // Create faces for the mesh
    const faces = [];
    for (let i = 0; i < pointCount - 1; i++) {
        for (let j = 0; j < pointCount - 1; j++) {
            const currentIndex = i * pointCount + j;
            
            // Create two triangles for each square
            faces.push(
                currentIndex, currentIndex + 1, currentIndex + pointCount,
                currentIndex + 1, currentIndex + pointCount + 1, currentIndex + pointCount
            );
            
            // Add lines
            if (j < pointCount - 1) {
                lineIndices.push(currentIndex, currentIndex + 1);
            }
            if (i < pointCount - 1) {
                lineIndices.push(currentIndex, currentIndex + pointCount);
            }
        }
    }
    
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    linesGeometry.setIndex(lineIndices);
    
    // Enhanced line material
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x888888,
        transparent: true,
        opacity: 0.6,
        linewidth: 1
    });
    
    const linesMesh = new THREE.LineSegments(linesGeometry, lineMaterial);
    scene.add(linesMesh);

    // Create mesh for filled squares
    const meshGeometry = new THREE.BufferGeometry();
    meshGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    meshGeometry.setIndex(faces);
    
    // Create mesh material
    const meshMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        wireframe: false
    });
    
    const filledMesh = new THREE.Mesh(meshGeometry, meshMaterial);
    scene.add(filledMesh);

    // Camera setup
    camera.position.set(0, 10, 33);
    camera.lookAt(0, 0, 0);

    // Animation
    const clock = new THREE.Clock();
    let shouldAnimate = false;
    
    function animate() {
        requestAnimationFrame(animate);
        
        // Check if section is in viewport
        const rect = waveSection.getBoundingClientRect();
        shouldAnimate = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (!shouldAnimate) return;
        
        const time = clock.getElapsedTime();
        const positions = pointsGeometry.attributes.position.array;
        
        // Enhanced wave animation
        for (let i = 0; i < pointCount; i++) {
            for (let j = 0; j < pointCount; j++) {
                const index = (i * pointCount + j) * 3;
                const x = positions[index];
                const z = positions[index + 2];
                
                // Multiple wave frequencies
                const wave1 = Math.sin((x * 0.1) + time) * 2;
                const wave2 = Math.cos((z * 0.1) + time * 0.8) * 2;
                const wave3 = Math.sin((x * 0.05 + z * 0.05) + time * 1.2) * 1.5;
                
                positions[index + 1] = wave1 + wave2 + wave3;
            }
        }
        
        pointsGeometry.attributes.position.needsUpdate = true;
        linesGeometry.attributes.position.needsUpdate = true;
        meshGeometry.attributes.position.needsUpdate = true;
        
        renderer.render(scene, camera);
    }

    // Handle window resize
    window.addEventListener('resize', updateCanvasSize);
  
    // Enhanced scroll effect - only within wave section
    function updateWaveScroll() {
        const rect = waveSection.getBoundingClientRect();
        
        // Only animate when the wave section is in view
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            // Calculate scroll progress within the wave section
            const sectionHeight = waveSection.offsetHeight;
            const scrolledInSection = Math.max(0, -rect.top);
            const scrolledPercent = Math.min(1, scrolledInSection / (sectionHeight - window.innerHeight));
            
            // Smooth camera movement - dive down into the wave
            camera.position.set(
                0, 
                10 - (82 * scrolledPercent), 
                33
            );
        }
    }
    
    window.addEventListener('scroll', updateWaveScroll);
    updateWaveScroll(); // Initial call

    animate();
})();

// ========================================
// TEXT DROP ANIMATION ON WAVE SECTION
// ========================================

(function initTextDropAnimation() {
    const waveSection = document.querySelector('.wave-section-container');
    const lines = document.querySelectorAll('.wave-section-container .text-drop__line');
    
    if (!waveSection || lines.length === 0 || typeof gsap === 'undefined') {
        return;
    }

    lines.forEach((line, index) => {
        // Text Drop Effect - 3D rotation reveal
        gsap.fromTo(
            line,
            { rotateX: -120 },
            {
                rotateX: 0,
                duration: 1.2,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: line,
                    start: 'bottom bottom',
                    end: 'bottom top',
                    scrub: true,
                    markers: false
                }
            }
        );
    });

    // Refresh ScrollTrigger on window resize
    window.addEventListener('resize', () => {
        ScrollTrigger.refresh();
    });
})();

// ========================================
// VENN DIAGRAM DOTS ANIMATION
// Animate dots moving around circles based on scroll
// ========================================
(function initVennDiagramAnimation() {
    const vennSection = document.querySelector('.venn-section');
    
    if (!vennSection || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        return;
    }
    
    // Function to calculate position on circle
    function getCirclePosition(cx, cy, radius, angle) {
        return {
            x: cx + radius * Math.cos(angle),
            y: cy + radius * Math.sin(angle)
        };
    }
    
    // Circle parameters (matching SVG with updated positions)
    const circles = [
        { cx: 300, cy: 220, radius: 220 }, // Circle 1 (Top - alone)
        { cx: 200, cy: 420, radius: 220 }, // Circle 2 (Bottom left)
        { cx: 400, cy: 420, radius: 220 }  // Circle 3 (Bottom right)
    ];
    
    // Create scroll trigger for venn diagram
    ScrollTrigger.create({
        trigger: vennSection,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
            const scrollProgress = self.progress;
            
            // Delay all animations - don't start until 5% scroll through the section
            const delayAmount = 0.05;
            const adjustedProgress = Math.max(0, (scrollProgress - delayAmount) / (1 - delayAmount));
            const progress = adjustedProgress;
            
            // Calculate color values - complete transition at 60% of adjusted scroll
            const colorProgress = Math.min(progress / 0.6, 1); // Reaches 1 at 60% progress
            const bgValue = Math.round(colorProgress * 255); // 0 to 255
            const elementValue = Math.round((1 - colorProgress) * 255); // 255 to 0
            
            // Update background color
            vennSection.style.backgroundColor = `rgb(${bgValue}, ${bgValue}, ${bgValue})`;
            
            // Animate one dot per circle
            circles.forEach((circle, circleIndex) => {
                const dot = document.querySelector(`.dot-${circleIndex + 1}`);
                const circleElement = document.querySelector(`.circle-${circleIndex + 1}`);
                
                if (dot) {
                    // Calculate angle - each circle rotates at different speed for variety
                    const speedMultiplier = 0.1 + (circleIndex * 0.05); // Slower speeds
                    const angle = progress * Math.PI * 4 * speedMultiplier; // Reduced rotations
                    
                    const pos = getCirclePosition(circle.cx, circle.cy, circle.radius, angle);
                    
                    // Set dot position
                    dot.setAttribute('cx', pos.x);
                    dot.setAttribute('cy', pos.y);
                    
                    // Update dot color
                    dot.setAttribute('fill', `rgb(${elementValue}, ${elementValue}, ${elementValue})`);
                }
                
                if (circleElement) {
                    // Update circle stroke color
                    circleElement.setAttribute('stroke', `rgb(${elementValue}, ${elementValue}, ${elementValue})`);
                }
            });
            
            // Animate images moving from center outward in different directions (10 images)
            // Using vmin for consistent scaling across zoom levels
            const images = [
                { element: document.querySelector('.circle-image-1'), startProgress: 0.15, direction: { x: 120, y: -150 } },   // Up-right
                { element: document.querySelector('.circle-image-2'), startProgress: 0.20, direction: { x: -120, y: -150 } },  // Up-left
                { element: document.querySelector('.circle-image-3'), startProgress: 0.25, direction: { x: 150, y: -75 } },    // Right-up
                { element: document.querySelector('.circle-image-4'), startProgress: 0.30, direction: { x: -150, y: -75 } },   // Left-up
                { element: document.querySelector('.circle-image-5'), startProgress: 0.35, direction: { x: 150, y: 75 } },     // Right-down
                { element: document.querySelector('.circle-image-6'), startProgress: 0.40, direction: { x: -150, y: 75 } },    // Left-down
                { element: document.querySelector('.circle-image-7'), startProgress: 0.45, direction: { x: 120, y: 150 } },    // Down-right
                { element: document.querySelector('.circle-image-8'), startProgress: 0.50, direction: { x: -120, y: 150 } },   // Down-left
                { element: document.querySelector('.circle-image-9'), startProgress: 0.55, direction: { x: 0, y: -165 } },     // Straight up
                { element: document.querySelector('.circle-image-10'), startProgress: 0.60, direction: { x: 0, y: 165 } }      // Straight down
            ];
            
            images.forEach((imageData) => {
                if (!imageData.element) return;
                
                if (progress >= imageData.startProgress) {
                    const imageProgress = Math.min((progress - imageData.startProgress) / 0.4, 1); // 0 to 1 over 40% scroll
                    const scale = imageProgress * 1.2; // Grows from 0 to 1.2x
                    const translateX = imageProgress * imageData.direction.x; // Moves in X direction
                    const translateY = imageProgress * imageData.direction.y; // Moves in Y direction
                    const opacity = imageProgress > 0 ? Math.min(imageProgress * 2.5, 1) : 0; // Fade in quickly
                    
                    imageData.element.style.opacity = opacity;
                    imageData.element.style.transform = `translate(calc(-50% + ${translateX}vmin), calc(-50% + ${translateY}vmin)) scale(${scale})`;
                } else {
                    imageData.element.style.opacity = 0;
                    imageData.element.style.transform = 'translate(-50%, -50%) scale(0)';
                }
            });
        }
    });
    
    console.log('Venn Diagram animation initialized');
})();

// ========================================
// SPIRAL TIMELINE ANIMATION
// ========================================
(function initSpiralTimeline() {
    const spiralSection = document.querySelector('.spiral-timeline-section');
    
    if (!spiralSection || typeof THREE === 'undefined') {
        console.log('Spiral Timeline: Missing dependencies');
        return;
    }

    // --- CONFIGURATION ---
    const CONFIG = {
        cardWidth: 2,
        cardHeight: 2.8, // Approx 5:7 Aspect Ratio
        tubeRadius: 1.5,
        spiralLoops: 4,
        spiralDepth: 60,
        spiralMaxRadius: 7,
        fov: 45
    };

    // --- TIMELINE DATA ---
    const TIMELINE_DATA = [
        // Italian Marble Collection
        { t: "Calacatta Oro", d: "Italian Marble - Luxurious white marble with bold golden veining, epitomizing timeless elegance.", img: "Tiles 3/Italian Marble/calacatta oro/vector.jpg", category: "Italian Marble" },
        { t: "Statuario", d: "Italian Marble - Classic white marble with dramatic gray veining, perfect for sophisticated spaces.", img: "Tiles 3/Italian Marble/statuario/vector.jpg", category: "Italian Marble" },
        { t: "Breccia Argentum", d: "Italian Marble - Stunning marble with silver and gray fragments creating a unique mosaic pattern.", img: "Tiles 3/Italian Marble/breccia argentum/vector.jpg", category: "Italian Marble" },
        { t: "Travertino Classic", d: "Italian Marble - Natural travertine with warm tones and organic texture for rustic charm.", img: "Tiles 3/Italian Marble/travertino classic /vector.jpg", category: "Italian Marble" },
        
        // Material Collection
        { t: "Absolute", d: "Material - Contemporary solid surface with clean lines and modern aesthetic appeal.", img: "Tiles 3/Material/absolute/vector1.jpg", category: "Material" },
        { t: "Metal", d: "Material - Industrial-inspired metallic finish bringing urban sophistication to any space.", img: "Tiles 3/Material/metal/vector1.jpg", category: "Material" },
        { t: "Space", d: "Material - Futuristic design with cosmic patterns for avant-garde interiors.", img: "Tiles 3/Material/space/vector1.jpg", category: "Material" },
        { t: "Skyline", d: "Material - Modern texture inspired by architectural cityscapes and urban landscapes.", img: "Tiles 3/Material/skyline/vector1.jpg", category: "Material" },
        
        // Moroccan Collection
        { t: "Aden", d: "Moroccan - Traditional Moroccan patterns with vibrant colors and intricate geometry.", img: "Tiles 3/Moroccan/aden/vector.webp", category: "Moroccan" },
        { t: "Brasilia", d: "Moroccan - Bold geometric designs combining traditional craftsmanship with contemporary flair.", img: "Tiles 3/Moroccan/brasilia/vector.webp", category: "Moroccan" },
        { t: "Brussels", d: "Moroccan - Elegant tile patterns with European-influenced Moroccan artistry.", img: "Tiles 3/Moroccan/brussels/vector.webp", category: "Moroccan" },
        { t: "Bogota", d: "Moroccan - Colorful mosaic patterns bringing warmth and character to spaces.", img: "Tiles 3/Moroccan/bogota/vector.webp", category: "Moroccan" },
        
        // Other Stone Collection
        { t: "Ardesia", d: "Other Stone - Natural slate with rich texture and earthy tones for organic elegance.", img: "Tiles 3/Other Stone/ardesia/vector1.jpg", category: "Other Stone" },
        { t: "Gemstone", d: "Other Stone - Precious stone-inspired surfaces with crystalline beauty and depth.", img: "Tiles 3/Other Stone/gemstone/vector1.jpg", category: "Other Stone" },
        { t: "Royal Stone", d: "Other Stone - Regal natural stone with commanding presence and luxurious appeal.", img: "Tiles 3/Other Stone/royal stone/vector1.jpg", category: "Other Stone" },
        { t: "Sahara Noir", d: "Other Stone - Dramatic black stone with desert-inspired patterns and textures.", img: "Tiles 3/Other Stone/sahara noir/vector1.jpg", category: "Other Stone" },
        
        // Wooden Collection
        { t: "Kauri", d: "Wooden - Premium wood-look tiles with authentic grain patterns and natural warmth.", img: "Tiles 3/Wooden/kauri/vector1.jpg", category: "Wooden" },
        { t: "Honey Wood", d: "Wooden - Warm honey-toned wood finish combining beauty with durability.", img: "Tiles 3/Wooden/honey wood/vector1.jpg", category: "Wooden" },
        { t: "Amazon", d: "Wooden - Exotic hardwood-inspired tiles with rich colors and distinctive grain.", img: "Tiles 3/Wooden/amazon/vector1.jpg", category: "Wooden" },
        { t: "Ca Foscari", d: "Wooden - Elegant Venetian-inspired wood finish with refined character.", img: "Tiles 3/Wooden/ca foscari/vector1.jpg", category: "Wooden" }
    ];

    const TOTAL_IMAGES = 20;

    // --- DOM ---
    const domContent = document.getElementById('spiral-info-content');
    const domTitle = document.getElementById('spiral-item-title');
    const domDesc = document.getElementById('spiral-item-desc');
    const domYear = document.getElementById('spiral-item-year');

    // --- SCENE ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xffffff, 0.04);

    const camera = new THREE.PerspectiveCamera(CONFIG.fov, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 16);

    const canvas = document.getElementById('spiral-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xffffff);

    // --- TEXTURE GENERATOR ---
    function createCardTexture(index) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 716;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0,0,512,716);
        ctx.strokeStyle = "#e0e0e0";
        ctx.lineWidth = 2;
        ctx.strokeRect(0,0,512,716);
        
        ctx.fillStyle = "#ccc";
        ctx.font = "30px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Loading Tile...", 256, 358);

        const texture = new THREE.CanvasTexture(canvas);

        const img = new Image();
        img.crossOrigin = "Anonymous";
        
        // Get the tile data
        const tileData = TIMELINE_DATA[index];
        img.src = tileData.img;

        img.onload = () => {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0,0,512,716);
            
            // Draw the tile image
            ctx.drawImage(img, 25, 25, 462, 462);
            
            // Add subtle border around image
            ctx.strokeStyle = "#eeeeee";
            ctx.lineWidth = 2;
            ctx.strokeRect(25, 25, 462, 462);

            // Add tile name at bottom
            ctx.fillStyle = "#333";
            ctx.font = "bold 32px Inter, Helvetica, Arial";
            ctx.textAlign = "left";
            ctx.fillText(tileData.t, 40, 560);
            
            // Add category label
            ctx.fillStyle = "#666";
            ctx.font = "22px Inter, Helvetica, Arial";
            ctx.fillText(tileData.category, 40, 600);
            
            // Add item number
            ctx.fillStyle = "#999";
            ctx.font = "18px Inter, Helvetica, Arial";
            ctx.fillText(`No. ${String(index+1).padStart(2,'0')}`, 40, 650);
            
            // Outer border
            ctx.strokeStyle = "#e0e0e0";
            ctx.lineWidth = 4;
            ctx.strokeRect(0, 0, 512, 716);
            
            texture.needsUpdate = true;
        };

        return texture;
    }

    // --- PATH ---
    const points = [];
    const steps = 400;
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = t * Math.PI * 2 * CONFIG.spiralLoops;
        const radius = 0.5 + Math.pow(t, 1.1) * CONFIG.spiralMaxRadius;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = (t * CONFIG.spiralDepth) - CONFIG.spiralDepth;
        points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);

    // --- CARDS ---
    const cards = [];
    const basePlaneGeo = new THREE.PlaneGeometry(CONFIG.cardWidth, CONFIG.cardHeight, 10, 10);
    
    const basePosAttr = basePlaneGeo.attributes.position;
    const basePositions = [];
    for(let i=0; i<basePosAttr.count; i++){
        basePositions.push(new THREE.Vector3(basePosAttr.getX(i), basePosAttr.getY(i), basePosAttr.getZ(i)));
    }

    for (let i = 0; i < TOTAL_IMAGES; i++) {
        const mat = new THREE.MeshBasicMaterial({ 
            map: createCardTexture(i),
            side: THREE.DoubleSide
        });
        const geo = basePlaneGeo.clone();
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);

        cards.push({
            mesh: mesh,
            index: i,
            baseOffset: i / TOTAL_IMAGES,
            rotationOffset: (i * 60) * (Math.PI / 180),
            currentBend: 1,
            t: 0
        });
    }

    // --- MORPH GEOMETRY ---
    function updateCardGeometry(card, bendFactor) {
        const positions = card.mesh.geometry.attributes.position;
        const radius = CONFIG.tubeRadius + 0.1;

        for(let i=0; i<basePositions.length; i++) {
            const v = basePositions[i];
            const flatX = v.x;
            const flatY = v.y;
            const flatZ = v.z;

            const angle = v.x / radius;
            const curvedX = radius * Math.sin(angle);
            const curvedY = v.y;
            const curvedZ = radius * (1 - Math.cos(angle));

            const x = flatX + (curvedX - flatX) * bendFactor;
            const y = flatY + (curvedY - flatY) * bendFactor;
            const z = flatZ + (curvedZ - flatZ) * bendFactor;

            positions.setXYZ(i, x, y, z);
        }
        positions.needsUpdate = true;
    }

    // --- ANIMATION STATE ---
    let scrollPos = 0;
    let targetScrollPos = 0;
    let activeIndex = -1;

    // Track scroll position relative to section
    window.addEventListener('scroll', () => {
        const rect = spiralSection.getBoundingClientRect();
        const sectionTop = rect.top;
        const sectionHeight = rect.height;
        const viewportHeight = window.innerHeight;
        
        // Only update when section is in view
        if (sectionTop < viewportHeight && sectionTop + sectionHeight > 0) {
            // Calculate how far we've scrolled through the section
            const scrollThroughSection = -sectionTop;
            const scrollProgress = Math.max(0, Math.min(1, scrollThroughSection / sectionHeight));
            targetScrollPos = scrollProgress * 2; // Scale for spiral effect
        }
    });

    function updateSidebar(index) {
        if(index === activeIndex) return;
        activeIndex = index;
        
        domContent.classList.remove('visible');
        setTimeout(() => {
            if(index === -1) return;
            
            const data = TIMELINE_DATA[index];
            domYear.innerText = data.category; // Show category instead of year
            domTitle.innerText = data.t;
            domDesc.innerText = data.d;
            domContent.classList.add('visible');
        }, 300);
    }

    const spiralOffset = new THREE.Vector3(-3.5, 2.0, 0);

    function animate() {
        scrollPos += (targetScrollPos - scrollPos) * 0.05;

        let candidateIndex = -1;
        let maxT = -1;

        cards.forEach(card => {
            let t = (card.baseOffset + scrollPos) % 1;
            if(t < 0) t += 1;
            card.t = t;
            if (t > 0.85 && t < 0.98) {
                if (t > maxT) {
                    maxT = t;
                    candidateIndex = card.index;
                }
            }
        });

        if (candidateIndex !== activeIndex) {
            updateSidebar(candidateIndex);
        }

        const targetZ = 10;
        const dist = camera.position.z - targetZ;
        const vFOV = THREE.MathUtils.degToRad(camera.fov);
        const visibleHeight = 2 * Math.tan(vFOV / 2) * dist;
        const visibleWidth = visibleHeight * camera.aspect;

        let displayScale = 1.2;
        const maxCardHeight = visibleHeight - 1.0;
        if (CONFIG.cardHeight * displayScale > maxCardHeight) {
            displayScale = maxCardHeight / CONFIG.cardHeight;
        }

        let targetX = visibleWidth * 0.25;
        const halfCardWidth = (CONFIG.cardWidth * displayScale) / 2;
        const screenRightEdge = visibleWidth / 2;
        const rightPadding = 0.5;

        if (targetX + halfCardWidth > screenRightEdge - rightPadding) {
            targetX = (screenRightEdge - rightPadding) - halfCardWidth;
        }

        cards.forEach(card => {
            const isFocused = (card.index === activeIndex);
            
            let targetPos = new THREE.Vector3();
            let targetRot = new THREE.Euler();
            let targetScale = 1;
            let targetBend = 1;

            if (isFocused) {
                targetPos.set(targetX, 0, targetZ);
                targetRot.set(0, -0.2, 0);
                targetScale = displayScale;
                targetBend = 0;
                card.mesh.material.opacity = 1;
            } else {
                const t = card.t;
                const posOnCurve = curve.getPointAt(t);
                targetPos.copy(posOnCurve);
                targetPos.add(spiralOffset);

                const lookAtT = Math.min(t + 0.01, 1);
                const lookAtPos = curve.getPointAt(lookAtT);
                const offsetLookAt = lookAtPos.clone().add(spiralOffset);
                
                const dummy = new THREE.Object3D();
                dummy.position.copy(targetPos);
                dummy.lookAt(offsetLookAt);
                
                const spinAngle = (t * Math.PI * 2 * 2) + card.rotationOffset;
                
                dummy.rotateZ(spinAngle);
                dummy.translateX(CONFIG.tubeRadius + 0.1);
                dummy.rotateY(Math.PI / 2);

                dummy.updateMatrix();
                targetPos.setFromMatrixPosition(dummy.matrix);
                targetRot.copy(dummy.rotation);
                
                targetScale = 0.2 + (t * t) * 0.8;
                targetBend = 1;

                if (t < 0.1) card.mesh.material.opacity = t / 0.1;
                else if (t > 0.95) card.mesh.material.opacity = (1 - t) / 0.05;
                else card.mesh.material.opacity = 1;
            }

            const lerpSpeed = 0.08;
            card.mesh.position.lerp(targetPos, lerpSpeed);
            
            const targetquat = new THREE.Quaternion().setFromEuler(targetRot);
            card.mesh.quaternion.slerp(targetquat, lerpSpeed);

            const currentScale = card.mesh.scale.x;
            const newScale = currentScale + (targetScale - currentScale) * lerpSpeed;
            card.mesh.scale.setScalar(newScale);

            card.currentBend += (targetBend - card.currentBend) * 0.05;
            updateCardGeometry(card, card.currentBend);

            card.mesh.material.transparent = true;
        });

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    console.log('Spiral Timeline animation initialized');
})();

// ========================================
// 3D TILT GALLERY ANIMATION
// ========================================
(function initTiltGallery() {
    const tiltContainer = document.querySelector(".tilt-container");
    const imagesContainer = document.querySelector(".tilt-images-container");
    const images = document.querySelectorAll(".tilt-floating-image");

    if (!tiltContainer || !imagesContainer || images.length === 0) {
        console.log('3D Tilt Gallery: Elements not found');
        return;
    }

    if (typeof gsap === 'undefined') {
        console.log('3D Tilt Gallery: GSAP not loaded');
        return;
    }

    // Initial fixed transforms for each image position
    const initialTransforms = [
        { x: -10, y: -10, rotateY: 25, rotateX: -5 }, // Top Left
        { x: 0, y: -15, rotateX: -10, rotateY: 0 }, // Top Center
        { x: 10, y: -10, rotateY: -25, rotateX: -5 }, // Top Right
        { x: -15, y: 0, rotateY: 30, rotateX: 0 }, // Middle Left
        { x: 15, y: 0, rotateY: -30, rotateX: 0 }, // Middle Right
        { x: -10, y: 10, rotateY: 25, rotateX: 5 }, // Bottom Left
        { x: 0, y: 15, rotateX: 10, rotateY: 0 }, // Bottom Center
        { x: 10, y: 10, rotateY: -25, rotateX: 5 } // Bottom Right
    ];

    // Apply initial transforms
    images.forEach((image, index) => {
        const transform = initialTransforms[index];
        image.style.transform = `
            translate3d(${transform.x}%, ${transform.y}%, 50px)
            rotateY(${transform.rotateY}deg)
            rotateX(${transform.rotateX}deg)
        `;
    });

    tiltContainer.addEventListener("mousemove", (e) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const moveX = (clientX - centerX) / centerX;
        const moveY = (clientY - centerY) / centerY;

        // Move the entire container as one unit
        gsap.to(imagesContainer, {
            duration: 1,
            ease: "power2.out",
            transform: `
                perspective(1000px)
                rotateX(${-moveY * 10}deg)
                rotateY(${moveX * 10}deg)
                translateZ(${-Math.abs(moveX * moveY) * 100}px)
            `
        });
    });

    // Reset position
    tiltContainer.addEventListener("mouseleave", () => {
        gsap.to(imagesContainer, {
            duration: 1,
            ease: "power2.out",
            transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)"
        });
    });

    console.log('3D Tilt Gallery animation initialized');
})();

// ========================================
// PLAYBOOK SCROLL ANIMATION
// ========================================
(function initPlaybookAnimation() {
    const playbookSection = document.querySelector('.playbook-scroll-section');
    
    if (!playbookSection || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.log('Playbook Animation: Missing dependencies');
        return;
    }
    
    // Animate the center scaler image - starts at full viewport size and shrinks down
    gsap.timeline({
        scrollTrigger: {
            trigger: '.playbook-scroll-section',
            start: 'top -10%',
            end: 'bottom 80%',
            scrub: true,
        },
    })
    .from('.scaler img', {
        height: window.innerHeight - 32,
        ease: 'power1.inOut',
    }, 0)
    .from('.scaler img', {
        width: window.innerWidth - 32,
        ease: 'power2.inOut',
    }, 0);
    
    // Animate the layers
    gsap.timeline({
        scrollTrigger: {
            trigger: '.playbook-scroll-section',
            start: 'top -40%',
            end: 'bottom bottom',
            scrub: true,
        },
    })
    .from('.layer:nth-of-type(1)', {
        opacity: 0,
        ease: 'sine.out',
    }, 0)
    .from('.layer:nth-of-type(1)', {
        scale: 0,
        ease: 'power1.inOut',
    }, 0)
    .from('.layer:nth-of-type(2)', {
        opacity: 0,
        ease: 'sine.out',
    }, 0)
    .from('.layer:nth-of-type(2)', {
        scale: 0,
        ease: 'power3.inOut',
    }, 0)
    .from('.layer:nth-of-type(3)', {
        opacity: 0,
        ease: 'sine.out',
    }, 0)
    .from('.layer:nth-of-type(3)', {
        scale: 0,
        ease: 'power4.inOut',
    }, 0);
    
    console.log('Playbook Scroll Animation initialized');
})();

// ========================================
// WORLD MAP INITIALIZATION
// ========================================
if (typeof am5viewer !== 'undefined' && document.getElementById('worldMapContainer')) {
    am5viewer.create("worldMapContainer", {
        "settings": {
            "editor": {
                "theme": "dark",
                "userData": {
                    "projection": "geoMercator",
                    "geodata": "worldLow"
                },
                "themeTags": ["dark"],
                "backgroundFill": {
                    "type": "Color",
                    "value": "#000000"
                },
                "polygonFill": {
                    "type": "Color",
                    "value": "#000000"
                },
                "lineStrokeDashLength": 8,
                "linePointStrokeWidth": 0.5,
                "fillColor": {
                    "type": "Color",
                    "value": "#879c39"
                },
                "backgroundNoise": false,
                "lineInteractive": true,
                "linePointScale": 0.2,
                "linePointTypeKey": "custom",
                "pointSvgPath": "M520-200 80-480l440-280-137 240h497v80H383l137 240Z",
                "linePointSvgPath": "M520-200 80-480l440-280-137 240h497v80H383l137 240Z",
                "linePointInteractive": false,
                "clipBackground": true,
                "__parse": true
            },
            "editor.map": {
                "minZoomLevel": 0.8,
                "projection": "geoMercator",
                "panX": "none",
                "panY": "none",
                "wheelY": "none",
                "zoomControl": {
                    "type": "ZoomControl",
                    "settings": {
                        "visible": false
                    }
                },
                "background": {
                    "type": "Rectangle",
                    "settings": {
                        "fill": {
                            "type": "Color",
                            "value": "#000000"
                        },
                        "fillOpacity": 1
                    }
                },
                "translateX": 692,
                "translateY": 484,
                "__parse": true
            },
            "editor.polygonSeries": {
                "valueField": "value",
                "calculateAggregates": true,
                "id": "polygonseries",
                "exclude": ["AQ"],
                "geometryField": "geometry",
                "geometryTypeField": "geometryType",
                "idField": "id"
            },
            "editor.lineSeries": {
                "layer": 30,
                "id": "lineseries",
                "lineTypeField": "lineType",
                "geometryField": "geometry",
                "geometryTypeField": "geometryType",
                "idField": "id",
                "lineType": "curved"
            }
        },
        "data": {
            "editor.polygonSeries": [
                {
                    "id": "IN",
                    "name": "India",
                    "settings": {
                        "type": "Template",
                        "settings": {
                            "fill": {
                                "type": "Color",
                                "value": "#0f3e67"
                            }
                        }
                    },
                    "__parse": true
                }
            ],
            "editor.lineSeries": [
                {
                    "settings": {
                        "type": "Template",
                        "settings": {
                            "stroke": {
                                "type": "Color",
                                "value": "#ffffff"
                            },
                            "strokeOpacity": 0.5,
                            "strokeWidth": 1,
                            "strokeDasharray": [8, 8]
                        }
                    },
                    "linePointSeries": {
                        "type": "MapPointSeries",
                        "settings": {
                            "geometryField": "geometry",
                            "geometryTypeField": "geometryType",
                            "idField": "id",
                            "id": "linepointseries_1",
                            "pointTypeField": "pointType",
                            "svgPathField": "path"
                        },
                        "properties": {
                            "data": [
                                {
                                    "geometry": {
                                        "type": "Point",
                                        "coordinates": [74.60087, 18.75777],
                                        "__parse": false
                                    },
                                    "id": "linepoint_1",
                                    "name": "Point 1",
                                    "settings": {
                                        "type": "Template",
                                        "settings": {
                                            "fillOpacity": 1,
                                            "fill": {
                                                "type": "Color",
                                                "value": "#fbad26"
                                            },
                                            "stroke": {
                                                "type": "Color",
                                                "value": "#000000"
                                            },
                                            "strokeOpacity": 0.5,
                                            "scale": 0.2,
                                            "strokeWidth": 0.5
                                        }
                                    },
                                    "pointType": "Empty",
                                    "__parse": true
                                },
                                {
                                    "geometry": {
                                        "type": "Point",
                                        "coordinates": [-80.6533, 33.91373],
                                        "__parse": false
                                    },
                                    "id": "linepoint_2",
                                    "name": "Point 2",
                                    "settings": {
                                        "type": "Template",
                                        "settings": {
                                            "fillOpacity": 1,
                                            "fill": {
                                                "type": "Color",
                                                "value": "#fbad26"
                                            },
                                            "stroke": {
                                                "type": "Color",
                                                "value": "#000000"
                                            },
                                            "strokeOpacity": 0.5,
                                            "scale": 0.035,
                                            "strokeWidth": 0.5,
                                            "rotation": 292
                                        }
                                    },
                                    "pointType": "custom",
                                    "path": "M520-200 80-480l440-280-137 240h497v80H383l137 240Z",
                                    "__parse": true
                                },
                                {
                                    "geometry": {
                                        "type": "Point",
                                        "coordinates": [-39.14147, -5.03388],
                                        "__parse": false
                                    },
                                    "id": "linepoint_3",
                                    "name": "Point 3",
                                    "settings": {
                                        "type": "Template",
                                        "settings": {
                                            "fillOpacity": 1,
                                            "fill": {
                                                "type": "Color",
                                                "value": "#fbad26"
                                            },
                                            "stroke": {
                                                "type": "Color",
                                                "value": "#000000"
                                            },
                                            "strokeOpacity": 0.5,
                                            "scale": 0.035,
                                            "strokeWidth": 0.5,
                                            "rotation": 328
                                        }
                                    },
                                    "pointType": "custom",
                                    "path": "M520-200 80-480l440-280-137 240h497v80H383l137 240Z",
                                    "__parse": true
                                }
                            ]
                        }
                    },
                    "geometry": {
                        "type": "Line",
                        "__parse": false
                    },
                    "id": "line_1",
                    "name": "Line 1",
                    "__parse": true
                },
                {
                    "settings": {
                        "type": "Template",
                        "settings": {
                            "stroke": {
                                "type": "Color",
                                "value": "#ffffff"
                            },
                            "strokeOpacity": 0.5,
                            "strokeWidth": 1,
                            "strokeDasharray": [8, 8]
                        }
                    },
                    "linePointSeries": {
                        "type": "MapPointSeries",
                        "settings": {
                            "geometryField": "geometry",
                            "geometryTypeField": "geometryType",
                            "idField": "id",
                            "id": "linepointseries_2",
                            "pointTypeField": "pointType",
                            "svgPathField": "path"
                        },
                        "properties": {
                            "data": [
                                {
                                    "geometry": {
                                        "type": "Point",
                                        "coordinates": [74.60087, 18.75777],
                                        "__parse": false
                                    },
                                    "id": "linepoint_1",
                                    "name": "Point 1",
                                    "settings": {
                                        "type": "Template",
                                        "settings": {
                                            "fillOpacity": 1,
                                            "fill": {
                                                "type": "Color",
                                                "value": "#fbad26"
                                            },
                                            "stroke": {
                                                "type": "Color",
                                                "value": "#000000"
                                            },
                                            "strokeOpacity": 0.5,
                                            "scale": 0.2,
                                            "strokeWidth": 0.5
                                        }
                                    },
                                    "pointType": "Empty",
                                    "__parse": true
                                },
                                {
                                    "geometry": {
                                        "type": "Point",
                                        "coordinates": [76.31755, 18.15624],
                                        "__parse": false
                                    },
                                    "id": "linepoint_2",
                                    "name": "Point 2",
                                    "settings": {
                                        "type": "Template",
                                        "settings": {
                                            "fillOpacity": 1,
                                            "fill": {
                                                "type": "Color",
                                                "value": "#fbad26"
                                            },
                                            "stroke": {
                                                "type": "Color",
                                                "value": "#000000"
                                            },
                                            "strokeOpacity": 0.5,
                                            "scale": 0.2,
                                            "strokeWidth": 0.5
                                        }
                                    },
                                    "pointType": "Empty",
                                    "__parse": true
                                },
                                {
                                    "geometry": {
                                        "type": "Point",
                                        "coordinates": [94.52778, 60.2832],
                                        "__parse": false
                                    },
                                    "id": "linepoint_3",
                                    "name": "Point 3",
                                    "settings": {
                                        "type": "Template",
                                        "settings": {
                                            "fillOpacity": 1,
                                            "fill": {
                                                "type": "Color",
                                                "value": "#fbad26"
                                            },
                                            "stroke": {
                                                "type": "Color",
                                                "value": "#000000"
                                            },
                                            "strokeOpacity": 0.5,
                                            "scale": 0.035,
                                            "strokeWidth": 0.5,
                                            "rotation": 45
                                        }
                                    },
                                    "pointType": "custom",
                                    "path": "M520-200 80-480l440-280-137 240h497v80H383l137 240Z",
                                    "__parse": true
                                }
                            ]
                        }
                    },
                    "geometry": {
                        "type": "Line",
                        "__parse": false
                    },
                    "id": "line_2",
                    "name": "Line 2",
                    "__parse": true
                },
                {
                    "settings": {
                        "type": "Template",
                        "settings": {
                            "stroke": {
                                "type": "Color",
                                "value": "#ffffff"
                            },
                            "strokeOpacity": 0.5,
                            "strokeWidth": 1,
                            "strokeDasharray": [8, 8]
                        }
                    },
                    "linePointSeries": {
                        "type": "MapPointSeries",
                        "settings": {
                            "geometryField": "geometry",
                            "geometryTypeField": "geometryType",
                            "idField": "id",
                            "id": "linepointseries_3",
                            "pointTypeField": "pointType",
                            "svgPathField": "path"
                        },
                        "properties": {
                            "data": [
                                {
                                    "geometry": {
                                        "type": "Point",
                                        "coordinates": [74.60087, 18.75777],
                                        "__parse": false
                                    },
                                    "id": "linepoint_1",
                                    "name": "Point 1",
                                    "settings": {
                                        "type": "Template",
                                        "settings": {
                                            "fillOpacity": 1,
                                            "fill": {
                                                "type": "Color",
                                                "value": "#fbad26"
                                            },
                                            "stroke": {
                                                "type": "Color",
                                                "value": "#000000"
                                            },
                                            "strokeOpacity": 0.5,
                                            "scale": 0.2,
                                            "strokeWidth": 0.5
                                        }
                                    },
                                    "pointType": "Empty",
                                    "__parse": true
                                },
                                {
                                    "geometry": {
                                        "type": "Point",
                                        "coordinates": [118.35459, -23.26009],
                                        "__parse": false
                                    },
                                    "id": "linepoint_2",
                                    "name": "Point 2",
                                    "settings": {
                                        "type": "Template",
                                        "settings": {
                                            "fillOpacity": 1,
                                            "fill": {
                                                "type": "Color",
                                                "value": "#fbad26"
                                            },
                                            "stroke": {
                                                "type": "Color",
                                                "value": "#000000"
                                            },
                                            "strokeOpacity": 0.5,
                                            "scale": 0.035,
                                            "strokeWidth": 0.5,
                                            "rotation": 130
                                        }
                                    },
                                    "pointType": "custom",
                                    "path": "M520-200 80-480l440-280-137 240h497v80H383l137 240Z",
                                    "__parse": true
                                }
                            ]
                        }
                    },
                    "geometry": {
                        "type": "Line",
                        "__parse": false
                    },
                    "id": "line_3",
                    "name": "Line 3",
                    "__parse": true
                },
                {
                    "settings": {
                        "type": "Template",
                        "settings": {
                            "stroke": {
                                "type": "Color",
                                "value": "#ffffff"
                            },
                            "strokeOpacity": 0.5,
                            "strokeWidth": 1,
                            "strokeDasharray": [8, 8]
                        }
                    },
                    "linePointSeries": {
                        "type": "MapPointSeries",
                        "settings": {
                            "geometryField": "geometry",
                            "geometryTypeField": "geometryType",
                            "idField": "id",
                            "id": "linepointseries_4",
                            "pointTypeField": "pointType",
                            "svgPathField": "path"
                        },
                        "properties": {
                            "data": [
                                {
                                    "geometry": {
                                        "type": "Point",
                                        "coordinates": [74.60087, 18.75777],
                                        "__parse": false
                                    },
                                    "id": "linepoint_1",
                                    "name": "Point 1",
                                    "settings": {
                                        "type": "Template",
                                        "settings": {
                                            "fillOpacity": 1,
                                            "fill": {
                                                "type": "Color",
                                                "value": "#fbad26"
                                            },
                                            "stroke": {
                                                "type": "Color",
                                                "value": "#000000"
                                            },
                                            "strokeOpacity": 0.5,
                                            "scale": 0.2,
                                            "strokeWidth": 0.5
                                        }
                                    },
                                    "pointType": "Empty",
                                    "__parse": true
                                },
                                {
                                    "geometry": {
                                        "type": "Point",
                                        "coordinates": [-0.1276, 51.5074],
                                        "__parse": false
                                    },
                                    "id": "linepoint_2",
                                    "name": "Point 2",
                                    "settings": {
                                        "type": "Template",
                                        "settings": {
                                            "fillOpacity": 1,
                                            "fill": {
                                                "type": "Color",
                                                "value": "#fbad26"
                                            },
                                            "stroke": {
                                                "type": "Color",
                                                "value": "#000000"
                                            },
                                            "strokeOpacity": 0.5,
                                            "scale": 0.035,
                                            "strokeWidth": 0.5,
                                            "rotation": 280
                                        }
                                    },
                                    "pointType": "custom",
                                    "path": "M520-200 80-480l440-280-137 240h497v80H383l137 240Z",
                                    "__parse": true
                                }
                            ]
                        }
                    },
                    "geometry": {
                        "type": "Line",
                        "__parse": false
                    },
                    "id": "line_4",
                    "name": "Line 4",
                    "__parse": true
                }
            ]
        }
    });
    console.log('World Map initialized');
}

// ========================================
// SLIDING TEXT EFFECT SECTION
// ========================================
// Mouse move effect for sliding text with stone and tiles hover

(function initSlidingTextEffect() {
    const spansSlow = document.querySelectorAll('.spanSlow');
    const spansFast = document.querySelectorAll('.spanFast');
    
    if (spansSlow.length === 0 && spansFast.length === 0) {
        console.log('Sliding text elements not found');
        return;
    }

    let width = window.innerWidth;

    function handleMouseMove(e) {
        let normalizedPosition = e.pageX / (width/2) - 1;
        let speedSlow = 100 * normalizedPosition;
        let speedFast = 200 * normalizedPosition;
        
        spansSlow.forEach((span) => {
            span.style.transform = `translate(${speedSlow}px)`;
        });
        
        spansFast.forEach((span) => {
            span.style.transform = `translate(${speedFast}px)`;
        });
        
        // Handle text label fill based on mouse position
        handleTextFill(e);
    }

    function handleWindowResize() {
        width = window.innerWidth;
    }

    // Fill text labels based on which side of the screen the mouse is on
    function handleTextFill(e) {
        const slidingSection = document.querySelector('.sliding-text-section');
        if (!slidingSection) return;
        
        const rect = slidingSection.getBoundingClientRect();
        const mouseY = e.clientY;
        
        // Check if mouse is within the sliding section vertically
        if (mouseY >= rect.top && mouseY <= rect.bottom) {
            const mouseX = e.clientX;
            const centerX = window.innerWidth / 2;
            
            const stoneLabel = document.querySelector('.stone-label');
            const tilesLabel = document.querySelector('.tiles-label');
            
            if (mouseX < centerX) {
                // Left side - fill Natural Stone
                if (stoneLabel) stoneLabel.classList.add('filled');
                if (tilesLabel) tilesLabel.classList.remove('filled');
            } else {
                // Right side - fill Tiles
                if (stoneLabel) stoneLabel.classList.remove('filled');
                if (tilesLabel) tilesLabel.classList.add('filled');
            }
        }
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleWindowResize);
    
    console.log('Sliding text effect initialized');
})();

// ========================================
// SEARCH AND HAMBURGER MENU FUNCTIONALITY
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Hamburger Menu Toggle
    const hamburgerBtn = document.getElementById('hamburgerMenuBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const menuOverlay = document.getElementById('hamburgerMenuOverlay');
    
    if (hamburgerBtn && menuOverlay && closeMenuBtn) {
        // Open menu
        hamburgerBtn.addEventListener('click', function() {
            menuOverlay.style.display = 'block';
            setTimeout(function() {
                menuOverlay.classList.add('active');
            }, 10);
        });
        
        // Close menu
        function closeMenu() {
            menuOverlay.classList.remove('active');
            setTimeout(function() {
                menuOverlay.style.display = 'none';
            }, 300);
        }
        
        closeMenuBtn.addEventListener('click', closeMenu);
        
        // Close menu when clicking overlay
        menuOverlay.addEventListener('click', function(e) {
            if (e.target === menuOverlay) {
                closeMenu();
            }
        });
        
        // Dropdown Toggle
        const dropdownToggles = document.querySelectorAll('.menu-dropdown-toggle, .submenu-dropdown-toggle');
        
        dropdownToggles.forEach(function(toggle) {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                const parentItem = this.parentElement;
                const wasActive = parentItem.classList.contains('active');
                
                // Close all sibling dropdowns
                const siblings = Array.from(parentItem.parentElement.children);
                siblings.forEach(function(sibling) {
                    if (sibling !== parentItem) {
                        sibling.classList.remove('active');
                    }
                });
                
                // Toggle current dropdown
                if (wasActive) {
                    parentItem.classList.remove('active');
                } else {
                    parentItem.classList.add('active');
                }
            });
        });
        
        // Close menu on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && menuOverlay.classList.contains('active')) {
                closeMenu();
            }
        });
    }
    
    // Search Overlay Functionality
    const searchBtn = document.getElementById('searchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    const searchForm = document.getElementById('searchForm');
    const searchContainer = document.querySelector('.search-container');
    
    if (searchBtn && searchOverlay && searchInput && searchForm && searchContainer) {
        // Open search overlay
        searchBtn.addEventListener('click', function() {
            searchOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            setTimeout(() => {
                searchInput.focus();
            }, 400);
        });
        
        // Close on overlay click (outside search container and popular searches)
        searchOverlay.addEventListener('click', function(e) {
            // Check if click is outside the search container
            if (!searchContainer.contains(e.target)) {
                searchOverlay.classList.remove('active');
                document.body.style.overflow = '';
                searchInput.value = '';
            }
        });
        
        // Close on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
                searchOverlay.classList.remove('active');
                document.body.style.overflow = '';
                searchInput.value = '';
            }
        });
        
        // Handle search form submission
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                // Here you can implement your search logic
                console.log('Searching for:', searchTerm);
                // For now, just show an alert
                alert('Searching for: ' + searchTerm);
                // You can redirect to a search results page or perform AJAX search
                // window.location.href = '/search?q=' + encodeURIComponent(searchTerm);
            }
        });
        
        // Handle search tag clicks
        const searchTags = document.querySelectorAll('.search-tag');
        searchTags.forEach(function(tag) {
            tag.addEventListener('click', function(e) {
                e.preventDefault();
                const tagText = this.textContent;
                searchInput.value = tagText;
                searchInput.focus();
            });
        });
    }
});
