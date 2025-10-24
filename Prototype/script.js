window.addEventListener('scroll', function() {
    const header = document.querySelector('.main-header');
    if (window.scrollY > 10) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});