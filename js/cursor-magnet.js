/**
 * Cursor Magnet - interactive elements subtly move toward cursor
 * Uses transform only, RAF-based, respects prefers-reduced-motion and touch.
 */
'use strict';

(function () {
	function prefersReducedMotion() {
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	function isTouchDevice() {
		return window.matchMedia('(pointer: coarse)').matches;
	}

	function isEnabled() {
		return !prefersReducedMotion() && !isTouchDevice();
	}

	var mouseX = 0;
	var mouseY = 0;
	var elements = [];
	var rafId = null;
	var lerpFactor = 0.18;
	var maxMovement = 16;
	var attractionRadius = 150;

	var SELECTORS = [
		'button',
		'a.ht-btn',
		'.pd-card',
		'.gallery-item',
		'.cursor-magnet',
		'.main-menu a',
		'.menu-switch',
		'.footer-social a'
	].join(', ');

	function getElements() {
		var list = [];
		var nodes = document.querySelectorAll(SELECTORS);
		for (var i = 0; i < nodes.length; i++) {
			var el = nodes[i];
			if (el.closest && el.closest('.ai-text')) continue;
			list.push({
				el: el,
				offsetX: 0,
				offsetY: 0
			});
		}
		return list;
	}

	function lerp(a, b, t) {
		return a + (b - a) * t;
	}

	function tick() {
		if (!isEnabled()) return;
		var updated = false;
		for (var i = 0; i < elements.length; i++) {
			var item = elements[i];
			var el = item.el;
			var rect = el.getBoundingClientRect();
			var centerX = rect.left + rect.width / 2;
			var centerY = rect.top + rect.height / 2;
			var dx = mouseX - centerX;
			var dy = mouseY - centerY;
			var dist = Math.sqrt(dx * dx + dy * dy);
			if (dist > attractionRadius || dist < 1) {
				var targetX = 0;
				var targetY = 0;
			} else {
				var strength = 1 - dist / attractionRadius;
				var move = Math.min(maxMovement, dist * 0.25) * strength;
				var targetX = (dx / dist) * move;
				var targetY = (dy / dist) * move;
			}
			item.offsetX = lerp(item.offsetX, targetX, lerpFactor);
			item.offsetY = lerp(item.offsetY, targetY, lerpFactor);
			if (Math.abs(item.offsetX) > 0.1 || Math.abs(item.offsetY) > 0.1) {
				updated = true;
			}
			el.style.transform = 'translate(' + item.offsetX + 'px, ' + item.offsetY + 'px)';
		}
		if (updated || elements.some(function (it) {
			return Math.abs(it.offsetX) > 0.1 || Math.abs(it.offsetY) > 0.1;
		})) {
			rafId = requestAnimationFrame(tick);
		}
	}

	function onMouseMove(e) {
		mouseX = e.clientX;
		mouseY = e.clientY;
		if (rafId === null && isEnabled() && elements.length) {
			rafId = requestAnimationFrame(tick);
		}
	}

	function init() {
		if (!isEnabled()) return;
		elements = getElements();
		window.addEventListener('mousemove', onMouseMove, { passive: true });
		window.addEventListener('resize', function () {
			elements = getElements();
		});
		if (elements.length && (mouseX || mouseY)) {
			rafId = requestAnimationFrame(tick);
		}
	}

	function destroy() {
		window.removeEventListener('mousemove', onMouseMove);
		if (rafId) cancelAnimationFrame(rafId);
		rafId = null;
		for (var i = 0; i < elements.length; i++) {
			if (elements[i] && elements[i].el) elements[i].el.style.transform = '';
		}
		elements = [];
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}

	window.CursorMagnet = { init: init, destroy: destroy, isEnabled: isEnabled };
})();
