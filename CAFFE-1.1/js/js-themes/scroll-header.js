const header = document.querySelector('.main-header');

window.addEventListener('scroll', () => {

    const scrollPosition = window.scrollY;

    // Primeiro estágio: desaparece o logo
    header.classList.toggle(
        'is-scrolled',
        scrollPosition > 30
    );

    // Segundo estágio: desaparece o fundo
    header.classList.toggle(
        'is-transparent',
        scrollPosition > 100
    );

});
