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
        if (window.scrollY > 50) {
            header.classList.add("scrolled-contraste");
        } else {
            header.classList.remove("scrolled-contraste");
        }
    } else {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }

})

function activarAltoContraste() {
    document.body.classList.toggle("alto-contraste");

    const boton = document.getElementById("contraste");
    const icono = boton.querySelector("img");

    if (document.body.classList.contains("alto-contraste")) {
        icono.src = "assets/icons/lightMode.png";
        icono.style.background = "white";
        icono.style.borderRadius = "50%";
        icono.style.padding = "1px";
        icono.alt = "modo claro";
        boton.setAttribute("aria-label", "desactivar modo alto contraste");
    } else {
        icono.src = "assets/icons/darkMode.png";
        icono.alt = "modo oscuro";
        boton.setAttribute("aria-label", "activar modo alto contraste");
        icono.style.background = "none";
        icono.style.padding = "0";
        icono.borderRadius = "0";
    }
}

function cambiarIdioma() {
    var lang = document.getElementById('idioma').value;
    document.documentElement.lang = lang;

    document.querySelectorAll('[lang]').forEach(el => {
        el.hidden = (el.getAttribute('lang') !== lang);
    })
}

function desplegarBar() {
    const btnToggleIcon = document.querySelector('.btn-toggle img');
    const menuDropdown = document.querySelector('.menu-dropdown');

    menuDropdown.classList.toggle('open');
    const isOpen = menuDropdown.classList.contains('open');

    if (isOpen) {
        btnToggleIcon.src = '/assets/icons/darkXmark.svg';
    } else {
        btnToggleIcon.src = '/assets/icons/darkBars.svg'
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