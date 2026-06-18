import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";

import Leccion from "./Leccion";
import Pregunta from "./Pregunta";
import Respuesta from "./Respuesta";

const DB_NAME = "PoliLingoDB.db";

let db = null;

class Database {

    static async inicializar() {

        const sqliteDir =
            FileSystem.documentDirectory + "SQLite/";

        const dbPath =
            sqliteDir + DB_NAME;

        const info =
            await FileSystem.getInfoAsync(
                dbPath
            );

        if (!info.exists) {

            await FileSystem.makeDirectoryAsync(
                sqliteDir,
                {
                    intermediates: true
                }
            );

            const asset = Asset.fromModule(
                require("../assets/PoliLingoDB.db")
            );

            await asset.downloadAsync();

            await FileSystem.copyAsync({
                from: asset.localUri,
                to: dbPath
            });
        }

        db = SQLite.openDatabaseSync(
            DB_NAME
        );

        console.log(
            "Base de datos inicializada correctamente."
        );
    }

    static obtenerConexion() {

        if (!db) {
            throw new Error(
                "La base de datos no ha sido inicializada."
            );
        }

        return db;
    }

    static obtenerTodasLasLecciones() {

        return db.getAllSync(`
            SELECT *
            FROM Leccion
        `);
    }

    static obtenerLeccion(idLeccion) {

        const datosLeccion =
            db.getFirstSync(
                `
                SELECT *
                FROM Leccion
                WHERE ID = ?
                `,
                [idLeccion]
            );

        if (!datosLeccion) {
            return null;
        }

        const leccion =
            new Leccion(
                datosLeccion.ID,
                datosLeccion.Descripcion,
                datosLeccion.ID_Dificultad
            );

        const preguntas =
            db.getAllSync(
                `
                SELECT p.*
                FROM Preguntas p
                INNER JOIN LeccionPregunta lp
                    ON p.ID = lp.ID_Pregunta
                WHERE lp.ID_Leccion = ?
                LIMIT 10
                `,
                [idLeccion]
            );

        for (const datosPregunta of preguntas) {

            const pista =
                db.getFirstSync(
                    `
                    SELECT *
                    FROM Pistas
                    WHERE ID_Pregunta = ?
                    `,
                    [datosPregunta.ID]
                );

            const pregunta =
                new Pregunta(
                    datosPregunta.ID,
                    datosPregunta.Pregunta,
                    pista
                        ? pista.Pista
                        : ""
                );

            const respuestas =
                db.getAllSync(
                    `
                    SELECT *
                    FROM Respuestas
                    WHERE ID_Pregunta = ?
                    `,
                    [datosPregunta.ID]
                );

            for (const datosRespuesta of respuestas) {

                const respuesta =
                    new Respuesta(
                        datosRespuesta.ID,
                        datosRespuesta.Respuesta,
                        datosRespuesta.Validez === 1
                    );

                pregunta.agregarRespuesta(
                    respuesta
                );
            }

            leccion.agregarPregunta(
                pregunta
            );
        }

        return leccion;
    }

    static obtenerPregunta(idPregunta) {

        const datosPregunta =
            db.getFirstSync(
                `
                SELECT *
                FROM Preguntas
                WHERE ID = ?
                `,
                [idPregunta]
            );

        if (!datosPregunta) {
            return null;
        }

        const pista =
            db.getFirstSync(
                `
                SELECT *
                FROM Pistas
                WHERE ID_Pregunta = ?
                `,
                [idPregunta]
            );

        const pregunta =
            new Pregunta(
                datosPregunta.ID,
                datosPregunta.Pregunta,
                pista
                    ? pista.Pista
                    : ""
            );

        const respuestas =
            db.getAllSync(
                `
                SELECT *
                FROM Respuestas
                WHERE ID_Pregunta = ?
                `,
                [idPregunta]
            );

        for (const datosRespuesta of respuestas) {

            const respuesta =
                new Respuesta(
                    datosRespuesta.ID,
                    datosRespuesta.Respuesta,
                    datosRespuesta.Validez === 1
                );

            pregunta.agregarRespuesta(
                respuesta
            );
        }

        return pregunta;
    }
}

export default Database;