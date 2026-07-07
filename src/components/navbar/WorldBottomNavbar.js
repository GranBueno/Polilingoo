import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Pressable,
} from 'react-native';

import { globalStyles } from '../../styles/styles';

const iconoPerfil = require('../../assets/navbar/iconoPerfil.png');

const racha10 = require('../../assets/navbar/racha10.png');
const racha30 = require('../../assets/navbar/racha30.png');
const racha100 = require('../../assets/navbar/racha100.png');

const corazones = {
    0: require('../../assets/navbar/corazon0.png'),
    1: require('../../assets/navbar/corazon1.png'),
    2: require('../../assets/navbar/corazon2.png'),
    3: require('../../assets/navbar/corazon3.png'),
    4: require('../../assets/navbar/corazon4.png'),
};

export default function WorldBottomNavbar({
    racha = 0,
    energia = 4,
    onPressStreak = () => {},
    onPressEnergy = () => {},
    onPressProfile = () => {},
}) {
    const getRachaImage = () => {
        if (racha <= 10) {
            return racha10;
        }

        if (racha <= 30) {
            return racha30;
        }

        return racha100;
    };

    const energiaSegura = Math.max(0, Math.min(energia, 4));

    return (
        <View pointerEvents="box-none" style={styles.container}>
            <View style={styles.contentRow}>
                <Pressable
                    onPress={onPressStreak}
                    style={({ pressed }) => [
                        styles.navItem,
                        pressed && globalStyles.pressed,
                    ]}
                >
                    <View style={styles.imageWrapper}>
                        <Image
                            source={getRachaImage()}
                            style={styles.iconImage}
                            resizeMode="contain"
                        />

                        <View style={styles.valueTextContainer}>
                            <Text
                                style={[
                                    globalStyles.title,
                                    styles.valueText,
                                ]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {racha}
                            </Text>
                        </View>
                    </View>
                </Pressable>

                <Pressable
                    onPress={onPressEnergy}
                    style={({ pressed }) => [
                        styles.navItem,
                        pressed && globalStyles.pressed,
                    ]}
                >
                    <View style={styles.imageWrapper}>
                        <Image
                            source={corazones[energiaSegura]}
                            style={styles.iconImage}
                            resizeMode="contain"
                        />

                        <View style={styles.valueTextContainer}>
                            <Text
                                style={[
                                    globalStyles.title,
                                    styles.valueText,
                                ]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {energiaSegura}/4
                            </Text>
                        </View>
                    </View>
                </Pressable>

                <Pressable
                    onPress={onPressProfile}
                    style={({ pressed }) => [
                        styles.navItem,
                        pressed && globalStyles.pressed,
                    ]}
                >
                    <Image
                        source={iconoPerfil}
                        style={styles.profileImage}
                        resizeMode="contain"
                    />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 18,

    height: 120,

    zIndex: 100,
    elevation: 100,
},

    contentRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    navItem: {
        flex: 1,
        height: '100%',

        alignItems: 'center',
        justifyContent: 'center',
    },

    imageWrapper: {
        width: '100%',
        height: '100%',

        alignItems: 'center',
        justifyContent: 'center',
    },

        iconImage: {
        width: 105,
        height: 105,
    },

    profileImage: {
        width: 110,
        height: 110,
    },
    valueTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    alignItems: 'center',
    justifyContent: 'center',
},

valueText: {
    fontSize: 18,
    lineHeight: 22,
    textAlign: 'center',
},
});