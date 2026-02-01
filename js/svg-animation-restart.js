'use strict';

(function () {
	// Function to restart SVG animation (for when user returns to a slide)
	function restartSVGAnimation(svgObject) {
		if (!svgObject) return;

		const dataSrc = svgObject.getAttribute('data') || svgObject.getAttribute('data-src');
		if (!dataSrc) return;

		try {
			const svgDoc = svgObject.contentDocument;
			if (svgDoc) {
				// Restart SMIL animations
				const animateElements = svgDoc.querySelectorAll('animate');
				animateElements.forEach(function (anim) {
					const parent = anim.parentElement;
					if (parent) {
						const fromValue = anim.getAttribute('from');
						if (fromValue && parent.hasAttribute('stroke-dashoffset')) {
							parent.setAttribute('stroke-dashoffset', fromValue);
						}
						const beginValue = anim.getAttribute('begin');
						anim.removeAttribute('begin');
						setTimeout(function () {
							if (beginValue) {
								anim.setAttribute('begin', beginValue);
							}
							anim.beginElement();
						}, 10);
					}
				});

				// Restart CSS animations
				const animatedElements = svgDoc.querySelectorAll('[class*="line"], [class*="cursor"]');
				animatedElements.forEach(function (el) {
					const classes = (el.className && el.className.baseVal) ? el.className.baseVal : (el.getAttribute('class') || '');
					el.removeAttribute('class');
					el.setAttribute('class', '');
					setTimeout(function () {
						el.setAttribute('class', classes);
					}, 10);
				});
				return;
			}
		} catch (e) {
			// Fall through to reload method
		}

		// Fallback: Reload the object
		const parent = svgObject.parentNode;
		if (!parent) return;

		const className = (svgObject.className && svgObject.className.baseVal) || svgObject.getAttribute('class') || '';
		const type = svgObject.getAttribute('type');
		const dataSrcAttr = svgObject.getAttribute('data-src') || dataSrc;

		const newObject = document.createElement('object');
		newObject.setAttribute('data-src', dataSrcAttr);
		newObject.setAttribute('type', type);
		newObject.className = className + ' hero-slide-svg';

		const timestamp = new Date().getTime();
		const separator = dataSrc.indexOf('?') === -1 ? '?' : '&';
		newObject.setAttribute('data', dataSrc + separator + 't=' + timestamp);

		parent.replaceChild(newObject, svgObject);

		newObject.addEventListener('load', function onLoad() {
			newObject.removeEventListener('load', onLoad);
			setTimeout(function () {
				try {
					const svgDoc = newObject.contentDocument;
					if (svgDoc) {
						const animateElements = svgDoc.querySelectorAll('animate');
						animateElements.forEach(function (anim) {
							const parentEl = anim.parentElement;
							if (parentEl) {
								const fromValue = anim.getAttribute('from');
								if (fromValue && parentEl.hasAttribute('stroke-dashoffset')) {
									parentEl.setAttribute('stroke-dashoffset', fromValue);
								}
								anim.beginElement();
							}
						});
					}
				} catch (e) { }
			}, 50);
		}, { once: true });
	}

	// Load SVG and trigger animation when slide becomes active (first time or return)
	function activateSlideSVG(heroItem) {
		if (!heroItem) return;

		const svgObjects = heroItem.querySelectorAll('.hero-slide-svg[data-src]');

		svgObjects.forEach(function (svgObject) {
			const dataSrc = svgObject.getAttribute('data-src');
			if (!dataSrc) return;

			const currentData = svgObject.getAttribute('data');

			if (!currentData) {
				// First time: load SVG - animation starts fresh on load
				svgObject.setAttribute('data', dataSrc);
				// No need to do anything else - SVG loads and animates automatically
			} else {
				// Returning to slide: restart animation from initial state
				restartSVGAnimation(svgObject);
			}
		});

		// Laptop canvas (if any)
		const laptopCanvas = heroItem.querySelector('#laptop-canvas');
		if (laptopCanvas && typeof window.restartLaptopAnimation === 'function') {
			setTimeout(function () {
				window.restartLaptopAnimation();
			}, 200);
		}
	}

	function init() {
		if (typeof jQuery === 'undefined') {
			setTimeout(init, 100);
			return;
		}

		jQuery(document).ready(function ($) {
			setTimeout(function () {
				const slider = $('.hero-slider');
				let lastActiveIndex = -1;

				function onSlideActivated() {
					setTimeout(function () {
						const activeItem = slider.find('.owl-item.active .hero-item');
						if (activeItem.length > 0) {
							activateSlideSVG(activeItem[0]);
						}
					}, 250);
				}

				function checkSlideChange() {
					const currentActive = slider.find('.owl-item.active');
					const currentIndex = currentActive.index();

					if (currentIndex !== lastActiveIndex && currentIndex >= 0) {
						lastActiveIndex = currentIndex;
						onSlideActivated();
					}
				}

				slider.on('changed.owl.carousel translated.owl.carousel translate.owl.carousel', function () {
					checkSlideChange();
				});

				slider.on('click', '.owl-nav button', function () {
					setTimeout(checkSlideChange, 400);
				});

				const observer = new MutationObserver(function (mutations) {
					mutations.forEach(function (mutation) {
						if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
							const target = mutation.target;
							if (target.classList && target.classList.contains('owl-item') && target.classList.contains('active')) {
								setTimeout(checkSlideChange, 200);
							}
						}
					});
				});

				const stage = slider.find('.owl-stage')[0];
				if (stage) {
					observer.observe(stage, {
						attributes: true,
						attributeFilter: ['class'],
						subtree: true,
						childList: false
					});
				}

				// Only load SVG for the initially active slide (no pre-loading of other slides)
				setTimeout(function () {
					lastActiveIndex = slider.find('.owl-item.active').index();
					const initialActiveItem = slider.find('.owl-item.active .hero-item');
					if (initialActiveItem.length > 0) {
						activateSlideSVG(initialActiveItem[0]);
					}
				}, 500);
			}, 1000);
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
