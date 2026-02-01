'use strict';

(function() {
	// Function to create typing effect
	function typeText(element, text, speed, callback) {
		if (!element || !text) return;
		
		element.textContent = '';
		let i = 0;
		let timeoutId = null;
		
		function type() {
			if (i < text.length) {
				element.textContent += text.charAt(i);
				i++;
				timeoutId = setTimeout(type, speed);
				activeTypingTimeouts.push(timeoutId);
			} else {
				if (callback) callback();
			}
		}
		
		type();
	}
	
	// Store active typing timeouts to clear them if needed
	let activeTypingTimeouts = [];
	let isTypingActive = false;
	let currentTypingSlide = null;
	
	// Function to clear all active typing timeouts
	function clearActiveTypingTimeouts() {
		activeTypingTimeouts.forEach(function(timeout) {
			clearTimeout(timeout);
		});
		activeTypingTimeouts = [];
		isTypingActive = false;
		currentTypingSlide = null;
	}
	
	// Function to restart typing animations for a slide
	function startTypingForSlide(heroItem) {
		if (!heroItem) return;
		
		// Prevent double typing - check if already typing this slide
		if (isTypingActive && currentTypingSlide === heroItem) {
			return;
		}
		
		// Clear any existing typing timeouts
		clearActiveTypingTimeouts();
		
		// Mark as active
		isTypingActive = true;
		currentTypingSlide = heroItem;
		
		// Check if this slide has typing text data attributes
		const h2 = heroItem.querySelector('h2[data-typing-text]');
		const p = heroItem.querySelector('p[data-typing-text]');
		const htCata = heroItem.querySelector('.ht-cata');
		const htBtn = heroItem.querySelector('.ht-btn');
		
		if (!h2) {
			isTypingActive = false;
			currentTypingSlide = null;
			return;
		}
		
		// Reset elements - clear text and hide
		if (h2) {
			h2.textContent = '';
		}
		if (p) {
			p.textContent = '';
		}
		
		// Ensure elements are hidden initially
		if (htCata) {
			htCata.style.opacity = '0';
			htCata.style.visibility = 'hidden';
			htCata.style.display = '';
		}
		if (htBtn) {
			htBtn.style.opacity = '0';
			htBtn.style.visibility = 'hidden';
			htBtn.style.display = '';
		}
		
		if (h2) {
			// Get text from data attribute
			const h2Text = h2.getAttribute('data-typing-text');
			
			// Start typing h2
			typeText(h2, h2Text, 100, function() {
				// After h2 finishes, start typing p
				if (p) {
					const pText = p.getAttribute('data-typing-text');
					if (pText) {
						const timeout1 = setTimeout(function() {
							typeText(p, pText, 50, function() {
								// After p finishes, show ht-cata and ht-btn
								const timeout2 = setTimeout(function() {
									if (htCata) {
										htCata.style.display = '';
										htCata.style.transition = 'opacity 0.5s ease, visibility 0.5s ease';
										// Force reflow
										htCata.offsetHeight;
										htCata.style.setProperty('opacity', '1', 'important');
										htCata.style.setProperty('visibility', 'visible', 'important');
									}
									if (htBtn) {
										htBtn.style.display = '';
										htBtn.style.transition = 'opacity 0.5s ease, visibility 0.5s ease';
										// Force reflow
										htBtn.offsetHeight;
										htBtn.style.setProperty('opacity', '1', 'important');
										htBtn.style.setProperty('visibility', 'visible', 'important');
									}
									// Mark typing as complete
									isTypingActive = false;
									currentTypingSlide = null;
								}, 300);
								activeTypingTimeouts.push(timeout2);
							});
						}, 300);
						activeTypingTimeouts.push(timeout1);
					} else {
						// If no p text, show elements after h2
						const timeout3 = setTimeout(function() {
							if (htCata) {
								htCata.style.display = '';
								htCata.style.transition = 'opacity 0.5s ease, visibility 0.5s ease';
								htCata.offsetHeight; // Force reflow
								htCata.style.setProperty('opacity', '1', 'important');
								htCata.style.setProperty('visibility', 'visible', 'important');
							}
							if (htBtn) {
								htBtn.style.display = '';
								htBtn.style.transition = 'opacity 0.5s ease, visibility 0.5s ease';
								htBtn.offsetHeight; // Force reflow
								htBtn.style.setProperty('opacity', '1', 'important');
								htBtn.style.setProperty('visibility', 'visible', 'important');
							}
							// Mark typing as complete
							isTypingActive = false;
							currentTypingSlide = null;
						}, 300);
						activeTypingTimeouts.push(timeout3);
					}
				} else {
					// If no p element, show elements after h2
					const timeout4 = setTimeout(function() {
						if (htCata) {
							htCata.style.display = '';
							htCata.style.transition = 'opacity 0.5s ease, visibility 0.5s ease';
							htCata.offsetHeight; // Force reflow
							htCata.style.setProperty('opacity', '1', 'important');
							htCata.style.setProperty('visibility', 'visible', 'important');
						}
						if (htBtn) {
							htBtn.style.display = '';
							htBtn.style.transition = 'opacity 0.5s ease, visibility 0.5s ease';
							htBtn.offsetHeight; // Force reflow
							htBtn.style.setProperty('opacity', '1', 'important');
							htBtn.style.setProperty('visibility', 'visible', 'important');
						}
						// Mark typing as complete
						isTypingActive = false;
						currentTypingSlide = null;
					}, 300);
					activeTypingTimeouts.push(timeout4);
				}
			});
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
				
				// Function to check if slide changed and start typing
				function checkSlideChange() {
					const activeItem = slider.find('.owl-item.active .hero-item');
					if (activeItem.length === 0) return;
					
					const currentIndex = activeItem.index();
					
					// Only proceed if index actually changed
					if (currentIndex !== lastActiveIndex && currentIndex >= 0) {
						lastActiveIndex = currentIndex;
						
						// Check if slide has typing effect - use both jQuery and vanilla JS
						const h2 = activeItem.find('h2[data-typing-text]');
						const h2Vanilla = activeItem[0] ? activeItem[0].querySelector('h2[data-typing-text]') : null;
						
						if (h2.length > 0 || h2Vanilla) {
							// Clear any existing typing first
							clearActiveTypingTimeouts();
							
							setTimeout(function() {
								// Use the DOM element directly
								const domElement = activeItem[0];
								if (domElement && !isTypingActive) {
									startTypingForSlide(domElement);
								}
							}, 400);
						}
					}
				}
				
				// Listen to slide changes - use only one event to prevent double triggering
				slider.on('changed.owl.carousel', function(event) {
					// Clear any active typing
					clearActiveTypingTimeouts();
					// Reset lastActiveIndex to force re-trigger
					lastActiveIndex = -1;
					setTimeout(checkSlideChange, 300);
				});
				
				// Remove translated event listener to prevent double triggering
				// The changed event is sufficient
				
				// Start typing for initial slide if it has typing effect
				setTimeout(function() {
					const initialActiveItem = slider.find('.owl-item.active .hero-item');
					if (initialActiveItem.length === 0) return;
					
					const h2 = initialActiveItem.find('h2[data-typing-text]');
					const h2Vanilla = initialActiveItem[0] ? initialActiveItem[0].querySelector('h2[data-typing-text]') : null;
					
					if (h2.length > 0 || h2Vanilla) {
						lastActiveIndex = slider.find('.owl-item.active').index();
						if (initialActiveItem[0]) {
							startTypingForSlide(initialActiveItem[0]);
						}
					}
				}, 1000);
			}, 1000);
		});
	}
	
	// Hide elements immediately on page load to prevent flash
	function hideTypingElements() {
		const typingSlides = document.querySelectorAll('.hero-text.typing-effect');
		typingSlides.forEach(function(slide) {
			const htCata = slide.querySelector('.ht-cata');
			const htBtn = slide.querySelector('.ht-btn');
			// Only hide if not already visible (don't override if typing is done)
			if (htCata && htCata.style.opacity !== '1') {
				htCata.style.opacity = '0';
				htCata.style.visibility = 'hidden';
			}
			if (htBtn && htBtn.style.opacity !== '1') {
				htBtn.style.opacity = '0';
				htBtn.style.visibility = 'hidden';
			}
		});
	}
	
	// Hide elements immediately
	hideTypingElements();
	
	// Also hide on DOM ready (in case elements load later)
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', hideTypingElements);
	}
	
	// Start initialization
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();

