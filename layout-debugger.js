/**
 * RESPONSIVE LAYOUT DEBUGGER
 * 
 * Add this script temporarily to your site to identify
 * elements that might break at different zoom levels.
 * 
 * Usage: 
 * 1. Add <script src="layout-debugger.js"></script> before </body>
 * 2. Open DevTools Console
 * 3. See report of potential issues
 * 4. Press 'D' key to toggle debug overlays
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        checkOnLoad: true,
        showOverlays: false,
        highlightColor: 'rgba(255, 0, 0, 0.3)',
        warningColor: 'rgba(255, 165, 0, 0.3)'
    };
    
    // Issues tracker
    const issues = {
        vhVwUnits: [],
        noMaxWidth: [],
        fixedPxFonts: [],
        wideContainers: [],
        overflowX: []
    };
    
    /**
     * Find all elements using vh/vw units
     */
    function findVhVwUnits() {
        console.log('🔍 Checking for vh/vw units...');
        const allElements = document.querySelectorAll('*');
        
        allElements.forEach(el => {
            const styles = window.getComputedStyle(el);
            const inlineStyle = el.getAttribute('style') || '';
            
            // Check for vh/vw in inline styles
            if (inlineStyle.match(/\d+(vh|vw)/)) {
                issues.vhVwUnits.push({
                    element: el,
                    selector: getSelector(el),
                    reason: 'Uses vh/vw in inline styles'
                });
            }
        });
        
        // Check stylesheets
        for (let sheet of document.styleSheets) {
            try {
                for (let rule of sheet.cssRules || sheet.rules || []) {
                    if (rule.cssText && rule.cssText.match(/\d+(vh|vw)/) && !rule.cssText.match(/clamp\(/)) {
                        console.warn('⚠️ Found vh/vw without clamp():', rule.cssText.substring(0, 100));
                    }
                }
            } catch (e) {
                // Cross-origin stylesheet, skip
            }
        }
    }
    
    /**
     * Find elements without max-width that are very wide
     */
    function findWideElements() {
        console.log('🔍 Checking for overly wide elements...');
        const allElements = document.querySelectorAll('*');
        
        allElements.forEach(el => {
            const styles = window.getComputedStyle(el);
            const width = el.offsetWidth;
            const maxWidth = styles.maxWidth;
            
            if (width > window.innerWidth && maxWidth === 'none') {
                issues.wideContainers.push({
                    element: el,
                    selector: getSelector(el),
                    width: width,
                    reason: 'Wider than viewport with no max-width'
                });
            }
        });
    }
    
    /**
     * Find elements causing horizontal overflow
     */
    function findOverflowX() {
        console.log('🔍 Checking for horizontal overflow...');
        const bodyWidth = document.body.scrollWidth;
        const viewportWidth = window.innerWidth;
        
        if (bodyWidth > viewportWidth) {
            console.warn('⚠️ Page has horizontal overflow:', bodyWidth - viewportWidth, 'px');
            issues.overflowX.push({
                overflow: bodyWidth - viewportWidth,
                reason: 'Page is wider than viewport'
            });
        }
    }
    
    /**
     * Find fixed pixel font sizes that might not scale
     */
    function findFixedFonts() {
        console.log('🔍 Checking for fixed pixel fonts...');
        const allElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button');
        
        allElements.forEach(el => {
            const styles = window.getComputedStyle(el);
            const fontSize = styles.fontSize;
            const inlineStyle = el.getAttribute('style') || '';
            
            // Check if font-size is set in pixels in inline style
            if (inlineStyle.match(/font-size:\s*\d+px/)) {
                const pxValue = parseInt(fontSize);
                if (pxValue > 14) { // Only flag larger text
                    issues.fixedPxFonts.push({
                        element: el,
                        selector: getSelector(el),
                        fontSize: fontSize,
                        reason: 'Large fixed pixel font size'
                    });
                }
            }
        });
    }
    
    /**
     * Get a CSS selector for an element
     */
    function getSelector(el) {
        if (el.id) return `#${el.id}`;
        if (el.className) return `.${el.className.split(' ')[0]}`;
        return el.tagName.toLowerCase();
    }
    
    /**
     * Create visual overlays for problem elements
     */
    function createOverlays() {
        // Remove existing overlays
        document.querySelectorAll('.layout-debug-overlay').forEach(el => el.remove());
        
        if (!CONFIG.showOverlays) return;
        
        // Add overlays for vh/vw elements
        issues.vhVwUnits.forEach(issue => {
            addOverlay(issue.element, CONFIG.highlightColor, 'vh/vw');
        });
        
        // Add overlays for wide containers
        issues.wideContainers.forEach(issue => {
            addOverlay(issue.element, CONFIG.warningColor, 'wide');
        });
        
        // Add overlays for fixed fonts
        issues.fixedPxFonts.forEach(issue => {
            addOverlay(issue.element, CONFIG.warningColor, 'fixed-px');
        });
    }
    
    /**
     * Add overlay to an element
     */
    function addOverlay(element, color, label) {
        const rect = element.getBoundingClientRect();
        const overlay = document.createElement('div');
        overlay.className = 'layout-debug-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: ${rect.top}px;
            left: ${rect.left}px;
            width: ${rect.width}px;
            height: ${rect.height}px;
            background: ${color};
            pointer-events: none;
            z-index: 999999;
            border: 2px solid ${color.replace('0.3', '1')};
            font-size: 12px;
            color: white;
            padding: 2px 5px;
        `;
        overlay.textContent = label;
        document.body.appendChild(overlay);
    }
    
    /**
     * Print report to console
     */
    function printReport() {
        console.log('═══════════════════════════════════════════');
        console.log('📊 RESPONSIVE LAYOUT ANALYSIS REPORT');
        console.log('═══════════════════════════════════════════\n');
        
        if (issues.vhVwUnits.length > 0) {
            console.log('⚠️ Found', issues.vhVwUnits.length, 'elements using vh/vw in inline styles:');
            issues.vhVwUnits.forEach(issue => {
                console.log('  -', issue.selector, ':', issue.reason);
            });
            console.log('');
        }
        
        if (issues.wideContainers.length > 0) {
            console.log('⚠️ Found', issues.wideContainers.length, 'wide containers without max-width:');
            issues.wideContainers.forEach(issue => {
                console.log('  -', issue.selector, ':', issue.width, 'px wide');
            });
            console.log('');
        }
        
        if (issues.fixedPxFonts.length > 0) {
            console.log('⚠️ Found', issues.fixedPxFonts.length, 'elements with fixed pixel fonts:');
            issues.fixedPxFonts.forEach(issue => {
                console.log('  -', issue.selector, ':', issue.fontSize);
            });
            console.log('');
        }
        
        if (issues.overflowX.length > 0) {
            console.log('⚠️ Horizontal overflow detected:');
            issues.overflowX.forEach(issue => {
                console.log('  -', issue.overflow, 'px overflow');
            });
            console.log('');
        }
        
        const totalIssues = issues.vhVwUnits.length + 
                           issues.wideContainers.length + 
                           issues.fixedPxFonts.length + 
                           issues.overflowX.length;
        
        if (totalIssues === 0) {
            console.log('✅ No major issues detected!');
        } else {
            console.log('📝 Total issues found:', totalIssues);
            console.log('\n💡 Tips:');
            console.log('  - Replace vh/vw with clamp()');
            console.log('  - Add max-width to wide containers');
            console.log('  - Use rem instead of px for fonts');
            console.log('  - Add overflow-x: hidden to body');
        }
        
        console.log('\n📍 Press "D" key to toggle visual overlays');
        console.log('═══════════════════════════════════════════\n');
    }
    
    /**
     * Run all checks
     */
    function runChecks() {
        // Clear previous issues
        Object.keys(issues).forEach(key => issues[key] = []);
        
        findVhVwUnits();
        findWideElements();
        findOverflowX();
        findFixedFonts();
        printReport();
        createOverlays();
    }
    
    /**
     * Toggle overlays with 'D' key
     */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'd' || e.key === 'D') {
            CONFIG.showOverlays = !CONFIG.showOverlays;
            console.log('🔍 Debug overlays:', CONFIG.showOverlays ? 'ON' : 'OFF');
            createOverlays();
        }
    });
    
    /**
     * Re-run checks on window resize
     */
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(runChecks, 500);
    });
    
    /**
     * Initialize on page load
     */
    if (CONFIG.checkOnLoad) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runChecks);
        } else {
            runChecks();
        }
    }
    
    // Expose API
    window.ResponsiveDebugger = {
        run: runChecks,
        toggleOverlays: () => {
            CONFIG.showOverlays = !CONFIG.showOverlays;
            createOverlays();
        },
        getIssues: () => issues
    };
    
})();
