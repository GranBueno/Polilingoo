import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ImageBackground,
    Pressable,
    useWindowDimensions,
} from 'react-native';

const navbarAssets = {
    topBackground: require('../assets/navbar/runicStone/runic_navbar_top_bg.png'),
    worldBackground: require('../assets/navbar/runicStone/runic_navbar_world_bg.png'),
    streakFlame: require('../assets/navbar/runicStone/runic_streak_flame.png'),
    heartFull: require('../assets/navbar/runicStone/runic_heart_full.png'),
    heartEmpty: require('../assets/navbar/runicStone/runic_heart_empty.png'),
    arrowLeft: require('../assets/navbar/runicStone/runic_arrow_left.png'),
    arrowRight: require('../assets/navbar/runicStone/runic_arrow_right.png'),
    profileIcon: require('../assets/navbar/runicStone/runic_profile_icon.png'),
};

export default function PolilingoNavbar({
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
        // Aquí después irá la lógica para cambiar al mundo anterior.
        // Ejemplo futuro:
        // setMundoActualIndex(mundoActualIndex - 1);
        // cambiarFondoDelMapa();
        // cambiarPosicionDeNiveles();
    },

    onPressMundoSiguiente = () => {
        // Aquí después irá la lógica para cambiar al siguiente mundo.
        // Ejemplo futuro:
        // setMundoActualIndex(mundoActualIndex + 1);
        // cambiarFondoDelMapa();
        // cambiarPosicionDeNiveles();
    },
}) {
    const { width } = useWindowDimensions();

    const mundoActual = mundos[mundoActualIndex] || 'Mundo';

    const navbarWidth = width > 520 ? 520 : width;

    return (
        <View style={[styles.wrapper, { width: navbarWidth }]}>

            {/* Barra superior */}
            <ImageBackground
                source={navbarAssets.topBackground}
                style={styles.topBar}
                imageStyle={styles.imageContain}
                resizeMode="contain"
            >
                {/* Zona izquierda: racha */}
                <View style={styles.rachaSection}>
                    <Image
                        source={navbarAssets.streakFlame}
                        style={styles.rachaIcon}
                        resizeMode="contain"
                    />

                    <View style={styles.rachaTextBox}>
                        <Text style={styles.rachaLabel}>Racha</Text>
                        <Text style={styles.rachaNumber}>{racha}</Text>
                    </View>
                </View>

                {/* Zona central: energía */}
                <View style={styles.energySection}>
                    {Array.from({ length: energiaMaxima }).map((_, index) => {
                        const isFull = index < energia;

                        return (
                            <Image
                                key={index}
                                source={isFull ? navbarAssets.heartFull : navbarAssets.heartEmpty}
                                style={styles.heartIcon}
                                resizeMode="contain"
                            />
                        );
                    })}
                </View>

                {/* Zona derecha: perfil */}
                <Pressable
                    style={({ pressed }) => [
                        styles.profileButton,
                        pressed && styles.pressed,
                    ]}
                    onPress={onPressPerfil}
                >
                    <Image
                        source={navbarAssets.profileIcon}
                        style={styles.profileIcon}
                        resizeMode="contain"
                    />
                </Pressable>
            </ImageBackground>

            {/* Barra inferior: navegación entre mundos */}
            <ImageBackground
                source={navbarAssets.worldBackground}
                style={styles.worldBar}
                resizeMode="stretch"
            >
                <Pressable
                    style={({ pressed }) => [
                        styles.arrowButton,
                        pressed && styles.pressed,
                    ]}
                    onPress={onPressMundoAnterior}
                >
                    <Image
                        source={navbarAssets.arrowLeft}
                        style={styles.arrowIcon}
                        resizeMode="contain"
                    />
                </Pressable>

                <View style={styles.worldNameBox}>
                    <Text
                        style={styles.worldName}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                    >
                        {mundoActual}
                    </Text>
                </View>

                <Pressable
                    style={({ pressed }) => [
                        styles.arrowButton,
                        pressed && styles.pressed,
                    ]}
                    onPress={onPressMundoSiguiente}
                >
                    <Image
                        source={navbarAssets.arrowRight}
                        style={styles.arrowIcon}
                        resizeMode="contain"
                    />
                </Pressable>
            </ImageBackground>

        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        alignSelf: 'center',
        paddingTop: 4,
        zIndex: 100,
    },
    imageContain: {
        width: '100%',
        height: '100%',
    },
    topBar: {
        width: '100%',
         aspectRatio: 3 / 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 13,
    },

    rachaSection: {
        width: '27%',
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 4,
    },

    rachaIcon: {
        width: 28,
        height: 28,
        marginRight: 4,
    },

    rachaTextBox: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    rachaLabel: {
        color: '#e7eee9',
        fontSize: 10,
        fontWeight: '800',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },

    rachaNumber: {
        color: '#9dd8ce',
        fontSize: 13,
        fontWeight: '900',
        marginTop: -2,
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },

    energySection: {
        width: '51%',
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
    },

    heartIcon: {
        width: 23,
        height: 23,
        marginHorizontal: -1,
    },

    profileButton: {
        width: '22%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },

    profileIcon: {
        width: 42,
        height: 42,
    },

    worldBar: {
        width: '100%',
        height: 64,
        marginTop: -8,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 11,
    },

    arrowButton: {
        width: '22%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },

    arrowIcon: {
        width: 35,
        height: 35,
    },

    worldNameBox: {
        width: '56%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },

    worldName: {
        color: '#e9eee8',
        fontSize: 20,
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: 0.5,
        textShadowColor: '#000',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 3,
    },

    pressed: {
        opacity: 0.65,
        transform: [{ scale: 0.94 }],
    },
});