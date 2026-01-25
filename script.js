// === PRELOADER ===
// Animate preloader percentage and loading bar
const preloader = document.querySelector('.preloader');
const preloaderPercentage = document.querySelector('.preloader-percentage');
const preloaderBar = document.querySelector('.preloader-bar');

let loadProgress = 0;
const loadInterval = setInterval(() => {
    loadProgress += Math.random() * 15; // Random increment for realistic loading
    
    if (loadProgress >= 100) {
        loadProgress = 100;
        clearInterval(loadInterval);
        
        // Update to 100%
        preloaderPercentage.textContent = '100%';
        preloaderBar.style.width = '100%';
        
        // Hide preloader after a short delay
        setTimeout(() => {
            preloader.classList.add('hidden');
            // Remove from DOM after transition
            setTimeout(() => {
                preloader.remove();
            }, 500);
        }, 300);
    } else {
        preloaderPercentage.textContent = Math.floor(loadProgress) + '%';
        preloaderBar.style.width = loadProgress + '%';
    }
}, 100); // Update every 100ms

// Ensure preloader hides when page is fully loaded
window.addEventListener('load', () => {
    // Force complete loading after window load event
    setTimeout(() => {
        if (loadProgress < 100) {
            clearInterval(loadInterval);
            loadProgress = 100;
            preloaderPercentage.textContent = '100%';
            preloaderBar.style.width = '100%';
            
            setTimeout(() => {
                preloader.classList.add('hidden');
                setTimeout(() => {
                    preloader.remove();
                }, 500);
            }, 300);
        }
    }, 500);
});

// Initialize GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Get elements
const splitTop = document.querySelector('.split-top');
const splitBottom = document.querySelector('.split-bottom');
const blackBackground = document.querySelector('.black-background');
const splitContainer = document.querySelector('.split-container');
const aboutUsText = document.querySelector('.about-us-text');
const letters = document.querySelectorAll('.about-us-text li');
const verticalLine = document.querySelector('.vertical-line');
const horizontalLine = document.querySelector('.horizontal-line');
const splitTextContainer = document.querySelector('.split-text-container');
const topTexts = document.querySelectorAll('.top-text');
const wholesalerText = document.querySelector('.wholesaler-text');
const wholesalerContainer = document.querySelector('.wholesaler-container');
const stackCardsSection = document.querySelector('.stack-cards-section');
const stackCards = document.querySelectorAll('.stack-cards__item');

// Set initial states explicitly to ensure proper starting position
gsap.set([splitTop, splitBottom], {
    yPercent: 0,
    force3D: true
});

gsap.set(blackBackground, {
    height: 0,
    force3D: true
});

// Set initial state for ABOUT US text and letters
gsap.set(aboutUsText, {
    force3D: true
});

// Set initial states for each letter based on their direction
letters.forEach((letter) => {
    const direction = letter.getAttribute('data-direction');
    let initialState = { opacity: 0, force3D: true };
    
    switch(direction) {
        case 'left':
            initialState.x = -100;
            break;
        case 'right':
            initialState.x = 100;
            break;
        case 'top':
            initialState.y = -100;
            break;
        case 'bottom':
            initialState.y = 100;
            break;
    }
    
    gsap.set(letter, initialState);
});

// Set initial state for vertical line (minimal height, visible)
gsap.set(verticalLine, {
    height: 1,
    opacity: 1,
    force3D: true
});

// Set initial state for horizontal line (no width initially)
gsap.set(horizontalLine, {
    width: 0,
    opacity: 1,
    force3D: true
});

// Set initial state for split text (visible but offset)
gsap.set(splitTextContainer, {
    opacity: 1,
    force3D: true
});

// Set initial positions for top text (Apple-style split reveal)
gsap.set(topTexts, {
    y: '15vh', // Start from below (viewport relative)
    opacity: 1,
    force3D: true
});

// Set initial position for wholesaler text
gsap.set(wholesalerText, {
    y: '-15vh', // Start from above (viewport relative)
    opacity: 1,
    force3D: true
});

// Set initial state for stack cards (hidden initially)
gsap.set(stackCardsSection, {
    autoAlpha: 0,
    force3D: true
});

gsap.set(stackCards, {
    opacity: 1,
    scale: 1,
    y: 0,
    force3D: true
});

// Create the parallax scroll animation timeline
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: '.scroll-content',
        start: 'top top',
        end: '35% top', // Animation completes at 35% scroll
        scrub: true, // No delay for instant response, fully reversible
        invalidateOnRefresh: true,
        anticipatePin: 1,
        fastScrollEnd: true,
        preventOverlaps: true
    }
});

// Animate the white screen split
// Top half moves up and out of view
tl.to(splitTop, {
    yPercent: -100, // Moves completely out of viewport
    ease: 'none',
    force3D: true
}, 0);

// Bottom half moves down and out of view
tl.to(splitBottom, {
    yPercent: 100, // Moves completely out of viewport
    ease: 'none',
    force3D: true
}, 0);

// Black background expands from center to full viewport
tl.to(blackBackground, {
    height: '100vh',
    ease: 'none',
    force3D: true
}, 0);

// === ABOUT US TEXT PARALLAX PHASES ===

// Animate each letter individually with staggered timing based on --i value
letters.forEach((letter) => {
    const iValue = parseFloat(letter.style.getPropertyValue('--i'));
    const direction = letter.getAttribute('data-direction');
    
    // Calculate start position based on stagger (10% base + stagger offset)
    const startProgress = 0.1 + (iValue - 1) * 0.03; // Stagger letters progressively
    const endProgress = 0.3; // All letters should be visible by 30%
    
    // Create animation for each letter
    let finalState = {
        opacity: 1,
        x: 0,
        y: 0,
        ease: 'none',
        force3D: true
    };
    
    tl.to(letter, finalState, startProgress);
});

// Phase 2: Scale up the entire text container (30% → 60%)
tl.to(aboutUsText, {
    scale: 1.5,
    ease: 'none',
    force3D: true
}, 0.3);

// Phase 3: Move entire text container to the left (60% → 100%)
tl.to(aboutUsText, {
    x: '-150vw', // Moves completely off-screen to the left
    ease: 'none',
    force3D: true
}, 0.6);

// Phase 4: Ensure complete disappearance at 100%
tl.to(aboutUsText, {
    autoAlpha: 0, // Ensures text is completely hidden
    duration: 0.01,
    ease: 'none'
}, 0.99);

// === STAGE 1: VERTICAL LINE GROWTH ===
// Line grows from 1px to 11vh (10vh above center to 1vh below center)
tl.to(verticalLine, {
    height: '11vh',
    ease: 'none',
    force3D: true
}, 0.7); // Starts at 70% of timeline

// === HORIZONTAL LINE EXPANSION ===
// Horizontal line expands from center outward after vertical line completes
tl.to(horizontalLine, {
    width: '60vw',
    ease: 'none',
    force3D: true
}, 0.75); // Starts at 75% of timeline

// === STAGE 2: SPLIT REVEAL TEXT ANIMATION ===
// Top text slides up from below (starts at 80%, after line reaches full height)
tl.to(topTexts, {
    y: 0,
    ease: 'none',
    force3D: true
}, 0.8);

// Wholesaler text slides down from above (same timing as top text)
tl.to(wholesalerText, {
    y: 0,
    ease: 'none',
    force3D: true
}, 0.8);

// Optional: Hide the split container completely after animation finishes
// This ensures no white residue remains
tl.to(splitContainer, {
    autoAlpha: 0, // Fades out and sets visibility:hidden
    duration: 0.01, // Very quick fade at the end
    ease: 'none'
}, 0.99); // Starts near the end of the timeline

// Ensure split container and text are visible when scrolling back up
ScrollTrigger.create({
    trigger: '.scroll-content',
    start: 'top top',
    end: '35% top',
    onUpdate: (self) => {
        // Show/hide elements based on progress
        if (self.progress < 0.99) {
            gsap.set(splitContainer, { autoAlpha: 1 });
            gsap.set(aboutUsText, { autoAlpha: 1 });
        }
    }
});

// Scroll Natural Stone section up after completion
ScrollTrigger.create({
    trigger: '.scroll-content',
    start: '35% top',
    end: '50% top',
    scrub: true,
    onUpdate: (self) => {
        const progress = self.progress;
        const moveAmount = -100 * progress; // Move up by 100vh
        gsap.to([verticalLine, horizontalLine, splitTextContainer, wholesalerContainer], {
            y: `${moveAmount}vh`,
            duration: 0.1
        });
    },
    onLeaveBack: () => {
        gsap.to([verticalLine, horizontalLine, splitTextContainer, wholesalerContainer], {
            y: 0,
            duration: 0.3
        });
    }
});

// Handle window resize for responsiveness with debounce
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
    }, 250);
});

// Prevent any scroll-related layout shifts
window.addEventListener('load', () => {
    ScrollTrigger.refresh();
});

// === STACK CARDS ANIMATION ===

// Typing animation function
function typeText(element, text, speed = 30) {
    element.innerHTML = '';
    let charIndex = 0;
    
    function typeChar() {
        if (charIndex < text.length) {
            const span = document.createElement('span');
            span.className = 'typing-text';
            // Preserve spaces by using &nbsp; for space characters
            span.innerHTML = text[charIndex] === ' ' ? '&nbsp;' : text[charIndex];
            span.style.animationDelay = `${charIndex * 0.02}s`;
            element.appendChild(span);
            charIndex++;
            setTimeout(typeChar, speed);
        }
    }
    
    typeChar();
}

// Show cards section after pinned text completes (at 100% of scroll-content)
ScrollTrigger.create({
    trigger: '.scroll-content',
    start: '55% top',
    onEnter: () => {
        gsap.to(stackCardsSection, {
            autoAlpha: 1,
            duration: 0.8,
            onComplete: () => {
                // Start typing animation for each card when they become visible
                stackCards.forEach((card, index) => {
                    setTimeout(() => {
                        const h3 = card.querySelector('h3');
                        const p = card.querySelector('p');
                        
                        if (h3 && !h3.dataset.typed) {
                            const h3Text = h3.textContent;
                            h3.dataset.typed = 'true';
                            typeText(h3, h3Text, 50);
                        }
                        
                        if (p && !p.dataset.typed) {
                            setTimeout(() => {
                                const pText = p.textContent;
                                p.dataset.typed = 'true';
                                typeText(p, pText, 20);
                            }, h3Text.length * 50 + 200);
                        }
                    }, index * 300);
                });
            }
        });
        gsap.to([scrollTextLine1, scrollTextLine2], {
            autoAlpha: 0,
            duration: 0.5
        });
    },
    onLeaveBack: () => {
        gsap.to(stackCardsSection, {
            autoAlpha: 0,
            duration: 0.5
        });
        gsap.to([scrollTextLine1, scrollTextLine2], {
            autoAlpha: 1,
            duration: 0.5
        });
        // Reset typing animation
        stackCards.forEach(card => {
            const h3 = card.querySelector('h3');
            const p = card.querySelector('p');
            if (h3) delete h3.dataset.typed;
            if (p) delete p.dataset.typed;
        });
    }
});

// Stack cards scroll-based animation
stackCards.forEach((card, index) => {
    const numCards = stackCards.length;
    const reverseIndex = numCards - 1 - index; // Cards at end are on top
    
    // Set initial stacked appearance - later cards are on top and visible at edges
    gsap.set(card, {
        scale: 1 - (reverseIndex * 0.05), // Later cards slightly smaller
        y: reverseIndex * 2, // Slight vertical offset
        rotation: reverseIndex * 1.5, // Slight rotation for perspective
        transformOrigin: 'center top',
        zIndex: index // Higher index = higher z-index (on top)
    });
    
    ScrollTrigger.create({
        trigger: card,
        start: 'top center',
        end: 'bottom center',
        scrub: 1,
        onUpdate: (self) => {
            const progress = self.progress;
            
            // Calculate transformations - animate from stacked to full size
            const scale = (1 - (reverseIndex * 0.05)) + (progress * (reverseIndex * 0.05)); // Grow to full size
            const y = (reverseIndex * 2) + (reverseIndex * 30 * (1 - progress));
            const rotation = (reverseIndex * 1.5) + (reverseIndex * 2 * (1 - progress));
            
            gsap.to(card, {
                scale: scale,
                y: y,
                rotation: rotation,
                force3D: true,
                duration: 0.1
            });
        }
    });
});

// === SLIDING TEXT EFFECT ===
// Mouse move effect for sliding text after cards section

window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('resize', handleWindowResize);

const spansSlow = document.querySelectorAll('.spanSlow');
const spansFast = document.querySelectorAll('.spanFast');

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

// === NUMBERS SECTION ANIMATION ===
// Animate numbers counting up and flying in from different directions

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
const numbersSection = document.querySelector('.numbers-section');
if (numbersSection && numberItems.length > 0) {
    const timeline = gsap.timeline({
        scrollTrigger: {
            trigger: numbersSection,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            pin: false
        }
    });
    
    // Animate each number item with staggered timing
    numberItems.forEach((item, index) => {
        const startProgress = 0.2 + (index * 0.08); // Stagger start times
        const endProgress = startProgress + 0.15;   // Animation duration
        
        timeline.to(item, {
            x: 0,
            y: 0,
            rotation: 0,
            opacity: 1,
            scale: 1,
            ease: 'back.out(1.2)',
            duration: 0.15
        }, startProgress);
        
        // Trigger number counting when item becomes visible
        ScrollTrigger.create({
            trigger: numbersSection,
            start: `${startProgress * 100}% top`,
            once: true,
            onEnter: () => {
                const number = item.querySelector('.number');
                if (number) {
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
            numbersVideo.style.opacity = '0.4';
            numbersVideo.play();
        },
        onLeave: () => {
            numbersVideo.style.opacity = '0';
            numbersVideo.pause();
        },
        onEnterBack: () => {
            numbersVideo.style.opacity = '0.4';
            numbersVideo.play();
        },
        onLeaveBack: () => {
            numbersVideo.style.opacity = '0';
            numbersVideo.pause();
        }
    });
}

// === VENN DIAGRAM DOTS ANIMATION ===
// Animate dots moving around circles based on scroll

const vennSection = document.querySelector('.venn-section');
if (vennSection) {
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
            // Increased values to ensure images go completely off-screen even at 25% zoom
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
}

console.log('Split screen parallax with per-letter ABOUT US animation and pinned scroll text initialized - Fully reversible');

// === PLAYBOOK SCROLL ANIMATION ===
// Exact replica of CodePen animation with GSAP ScrollTrigger

const playbookSection = document.querySelector('.playbook-scroll-section');
if (playbookSection) {
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
}

// === WORLD MAP INITIALIZATION ===
// Initialize amCharts world map

if (document.getElementById('worldMapContainer')) {
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
}

// === FOOTER VIDEO AUTOPLAY ON SCROLL ===
// Play footer video when it becomes visible
const footerVideo = document.querySelector('.footer-video');
if (footerVideo) {
    ScrollTrigger.create({
        trigger: '.footer-video-container',
        start: 'top 80%', // Trigger when video container is 80% from top
        end: 'bottom 20%', // Stop when video is 20% from bottom
        onEnter: () => {
            footerVideo.play().catch(err => console.log('Video play failed:', err));
        },
        onEnterBack: () => {
            footerVideo.play().catch(err => console.log('Video play failed:', err));
        },
        onLeave: () => {
            footerVideo.pause();
        },
        onLeaveBack: () => {
            footerVideo.pause();
        }
    });
}
