document.addEventListener("DOMContentLoaded", () => {
    if (window.abrirModalRegistrar) {
        const modalRegistrar = new bootstrap.Modal(document.getElementById('modalRegistrar'));
        modalRegistrar.show();
    } else if (window.abrirModalIniciarSesion) {
        const modalIniciarSesion = new bootstrap.Modal(document.getElementById('modalIniciarSesion'));
        modalIniciarSesion.show();
    }

    const reservaDropdown = document.querySelector(".menu-dropdown .dropdown");
    const toggle = reservaDropdown.querySelector(".dropdown-toggle");

    toggle.addEventListener("click", (e) => {
        e.preventDefault();
        reservaDropdown.classList.toggle("open");
    });

})

window.addEventListener("scroll", function () {
    const header = document.querySelector("header");
    const altoContraste = document.body.classList.contains("alto-contraste");

    if (altoContraste) {
        if (window.scrollY > 20) {
            header.classList.add("scrolled-contraste");
        } else {
            header.classList.remove("scrolled-contraste");
        }
    } else {
        if (window.scrollY > 20) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }

})

function cambiarIdioma() {
    var lang = document.getElementById('idioma').value;
    document.documentElement.lang = lang;

    document.querySelectorAll('[lang]').forEach(el => {
        el.hidden = (el.getAttribute('lang') !== lang);
    })
}

function desplegarBar() {
    const icono = document.getElementById('iconoHamburguesa');
    const menuDropdown = document.querySelector('.menu-dropdown');

    menuDropdown.classList.toggle('open');

    const isOpen = menuDropdown.classList.contains('open');

    if (isOpen) {
        icono.classList.replace("bi-list", "bi-x");
    } else {
        icono.classList.replace("bi-x", "bi-list");
    }

}

window.addEventListener('resize', () => {
    const menu = document.querySelector('.menu-dropdown');
    const btnToggleIcon = document.querySelector('.btn-toggle img');

    if (window.innerWidth > 1110) {
        menu.classList.remove('open'); // cierra el menú si está abierto
        btnToggleIcon.src = '/assets/icons/darkBars.svg'
    }
});