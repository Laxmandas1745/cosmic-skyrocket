// Scroll-based video scrubbing with pinned hero and smooth interpolation
const video = document.getElementById('heroVideo');
const heroSection = document.querySelector('.hero-banner');
const scrollSpacer = document.querySelector('.scroll-spacer');
const heroText = document.getElementById('heroText');
const navbar = document.getElementById('navbar');
const navbarIcons = document.getElementById('navbarIcons');
const navbarTitle = document.getElementById('navbarTitle');
const heroFadeGradient = document.getElementById('heroFadeGradient');
const heroBanner = document.getElementById('heroBanner');
const heroContainer = document.getElementById('heroContainer');
const aboutSection = document.getElementById('aboutSection');
const aboutContent = document.getElementById('aboutContent');
const aboutTitle = document.getElementById('aboutTitle');
const aboutDescription = document.getElementById('aboutDescription');
const aboutDescriptionSpan = document.querySelector('#aboutDescription span');
const aboutHighlight = document.querySelector('.about-highlight');
const signatureLine = document.getElementById('signatureLine');

let videoLoaded = false;
let videoDuration = 0;
let targetTime = 0;
let currentTime = 0;
let animationFrameId = null;
let isSeeking = false;
let animationTriggered = false;
let iconsTriggered = false;
let navbarTimeout = null; // Track the navbar timeout

// Smooth interpolation settings
const smoothFactor = 0.12; // Balanced for smooth but responsive playback
let scrollThreshold = window.innerHeight * 0.0463; // 4.63vh converted to pixels
let iconsScrollThreshold = window.innerHeight * 0.1389; // 13.89vh converted to pixels

// Navbar shrink settings
let startShrinkScroll = window.innerHeight * 0.1852; // 18.52vh converted to pixels
const maxNavbarWidth = 80; // Starting width in vw
const minNavbarWidthVw = 13; // Minimum width in vw

// Wait for video metadata to load
video.addEventListener('loadedmetadata', () => {
    videoLoaded = true;
    videoDuration = video.duration;
    video.currentTime = 0;
    currentTime = 0;
    startSmoothUpdate();
});

// Track seeking state to prevent hangs
video.addEventListener('seeking', () => {
    isSeeking = true;
});

video.addEventListener('seeked', () => {
    isSeeking = false;
});

// Preload the video with better buffering
video.preload = 'auto';
video.load();

// Linear interpolation function
function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

// Smooth video update loop with seeking protection
function smoothUpdate() {
    if (!videoLoaded) {
        animationFrameId = requestAnimationFrame(smoothUpdate);
        return;
    }

    // Smoothly interpolate current time towards target time
    currentTime = lerp(currentTime, targetTime, smoothFactor);
    
    // Update video only if not currently seeking and there's a meaningful difference
    const timeDiff = Math.abs(video.currentTime - currentTime);
    
    if (!isSeeking && timeDiff > 0.016) { // ~1 frame at 60fps
        video.currentTime = currentTime;
    }
    
    animationFrameId = requestAnimationFrame(smoothUpdate);
}

function startSmoothUpdate() {
    if (!animationFrameId) {
        smoothUpdate();
    }
}

// Calculate target video time based on scroll
function updateTargetTime() {
    if (!videoLoaded) return;

    const scrollPosition = window.pageYOffset || window.scrollY;
    const spacerTop = scrollSpacer.offsetTop;
    const spacerHeight = scrollSpacer.offsetHeight;
    const containerBottom = heroContainer.offsetTop + heroContainer.offsetHeight;
    
    // Calculate how far through the spacer we've scrolled
    const scrollIntoSpacer = scrollPosition - spacerTop + window.innerHeight;
    
    // Calculate scroll percentage within the video section (0 to 1)
    const scrollPercentage = Math.min(Math.max(scrollIntoSpacer / (spacerHeight + window.innerHeight), 0), 1);
    
    // Map scroll to video time
    targetTime = scrollPercentage * videoDuration;
    
    // Update navbar width and title opacity based on video progress
    updateNavbarShrink(scrollPercentage);
    
    // Handle hero fade gradient when scrolling past video
    updateHeroFade();
    
    // Keep hero fixed until we scroll past the container
    if (scrollPosition + window.innerHeight >= containerBottom) {
        heroSection.style.position = 'absolute';
        heroSection.style.top = (containerBottom - window.innerHeight) + 'px';
    } else {
        heroSection.style.position = 'fixed';
        heroSection.style.top = '0';
    }
}

// Handle hero fade gradient when scrolling into about section
function updateHeroFade() {
    const scrollPosition = window.pageYOffset || window.scrollY;
    const spacerTop = scrollSpacer.offsetTop;
    const spacerHeight = scrollSpacer.offsetHeight;
    const videoSectionEnd = spacerTop + spacerHeight;
    
    // Start fading when we're near the end of video section
    const fadeStartPoint = videoSectionEnd - window.innerHeight * 0.3;
    
    if (scrollPosition > fadeStartPoint) {
        // Calculate fade progress (0 to 1)
        const fadeProgress = Math.min((scrollPosition - fadeStartPoint) / (window.innerHeight * 0.5), 1);
        heroFadeGradient.style.opacity = fadeProgress;
    } else {
        heroFadeGradient.style.opacity = '0';
    }
}

// Handle navbar shrinking based on scroll
function updateNavbarShrink(scrollPercentage) {
    const scrollPosition = window.pageYOffset || window.scrollY;
    const spacerTop = scrollSpacer.offsetTop;
    const spacerHeight = scrollSpacer.offsetHeight;
    
    // Only start shrinking after icons are visible and continue through video completion
    if (scrollPosition > startShrinkScroll) {
        // Calculate uniform shrink progress from startShrinkScroll to end of video
        const scrollRange = (spacerTop + spacerHeight) - startShrinkScroll;
        const scrollProgress = (scrollPosition - startShrinkScroll) / scrollRange;
        const shrinkProgress = Math.min(Math.max(scrollProgress, 0), 1);
        
        // Calculate navbar width (from 80vw to minNavbarWidthVw)
        const viewportWidth = window.innerWidth;
        const startWidth = (maxNavbarWidth / 100) * viewportWidth; // Convert vw to px
        const minWidth = (minNavbarWidthVw / 100) * viewportWidth; // Convert vw to px
        const newWidth = startWidth - ((startWidth - minWidth) * shrinkProgress);
        const finalWidth = Math.max(newWidth, minWidth);
        
        navbar.style.width = `${finalWidth}px`;
        
        // Fade out both title text and hero text (from 1 to 0)
        const titleOpacity = Math.max(1 - (shrinkProgress * 4), 0);
        navbarTitle.style.opacity = titleOpacity;
        heroText.style.opacity = Math.max(1 - (shrinkProgress * 7), 0);
        
        // Hide title completely when fully faded
        if (titleOpacity === 0) {
            navbarTitle.style.display = 'none';
        } else {
            navbarTitle.style.display = 'block';
        }
    } else {
        // Reset to default width when scrolled back up
        navbar.style.width = `${maxNavbarWidth}vw`;
        navbarTitle.style.opacity = '1';
        navbarTitle.style.display = 'block';
        heroText.style.opacity = '1';
    }
}

// Scroll event handler
let ticking = false;

// Handle text animation on scroll
function handleTextAnimation() {
    const scrollPosition = window.pageYOffset || window.scrollY;
    
    if (!animationTriggered && scrollPosition > scrollThreshold) {
        // Trigger the animation
        animationTriggered = true;
        heroText.classList.add('animating');
        
        // Show navbar after text animation completes
        navbarTimeout = setTimeout(() => {
            // Only show navbar if animation is still triggered
            if (animationTriggered) {
                navbar.classList.add('visible');
            }
        }, 800); // Delay to sync with text animation (matches CSS transition)
    } else if (animationTriggered && scrollPosition <= scrollThreshold) {
        // Reset animation if scrolled back to top
        animationTriggered = false;
        heroText.classList.remove('animating');
        navbar.classList.remove('visible');
        navbarIcons.classList.remove('visible');
        iconsTriggered = false;
        
        // Clear the navbar timeout to prevent it from showing
        if (navbarTimeout) {
            clearTimeout(navbarTimeout);
            navbarTimeout = null;
        }
    }
    
    // Show icons on further scroll
    if (animationTriggered && !iconsTriggered && scrollPosition > iconsScrollThreshold) {
        iconsTriggered = true;
        navbarIcons.classList.add('visible');
    } else if (iconsTriggered && scrollPosition <= iconsScrollThreshold) {
        iconsTriggered = false;
        navbarIcons.classList.remove('visible');
        animationTriggered = false;
        heroText.classList.remove('animating');
        navbar.classList.remove('visible');
        
        // Clear the navbar timeout
        if (navbarTimeout) {
            clearTimeout(navbarTimeout);
            navbarTimeout = null;
        }
    }
}

// Handle About section scroll animations
function handleAboutAnimation() {
    const scrollPosition = window.pageYOffset || window.scrollY;
    const aboutTop = aboutSection.offsetTop;
    const aboutHeight = aboutSection.offsetHeight;
    const scrollIntoAbout = scrollPosition - aboutTop;
    
    // Only animate if we're in the about section
    if (scrollPosition >= aboutTop && scrollPosition < aboutTop + aboutHeight) {
        // Calculate animation progress (0 to 1 over full pinned range)
        const totalPinnedScroll = Math.max(aboutHeight - window.innerHeight, 1);
        const animationProgress = Math.min(Math.max(scrollIntoAbout / totalPinnedScroll, 0), 1);
        const animationDone = animationProgress >= 1;

        // Pin only while animation is running
        aboutContent.style.position = animationDone ? 'absolute' : 'fixed';
        aboutContent.style.top = animationDone ? `${aboutHeight - window.innerHeight}px` : '0';
        
        // Stage 1: Move from bottom-right to bottom-left (0 to 0.33)
        // Stage 2: Move from bottom-left up to top-left while shrinking (0.33 to 0.66)
        // Stage 3: Show description (0.66 to 1)
        
        if (animationProgress <= 0.33) {
            // Stage 1: Horizontal movement from bottom-right to bottom-left
            const stage1Progress = animationProgress / 0.33;

            aboutTitle.style.bottom = '5vh';
            aboutTitle.style.right = 'auto';
            aboutTitle.style.top = 'auto';
            const leftMargin = window.innerWidth * 0.05;
            const rightMargin = window.innerWidth * 0.05;
            const titleWidth = aboutTitle.offsetWidth;
            const startLeft = window.innerWidth - rightMargin - titleWidth;
            const maxShift = Math.max(startLeft - leftMargin, 0);
            const currentLeft = startLeft - (maxShift * stage1Progress);
            aboutTitle.style.left = `${currentLeft}px`;
            aboutTitle.style.transform = 'translateX(0)';
            
            aboutTitle.style.fontSize = '27vh';
            aboutDescription.style.opacity = '0';
            
        } else if (animationProgress <= 0.66) {
            // Stage 2: Vertical movement and shrinking
            const stage2Progress = (animationProgress - 0.33) / 0.33;
            const verticalPosition = 17 + (55 * stage2Progress); // From 5vh (bottom) to 90vh (bottom)
            const fontSize = 27 - (15 * stage2Progress); // From 20vh to 5vh
            
            aboutTitle.style.top = 'auto';
            aboutTitle.style.right = 'auto';
            aboutTitle.style.left = '5vw';
            aboutTitle.style.bottom = `${verticalPosition}vh`;
            aboutTitle.style.transform = 'translateX(0)';
            aboutTitle.style.fontSize = `${fontSize}vh`;
            aboutDescription.style.opacity = '0';
            
        } else {
            // Stage 3: Show description
            const stage3Progress = (animationProgress - 0.66) / 0.34;
            
            aboutTitle.style.bottom = 'auto';
            aboutTitle.style.right = 'auto';
            aboutTitle.style.left = '5vw';
            aboutTitle.style.top = '15vh';
            aboutTitle.style.transform = 'translateX(0)';
            aboutTitle.style.fontSize = '12vh';
            aboutDescription.style.opacity = '1';
            if (aboutDescriptionSpan && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                const fullWidth = aboutDescriptionSpan.offsetWidth * 20;
                const fillWidth = fullWidth * Math.min(stage3Progress, 1);
                aboutDescriptionSpan.style.backgroundSize = `${fillWidth}px 200%`;
                if (aboutHighlight) {
                    const parentRect = aboutDescriptionSpan.getBoundingClientRect();
                    const highlightRect = aboutHighlight.getBoundingClientRect();
                    const offsetX = Math.max(highlightRect.left - parentRect.left, 0);
                    aboutHighlight.style.backgroundSize = `${fillWidth}px 200%`;
                    aboutHighlight.style.backgroundPosition = `-${offsetX}px 0`;
                }
            }
            if (signatureLine) {
                const revealAt = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.35;
                signatureLine.classList.toggle('visible', stage3Progress >= revealAt);
            }
        }
        
    } else if (scrollPosition >= aboutTop + aboutHeight) {
        // Unpin when past the section
        aboutContent.style.position = 'absolute';
        aboutContent.style.top = `${aboutHeight - window.innerHeight}px`;
        aboutTitle.style.left = '5vw';
        aboutTitle.style.top = '5vh';
        aboutTitle.style.transform = 'translateX(0)';
        aboutTitle.style.fontSize = '5vh';
        aboutDescription.style.opacity = '1';
        if (aboutDescriptionSpan && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            const fullWidth = aboutDescriptionSpan.offsetWidth * 2;
            aboutDescriptionSpan.style.backgroundSize = `${fullWidth}px 200%`;
            if (aboutHighlight) {
                const parentRect = aboutDescriptionSpan.getBoundingClientRect();
                const highlightRect = aboutHighlight.getBoundingClientRect();
                const offsetX = Math.max(highlightRect.left - parentRect.left, 0);
                aboutHighlight.style.backgroundSize = `${fullWidth}px 200%`;
                aboutHighlight.style.backgroundPosition = `-${offsetX}px 0`;
            }
        }
        if (signatureLine) {
            signatureLine.classList.add('visible');
        }
    }
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            updateTargetTime();
            handleTextAnimation();
            handleAboutAnimation();
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true });

// Handle resize
window.addEventListener('resize', () => {
    // Recalculate viewport-based values
    scrollThreshold = window.innerHeight * 0.0463;
    iconsScrollThreshold = window.innerHeight * 0.1389;
    minNavbarWidth = window.innerWidth * 0.0365;
    updateTargetTime();
});

// Initial update
window.addEventListener('load', () => {
    if (videoLoaded) {
        updateTargetTime();
    }
});
