export function slider_tournament() {
    // Получаем нужные элементы
    const tournamentSlider = document.querySelector('.tournament__content-slider');
    const tournamentSlides = document.querySelectorAll('.tournament__slider-participants');
    const contentBlock = document.querySelector('.tournament__content-block');
    const content = document.querySelector('.tournament__content');

    // Проверяем наличие важных элементов
    if (!tournamentSlider || tournamentSlides.length === 0 || !contentBlock || !content) {
        console.warn('Slider elements not found');
        return;
    }

    let prevBtn = null;
    let nextBtn = null;
    let pagination = null;

    let currentIndex = 0;
    let showSlidesCount = 3;
    const gapPx = 21;

    let autoSlideInterval = null;

    function createControl() {
        let control = contentBlock.querySelector('.tournament-control') || content.querySelector('.tournament-control');
        if (!control) {
            control = document.createElement('div');
            control.classList.add('tournament-control');
            contentBlock.appendChild(control);
        }
        return control;
    }

    function moveControlContainer() {
        const control = document.querySelector('.tournament-control');
        if (!control) return;

        if (window.innerWidth <= 768) {
            if (control.parentNode !== content) {
                content.appendChild(control);
            }
        } else {
            if (control.parentNode !== contentBlock) {
                contentBlock.appendChild(control);
            }
        }
    }

    function createButtons() {
        if (prevBtn && nextBtn) return;
        const control = createControl();

        prevBtn = document.createElement('button');
        prevBtn.classList.add('tournament-nav', 'prev');
        prevBtn.innerHTML = `
      <svg width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.4618 1.53839L9.92334 9.99993L1.4618 18.4615" stroke="white" stroke-width="2" stroke-linecap="square" transform="rotate(180 6 10)"/>
      </svg>
    `;
        control.appendChild(prevBtn);

        nextBtn = document.createElement('button');
        nextBtn.classList.add('tournament-nav', 'next');
        nextBtn.innerHTML = `
      <svg width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.4618 1.53839L9.92334 9.99993L1.4618 18.4615" stroke="white" stroke-width="2" stroke-linecap="square"/>
      </svg>
    `;
        control.appendChild(nextBtn);

        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateSlider();
                resetAutoSlide();
            }
        });

        nextBtn.addEventListener('click', () => {
            if (currentIndex < tournamentSlides.length - showSlidesCount) {
                currentIndex++;
                updateSlider();
                resetAutoSlide();
            }
        });
    }

    function createPagination() {
        if (pagination) return;
        const control = createControl();
        pagination = document.createElement('div');
        pagination.classList.add('tournament-pagination');
        control.appendChild(pagination);
    }

    function updatePagination() {
        if (!pagination) return;

        const currentSlide = currentIndex + showSlidesCount;
        const maxSlide = tournamentSlides.length;

        pagination.innerHTML = `
      <span class="pagination-current${currentSlide >= maxSlide ? ' disabled' : ''}">${currentSlide}</span>
      <span class="pagination-slash${currentSlide >= maxSlide ? ' active' : ''}"> / </span>
      <span class="pagination-max${currentSlide >= maxSlide ? ' active' : ''}">${maxSlide}</span>
    `;
    }

    function updateButtons() {
        if (prevBtn) {
            prevBtn.disabled = currentIndex <= 0;
            prevBtn.classList.toggle('disabled', currentIndex <= 0);
        }
        if (nextBtn) {
            nextBtn.disabled = currentIndex >= tournamentSlides.length - showSlidesCount;
            nextBtn.classList.toggle('disabled', currentIndex >= tournamentSlides.length - showSlidesCount);
        }
    }

    function updateSlider() {
        if (tournamentSlides.length === 0) return;

        const slideWidth = tournamentSlides[0].offsetWidth;
        const totalShift = currentIndex * (slideWidth + gapPx);

        tournamentSlider.style.transform = `translateX(-${totalShift}px)`;

        tournamentSlides.forEach((slide, i) => {
            slide.classList.toggle('active', i >= currentIndex && i < currentIndex + showSlidesCount);
        });

        updateButtons();
        updatePagination();
    }

    function autoSlide() {
        if (currentIndex < tournamentSlides.length - showSlidesCount) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        updateSlider();
    }

    function startAutoSlide() {
        if (autoSlideInterval) return;
        autoSlideInterval = setInterval(autoSlide, 4000);
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
        startAutoSlide();
    }

    function calculateShowSlidesCount() {
        const width = window.innerWidth;
        if (width > 991) return 3;
        if (width > 768) return 2;
        return 1;
    }

    function onResize() {
        showSlidesCount = calculateShowSlidesCount();

        if (currentIndex > tournamentSlides.length - showSlidesCount) {
            currentIndex = tournamentSlides.length - showSlidesCount;
        }
        if (currentIndex < 0) currentIndex = 0;

        updateSlider();
        resetAutoSlide();
        moveControlContainer();
    }

    function init() {
        createButtons();
        createPagination();

        showSlidesCount = calculateShowSlidesCount();

        if (currentIndex > tournamentSlides.length - showSlidesCount) {
            currentIndex = tournamentSlides.length - showSlidesCount;
        }
        if (currentIndex < 0) currentIndex = 0;

        updateSlider();
        startAutoSlide();
        moveControlContainer();

        window.addEventListener('resize', debounce(onResize, 100));
    }

    // Утилита debounce для оптимизации события resize
    function debounce(fn, delay) {
        let timer = null;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}
