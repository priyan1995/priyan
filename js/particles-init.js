'use strict';

// Initialize particles.js with very transparent settings
document.addEventListener('DOMContentLoaded', function() {
	if (typeof particlesJS !== 'undefined') {
		var particlesContainer = document.getElementById('particles-js');
		if (!particlesContainer) return;

		var isBookCover = !!particlesContainer.closest('.page-face--cover');

		if (isBookCover) {
			particlesContainer.style.position = 'absolute';
			particlesContainer.style.top = '0';
			particlesContainer.style.left = '0';
			particlesContainer.style.width = '100%';
			particlesContainer.style.height = '100%';
			particlesContainer.style.zIndex = '0';
			particlesContainer.style.margin = '0';
			particlesContainer.style.padding = '0';
			particlesContainer.style.overflow = 'hidden';
			particlesContainer.style.pointerEvents = 'none';
		} else {
			particlesContainer.style.position = 'fixed';
			particlesContainer.style.top = '0';
			particlesContainer.style.left = '0';
			particlesContainer.style.width = '100%';
			particlesContainer.style.height = '100%';
			particlesContainer.style.zIndex = '0';
			particlesContainer.style.margin = '0';
			particlesContainer.style.padding = '0';
			particlesContainer.style.pointerEvents = 'none';
		}

		particlesJS('particles-js', {
			particles: {
				number: {
					value: isBookCover ? 35 : 50,
					density: {
						enable: true,
						value_area: isBookCover ? 500 : 800
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
					value: isBookCover ? 0.35 : 0.1,
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
					distance: 120,
					color: '#ffffff',
					opacity: isBookCover ? 0.25 : 0.08,
					width: 1
				},
				move: {
					enable: true,
					speed: 1,
					direction: 'none',
					random: true,
					straight: false,
					out_mode: 'bounce',
					bounce: true,
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
						enable: false,
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

		setTimeout(function() {
			var canvas = particlesContainer.querySelector('canvas');
			if (!canvas) return;

			if (isBookCover) {
				canvas.style.position = 'absolute';
				canvas.style.top = '0';
				canvas.style.left = '0';
				canvas.style.width = '100%';
				canvas.style.height = '100%';
				canvas.style.zIndex = '0';
				canvas.style.pointerEvents = 'none';
				canvas.style.maxWidth = '100%';
				canvas.style.maxHeight = '100%';
			} else {
				canvas.style.position = 'fixed';
				canvas.style.top = '0';
				canvas.style.left = '0';
				canvas.style.zIndex = '0';
				canvas.style.pointerEvents = 'none';
				canvas.setAttribute('style', canvas.getAttribute('style') + ' pointer-events: none !important;');
			}
		}, 100);
	}
});
