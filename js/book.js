(function () {
	const bookEl = document.getElementById('portfolio-book');
	const pagesEl = document.getElementById('book-pages');
	if (!bookEl || !pagesEl || typeof data === 'undefined') return;

	const projects = data.projects.filter(Boolean);
	const sheets = [];
	let current = 0;
	let isAnimating = false;
	const FLIP_MS = 900;
	const AUTO_MS = 4000;
	const OPEN_DELAY_MS = 4000;
	let autoTimer = null;
	let isHovered = false;
	let autoDirection = 1;
	let hasOpened = false;

	const coverProject = projects[0] || null;
	const remainingProjects = projects.slice(1);

	for (let i = 0; i < remainingProjects.length; i += 2) {
		sheets.push({
			front: remainingProjects[i],
			back: remainingProjects[i + 1] || null,
		});
	}

	function faceHTML(project, side, pageNumber) {
		if (!project) {
			return `<div class="page-face page-face--${side} page-face--blank"></div>`;
		}

		const credit = project.companyCredit
			? `<span class="page-credit">${project.companyCredit}</span>`
			: '';
		const linkAttrs = project.link
			? `href="${project.link}" target="_blank" rel="noopener noreferrer"`
			: 'href="javascript:void(0)" aria-disabled="true"';

		return `
			<div class="page-face page-face--${side}">
				<img class="page-image" src="${project.image}" alt="${project.title}" draggable="false" loading="eager" decoding="sync" fetchpriority="high">
				<div class="page-meta">
					<span class="page-number">${pageNumber}</span>
					<a class="page-title" ${linkAttrs}>${project.title}</a>
					<span class="page-tech">${project.tech}</span>
					${credit}
				</div>
			</div>
		`;
	}

	// Warm image cache so mobile Safari doesn't flash white when a buried page is revealed
	projects.forEach((project) => {
		if (!project.image) return;
		const preload = new Image();
		preload.decoding = 'async';
		preload.src = project.image;
	});

	const totalSheets = sheets.length + 2; // cover + content sheets + end blank

	const coverPage = document.createElement('div');
	coverPage.className = 'book-page book-page--cover';
	coverPage.dataset.index = '0';
	coverPage.style.zIndex = String(totalSheets);
	coverPage.innerHTML = `
		<div class="page-face page-face--front page-face--cover">
			<h2 class="book-cover-title">Portfolio</h2>
		</div>
		${faceHTML(coverProject, 'back', 1)}
	`;
	pagesEl.appendChild(coverPage);

	sheets.forEach((sheet, index) => {
		const frontNum = index * 2 + 2;
		const backNum = index * 2 + 3;
		const page = document.createElement('div');
		page.className = 'book-page';
		page.dataset.index = String(index + 1);
		page.style.zIndex = String(totalSheets - (index + 1));
		page.innerHTML =
			faceHTML(sheet.front, 'front', frontNum) +
			faceHTML(sheet.back, 'back', backNum);
		pagesEl.appendChild(page);
	});

	// Final blank sheet so the last spread always has two bordered pages
	const endPage = document.createElement('div');
	endPage.className = 'book-page book-page--end';
	endPage.dataset.index = String(sheets.length + 1);
	endPage.style.zIndex = '1';
	endPage.innerHTML = `
		<div class="page-face page-face--front page-face--blank"></div>
		<div class="page-face page-face--back page-face--blank"></div>
	`;
	pagesEl.appendChild(endPage);

	const pageNodes = Array.from(pagesEl.querySelectorAll('.book-page'));
	const bookStage = bookEl.closest('.book-stage');
	const lastFlippableIndex = pageNodes.length - 1; // end blank stays on the right

	// Decode every sheet image up front so mobile reveal isn't a white paint
	pageNodes.forEach((page) => {
		page.querySelectorAll('.page-image').forEach((img) => {
			if (img.decode) {
				img.decode().catch(() => {});
			}
		});
	});

	function restack() {
		pageNodes.forEach((node, index) => {
			if (node.classList.contains('is-flipped')) {
				node.style.zIndex = String(index + 1);
			} else {
				node.style.zIndex = String(totalSheets - index);
			}
		});
	}

	function warmPageImages(page) {
		if (!page) return;
		page.querySelectorAll('.page-image').forEach((img) => {
			if (img.decode) {
				img.decode().catch(() => {});
			}
		});
	}

	// Keep the page that will sit on the right composited on mobile (avoids white flash)
	function setRightLive(page) {
		pageNodes.forEach((node) => node.classList.remove('is-right-live'));
		if (!page) return;
		page.classList.add('is-right-live');
		warmPageImages(page);
	}

	function updateState() {
		bookEl.classList.toggle('is-at-start', current <= 0);
		bookEl.classList.toggle('is-at-end', current >= lastFlippableIndex);
		bookEl.classList.toggle('is-cover-open', current > 0);
		if (bookStage) {
			bookStage.classList.toggle('is-decoration-visible', current > 0);
		}
	}

	function flipNext() {
		if (!hasOpened || isAnimating || current >= lastFlippableIndex) return false;
		isAnimating = true;
		bookEl.classList.add('is-animating');
		const page = pageNodes[current];
		const nextRight = pageNodes[current + 1];
		const isCoverFlip = page.classList.contains('book-page--cover');
		if (isCoverFlip) {
			bookEl.classList.add('is-opening');
		}
		setRightLive(nextRight);
		page.classList.add('is-flipping', 'is-flipped');
		page.style.zIndex = String(totalSheets + current + 1);
		current += 1;
		updateState();
		window.setTimeout(() => {
			restack();
			setRightLive(pageNodes[current]);
			page.classList.remove('is-flipping');
			if (isCoverFlip) {
				bookEl.classList.remove('is-opening');
			}
			// Let Safari commit the new stack before unlocking overlays (reduces blink)
			window.requestAnimationFrame(() => {
				isAnimating = false;
				bookEl.classList.remove('is-animating');
				updateState();
			});
		}, FLIP_MS);
		return true;
	}

	function flipPrev() {
		if (!hasOpened || isAnimating || current <= 0) return false;
		isAnimating = true;
		bookEl.classList.add('is-animating');
		current -= 1;
		const page = pageNodes[current];
		const isCoverFlip = page.classList.contains('book-page--cover');
		if (isCoverFlip) {
			bookEl.classList.add('is-opening');
		}
		// This sheet's front becomes the right page — warm it before it rotates in
		setRightLive(page);
		page.classList.add('is-flipping');
		page.classList.remove('is-flipped');
		page.style.zIndex = String(totalSheets + current + 1);
		updateState();
		window.setTimeout(() => {
			restack();
			setRightLive(pageNodes[current]);
			page.classList.remove('is-flipping');
			if (isCoverFlip) {
				bookEl.classList.remove('is-opening');
			}
			window.requestAnimationFrame(() => {
				isAnimating = false;
				bookEl.classList.remove('is-animating');
				updateState();
			});
		}, FLIP_MS);
		return true;
	}

	function autoStep() {
		// Touch devices synthesize sticky mouseenter without mouseleave — never gate on hover there
		if (!hasOpened || isAnimating || (isHovered && !isTouchBookUi())) return;

		if (autoDirection === 1) {
			if (current >= lastFlippableIndex) {
				autoDirection = -1;
				flipPrev();
			} else {
				flipNext();
			}
			return;
		}

		if (current <= 0) {
			autoDirection = 1;
			flipNext();
		} else {
			flipPrev();
		}
	}

	function startAutoFold() {
		stopAutoFold();
		if (!hasOpened) return;
		if (isHovered && !isTouchBookUi()) return;
		autoTimer = window.setInterval(autoStep, AUTO_MS);
	}

	function stopAutoFold() {
		if (autoTimer) {
			window.clearInterval(autoTimer);
			autoTimer = null;
		}
	}

	function openBook() {
		if (hasOpened) return;
		hasOpened = true;

		// Clip left side before expanding so under-pages/shadow never flash
		bookEl.classList.add('is-opening');
		bookEl.classList.remove('is-closed');
		bookEl.classList.add('is-open');
		flipNext();

		window.setTimeout(() => {
			startAutoFold();
		}, FLIP_MS);
	}

	function isTouchBookUi() {
		return window.matchMedia('(hover: none), (pointer: coarse)').matches;
	}

	pagesEl.addEventListener('click', (event) => {
		const title = event.target.closest('.page-title');
		if (title) {
			event.stopPropagation();
			if (title.getAttribute('aria-disabled') === 'true') {
				event.preventDefault();
			}
			return;
		}

		if (!hasOpened) {
			openBook();
			return;
		}

		// Mobile Safari often hit-tests the untransformed page box (right half only),
		// so left-side taps miss the flipped face — use X position instead.
		if (isTouchBookUi()) {
			const rect = bookEl.getBoundingClientRect();
			if (event.clientX < rect.left + rect.width / 2) {
				flipPrev();
			} else {
				flipNext();
			}
			// Keep autofold alive after taps (touch hover would otherwise leave it stopped)
			startAutoFold();
			return;
		}

		const face = event.target.closest('.page-face');
		if (!face) return;

		// Blank right page stays put; blank left page can fold back
		if (face.classList.contains('page-face--blank')) {
			if (face.classList.contains('page-face--back')) {
				flipPrev();
			}
			return;
		}

		if (face.classList.contains('page-face--front')) {
			flipNext();
			return;
		}

		if (face.classList.contains('page-face--back')) {
			flipPrev();
		}
	});

	// Desktop only — mobile sticky :hover / synthetic mouseenter permanently stops autofold
	bookEl.addEventListener('mouseenter', () => {
		if (isTouchBookUi()) return;
		isHovered = true;
		stopAutoFold();
	});

	bookEl.addEventListener('mouseleave', () => {
		if (isTouchBookUi()) return;
		isHovered = false;
		startAutoFold();
	});

	bookEl.classList.add('is-closed');
	updateState();
	window.setTimeout(openBook, OPEN_DELAY_MS);
})();
