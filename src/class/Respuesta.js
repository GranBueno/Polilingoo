export default class Respuesta {
    constructor(id, texto, validez = false) {
        this.id = id;
        this.texto = texto;
        this.validez = validez;
    }

    esCorrecta() {
        return this.validez;
    }
}