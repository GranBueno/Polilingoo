class Usuarios {
    constructor(nombre, correo, contrasena, fechaReg, ultSesion, puntaje, mayorRacha, rachaActual) {
        this.nombre = nombre;
        this.correo = correo;
        this.contrasena = contrasena;
        this.fechareg = fechaReg;
        this.ultsesio = ultSesion;
        this.puntaje = puntaje;
        this.mayorracha = mayorRacha;
        this.rachaactual = rachaActual;
    }

    // ---------------- MÉTODOS DE USUARIOS ----------------

    // --------------- MÉTODOS DE RACHA ----------------
    aumentarRacha() {
        if (this.rachaactual > this.mayorracha) {
            this.mayorracha = this.rachaactual;
        }
        this.rachaactual += 1;
    }
    perderRacha() {
        this.rachaactual = 0;
    }

    // --------------- MÉTODOS DE PUNTAJE ----------------
    actualizarPuntaje(respuestasCorrectas, respuestasIncorrectas) {
        this.puntaje += respuestasCorrectas * 10 - respuestasIncorrectas * 7;
    }

    // ---------------- VALIDACIONES ----------------

    validarCorreo() {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(this.correo);
    }

    validarContrasena() {
        const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;
        return regex.test(this.contrasena);
    }

    validarNombre() {
        // Solo letras, números, -, _, /
        const regex = /^[a-zA-Z0-9\-_\/]+$/;
        return regex.test(this.nombre);
    }

    validarTodo() {
        return (
            this.validarCorreo() &&
            this.validarContrasena() &&
            this.validarNombre()
        );
    }
}