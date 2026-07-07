import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    useWindowDimensions,
    Platform,
    StatusBar,
} from 'react-native';

export default function PolilingoNavbarCode({
    racha = 0,
    energia = 5,
    energiaMaxima = 7,

    mundoActualIndex = 0,
    mundos = [
        'Mundo 1',
        'Mundo 2',
        'Mundo 3',
    ],

    onPressPerfil = () => {},

    onPressMundoAnterior = () => {
        // Aquí irá la lógica para cambiar al mundo anterior.
        // Ejemplo futuro:
        // setMundoActualIndex(mundoActualIndex - 1);
        // cambiarFondoDelMapa();
        // cambiarPosicionDeNiveles();
    },

    onPressMundoSiguiente = () => {
        // Aquí irá la lógica para cambiar al siguiente mundo.
        // Ejemplo futuro:
        // setMundoActualIndex(mundoActualIndex + 1);
        // cambiarFondoDelMapa();
        // cambiarPosicionDeNiveles();
    },
}) {
    const { width } = useWindowDimensions();

    const navbarWidth = Math.min(width - 12, 520);
    const mundoActual = mundos[mundoActualIndex] || 'Mundo';

    const energiaActual = Math.max(0, Math.min(energia, energiaMaxima));

    const topSafeSpace =
        Platform.OS === 'android'
            ? StatusBar.currentHeight || 28
            : 38;

    return (
        <View
            style={[
                styles.wrapper,
                {
                    width: navbarWidth,
                    paddingTop: topSafeSpace + 8,
                },
            ]}
        >
            {/* Barra superior */}
            <View style={styles.topBar}>

                {/* Racha */}
                <View style={styles.rachaSection}>
                    <View style={styles.iconCircle}>
                        <Text style={styles.flameIcon}>🔥</Text>
                    </View>

                    <View style={styles.rachaTextBox}>
                        <Text style={styles.smallLabel}>Racha</Text>
                        <Text style={styles.rachaNumber}>{racha}</Text>
                    </View>
                </View>

                {/* Energía */}
                <View style={styles.energySection}>
                    {Array.from({ length: energiaMaxima }).map((_, index) => {
                        const isFull = index < energiaActual;

                        return (
                            <Text
                                key={index}
                                style={[
                                    styles.heart,
                                    isFull ? styles.heartFull : styles.heartEmpty,
                                ]}
                            >
                                {isFull ? '♥' : '♡'}
                            </Text>
                        );
                    })}
                </View>

                {/* Perfil */}
                <Pressable
                    style={({ pressed }) => [
                        styles.profileButton,
                        pressed && styles.pressed,
                    ]}
                    onPress={onPressPerfil}
                >
                    <Text style={styles.profileIcon}>👤</Text>
                </Pressable>

            </View>

            {/* Barra inferior */}
            <View style={styles.worldBar}>

                <Pressable
                    style={({ pressed }) => [
                        styles.arrowButton,
                        pressed && styles.pressed,
                    ]}
                    onPress={onPressMundoAnterior}
                >
                    <Text style={styles.arrowText}>‹</Text>
                </Pressable>

                <View style={styles.worldNameContainer}>
                    <Text style={styles.decorativeLine}>✦</Text>

                    <Text
                        style={styles.worldName}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                    >
                        {mundoActual}
                    </Text>

                    <Text style={styles.decorativeLine}>✦</Text>
                </View>

                <Pressable
                    style={({ pressed }) => [
                        styles.arrowButton,
                        pressed && styles.pressed,
                    ]}
                    onPress={onPressMundoSiguiente}
                >
                    <Text style={styles.arrowText}>›</Text>
                </Pressable>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        alignSelf: 'center',
        zIndex: 100,
        paddingHorizontal: 6,
    },

    topBar: {
        width: '100%',
        minHeight: 72,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#6f4424',
        backgroundColor: '#d8b57a',

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        paddingHorizontal: 10,
        paddingVertical: 8,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 5,
        elevation: 8,
    },

    rachaSection: {
        width: '29%',
        height: 50,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#7b4f2a',
        backgroundColor: '#e7c98f',

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        paddingHorizontal: 4,
    },

    iconCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 1.5,
        borderColor: '#8c5428',
        backgroundColor: '#c79453',

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 5,
    },

    flameIcon: {
        fontSize: 17,
    },

    rachaTextBox: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    smallLabel: {
        color: '#3d2615',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.3,
    },

    rachaNumber: {
        color: '#4a2b16',
        fontSize: 15,
        fontWeight: '900',
        marginTop: -2,
    },

    energySection: {
        width: '43%',
        height: 50,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#7b4f2a',
        backgroundColor: '#e7c98f',

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        paddingHorizontal: 4,
    },

    heart: {
        fontSize: 22,
        marginHorizontal: 1,
        fontWeight: '900',
        textShadowColor: '#3c1d12',
        textShadowOffset: { width: 0.5, height: 0.5 },
        textShadowRadius: 1,
    },

    heartFull: {
        color: '#9c2020',
    },

    heartEmpty: {
        color: '#7d654a',
    },

    profileButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#7b4f2a',
        backgroundColor: '#c79453',

        alignItems: 'center',
        justifyContent: 'center',
    },

    profileIcon: {
        fontSize: 24,
    },

    worldBar: {
        width: '100%',
        minHeight: 56,
        marginTop: 5,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#6f4424',
        backgroundColor: '#d2a96d',

        flexDirection: 'row',
        alignItems: 'center',

        paddingHorizontal: 8,
        paddingVertical: 6,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 7,
    },

    arrowButton: {
        width: 48,
        height: 42,
        borderRadius: 21,
        borderWidth: 1.7,
        borderColor: '#7b4f2a',
        backgroundColor: '#e7c98f',

        alignItems: 'center',
        justifyContent: 'center',
    },

    arrowText: {
        color: '#3d2615',
        fontSize: 38,
        fontWeight: '900',
        marginTop: -4,
    },

    worldNameContainer: {
        flex: 1,
        height: 42,
        marginHorizontal: 8,
        borderRadius: 13,
        borderWidth: 1.5,
        borderColor: '#7b4f2a',
        backgroundColor: '#e7c98f',

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        paddingHorizontal: 8,
    },

    worldName: {
        flexShrink: 1,
        color: '#3d2615',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 0.5,
        textAlign: 'center',
        marginHorizontal: 8,
    },

    decorativeLine: {
        color: '#7b4f2a',
        fontSize: 13,
    },

    pressed: {
        opacity: 0.7,
        transform: [{ scale: 0.95 }],
    },
});