
'use strict'
document.addEventListener("DOMContentLoaded", () => {
    console.log('Скрипт отработал корректно')
});

'use strict'

document.addEventListener('DOMContentLoaded', () => {

    /* 1. Исключение накладывания контента на хедер при скроле/прокрутке страницы */

    const header = document.querySelector('.header');       // создаем переменную находя блок по классу

    if (header) {                                           // проверяем существование элемента в DOM
        console.log('Константа header существует');

        /* 
        *   Алгоритм
        *
        //*   1. Начало.
        //*   2. Получаем высоту блока/элемента (создание переменной, которая не будет меняться).
        //*   3. Проверка условия (навешиваем слушатель событий на scroll страницы и ожидаем ее прокрутку): если страница прокручивается.
        //*       3.1. Да: Получаем значение насколько прокрутили страницу (создание переменной, которая будет меняться).
        //*           3.1.1 Проверка условия (сравниваем высоту элемента и значение прокрученной страницы): если расстояние от верха страницы больше высоты элемента
        //*               3.1.1.1. Да: устанавливаем класс модификатора на элемент
        //*               3.1.1.2. Нет (если расстояние от верха экрана меньше высоты элемента): удаляем класс модификатора у элемента
        //*       3.2. Нет: Конец
        //*   4. Конец
        * 
        *   Блок-схема: /images/block-schema-basic.png
        */

        const heightHeader = header.offsetHeight;           // определяем высоту блока, включая внутренние отступы

        document.addEventListener('scroll', () => {         // навешиваем слушатель событий на scroll страницы и ожидаем ее прокрутку

            console.log('Страница скролится');

            let scrollPageY = this.scrollY;                 // получаем значение насколько прокрутили страницу

            if (scrollPageY > heightHeader) {               // условие: если расстояние от верха страницы больше высоты элемента
                header.classList.add('header--scroll')      // устанавливаем класс модификатора на элемент
            } else {
                header.classList.remove('header--scroll')   // удаляем класс модификатора у элемента
            }

        })


    }


    /* 1. Появление кнопки скачивания файла статьи */

    const articles__link = document.querySelector('.articles__link');

    if (articles__link) {
        console.log('Мышка наведена на название статьи, появляется кнопка скачивания');

        /* 
        *   Алгоритм
        *
        //*   1. Начало.
        //*   2. Получаем элемент (текст).
        //*   3. Проверка условия (навешиваем слушатель событий наведение мыши на название статьи).
        //*       3.1. Да: Получаем возможность скачивания PDF-файла(кнопка скачивания).
        //*       3.2. Нет: Конец
        //*   4. Конец
        * 
        *   Блок-схема: /images/block-schema.png
        */
    }

});
    /* 1. Появление меню */

    const imageMenu = document.querySelector('.menu');
    const headerMenu = document.querySelector('.header__nav');


    /* 
    *   Алгоритм
    *
    //*   1. Начало.
    //*   2. Получаем элемент (текст).
    //*   3. Проверка условия (навешиваем слушатель событий наведение мыши на меню).
    //*       3.1. Да: Получаем список меню.
    //*       3.2. Нет: Конец
    //*   4. Конец
    * 
    *   Блок-схема: /images/block-schema-3.png
    */
    if (headerMenu && imageMenu) {
        console.log('Кнопка меню существует');
        imageMenu.addEventListener('click', () => {
            headerMenu.removeAttribute("hidden");

        });
        window.addEventListener("click", (event) => {
            // проверяем, был ли клик на фоне модального окна
            if (event.target === headerMenu) {
                //если условие выполняется, добавляем атрибут hidden у модального окна modalApplication и модальное окно становится невидимым
                headerMenu.setAttribute("hidden", true);
            }
        });


    }

'use strict'

document.addEventListener('DOMContentLoaded', () => {

    ///* 
        //*   1. Начало.
        //*   2. Получаем элементы (изображения с описанием).
        //*   3. Проверка условия (есть ли такие изображения).
          //*     3.1. Добавляем обработчик наведения курсора на изображение:
          //*       3.1.1.Да:
          //* 3.1.1.1. Показываем текст при наведении.
          //* 3.1.2. Нет: продолжаем.
        //*       3.2. Добавляем обработчик курсор с изображения;
        //*  3.3.1.Да:
        //*  3.3.1.1. Скрываем элемент с описанием
        //*  3.3.2. Нет: продолжаем.
        //*   4. Конец

const intensiveImg= document.querySelectorAll('.intensive__img');

intensiveImg.forEach((item, index) => {
        const intensiveText = document.querySelectorAll('.intensive__description');

    item.addEventListener('mouseenter', () => { 
        item.style.opacity = 0.5;
        intensiveText[index].removeAttribute('hidden');
    });
        item.addEventListener('mouseleave', () => {
            item.style.opacity = 1;
                  intensiveText[index].setAttribute('hidden', true);
    });
});
});

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const intensiveImg = document.querySelectorAll('.intensive__img');
    const intensiveText = document.querySelectorAll('.intensive__description');
    
    intensiveImg.forEach((item, index) => {
        item.addEventListener('mouseenter', () => { 
            item.style.opacity = 0.5;
            intensiveText[index].removeAttribute('hidden');
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.opacity = 1;
            intensiveText[index].setAttribute('hidden', true);
        });
    });

    // Обработчик для кнопки закрытия меню
    const closeButton = document.querySelector('.close-btn');
    const  menu = document.querySelector('.menu');

    closeButton.addEventListener('click', () => {
         menu.style.display = 'none'; // Скрыть меню
    });

    // Обработчик для иконки меню (если она добавлена)
    const menuIcon = document.querySelector('.menu-icon');
    
    menuIcon.addEventListener('click', () => {
        menu.style.display = 'flex'; // Показать меню
    });
     });
     const victorianismContainer = document.querySelector(".victorianism");
       if (victorianismContainer) {
            const dataTitlevictorianism= [
            "Королевская семья",
            "Монеты",
            "Вестминстерский дворец",
            "Развитие общества",
            "Архитектура",
            "Джентльмен",
        ];
          const Titlevictorianism
=victorianismContainer.querySelectorAll(".victorianism__subtitle");
      Titlevictorianism.forEach((item, index) => {
              item.textContent = dataTitlevictorianism[index];
           });
    }