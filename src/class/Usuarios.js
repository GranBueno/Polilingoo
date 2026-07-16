import { MAX_VIDAS } from "../config/gameRules";

export default class Usuario {
    constructor(
        nombre,
        correo,
        contrasena,
        fechaRegistro = null,
        ultimaSesion = null,
        puntaje = 0,
        mayorRacha = 0,
        rachaActual = 0,
        energia = MAX_VIDAS
    ) {
        this.nombre = String(nombre ?? "").trim();
        this.correo = String(correo ?? "").trim().toLowerCase();
        this.contrasena = String(contrasena ?? "");
        this.fechaRegistro = fechaRegistro;
        this.ultimaSesion = ultimaSesion;
        this.puntaje = puntaje;
        this.mayorRacha = mayorRacha;
        this.rachaActual = rachaActual;
        this.energia = energia;
    }

    validarNombre() {
        const regex = /^[a-zA-Z0-9\-_\/]{3,20}$/;
        return regex.test(this.nombre);
    }

    validarCorreo() {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(this.correo);
    }

    validarContrasena() {
        const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;
        return regex.test(this.contrasena);
    }

    validarTodo() {
        const errores = [];

        if (!this.validarNombre()) {
            errores.push(
                "El usuario debe tener de 3 a 20 caracteres y solo puede usar letras, números, guion, guion bajo o /."
            );
        }

        if (!this.validarCorreo()) {
            errores.push("Ingresa un correo electrónico válido.");
        }

        if (!this.validarContrasena()) {
            errores.push(
                "La contraseña debe tener de 8 a 16 caracteres, una mayúscula y un carácter especial."
            );
        }

        return {
            valido: errores.length === 0,
            errores,
        };
    }
}
