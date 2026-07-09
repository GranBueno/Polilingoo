export default class Respuesta {
    constructor(id, texto, validez = false, orden = 1) {
        this.id = id;
        this.texto = texto;
        this.validez = validez;
        this.orden = orden;
    }

    esCorrecta() {
        return this.validez;
    }

    toPlainObject() {
        return {
            id: this.id,
            texto: this.texto,
            validez: this.validez,
            orden: this.orden,
        };
    }
}
