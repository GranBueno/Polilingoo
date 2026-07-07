import { StyleSheet } from 'react-native';

export const colors = {
    parchmentLight: '#e7c98f',
    parchmentBase: '#d8b57a',
    parchmentDark: '#c79453',

    ink: '#3d2615',
    inkSoft: '#5a3a21',

    oldBrown: '#6f4424',
    borderBrown: '#7b4f2a',

    oldGold: '#b8873b',
    darkGold: '#8c5428',

    heartRed: '#9c2020',
    heartEmpty: '#7d654a',

    shadow: '#000000',
    whiteText: '#f5efe0',
};

export const fonts = {
    title: 'Cinzel_700Bold',
    titleStrong: 'Cinzel_900Black',

    text: 'Alegreya_400Regular',
    textMedium: 'Alegreya_500Medium',
    textBold: 'Alegreya_700Bold',
    textItalic: 'Alegreya_400Regular_Italic',
};

export const globalStyles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.parchmentBase,
    },

    title: {
        fontFamily: fonts.title,
        color: colors.ink,
        fontSize: 28,
        letterSpacing: 0.8,
        textAlign: 'center',
    },

    titleLarge: {
        fontFamily: fonts.titleStrong,
        color: colors.ink,
        fontSize: 34,
        letterSpacing: 1,
        textAlign: 'center',
    },

    subtitle: {
        fontFamily: fonts.title,
        color: colors.inkSoft,
        fontSize: 20,
        letterSpacing: 0.5,
        textAlign: 'center',
    },

    text: {
        fontFamily: fonts.text,
        color: colors.ink,
        fontSize: 18,
        lineHeight: 24,
    },

    textSmall: {
        fontFamily: fonts.text,
        color: colors.ink,
        fontSize: 14,
        lineHeight: 19,
    },

    textBold: {
        fontFamily: fonts.textBold,
        color: colors.ink,
        fontSize: 18,
    },

    instructionText: {
        fontFamily: fonts.textMedium,
        color: colors.inkSoft,
        fontSize: 17,
        lineHeight: 23,
        textAlign: 'center',
    },

    hintText: {
        fontFamily: fonts.textItalic,
        color: colors.inkSoft,
        fontSize: 16,
        lineHeight: 22,
    },

    buttonText: {
        fontFamily: fonts.textBold,
        color: colors.ink,
        fontSize: 18,
        textAlign: 'center',
    },

    navbarWorldText: {
        fontFamily: fonts.title,
        color: colors.ink,
        fontSize: 20,
        letterSpacing: 0.5,
        textAlign: 'center',
    },

    navbarSmallText: {
        fontFamily: fonts.textBold,
        color: colors.ink,
        fontSize: 11,
        textAlign: 'center',
    },

    parchmentBox: {
        backgroundColor: colors.parchmentLight,
        borderColor: colors.borderBrown,
        borderWidth: 2,
        borderRadius: 16,
        padding: 14,

        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 5,
        elevation: 6,
    },

    parchmentButton: {
        backgroundColor: colors.parchmentLight,
        borderColor: colors.borderBrown,
        borderWidth: 2,
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 16,

        alignItems: 'center',
        justifyContent: 'center',

        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },

    pressed: {
        opacity: 0.7,
        transform: [{ scale: 0.96 }],
    },
});