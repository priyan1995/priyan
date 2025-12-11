'use strict';

(function() {
	// Function to restart SVG animation by reloading the object
	function restartSVGAnimation(svgObject) {
		if (!svgObject) return;
		
		// Get the current data source
		const dataSrc = svgObject.getAttribute('data');
		if (!dataSrc) return;
		
		try {
			// Try to access the SVG document directly
			const svgDoc = svgObject.contentDocument;
			if (svgDoc) {
				// Get all animate elements
				const animateElements = svgDoc.querySelectorAll('animate');
				animateElements.forEach(function(anim) {
					// Get the parent element (circle, ellipse, etc.)
					const parent = anim.parentElement;
					if (parent) {
						// Get the initial stroke-dashoffset value from the 'from' attribute
						const fromValue = anim.getAttribute('from');
						if (fromValue && parent.hasAttribute('stroke-dashoffset')) {
							// Reset stroke-dashoffset to initial value
							parent.setAttribute('stroke-dashoffset', fromValue);
						}
						
						// Restart animation
						const beginValue = anim.getAttribute('begin');
						// Remove and re-add the begin attribute to force restart
						anim.removeAttribute('begin');
						setTimeout(function() {
							if (beginValue) {
								anim.setAttribute('begin', beginValue);
							}
							// Force restart by calling beginElement
							anim.beginElement();
						}, 10);
					}
				});
				
				// Also restart CSS animations by removing and re-adding classes
				const animatedElements = svgDoc.querySelectorAll('[class*="line"], [class*="cursor"]');
				animatedElements.forEach(function(el) {
					const classes = el.className.baseVal || el.className;
					el.className.baseVal = '';
					el.className = '';
					setTimeout(function() {
						el.className.baseVal = classes;
						el.className = classes;
					}, 10);
				});
				
				return;
			}
		} catch (e) {
			// Cross-origin or other error, fall back to reload method
			console.log('SVG direct access failed, using reload method:', e);
		}
		
		// Fallback: Reload the object element (most reliable for object tags)
		const parent = svgObject.parentNode;
		if (!parent) return;
		
		// Store attributes
		const className = svgObject.className;
		const type = svgObject.getAttribute('type');
		
		// Create a new object element
		const newObject = document.createElement('object');
		newObject.setAttribute('data', dataSrc);
		newObject.setAttribute('type', type);
		newObject.className = className;
		
		// Add cache-busting to force reload
		const timestamp = new Date().getTime();
		const separator = dataSrc.indexOf('?') === -1 ? '?' : '&';
		newObject.setAttribute('data', dataSrc + separator + 't=' + timestamp);
		
		// Replace the old object with the new one
		parent.replaceChild(newObject, svgObject);
		
		// After reload, try to ensure animations restart
		newObject.addEventListener('load', function onLoad() {
			newObject.removeEventListener('load', onLoad);
			setTimeout(function() {
				try {
					const svgDoc = newObject.contentDocument;
					if (svgDoc) {
						// Reset stroke-dashoffset and restart animations
						const animateElements = svgDoc.querySelectorAll('animate');
						animateElements.forEach(function(anim) {
							const parentEl = anim.parentElement;
							if (parentEl) {
								const fromValue = anim.getAttribute('from');
								if (fromValue && parentEl.hasAttribute('stroke-dashoffset')) {
									parentEl.setAttribute('stroke-dashoffset', fromValue);
								}
								// Force restart
								anim.beginElement();
							}
						});
					}
				} catch (e) {
					// Cross-origin issue - the reload should have restarted animations anyway
				}
			}, 50);
		}, { once: true });
	}
	
	// Function to restart animations for a specific slide
	function restartSlideAnimations(heroItem) {
		if (!heroItem) return;
		
		// Find all SVG objects in this slide
		const svgObjects = heroItem.querySelectorAll('object[type="image/svg+xml"]');
		
		svgObjects.forEach(function(svgObject) {
			restartSVGAnimation(svgObject);
		});
		
		// Check for laptop canvas and restart Three.js animation
		const laptopCanvas = heroItem.querySelector('#laptop-canvas');
		if (laptopCanvas && typeof window.restartLaptopAnimation === 'function') {
			// Small delay to ensure canvas is visible
			setTimeout(function() {
				window.restartLaptopAnimation();
			}, 200);
		}
	}
	
	// Initialize when DOM is ready
	function init() {
		if (typeof jQuery === 'undefined') {
			setTimeout(init, 100);
			return;
		}
		
		jQuery(document).ready(function($) {
			// Wait for slider to be initialized
			setTimeout(function() {
				const slider = $('.hero-slider');
				let lastActiveIndex = -1;
				
				// Function to restart animations for active slide
				function restartActiveSlideAnimations() {
					setTimeout(function() {
						const activeItem = slider.find('.owl-item.active .hero-item');
						if (activeItem.length > 0) {
							restartSlideAnimations(activeItem[0]);
						}
					}, 250); // Delay to ensure transition is complete
				}
				
				// Function to check if slide actually changed
				function checkSlideChange() {
					const currentActive = slider.find('.owl-item.active');
					const currentIndex = currentActive.index();
					
					if (currentIndex !== lastActiveIndex && currentIndex >= 0) {
						lastActiveIndex = currentIndex;
						restartActiveSlideAnimations();
					}
				}
				
				// Listen to multiple events to catch all slide changes
				slider.on('changed.owl.carousel translated.owl.carousel translate.owl.carousel', function(event) {
					checkSlideChange();
				});
				
				// Also listen to direct button clicks as fallback
				slider.on('click', '.owl-nav button', function() {
					setTimeout(function() {
						checkSlideChange();
					}, 400);
				});
				
				// Use MutationObserver to watch for active class changes
				const observer = new MutationObserver(function(mutations) {
					mutations.forEach(function(mutation) {
						if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
							const target = mutation.target;
							if (target.classList && target.classList.contains('owl-item') && target.classList.contains('active')) {
								setTimeout(function() {
									checkSlideChange();
								}, 200);
							}
						}
					});
				});
				
				// Observe the slider stage for class changes
				const stage = slider.find('.owl-stage')[0];
				if (stage) {
					observer.observe(stage, {
						attributes: true,
						attributeFilter: ['class'],
						subtree: true,
						childList: false
					});
				}
				
				// Also restart animation for initial slide
				setTimeout(function() {
					const initialActiveItem = slider.find('.owl-item.active .hero-item');
					if (initialActiveItem.length > 0) {
						lastActiveIndex = slider.find('.owl-item.active').index();
						restartSlideAnimations(initialActiveItem[0]);
					}
				}, 500);
			}, 1000);
		});
	}
	
	// Start initialization
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();

