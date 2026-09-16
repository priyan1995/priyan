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
	let autoTimer = null;
	let isHovered = false;
	let autoDirection = 1;

	for (let i = 0; i < projects.length; i += 2) {
		sheets.push({
			front: projects[i],
			back: projects[i + 1] || null,
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

	sheets.forEach((sheet, index) => {
		const frontNum = index * 2 + 1;
		const backNum = index * 2 + 2;
		const page = document.createElement('div');
		page.className = 'book-page';
		page.dataset.index = String(index);
		page.style.zIndex = String(sheets.length - index);
		page.innerHTML =
			faceHTML(sheet.front, 'front', frontNum) +
			faceHTML(sheet.back, 'back', backNum);
		pagesEl.appendChild(page);
	});

	const pageNodes = Array.from(pagesEl.querySelectorAll('.book-page'));
	const OPEN_DELAY_MS = 2000;
	const OPEN_MS = 700;
	let hasOpened = false;

	function restack() {
		pageNodes.forEach((node, index) => {
			if (node.classList.contains('is-flipped')) {
				node.style.zIndex = String(index + 1);
			} else {
				node.style.zIndex = String(sheets.length - index);
			}
		});
	}

	function updateState() {
		bookEl.classList.toggle('is-at-start', current <= 0);
		bookEl.classList.toggle('is-at-end', current >= pageNodes.length);
	}

	function flipNext() {
		if (!hasOpened || isAnimating || current >= pageNodes.length) return false;
		isAnimating = true;
		const page = pageNodes[current];
		page.classList.add('is-flipping', 'is-flipped');
		page.style.zIndex = String(sheets.length + current + 1);
		current += 1;
		updateState();
		window.setTimeout(() => {
			page.classList.remove('is-flipping');
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
		page.classList.add('is-flipping');
		page.classList.remove('is-flipped');
		page.style.zIndex = String(sheets.length + current + 1);
		updateState();
		window.setTimeout(() => {
			page.classList.remove('is-flipping');
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
		bookEl.classList.remove('is-closed');
		bookEl.classList.add('is-open');
		hasOpened = true;
		window.setTimeout(() => {
			startAutoFold();
		}, OPEN_MS);
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
	window.setTimeout(openBook, OPEN_DELAY_MS);
})();
