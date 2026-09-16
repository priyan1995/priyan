(function () {
	const bookEl = document.getElementById('portfolio-book');
	const pagesEl = document.getElementById('book-pages');
	if (!bookEl || !pagesEl || typeof data === 'undefined') return;

	const projects = data.projects.filter(Boolean);
	const sheets = [];
	let current = 0;
	let isAnimating = false;
	const FLIP_MS = 900;

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
	const prevBtn = bookEl.querySelector('.book-hit--prev');
	const nextBtn = bookEl.querySelector('.book-hit--next');
	const AUTO_MS = 4000;
	let autoTimer = null;
	let isHovered = false;
	let autoDirection = 1;

	function restack() {
		pageNodes.forEach((node, index) => {
			if (node.classList.contains('is-flipped')) {
				node.style.zIndex = String(index + 1);
			} else {
				node.style.zIndex = String(sheets.length - index);
			}
		});
	}

	function updateHits() {
		if (prevBtn) prevBtn.disabled = current <= 0 || isAnimating;
		if (nextBtn) nextBtn.disabled = current >= pageNodes.length || isAnimating;
		bookEl.classList.toggle('is-at-start', current <= 0);
		bookEl.classList.toggle('is-at-end', current >= pageNodes.length);
	}

	function flipNext() {
		if (isAnimating || current >= pageNodes.length) return false;
		isAnimating = true;
		const page = pageNodes[current];
		page.classList.add('is-flipping', 'is-flipped');
		page.style.zIndex = String(sheets.length + current + 1);
		current += 1;
		updateHits();
		window.setTimeout(() => {
			page.classList.remove('is-flipping');
			restack();
			isAnimating = false;
			updateHits();
		}, FLIP_MS);
		return true;
	}

	function flipPrev() {
		if (isAnimating || current <= 0) return false;
		isAnimating = true;
		current -= 1;
		const page = pageNodes[current];
		page.classList.add('is-flipping');
		page.classList.remove('is-flipped');
		page.style.zIndex = String(sheets.length + current + 1);
		updateHits();
		window.setTimeout(() => {
			page.classList.remove('is-flipping');
			restack();
			isAnimating = false;
			updateHits();
		}, FLIP_MS);
		return true;
	}

	function autoStep() {
		if (isHovered || isAnimating) return;

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
		if (isHovered) return;
		autoTimer = window.setInterval(autoStep, AUTO_MS);
	}

	function stopAutoFold() {
		if (autoTimer) {
			window.clearInterval(autoTimer);
			autoTimer = null;
		}
	}

	if (nextBtn) nextBtn.addEventListener('click', flipNext);
	if (prevBtn) prevBtn.addEventListener('click', flipPrev);

	pagesEl.addEventListener('click', (event) => {
		const title = event.target.closest('.page-title');
		if (!title) return;
		event.stopPropagation();
		if (title.getAttribute('aria-disabled') === 'true') {
			event.preventDefault();
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

	updateHits();
	startAutoFold();
})();
