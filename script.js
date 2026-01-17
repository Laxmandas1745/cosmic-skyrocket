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
const pinnedTextSection = document.querySelector('.pinned-text-section');
const scrollTextLine1 = document.querySelector('.line-1');
const scrollTextLine2 = document.querySelector('.line-2');
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
    y: 100, // Start from below
    opacity: 1,
    force3D: true
});

// Set initial position for wholesaler text
gsap.set(wholesalerText, {
    y: -100, // Start from above
    opacity: 1,
    force3D: true
});

// Set initial positions for pinned horizontal scroll text (hidden initially)
gsap.set([scrollTextLine1, scrollTextLine2], {
    x: 0,
    opacity: 0,
    force3D: true
});

// Set initial state for stack cards (hidden initially, will show after pinned text)
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

// === PINNED HORIZONTAL SCROLL TEXT SECTION ===
// This section starts after a scrolling gap following the Natural Stone section

// Create a separate timeline for the pinned text section
// This will be controlled by scroll position after the first timeline ends
const pinnedTimeline = gsap.timeline({
    scrollTrigger: {
        trigger: '.scroll-content',
        start: '50% top', // Starts at 50% scroll (gap between 35% and 50%)
        end: '100% top', // Extended scroll range for text animation
        scrub: true,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => {
            // Calculate text widths dynamically
            const line1Width = scrollTextLine1.offsetWidth;
            const line2Width = scrollTextLine2.offsetWidth;
            const viewportWidth = window.innerWidth;
            
            // Calculate how far to move each line (from center to completely off-screen left)
            const line1Distance = -(line1Width + viewportWidth / 2);
            const line2Distance = -(line2Width + viewportWidth / 2);
            
            // Apply transforms based on progress
            const progress = self.progress;
            gsap.set(scrollTextLine1, {
                x: progress * line1Distance,
                force3D: true
            });
            gsap.set(scrollTextLine2, {
                x: progress * line2Distance,
                force3D: true
            });
        }
    }
});

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

// Fade out Natural Stone section elements after completion
ScrollTrigger.create({
    trigger: '.scroll-content',
    start: '35% top',
    end: '45% top',
    onEnter: () => {
        gsap.to([verticalLine, horizontalLine, splitTextContainer, wholesalerText], {
            autoAlpha: 0,
            duration: 0.3
        });
    },
    onLeaveBack: () => {
        gsap.to([verticalLine, horizontalLine, splitTextContainer, wholesalerText], {
            autoAlpha: 1,
            duration: 0.3
        });
    }
});

// Manage pinned text visibility - appears at 50%
ScrollTrigger.create({
    trigger: '.scroll-content',
    start: '50% top',
    end: '100% top',
    onEnter: () => {
        gsap.to([scrollTextLine1, scrollTextLine2], {
            autoAlpha: 1,
            duration: 0.3
        });
    },
    onLeaveBack: () => {
        gsap.to([scrollTextLine1, scrollTextLine2], {
            autoAlpha: 0,
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
// Cards appear AFTER pinned text animation completes

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
    start: '95% top',
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
    
    ScrollTrigger.create({
        trigger: card,
        start: 'top center',
        end: 'bottom center',
        scrub: 1,
        onUpdate: (self) => {
            const progress = self.progress;
            const reverseIndex = numCards - 1 - index;
            
            // Calculate transformations
            const scale = 0.9 + (progress * 0.1);
            const y = reverseIndex * 30 * (1 - progress);
            const rotation = reverseIndex * 2 * (1 - progress);
            
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

console.log('Split screen parallax with per-letter ABOUT US animation and pinned scroll text initialized - Fully reversible');
