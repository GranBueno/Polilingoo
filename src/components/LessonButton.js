import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Pressable,
} from 'react-native';

import { globalStyles, colors } from '../styles/styles';

const scrollLeccion = require('../assets/images/scroll_leccion.png');

export default function LessonButton({
    lessonNumber = 1,
    lessonData = null,
    isLocked = false,
    onPress = () => {},
}) {
    const handlePress = () => {
        if (isLocked) {
            return;
        }

        onPress(lessonData);
    };

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Lección ${lessonNumber}`}
            accessibilityState={{ disabled: isLocked }}
            disabled={isLocked}
            onPress={handlePress}
            style={({ pressed }) => [
                styles.container,
                pressed && !isLocked && globalStyles.pressed,
            ]}
        >
            <View style={styles.shadowOvalSoft} />
            <View style={styles.shadowOval} />

            <Image
                source={scrollLeccion}
                style={[
                    styles.scrollImage,
                    isLocked && styles.lockedScrollImage,
                ]}
                resizeMode="contain"
            />

            <View style={styles.lessonNumberCircle}>
                <Text
                    style={[
                        globalStyles.navbarWorldText,
                        styles.lessonNumberText,
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                >
                    {lessonNumber}
                </Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 120,
        height: 120,

        alignItems: 'center',
        justifyContent: 'center',

        overflow: 'visible',
    },

    shadowOvalSoft: {
        position: 'absolute',
        bottom: -28,

        width: 90,
        height: 90,
        borderRadius: 45,

        backgroundColor: 'rgba(0, 0, 0, 0.18)',

        transform: [
            { scaleX: 1.55 },
            { scaleY: 0.28 },
        ],

        zIndex: 1,
    },

    shadowOval: {
        position: 'absolute',
        bottom: -24,

        width: 82,
        height: 82,
        borderRadius: 41,

        backgroundColor: 'rgba(10, 6, 5, 0.48)',

        transform: [
            { scaleX: 1.45 },
            { scaleY: 0.24 },
        ],

        zIndex: 1,
    },
    scrollImage: {
        position: 'absolute',
        top: 25,

        width: 90,
        height: 90,

        zIndex: 2,
    },

    lockedScrollImage: {
        opacity: 0.45,
    },

    lessonNumberCircle: {
        position: 'absolute',

        width: 34,
        height: 34,
        borderRadius: 17,

        backgroundColor: colors.parchmentLight,
        borderWidth: 2,
        borderColor: colors.oldGold,

        alignItems: 'center',
        justifyContent: 'center',

        transform: [{ translateY: 10 }],

        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,

        zIndex: 3,
    },

    lessonNumberText: {
        fontSize: 17,
        lineHeight: 20,
        textAlign: 'center',
    },
});
