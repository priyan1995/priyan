/**
 * Custom Cursor - raindrop cursor with droplet trail
 * Hides default cursor, shows custom raindrop, spawns trail on move.
 * Respects prefers-reduced-motion and touch devices.
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
	var cursorX = 0;
	var cursorY = 0;
	var rafId = null;
	var lerpFactor = 0.2;
	var lastTrailTime = 0;
	var trailThrottle = 40;
	var dropletContainer = null;
	var cursorEl = null;
	var hasMoved = false;

	function lerp(a, b, t) {
		return a + (b - a) * t;
	}

	function createCursorElement() {
		if (cursorEl) return cursorEl;
		cursorEl = document.createElement('div');
		cursorEl.className = 'custom-cursor';
		cursorEl.setAttribute('aria-hidden', 'true');
		document.body.appendChild(cursorEl);
		return cursorEl;
	}

	function createDropletContainer() {
		if (dropletContainer) return dropletContainer;
		dropletContainer = document.createElement('div');
		dropletContainer.className = 'custom-cursor-trail';
		dropletContainer.setAttribute('aria-hidden', 'true');
		document.body.appendChild(dropletContainer);
		return dropletContainer;
	}

	function spawnDroplet(x, y) {
		if (!dropletContainer || !isEnabled()) return;
		var drop = document.createElement('div');
		drop.className = 'cursor-droplet';
		drop.style.left = x + 'px';
		drop.style.top = y + 'px';
		dropletContainer.appendChild(drop);
		requestAnimationFrame(function () {
			drop.classList.add('cursor-droplet-visible');
		});
		setTimeout(function () {
			drop.classList.add('cursor-droplet-gone');
			setTimeout(function () {
				if (drop.parentNode) drop.parentNode.removeChild(drop);
			}, 400);
		}, 1200);
	}

	function tick() {
		if (!isEnabled()) return;
		cursorX = lerp(cursorX, mouseX, lerpFactor);
		cursorY = lerp(cursorY, mouseY, lerpFactor);
		if (cursorEl) {
			cursorEl.style.transform = 'translate(' + cursorX + 'px, ' + cursorY + 'px)';
		}
		rafId = requestAnimationFrame(tick);
	}

	function onMouseMove(e) {
		mouseX = e.clientX;
		mouseY = e.clientY;
		if (!hasMoved) {
			hasMoved = true;
			cursorX = mouseX;
			cursorY = mouseY;
			if (cursorEl) cursorEl.classList.add('custom-cursor-visible');
		}
		var now = Date.now();
		if (now - lastTrailTime >= trailThrottle && isEnabled() && dropletContainer) {
			lastTrailTime = now;
			spawnDroplet(e.clientX, e.clientY);
		}
	}

	function applyCursorNone() {
		document.documentElement.classList.add('custom-cursor-active');
	}

	function removeCursorNone() {
		document.documentElement.classList.remove('custom-cursor-active');
	}

	function init() {
		if (!isEnabled()) {
			if (typeof console !== 'undefined' && console.log) {
				console.log('[CustomCursor] Disabled: prefers-reduced-motion or touch device');
			}
			return;
		}
		createCursorElement();
		createDropletContainer();
		applyCursorNone();
		cursorX = mouseX = window.innerWidth / 2;
		cursorY = mouseY = window.innerHeight / 2;
		window.addEventListener('mousemove', onMouseMove, { passive: true });
		rafId = requestAnimationFrame(tick);
		if (typeof console !== 'undefined' && console.log) {
			console.log('[CustomCursor] Initialized - raindrop cursor + trail active');
		}
	}

	function destroy() {
		removeCursorNone();
		window.removeEventListener('mousemove', onMouseMove);
		if (rafId) cancelAnimationFrame(rafId);
		rafId = null;
		if (cursorEl && cursorEl.parentNode) cursorEl.parentNode.removeChild(cursorEl);
		cursorEl = null;
		if (dropletContainer && dropletContainer.parentNode) {
			dropletContainer.innerHTML = '';
			dropletContainer.parentNode.removeChild(dropletContainer);
		}
		dropletContainer = null;
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}

	window.CustomCursor = { init: init, destroy: destroy, isEnabled: isEnabled };
})();
