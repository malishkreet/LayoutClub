export function running () {
    // Модуль работает
    const marquee = () => {
        /*
             Инструкция:
             Структура: вы можете указать любые элементы классов и тегов.
             <div data-marquee>
                 <span>element one</span>
                 <div>element two</div>
             </div>
             Дополнительные настройки (вы не можете указать):
             data-marquee-space='30' - Ссылка между элементами (по умолчанию 30px) -может быть указано в CSS с барами
             data-marquee-speed='1000' - Скорость анимации (по умолчанию 1000) Укажите в MS 1S = 1000
             data-marquee-pause-mouse-enter - Остановите анимацию при движении.
             data-marquee-direction='left' - Направление анимации "Верх, справа, внизу, слева" (по умолчанию слева)
             !Важно: при использовании data-marquee-direction 'top' Или 'bottom' должен быть фиксированная высота + overflow: hidden;
         */

        const $marqueeArray = document.querySelectorAll('[data-marquee]');
        const CLASS_NAMES = {
            wrapper: 'marquee-wrapper',
            inner: 'marquee-inner',
            item: 'marquee-item',
        };

        if (!$marqueeArray.length) return;

        const { head } = document;

        // Функция задержки вызова
        function debounce(delay, fn) {
            let timerId;
            return (...args) => {
                if (timerId) {
                    clearTimeout(timerId);
                }
                timerId = setTimeout(() => {
                    fn(...args);
                    timerId = null;
                }, delay);
            };
        }

        // Событие изменения в размере Vuwport
        const onWindowWidthResize = (cb) => {
            if (!cb && !isFunction(cb)) return;

            let prevWidth = 0;

            const handleResize = () => {
                const currentWidth = window.innerWidth;

                if (prevWidth !== currentWidth) {
                    prevWidth = currentWidth;
                    cb();
                }
            };

            window.addEventListener('resize', debounce(50, handleResize));

            handleResize();
        };

        // Мы создаем структуру
        const buildMarquee = (marqueeNode) => {
            if (!marqueeNode) return;

            const $marquee = marqueeNode;
            const $childElements = $marquee.children;

            if (!$childElements.length) return;
            $marquee.classList.add(CLASS_NAMES.wrapper);
            Array.from($childElements).forEach(($childItem) => $childItem.classList.add(CLASS_NAMES.item));

            const htmlStructure = `<div class="${CLASS_NAMES.inner}">${$marquee.innerHTML}</div>`;
            $marquee.innerHTML = htmlStructure;
        };

        // Функция получения размера элементов
        const getElSize = ($el, isVertical) => {
            if (isVertical) return $el.offsetHeight;
            return $el.offsetWidth;
        };

        $marqueeArray.forEach(($wrapper) => {
            if (!$wrapper) return;

            buildMarquee($wrapper);

            const $marqueeInner = $wrapper.firstElementChild;
            let cacheArray = [];

            if (!$marqueeInner) return;

            const dataMarqueeSpace = parseFloat($wrapper.getAttribute('data-marquee-space'));
            const $items = $wrapper.querySelectorAll(`.${CLASS_NAMES.item}`);
            const speed = parseFloat($wrapper.getAttribute('data-marquee-speed')) / 10 || 100;
            const isMousePaused = $wrapper.hasAttribute('data-marquee-pause-mouse-enter');
            const direction = $wrapper.getAttribute('data-marquee-direction');
            const isVertical = direction === 'bottom' || direction === 'top';
            const animName = `marqueeAnimation-${Math.floor(Math.random() * 10000000)}`;
            let spaceBetweenItem = parseFloat(window.getComputedStyle($items[0])?.getPropertyValue('margin-right'));
            let spaceBetween = spaceBetweenItem ? spaceBetweenItem : !isNaN(dataMarqueeSpace) ? dataMarqueeSpace : 30;
            let startPosition = parseFloat($wrapper.getAttribute('data-marquee-start')) || 0;

            // Динамические данные, учитывая при сценарии.
            let sumSize = 0;
            let firstScreenVisibleSize = 0;
            let initialSizeElements = 0;
            let initialElementsLength = $marqueeInner.children.length;
            let index = 0;
            let counterDuplicateElements = 0;

            // Инициализация событий.
            const initEvents = () => {
                if (startPosition) $marqueeInner.addEventListener('animationiteration', onChangeStartPosition);

                if (!isMousePaused) return;
                $marqueeInner.removeEventListener('mouseenter', onChangePaused);
                $marqueeInner.removeEventListener('mouseleave', onChangePaused);
                $marqueeInner.addEventListener('mouseenter', onChangePaused);
                $marqueeInner.addEventListener('mouseleave', onChangePaused);
            };

            const onChangeStartPosition = () => {
                startPosition = 0;
                $marqueeInner.removeEventListener('animationiteration', onChangeStartPosition);
                onResize();
            };

            // Добавление основных стилей для корректирующей работы анимации.
            const setBaseStyles = (firstScreenVisibleSize) => {
                let baseStyle = 'display: flex; flex-wrap: nowrap;';

                if (isVertical) {
                    baseStyle += `
				flex-direction: column;
			 position: relative;
			 will-change: transform;`;

                    if (direction === 'bottom') {
                        baseStyle += `top: -${firstScreenVisibleSize}px;`;
                    }
                } else {
                    baseStyle += `
				position: relative;
			 will-change: transform;`;

                    if (direction === 'right') {
                        baseStyle += `left: -${firstScreenVisibleSize}px;;`;
                    }
                }

                $marqueeInner.style.cssText = baseStyle;
            };

            // Функция возвращает значение, которым требуются элементы, когда анимация.
            const setdirectionAnim = (totalWidth) => {
                switch (direction) {
                    case 'right':
                    case 'bottom':
                        return totalWidth;
                    default:
                        return -totalWidth;
                }
            };

            // Анимационная функция.
            const animation = () => {
                const keyFrameCss = `@keyframes ${animName} {
					 0% {
						 transform: translate${isVertical ? 'Y' : 'X'}(${startPosition}%);
					 }
					 100% {
						 transform: translate${isVertical ? 'Y' : 'X'}(${setdirectionAnim(firstScreenVisibleSize)}px);
					 }
				 }`;
                const $style = document.createElement('style');

                $style.classList.add(animName);
                $style.innerHTML = keyFrameCss;
                head.append($style);

                $marqueeInner.style.animation = `${animName} ${(firstScreenVisibleSize + (startPosition * firstScreenVisibleSize) / 100) / speed
                }s infinite linear`;
            };

            // Функция работы с элементами. (дублирование, индикация \ Расчет размера)
            const addDublicateElements = () => {
                // После изменения размера экрана мы нулеваем все динамические данные.
                sumSize = firstScreenVisibleSize = initialSizeElements = counterDuplicateElements = index = 0;

                const $parentNodeWidth = getElSize($wrapper, isVertical);

                let $childrenEl = Array.from($marqueeInner.children);

                if (!$childrenEl.length) return;

                if (!cacheArray.length) {
                    cacheArray = $childrenEl.map(($item) => $item);
                } else {
                    $childrenEl = [...cacheArray];
                }

                // Добавьте базовые стили сгибаний для правильного расчета размера элементов.
                $marqueeInner.style.display = 'flex';
                if (isVertical) $marqueeInner.style.flexDirection = 'column';
                // Мы зажигаем количество элементов, чтобы избежать дублирования, когда изменяется размер экрана.
                $marqueeInner.innerHTML = '';
                $childrenEl.forEach(($item) => {
                    $marqueeInner.append($item);
                });

                // Прежде чем дублирование элементов добавить стили вдавливания и принести размер элементов в динамические данные.
                $childrenEl.forEach(($item) => {
                    if (isVertical) {
                        $item.style.marginBottom = `${spaceBetween}px`;
                    } else {
                        $item.style.marginRight = `${spaceBetween}px`;
                        $item.style.flexShrink = 0;
                    }

                    const sizeEl = getElSize($item, isVertical);

                    sumSize += sizeEl + spaceBetween;
                    firstScreenVisibleSize += sizeEl + spaceBetween;
                    initialSizeElements += sizeEl + spaceBetween;
                    counterDuplicateElements += 1;

                    return sizeEl;
                });

                const $multiplyWidth = $parentNodeWidth * 2 + initialSizeElements;

                // Дублировать элементы по мере необходимости.
                for (; sumSize < $multiplyWidth; index += 1) {
                    if (!$childrenEl[index]) index = 0;

                    const $cloneNone = $childrenEl[index].cloneNode(true);
                    const $lastElement = $marqueeInner.children[index];

                    $marqueeInner.append($cloneNone);

                    sumSize += getElSize($lastElement, isVertical) + spaceBetween;

                    if (
                        firstScreenVisibleSize < $parentNodeWidth ||
                        counterDuplicateElements % initialElementsLength !== 0
                    ) {
                        counterDuplicateElements += 1;
                        firstScreenVisibleSize += getElSize($lastElement, isVertical) + spaceBetween;
                    }
                }

                // Мы добавляем основные стили с учетом рассчитанных значений элементов элементов.
                setBaseStyles(firstScreenVisibleSize);
            };

            // Функция правильного определения углубления между элементами (если отклонения добавляются в CSS).
            const correctSpaceBetween = () => {
                if (spaceBetweenItem) {
                    $items.forEach(($item) => $item.style.removeProperty('margin-right'));

                    spaceBetweenItem = parseFloat(window.getComputedStyle($items[0]).getPropertyValue('margin-right'));
                    spaceBetween = spaceBetweenItem ? spaceBetweenItem : !isNaN(dataMarqueeSpace) ? dataMarqueeSpace : 30;
                }
            };

            // Функция инициализации.
            const init = () => {
                correctSpaceBetween();
                addDublicateElements();
                animation();
                initEvents();
            };

            // Функция анимации перезапуска при изменении размера Vuvport.
            const onResize = () => {
                head.querySelector(`.${animName}`)?.remove();
                init();
            };

            // Функция паузы при перемещении.
            const onChangePaused = (e) => {
                const { type, target } = e;

                target.style.animationPlayState = type === 'mouseenter' ? 'paused' : 'running';
            };

            onWindowWidthResize(onResize);
        });
    }
    marquee()
}