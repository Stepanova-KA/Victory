// Регистрация плагинов GSAP (Важно!)
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// --- Переменные для предзагрузчика (объявляем здесь, чтобы были доступны до DOMContentLoaded) ---
const preloader = document.getElementById('preloader');
const loadingBar = document.querySelector('.loading-bar');
const minLoadTime = 2000; // Минимальное время отображения предзагрузчика в мс (2 секунды)
let pageLoaded = false; // Флаг, который станет true, когда window.load сработает
let dataFetched = false; // Флаг, который станет true, когда данные JSON загружены и обработаны
let loadStartTime = Date.now(); // Время начала загрузки страницы

// Добавляем класс 'no-scroll' к body сразу, чтобы предотвратить прокрутку
document.body.classList.add('no-scroll');

// Функция для обновления полосы загрузки (прогресса)
function updateLoadingProgress(progress) {
    if (loadingBar) {
        loadingBar.style.width = `${progress}%`;
    }
}

// Функция для скрытия предзагрузчика
function hidePreloader() {
    // Убедимся, что и страница, и данные загружены, и прошло минимальное время
    if (pageLoaded && dataFetched) {
        const timeElapsed = Date.now() - loadStartTime;
        const remainingTime = Math.max(0, minLoadTime - timeElapsed); // Вычисляем, сколько еще ждать

        updateLoadingProgress(100); // Убедимся, что полоса заполнена до конца

        // Плавное исчезновение предзагрузчика
        setTimeout(() => {
            gsap.to(preloader, {
                opacity: 0,
                duration: 1, // Плавное исчезновение за 1 секунду
                onComplete: () => {
                    preloader.style.display = 'none'; // Полностью скрываем элемент
                    document.body.classList.remove('no-scroll'); // Разрешаем прокрутку страницы
                }
            });
        }, remainingTime); // Ждем оставшееся время
    }
}

// Слушаем событие полной загрузки страницы (включая изображения, CSS и т.d.)
window.addEventListener('load', () => {
    pageLoaded = true;
    hidePreloader(); // Пытаемся скрыть предзагрузчик
});


document.addEventListener('DOMContentLoaded', () => {

    // --- 0. Селекторы модальных окон ---
    const topicModal = document.getElementById('topic-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const topicCloseBtn = topicModal.querySelector('.modal-close-btn');
    let topicCards; // Объявляем здесь с `let`, чтобы можно было переприсвоить после fetch

    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxCloseBtn = lightboxModal.querySelector('.modal-close-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    const figureModal = document.getElementById('figure-modal');
    const figureModalTitle = document.getElementById('figure-modal-title');
    const figureModalText = document.getElementById('figure-modal-text');
    const figureCloseBtn = figureModal.querySelector('.modal-close-btn');
    const figureCards = document.querySelectorAll('.figure-card');


    // --- Общие функции для открытия и закрытия модальных окон ---
    function openModal(modalElement, contentCallback = null) {
        modalElement.style.display = 'flex';
        if (contentCallback) {
            contentCallback();
        }
        requestAnimationFrame(() => {
            modalElement.classList.add('active');
            document.body.classList.add('modal-open');
        });
    }

    function closeModal(modalElement) {
        modalElement.classList.remove('active');
        document.body.classList.remove('modal-open');
        const modalContent = modalElement.querySelector('.modal-content');
        const transitionDuration = parseFloat(getComputedStyle(modalContent).transitionDuration) * 1000;
        setTimeout(() => {
            if (!modalElement.classList.contains('active')) {
                modalElement.style.display = 'none';
            }
        }, transitionDuration + 50);
    }


    // --- Загрузка данных о темах и их генерация (для Swiper) ---

    function generateTopics(topicsData) {
    // Получаем Swiper Wrapper, а не topic-grid напрямую
    const swiperWrapper = document.querySelector('.topic-grid .swiper-wrapper');
    if (!swiperWrapper) {
        console.error('Element .topic-grid .swiper-wrapper not found!');
        return;
    }
    swiperWrapper.innerHTML = ''; // Очищаем контейнер

    let index = 0;
    const totalTopics = Object.keys(topicsData).length;

    for (const topicKey in topicsData) { // ИСПОЛЬЗУЕМ ЦИКЛ for...in
        if (Object.hasOwnProperty.call(topicsData, topicKey)) {
            const topic = topicsData[topicKey];

            const cardHtml = `
                <div class="topic-card swiper-slide"
                     data-topic-title="${topic.title}"
                     data-topic-fulltext="${topic.fullText}">
                    <img src="${topic.image}" alt="${topic.title.split(':')[0]}">
                    <div class="topic-card-content">
                        <h3>${topic.title.split(':')[0]}</h3>
                        <p>${topic.shortDesc}</p>
                        <a href="#" class="read-more">${topic.buttonText}</a> <!-- ИЗМЕНЕНИЕ ЗДЕСЬ! -->
                    </div>
                </div>
            `;
            swiperWrapper.insertAdjacentHTML('beforeend', cardHtml);

            index++;
            // Обновляем прогресс полосы загрузки (имитация загрузки и рендера данных)
            updateLoadingProgress(Math.floor(50 + (index / totalTopics) * 25)); // Прогресс от 50% до 75%
        }
    }

    // Инициализация Swiper после того, как все слайды добавлены
    const mySwiper = new Swiper('.swiper-container', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            // when window width is >= 640px
            640: {
              slidesPerView: 2,
              spaceBetween: 20
            },
            // when window width is >= 1024px
            1024: {
              slidesPerView: 3,
              spaceBetween: 30
            }
        },
        grabCursor: true, // Изменяет курсор при наведении
        autoplay: { // Автоматическая прокрутка
            delay: 5000, // 5 секунд
            disableOnInteraction: false, // Продолжать автопрокрутку после ручного переключения
        },
        effect: 'coverflow', // Красивый эффект 3D-перелистывания
        coverflowEffect: {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
        },
    });

    // После генерации карточек и инициализации Swiper, получаем их в переменную topicCards
    topicCards = document.querySelectorAll('.topic-card');
    
    // Привязываем слушатели событий к динамически созданным topicCards
    topicCards.forEach(card => {
        // Клик на ЛЮБОЙ части карточки, включая кнопку "Заглянуть"
        card.addEventListener('click', (e) => {
            // Обязательно предотвращаем стандартное поведение ссылки и останавливаем всплытие
            e.preventDefault();
            e.stopPropagation();

            const title = card.dataset.topicTitle;
            const fullText = card.dataset.topicFulltext;
            
            openModal(topicModal, () => {
                modalTitle.textContent = title;
                modalText.innerHTML = fullText;
            });
        });
    });

    // После успешной генерации данных, устанавливаем флаг и пытаемся скрыть прелоадер
    dataFetched = true;
    updateLoadingProgress(75); // Данные загружены и обработаны - 75%
    hidePreloader();
}

    // Загрузка данных из JSON-файла
    fetch('data.json') // <-- УБЕДИТЕСЬ, ЧТО ЭТОТ ПУТЬ ПРАВИЛЬНЫЙ (ПРОВЕРЬТЕ НАЗВАНИЕ ФАЙЛА И ПАПКУ)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            updateLoadingProgress(25); // Начало загрузки файла - 25%
            return response.json();
        })
        .then(data => {
            generateTopics(data); // Передаем загруженные данные в функцию генерации
        })
        .catch(error => {
            console.error('Ошибка загрузки данных о темах:', error);
            // В случае ошибки, все равно скрываем прелоадер после мин. времени
            dataFetched = true;
            updateLoadingProgress(100);
            hidePreloader();
        });


    // --- 1. Анимации секции HERO (GSAP) ---
    const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Проверяем существование элементов перед анимацией параллакса
    const victorianPortal = document.querySelector(".victorian-portal"); // Если у вас нет .victorian-portal, удалите этот блок
    const heroContent = document.querySelector(".hero-content");
    const heroBackground = document.querySelector(".hero-background-image");
    const typedTextElement = document.getElementById('typed-text'); // Селектор для Typed.js

    // Добавляем проверку на существование элементов перед gsap.set()
    if (victorianPortal) gsap.set(victorianPortal, { opacity: 0, scale: 0.7, rotateY: 20 });
    if (heroContent) {
        gsap.set(heroContent, { y: 30, opacity: 0 });
        if (heroContent.querySelector('h1')) gsap.set(heroContent.querySelector('h1'), { scale: 0.9, opacity: 0 });
        if (heroContent.querySelector('p')) gsap.set(heroContent.querySelector('p'), { y: 20, opacity: 0 });
    }
    const btnDiscover = document.querySelector(".btn-discover");
    if (btnDiscover) gsap.set(btnDiscover, { opacity: 0 });
    const scrollIndicator = document.querySelector(".scroll-indicator");
    if (scrollIndicator) gsap.set(scrollIndicator, { opacity: 0 });

    heroTimeline
        .to(victorianPortal, { // Анимируем, только если элемент существует
            opacity: 1,
            scale: 1,
            rotateY: 0,
            duration: 1.8,
            ease: "power3.out",
            delay: 0.5,
            onComplete: () => {
                const heroSection = document.querySelector('#hero');
                if (heroSection) {
                    heroSection.addEventListener('mousemove', (e) => {
                        const portal = document.querySelector('.victorian-portal');
                        const content = document.querySelector('.hero-content');
                        const frame = document.querySelector('.portal-frame');

                        const targetElement = portal || content;
                        if (!targetElement) return;

                        const rect = targetElement.getBoundingClientRect();
                        const centerX = rect.left + rect.width / 2;
                        const centerY = rect.top + rect.height / 2;

                        const offsetX = (e.clientX - centerX) / window.innerWidth * 20;
                        const offsetY = (e.clientY - centerY) / window.innerHeight * 20;

                        if (frame) {
                            gsap.to(frame, {
                                x: offsetX * 0.5,
                                y: offsetY * 0.5,
                                rotationY: offsetX * 0.2,
                                rotationX: -offsetY * 0.2,
                                duration: 0.8,
                                ease: "power2.out"
                            });
                        }
                        if (content) {
                            gsap.to(content, {
                                x: -offsetX * 0.3,
                                y: -offsetY * 0.3,
                                duration: 0.8,
                                ease: "power2.out"
                            });
                        }
                    });
                }
            }
        })
        .to(heroContent, {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: "power3.out"
        }, "<0.5")
        .add(() => {
            if (typedTextElement) { // Проверяем, что элемент существует
                new Typed('#typed-text', {
                    strings: [
                        "Викторианская Англия",
                        "Золотой Век Британской Истории",
                        "Эпоха Инноваций и Открытий"
                    ],
                    typeSpeed: 50,
                    backSpeed: 25,
                    loop: true,
                    showCursor: true,
                    cursorChar: '|',
                    autoInsertCss: true,
                });
            }
        }, "<0.2")
        .to(heroContent.querySelector('h1'), { opacity: 1, scale: 1, duration: 1, ease: "power3.out" }, "<0.1")
        .to(heroContent.querySelector('p'), { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, "<0.3")
        .to(btnDiscover, { opacity: 1, duration: 0.8, ease: "power3.out" }, "<0.5")
        .to(scrollIndicator, { opacity: 1, duration: 0.8 }, "-=0.3");

    if (heroBackground) {
        gsap.to(heroBackground, {
            yPercent: 10,
            ease: "none",
            scrollTrigger: {
                trigger: "#hero",
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });
    }

    if (victorianPortal) { // Анимируем, только если элемент существует
        gsap.to(victorianPortal, {
            yPercent: -5,
            ease: "none",
            scrollTrigger: {
                trigger: "#hero",
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });
    }

    if (heroContent) {
        gsap.to(heroContent, {
            yPercent: -10,
            ease: "none",
            scrollTrigger: {
                trigger: "#hero",
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });
    }

    if (btnDiscover) {
        btnDiscover.addEventListener("mouseenter", function() {
            gsap.to(this, {
                backgroundColor: "var(--color-emerald)",
                color: "var(--color-light)",
                borderColor: "var(--color-gold)",
                y: -10,
                scale: 1.08,
                boxShadow: "0 12px 30px rgba(0,0,0,0.7), inset 0 0 25px rgba(255,255,255,0.2), 0 0 25px var(--color-gold)",
                duration: 0.5
            });
        });

        btnDiscover.addEventListener("mouseleave", function() {
            gsap.to(this, {
                backgroundColor: "var(--color-burgundy)",
                color: "var(--color-light)",
                borderColor: "var(--color-burgundy)",
                y: 0,
                scale: 1,
                boxShadow: "0 8px 18px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.1)",
                duration: 0.5
            });
        });
    }

    // --- 2. Конфигурация Particles.js (для эффекта пыли/тумана) ---
    if (document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            "particles": {
                "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#d4c8a8" },
                "shape": { "type": "circle", "stroke": { "width": 0, "color": "#000000" }, "polygon": { "nb_sides": 5 } },
                "opacity": { "value": 0.5, "random": true, "anim": { "enable": true, "speed": 1, "opacity_min": 0.1, "sync": false } },
                "size": { "value": 3, "random": true, "anim": { "enable": true, "speed": 2, "size_min": 0.1, "sync": false } },
                "line_linked": { "enable": false },
                "move": { "enable": true, "speed": 0.5, "direction": "bottom", "random": true, "straight": false, "out_mode": "out", "bounce": false, "attract": { "enable": false, "rotateX": 600, "rotateY": 1200 } }
            },
            "interactivity": {
                "detect_on": "canvas", "events": { "onhover": { "enable": false }, "onclick": { "enable": false }, "resize": true },
                "modes": { "grab": { "distance": 400, "line_linked": { "opacity": 1 } }, "bubble": { "distance": 200, "size": 4, "duration": 2, "opacity": 0.8, "speed": 3 }, "repulse": { "distance": 200, "duration": 0.4 }, "push": { "particles_nb": 4 }, "remove": { "particles_nb": 2 } }
            },
            "retina_detect": true
        });
    }

    // --- 3. Конфигурация ScrollReveal и анимации GSAP ScrollTrigger для остальных секций ---
    // (Обратите внимание: ScrollReveal для .topic-card удален, так как Swiper управляет их анимацией)
    ScrollReveal().reveal('.section-heading', {
        delay: 200,
        distance: '50px',
        origin: 'bottom',
        easing: 'ease-out',
        duration: 800,
        scale: 0.9,
        reset: true
    });

    gsap.fromTo("#about .about-text", { x: -100, opacity: 0 }, {
        x: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
            trigger: "#about",
            start: "top 70%",
            toggleActions: "play none none reverse"
        }
    });
    gsap.fromTo("#about .about-image", { x: 100, opacity: 0, rotation: 10 }, {
        x: 0,
        opacity: 1,
        rotation: 3,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
            trigger: "#about",
            start: "top 70%",
            toggleActions: "play none none reverse"
        }
    });

    // ScrollReveal для .topic-card будет вызван после их генерации в generateTopics
    // (см. ниже в generateTopics ScrollReveal.reveal('.topic-card'))

    ScrollReveal().reveal('.gallery-item', {
        delay: 100,
        distance: '40px',
        origin: 'bottom',
        interval: 80,
        easing: 'ease-out',
        duration: 700,
        scale: 0.98,
        reset: true
    });

    ScrollReveal().reveal('.figure-card', {
        delay: 100,
        distance: '30px',
        origin: 'bottom',
        interval: 70,
        easing: 'ease-out',
        duration: 600,
        scale: 0.97,
        reset: true
    });

    ScrollReveal().reveal('.resource-item', {
        delay: 150,
        distance: '40px',
        origin: 'bottom',
        interval: 100,
        easing: 'ease-out',
        duration: 800,
        scale: 0.95,
        reset: true
    });

    gsap.utils.toArray(".timeline-event").forEach((event) => {
        gsap.fromTo(event, { opacity: 0, y: 50 }, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: event,
                start: "top 75%",
                toggleActions: "play none none reverse",
            }
        });
        gsap.fromTo(event.querySelector(".timeline-date"), { opacity: 0, scale: 0.8 }, {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "back.out(1.7)",
            scrollTrigger: {
                trigger: event,
                start: "top 75%",
                toggleActions: "play none none reverse",
            }
        });
    });

 if (typeof ScrollReveal !== 'undefined') {
    ScrollReveal().reveal('#virtual-tour .section-heading, #virtual-tour p, .then-now-slider', {
        delay: 200,
        distance: '50px',
        origin: 'bottom',
        easing: 'ease-in-out',
        interval: 50,
        duration: 800,
        reset: true
    });
}


    // ScrollReveal для заголовков и параграфов в секции контактов (не для формы)
    ScrollReveal().reveal('#contact .section-heading, #contact > p', {
        delay: 100,
        distance: '20px',
        origin: 'bottom',
        interval: 50,
        easing: 'ease-out',
        duration: 600,
        reset: true
    });


    // --- 4. Плавная прокрутка для навигационных ссылок ---
    document.querySelectorAll('nav a[href^="#"], .btn-discover, .scroll-indicator').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // --- 5. Эффект "липкого" хедера ---
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- 6. Логика модальных окон для карточек тем ---
    // Слушатели событий для topicCards теперь привязываются внутри generateTopics
    topicCloseBtn.addEventListener('click', () => closeModal(topicModal));
    topicModal.addEventListener('click', (e) => {
        if (e.target === topicModal) {
            closeModal(topicModal);
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && topicModal.classList.contains('active')) {
            closeModal(topicModal);
        }
    });

    // --- 7. Логика модального окна для галереи (лайтбокс) ---
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const src = this.dataset.src;
            const caption = this.dataset.caption;

            openModal(lightboxModal, () => {
                if (lightboxImage) {
                    lightboxImage.onload = null;
                    lightboxImage.onerror = null;

                    lightboxImage.onload = () => {};
                    lightboxImage.onerror = (e) => {
                        console.error("ОШИБКА: Изображение НЕ ЗАГРУЗИЛОСЬ по адресу:", lightboxImage.src, e);
                        lightboxImage.src = 'https://via.placeholder.com/400x300?text=Image+Load+Error';
                        lightboxCaption.textContent = 'Ошибка загрузки изображения. Пожалуйста, проверьте URL.';
                    };

                    lightboxImage.src = src;
                } else {
                    console.error("ОШИБКА: Элемент #lightbox-image не найден в DOM! Проверьте HTML ID.");
                }
                lightboxCaption.textContent = caption;
            });
        });
    });

    lightboxCloseBtn.addEventListener('click', () => closeModal(lightboxModal));
    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal || e.target === lightboxImage) {
            closeModal(lightboxModal);
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
            closeModal(lightboxModal);
        }
    });

    // --- 8. Логика модальных окон для знаковых фигур ---
    figureCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.dataset.figureTitle;
            const text = card.dataset.figureText;
            openModal(figureModal, () => {
                figureModalTitle.textContent = title;
                figureModalText.innerHTML = text;
            });
        });
    });

    figureCloseBtn.addEventListener('click', () => closeModal(figureModal));
    figureModal.addEventListener('click', (e) => {
        if (e.target === figureModal) {
            closeModal(figureModal);
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && figureModal.classList.contains('active')) {
            closeModal(figureModal);
        }
    });

    // --- 9. Логика обработки ссылок ресурсов (для примера) ---
    document.querySelectorAll('.resource-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            alert('(Демонстрация интерактивности)');
        });
    });
    
    // --- Then & Now Slider Logic ---
    const sliders = document.querySelectorAll('.then-now-slider');

    sliders.forEach(sliderSection => {
        const sliderControl = sliderSection.querySelector('.slider-control');
        const imgNow = sliderSection.querySelector('.img-now');
        const sliderHandle = sliderSection.querySelector('.slider-handle');

        if (sliderControl && imgNow && sliderHandle) {
            const updateSlider = (value) => {
                imgNow.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
                sliderHandle.style.left = `${value}%`;
            };

            updateSlider(sliderControl.value);

            sliderControl.addEventListener('input', (e) => {
                updateSlider(e.target.value);
            });

            gsap.fromTo(sliderSection,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sliderSection,
                        start: "top bottom-=150",
                        toggleActions: "play none none none"
                    }
                }
            );

            gsap.fromTo(sliderControl,
                { opacity: 0, scaleX: 0 },
                { opacity: 1, scaleX: 1, duration: 0.8, ease: "back.out(1.7)", delay: 0.5, scrollTrigger: { trigger: sliderSection, start: "top bottom-=150" } }
            );

            gsap.fromTo(sliderHandle,
                { opacity: 0, scale: 0 },
                { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)", delay: 1, scrollTrigger: { trigger: sliderSection, start: "top bottom-=150" } }
            );
        }
    });
   
    

    // --- LocalStorage для формы контактов ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const contactName = document.getElementById('contact-name');
        const contactEmail = document.getElementById('contact-email');
        const contactMessage = document.getElementById('contact-message');
        const formFeedback = document.getElementById('form-feedback');

        // Загружаем данные из LocalStorage при загрузке страницы
        const savedName = localStorage.getItem('contactName');
        const savedEmail = localStorage.getItem('contactEmail');
        const savedMessage = localStorage.getItem('contactMessage');

        if (savedName) contactName.value = savedName;
        if (savedEmail) contactEmail.value = savedEmail;
        if (savedMessage) contactMessage.value = savedMessage;

        // Сохраняем данные в LocalStorage при изменении полей ввода (с задержкой для производительности)
        let saveTimeout;
        const saveData = () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                localStorage.setItem('contactName', contactName.value);
                localStorage.setItem('contactEmail', contactEmail.value);
                localStorage.setItem('contactMessage', contactMessage.value);
                console.log('Данные формы сохранены в LocalStorage.');
            }, 500); // Сохранить через 500мс после последнего ввода
        };

        contactForm.addEventListener('input', saveData); // Используем 'input' для всех изменений

        // Обработка отправки формы
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Предотвращаем стандартную отправку формы

            // В реальном приложении здесь был бы код для отправки данных на сервер (AJAX/Fetch)
            console.log('Форма отправлена:', {
                name: contactName.value,
                email: contactEmail.value,
                message: contactMessage.value
            });

            formFeedback.textContent = 'Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.';
            formFeedback.style.color = 'var(--color-emerald)'; // Зеленый цвет для успеха

            // Очищаем LocalStorage и поля формы после "отправки"
            localStorage.removeItem('contactName');
            localStorage.removeItem('contactEmail');
            localStorage.removeItem('contactMessage');

            contactForm.reset(); // Очищаем поля формы
            
            // Скрываем сообщение об обратной связи через несколько секунд
            setTimeout(() => {
                formFeedback.textContent = '';
            }, 5000); // 5 секунд
        });
    }

}); // Конец DOMContentLoaded