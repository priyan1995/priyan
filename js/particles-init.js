'use strict';

// Initialize particles.js with very transparent settings
document.addEventListener('DOMContentLoaded', function() {
	if (typeof particlesJS !== 'undefined') {
		// Ensure particles container doesn't affect layout
		var particlesContainer = document.getElementById('particles-js');
		if (particlesContainer) {
			particlesContainer.style.position = 'fixed';
			particlesContainer.style.top = '0';
			particlesContainer.style.left = '0';
			particlesContainer.style.width = '100%';
			particlesContainer.style.height = '100%';
			particlesContainer.style.zIndex = '0';
			particlesContainer.style.margin = '0';
			particlesContainer.style.padding = '0';
		}
		
		particlesJS('particles-js', {
			particles: {
				number: {
					value: 50,
					density: {
						enable: true,
						value_area: 800
					}
				},
				color: {
					value: '#ffffff'
				},
				shape: {
					type: 'circle',
					stroke: {
						width: 0,
						color: '#000000'
					}
				},
				opacity: {
					value: 0.1,
					random: true,
					anim: {
						enable: true,
						speed: 1,
						opacity_min: 0.05,
						sync: false
					}
				},
				size: {
					value: 3,
					random: true,
					anim: {
						enable: true,
						speed: 2,
						size_min: 0.5,
						sync: false
					}
				},
				line_linked: {
					enable: true,
					distance: 150,
					color: '#ffffff',
					opacity: 0.08,
					width: 1
				},
				move: {
					enable: true,
					speed: 1,
					direction: 'none',
					random: true,
					straight: false,
					out_mode: 'out',
					bounce: false,
					attract: {
						enable: false,
						rotateX: 600,
						rotateY: 1200
					}
				}
			},
			interactivity: {
				detect_on: 'canvas',
				events: {
					onhover: {
						enable: true,
						mode: 'grab'
					},
					onclick: {
						enable: false
					},
					resize: true
				},
				modes: {
					grab: {
						distance: 140,
						line_linked: {
							opacity: 0.15
						}
					},
					bubble: {
						distance: 400,
						size: 40,
						duration: 2,
						opacity: 0.1,
						speed: 3
					},
					repulse: {
						distance: 200,
						duration: 0.4
					},
					push: {
						particles_nb: 4
					},
					remove: {
						particles_nb: 2
					}
				}
			},
			retina_detect: true
		});
		
		// Ensure canvas is properly positioned after initialization
		setTimeout(function() {
			var canvas = particlesContainer ? particlesContainer.querySelector('canvas') : null;
			if (canvas) {
				canvas.style.position = 'fixed';
				canvas.style.top = '0';
				canvas.style.left = '0';
				canvas.style.zIndex = '0';
				canvas.style.pointerEvents = 'none';
				canvas.setAttribute('style', canvas.getAttribute('style') + ' pointer-events: none !important;');
			}
		}, 100);
		
		// Also ensure container doesn't block clicks
		if (particlesContainer) {
			particlesContainer.style.pointerEvents = 'none';
		}
	}
});

