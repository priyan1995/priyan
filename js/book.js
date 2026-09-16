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
	const SHIFT_MS = 600;
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
				<img class="page-image" src="${project.image}" alt="${project.title}">
				<div class="page-meta">
					<span class="page-number">${pageNumber}</span>
					<a class="page-title" ${linkAttrs}>${project.title}</a>
					<span class="page-tech">${project.tech}</span>
					${credit}
				</div>
			</div>
		`;
	}

	const totalSheets = sheets.length + 1;

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

	const pageNodes = Array.from(pagesEl.querySelectorAll('.book-page'));

	function restack() {
		pageNodes.forEach((node, index) => {
			if (node.classList.contains('is-flipped')) {
				node.style.zIndex = String(index + 1);
			} else {
				node.style.zIndex = String(totalSheets - index);
			}
		});
	}

	function updateState() {
		bookEl.classList.toggle('is-at-start', current <= 0);
		bookEl.classList.toggle('is-at-end', current >= pageNodes.length);
		bookEl.classList.toggle('is-cover-open', current > 0);
	}

	function flipNext() {
		if (!hasOpened || isAnimating || current >= pageNodes.length) return false;
		isAnimating = true;
		const page = pageNodes[current];
		const isCoverFlip = page.classList.contains('book-page--cover');
		if (isCoverFlip) {
			bookEl.classList.add('is-opening');
		}
		page.classList.add('is-flipping', 'is-flipped');
		page.style.zIndex = String(totalSheets + current + 1);
		current += 1;
		updateState();
		window.setTimeout(() => {
			page.classList.remove('is-flipping');
			if (isCoverFlip) {
				bookEl.classList.remove('is-opening');
			}
			restack();
			isAnimating = false;
			updateState();
		}, FLIP_MS);
		return true;
	}

	function flipPrev() {
		if (!hasOpened || isAnimating || current <= 0) return false;
		isAnimating = true;
		current -= 1;
		const page = pageNodes[current];
		const isCoverFlip = page.classList.contains('book-page--cover');
		if (isCoverFlip) {
			bookEl.classList.add('is-opening');
		}
		page.classList.add('is-flipping');
		page.classList.remove('is-flipped');
		page.style.zIndex = String(totalSheets + current + 1);
		updateState();
		window.setTimeout(() => {
			page.classList.remove('is-flipping');
			if (isCoverFlip) {
				bookEl.classList.remove('is-opening');
			}
			restack();
			isAnimating = false;
			updateState();
		}, FLIP_MS);
		return true;
	}

	function autoStep() {
		if (!hasOpened || isHovered || isAnimating) return;

		if (autoDirection === 1) {
			if (current >= pageNodes.length) {
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
		if (!hasOpened || isHovered) return;
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

		// Slide the complete closed book to the spine position (no empty left page)
		bookEl.classList.add('is-shifting');

		window.setTimeout(() => {
			// Expand and fold the cover together — 1st project lands on the left
			bookEl.classList.remove('is-closed', 'is-shifting');
			bookEl.classList.add('is-open');
			flipNext();

			window.setTimeout(() => {
				startAutoFold();
			}, FLIP_MS);
		}, SHIFT_MS);
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

		const face = event.target.closest('.page-face');
		if (!face || face.classList.contains('page-face--blank')) return;

		if (face.classList.contains('page-face--front')) {
			flipNext();
			return;
		}

		if (face.classList.contains('page-face--back')) {
			flipPrev();
		}
	});

	bookEl.addEventListener('mouseenter', () => {
		isHovered = true;
		stopAutoFold();
	});

	bookEl.addEventListener('mouseleave', () => {
		isHovered = false;
		startAutoFold();
	});

	bookEl.classList.add('is-closed');
	updateState();
})();
