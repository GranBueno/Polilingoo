export const SEED_MUNDOS = [
    {
        id: 1,
        nombre: "MUNDO VERDE",
        orden: 1,
    },
];

export const SEED_DIFICULTADES = [
    {
        id: 1,
        nombre: "Inicial",
    },
];

export const SEED_LECCIONES = [
    {
        id: 1,
        mundoId: 1,
        dificultadId: 1,
        nombre: "Lección 1",
        descripcion: "Naturaleza básica",
        orden: 1,
        preguntas: [
            {
                texto: "Forest",
                instruccion: "Elige la traducción correcta.",
                pista: "Un lugar con muchos árboles.",
                respuestas: [
                    { texto: "Bosque", correcta: true },
                    { texto: "Río", correcta: false },
                    { texto: "Montaña", correcta: false },
                    { texto: "Fuego", correcta: false },
                ],
            },
            {
                texto: "River",
                instruccion: "Elige la traducción correcta.",
                pista: "Agua que fluye por la tierra.",
                respuestas: [
                    { texto: "Piedra", correcta: false },
                    { texto: "Río", correcta: true },
                    { texto: "Árbol", correcta: false },
                    { texto: "Casa", correcta: false },
                ],
            },
            {
                texto: "Fire",
                instruccion: "Elige la traducción correcta.",
                pista: "Da calor y luz.",
                respuestas: [
                    { texto: "Agua", correcta: false },
                    { texto: "Fuego", correcta: true },
                    { texto: "Montaña", correcta: false },
                    { texto: "Viento", correcta: false },
                ],
            },
            {
                texto: "Mountain",
                instruccion: "Elige la traducción correcta.",
                pista: "Elevación grande de tierra.",
                respuestas: [
                    { texto: "Bosque", correcta: false },
                    { texto: "Cielo", correcta: false },
                    { texto: "Montaña", correcta: true },
                    { texto: "Luna", correcta: false },
                ],
            },
            {
                texto: "Water",
                instruccion: "Elige la traducción correcta.",
                pista: "La bebemos para vivir.",
                respuestas: [
                    { texto: "Agua", correcta: true },
                    { texto: "Fuego", correcta: false },
                    { texto: "Tierra", correcta: false },
                    { texto: "Sol", correcta: false },
                ],
            },
        ],
    },
    {
        id: 2,
        mundoId: 1,
        dificultadId: 1,
        nombre: "Lección 2",
        descripcion: "Cielo y tiempo",
        orden: 2,
        preguntas: [
            {
                texto: "Sun",
                instruccion: "Elige la traducción correcta.",
                pista: "Aparece durante el día.",
                respuestas: [
                    { texto: "Sol", correcta: true },
                    { texto: "Luna", correcta: false },
                    { texto: "Noche", correcta: false },
                    { texto: "Estrella", correcta: false },
                ],
            },
            {
                texto: "Moon",
                instruccion: "Elige la traducción correcta.",
                pista: "Se ve mucho durante la noche.",
                respuestas: [
                    { texto: "Día", correcta: false },
                    { texto: "Luna", correcta: true },
                    { texto: "Luz", correcta: false },
                    { texto: "Cielo", correcta: false },
                ],
            },
            {
                texto: "Star",
                instruccion: "Elige la traducción correcta.",
                pista: "Punto brillante en el cielo nocturno.",
                respuestas: [
                    { texto: "Roca", correcta: false },
                    { texto: "Estrella", correcta: true },
                    { texto: "Árbol", correcta: false },
                    { texto: "Agua", correcta: false },
                ],
            },
            {
                texto: "Day",
                instruccion: "Elige la traducción correcta.",
                pista: "Cuando hay luz del sol.",
                respuestas: [
                    { texto: "Día", correcta: true },
                    { texto: "Noche", correcta: false },
                    { texto: "Fuego", correcta: false },
                    { texto: "Río", correcta: false },
                ],
            },
            {
                texto: "Night",
                instruccion: "Elige la traducción correcta.",
                pista: "Cuando el cielo está oscuro.",
                respuestas: [
                    { texto: "Camino", correcta: false },
                    { texto: "Sol", correcta: false },
                    { texto: "Noche", correcta: true },
                    { texto: "Casa", correcta: false },
                ],
            },
        ],
    },
    {
        id: 3,
        mundoId: 1,
        dificultadId: 1,
        nombre: "Lección 3",
        descripcion: "Personas y criaturas",
        orden: 3,
        preguntas: [
            {
                texto: "Wolf",
                instruccion: "Elige la traducción correcta.",
                pista: "Animal parecido a un perro salvaje.",
                respuestas: [
                    { texto: "Lobo", correcta: true },
                    { texto: "Ave", correcta: false },
                    { texto: "Niño", correcta: false },
                    { texto: "Maestro", correcta: false },
                ],
            },
            {
                texto: "Bird",
                instruccion: "Elige la traducción correcta.",
                pista: "Animal con alas.",
                respuestas: [
                    { texto: "Luna", correcta: false },
                    { texto: "Ave", correcta: true },
                    { texto: "Fuego", correcta: false },
                    { texto: "Río", correcta: false },
                ],
            },
            {
                texto: "Friend",
                instruccion: "Elige la traducción correcta.",
                pista: "Persona cercana y de confianza.",
                respuestas: [
                    { texto: "Enemigo", correcta: false },
                    { texto: "Amigo", correcta: true },
                    { texto: "Bosque", correcta: false },
                    { texto: "Puerta", correcta: false },
                ],
            },
            {
                texto: "Teacher",
                instruccion: "Elige la traducción correcta.",
                pista: "Persona que enseña.",
                respuestas: [
                    { texto: "Maestro", correcta: true },
                    { texto: "Estrella", correcta: false },
                    { texto: "Camino", correcta: false },
                    { texto: "Viento", correcta: false },
                ],
            },
            {
                texto: "Child",
                instruccion: "Elige la traducción correcta.",
                pista: "Persona de poca edad.",
                respuestas: [
                    { texto: "Niño", correcta: true },
                    { texto: "Montaña", correcta: false },
                    { texto: "Agua", correcta: false },
                    { texto: "Libro", correcta: false },
                ],
            },
        ],
    },
    {
        id: 4,
        mundoId: 1,
        dificultadId: 1,
        nombre: "Lección 4",
        descripcion: "Acciones básicas",
        orden: 4,
        preguntas: [
            {
                texto: "Run",
                instruccion: "Elige la traducción correcta.",
                pista: "Moverse rápido con las piernas.",
                respuestas: [
                    { texto: "Correr", correcta: true },
                    { texto: "Dormir", correcta: false },
                    { texto: "Leer", correcta: false },
                    { texto: "Beber", correcta: false },
                ],
            },
            {
                texto: "Eat",
                instruccion: "Elige la traducción correcta.",
                pista: "Consumir comida.",
                respuestas: [
                    { texto: "Escribir", correcta: false },
                    { texto: "Comer", correcta: true },
                    { texto: "Correr", correcta: false },
                    { texto: "Mirar", correcta: false },
                ],
            },
            {
                texto: "Drink",
                instruccion: "Elige la traducción correcta.",
                pista: "Consumir líquido.",
                respuestas: [
                    { texto: "Beber", correcta: true },
                    { texto: "Leer", correcta: false },
                    { texto: "Saltar", correcta: false },
                    { texto: "Caminar", correcta: false },
                ],
            },
            {
                texto: "Read",
                instruccion: "Elige la traducción correcta.",
                pista: "Interpretar texto escrito.",
                respuestas: [
                    { texto: "Cantar", correcta: false },
                    { texto: "Leer", correcta: true },
                    { texto: "Beber", correcta: false },
                    { texto: "Abrir", correcta: false },
                ],
            },
            {
                texto: "Write",
                instruccion: "Elige la traducción correcta.",
                pista: "Crear palabras con letras.",
                respuestas: [
                    { texto: "Escribir", correcta: true },
                    { texto: "Correr", correcta: false },
                    { texto: "Comer", correcta: false },
                    { texto: "Dormir", correcta: false },
                ],
            },
        ],
    },
    {
        id: 5,
        mundoId: 1,
        dificultadId: 1,
        nombre: "Lección 5",
        descripcion: "Frases sencillas",
        orden: 5,
        preguntas: [
            {
                texto: "Good morning",
                instruccion: "Elige la traducción correcta.",
                pista: "Saludo usado al empezar el día.",
                respuestas: [
                    { texto: "Buenos días", correcta: true },
                    { texto: "Buenas noches", correcta: false },
                    { texto: "Gracias", correcta: false },
                    { texto: "Adiós", correcta: false },
                ],
            },
            {
                texto: "Thank you",
                instruccion: "Elige la traducción correcta.",
                pista: "Se usa para agradecer.",
                respuestas: [
                    { texto: "Hola", correcta: false },
                    { texto: "Gracias", correcta: true },
                    { texto: "Perdón", correcta: false },
                    { texto: "Hasta luego", correcta: false },
                ],
            },
            {
                texto: "See you later",
                instruccion: "Elige la traducción correcta.",
                pista: "Despedida temporal.",
                respuestas: [
                    { texto: "Hasta luego", correcta: true },
                    { texto: "Buenos días", correcta: false },
                    { texto: "Por favor", correcta: false },
                    { texto: "Bienvenido", correcta: false },
                ],
            },
            {
                texto: "Please",
                instruccion: "Elige la traducción correcta.",
                pista: "Hace una petición más amable.",
                respuestas: [
                    { texto: "Gracias", correcta: false },
                    { texto: "Por favor", correcta: true },
                    { texto: "Agua", correcta: false },
                    { texto: "Perdón", correcta: false },
                ],
            },
            {
                texto: "Welcome",
                instruccion: "Elige la traducción correcta.",
                pista: "Se dice al recibir a alguien.",
                respuestas: [
                    { texto: "Bienvenido", correcta: true },
                    { texto: "Adiós", correcta: false },
                    { texto: "Maestro", correcta: false },
                    { texto: "Noche", correcta: false },
                ],
            },
        ],
    },
];
