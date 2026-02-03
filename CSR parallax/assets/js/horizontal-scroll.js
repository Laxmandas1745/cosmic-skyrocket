/**
 * Horizontal Scroll Implementation
 * Based on the Horizontal Scroll Guide
 */

// Calculate the dynamic height needed for the outer container
function calcDynamicHeight(objectWidth) {
  const vw = window.innerWidth;   // Viewport width
  const vh = window.innerHeight;  // Viewport height
  return objectWidth - vw + vh + 150; // 150 = buffer space for smooth scrolling
}

// Set the height of the tall outer container
function handleDynamicHeight(objectRef, tallOuterContainer) {
  const objectWidth = objectRef.scrollWidth; // Total width of horizontal content
  const dynamicHeight = calcDynamicHeight(objectWidth);
  tallOuterContainer.style.height = `${dynamicHeight}px`;
}

// Apply scroll listener to translate content horizontally
function applyScrollListener(containerRef, objectRef) {
  const scrollIndicator = document.getElementById("scrollIndicator");
  let hasScrolled = false;

  window.addEventListener("scroll", () => {
    const offsetTop = -containerRef.offsetTop;
    objectRef.style.transform = `translateX(${offsetTop}px)`;

    // Hide scroll indicator after user starts scrolling
    if (!hasScrolled && offsetTop < -50 && scrollIndicator) {
      scrollIndicator.classList.add("hide");
      hasScrolled = true;
    }

    // Show indicator again if user scrolls back to top
    if (offsetTop > -10 && scrollIndicator) {
      scrollIndicator.classList.remove("hide");
      hasScrolled = false;
    }
  });
}

// Handle window resize
function handleResize(objectRef, tallOuterContainer) {
  handleDynamicHeight(objectRef, tallOuterContainer);
}

// Initialize horizontal scroll
function initHorizontalScroll() {
  // Get DOM elements
  const tallOuterContainer = document.getElementById("tallOuterContainer");
  const stickyContainer = document.getElementById("stickyContainer");
  const horizontalContainer = document.getElementById("horizontalContainer");

  // Check if elements exist
  if (!tallOuterContainer || !stickyContainer || !horizontalContainer) {
    console.warn("Horizontal scroll elements not found");
    return;
  }

  // Set initial height
  handleDynamicHeight(horizontalContainer, tallOuterContainer);

  // Apply scroll translation
  applyScrollListener(stickyContainer, horizontalContainer);

  // Handle window resize with debounce
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      handleResize(horizontalContainer, tallOuterContainer);
    }, 150);
  });
}

// Initialize on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHorizontalScroll);
} else {
  initHorizontalScroll();
}
