export function slider_stage() {
    const slides = Array.from(document.querySelectorAll(".stages__item"));
    const prevBtn = document.querySelector(".stages__nav--prev");
    const nextBtn = document.querySelector(".stages__nav--next");
    const pagination = document.querySelector(".stages__pagination");
    const showSlide = 1;
    let currentIndex = 0;
    let dots = [];
    let isAnimating = false;
    const ANIM_MS = 400;
    function buildPagination() {
        if (!pagination) return;
        const pages = Math.ceil(slides.length / showSlide);
        pagination.innerHTML = "";
        dots = [];
        for (let i = 0; i < pages; i++) {
            const dot = document.createElement("div");
            dot.type = "div";
            dot.className = "stages__dot";
            pagination.appendChild(dot);
            dots.push(dot);
        }
    }
    function updateDots() {
        if (!dots.length) return;
        const page = Math.floor(currentIndex / showSlide);
        dots.forEach((d, i) => d.classList.toggle("is-active", i === page));
    }
    function updateButtons() {
        const maxIndex = slides.length - showSlide;
        prevBtn?.classList.toggle("is-disabled", currentIndex <= 0);
        nextBtn?.classList.toggle("is-disabled", currentIndex >= maxIndex);
    }
    function clampIndex(i) {
        const max = slides.length - showSlide;
        return Math.max(0, Math.min(i, max));
    }
    function cleanAll() {
        slides.forEach(s => {
            s.classList.remove("is-active", "is-prev", "is-next");
            s.style.zIndex = "";
        });
    }
    function hardSanitizeActive(activeIndex) {
        slides.forEach((s, i) => {
            s.classList.remove("is-active", "is-prev", "is-next");
            s.style.zIndex = "";
            if (i === activeIndex) {
                s.classList.add("is-active");
                s.style.zIndex = "2";
            }
        });
    }
    function applyClasses(newIndex, direction) {
        if (isAnimating) return;
        isAnimating = true;
        const oldSlide = slides[currentIndex];
        const newSlide = slides[newIndex];
        if (!oldSlide || !newSlide) {
            isAnimating = false;
            return;
        }
        slides.forEach(s => s.style.zIndex = "");
        oldSlide.classList.remove("is-active", "is-prev", "is-next");
        oldSlide.classList.add(direction === "next" ? "is-prev" : "is-next");
        oldSlide.style.zIndex = "1";
        newSlide.classList.remove("is-active", "is-prev", "is-next");
        newSlide.classList.add(direction === "next" ? "is-next" : "is-prev");
        newSlide.style.zIndex = "2";
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                newSlide.classList.remove("is-prev", "is-next");
                newSlide.classList.add("is-active");
            });
        });
        setTimeout(() => {
            hardSanitizeActive(newIndex);
            isAnimating = false;
        }, ANIM_MS + 40);
    }
    function goTo(index, direction = "next") {
        const newIndex = clampIndex(index);
        if (newIndex === currentIndex || isAnimating) return;
        if (window.innerWidth <= 768) applyClasses(newIndex, direction); else {
            cleanAll();
            slides.forEach(s => s.classList.add("is-active"));
        }
        currentIndex = newIndex;
        updateButtons();
        updateDots();
        updateActiveBlocks();
    }
    prevBtn?.addEventListener("click", () => {
        if (isAnimating) return;
        goTo(currentIndex - showSlide, "prev");
    });
    nextBtn?.addEventListener("click", () => {
        if (isAnimating) return;
        goTo(currentIndex + showSlide, "next");
    });
    function updateActiveBlocks() {
        const activeItems = document.querySelectorAll(".stages__item.is-active");
        activeItems.forEach(item => {
            const cards = item.querySelectorAll(".stages__card");
            cards.forEach((card, idx) => {
                card.classList.toggle("is-active", idx !== cards.length - 1);
                card.classList.toggle("is-active-last", idx === cards.length - 1);
            });
        });
    }
    function removeBr() {
        document.querySelectorAll(".stages__text").forEach(el => {
            el.querySelectorAll("br").forEach(br => br.remove());
        });
    }
    function saveOriginalHtml() {
        document.querySelectorAll(".stages__text").forEach(el => {
            el.dataset.originalHtml = el.innerHTML;
        });
    }
    function restoreBr() {
        document.querySelectorAll(".stages__text").forEach(el => {
            if (el.dataset.originalHtml) el.innerHTML = el.dataset.originalHtml;
        });
    }
    function checkWidth() {
        if (window.innerWidth > 991) restoreBr(); else removeBr();
        if (window.innerWidth > 768) {
            cleanAll();
            slides.forEach(s => s.classList.add("is-active"));
        } else {
            cleanAll();
            const current = slides[currentIndex] || slides[0];
            if (current) {
                current.classList.add("is-active");
                current.style.zIndex = "2";
            }
        }
        updateButtons();
        updateDots();
    }
    window.addEventListener("DOMContentLoaded", () => {
        saveOriginalHtml();
        buildPagination();
        checkWidth();
        updateDots();
    });
    window.addEventListener("resize", checkWidth);
}