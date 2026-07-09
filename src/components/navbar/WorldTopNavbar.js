import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    Pressable,
    SafeAreaView,
    Platform,
    StatusBar,
} from 'react-native';

import { globalStyles, colors } from '../../styles/styles';

const navbarImage = require('../../assets/navbar/navbar_top_scroll2.png');

export default function WorldTopNavbar({
    worldName = 'MUNDO VERDE',
    onPressLeft = () => {},
    onPressRight = () => {},
}) {
    return (
    <SafeAreaView pointerEvents="box-none" style={styles.safeArea}>
        <View pointerEvents="box-none" style={styles.container}>
            <ImageBackground
                pointerEvents="box-none"
                source={navbarImage}
                style={styles.navbarImage}
                imageStyle={styles.navbarImageStyle}
                resizeMode="stretch"
            >
                <View pointerEvents="box-none" style={styles.contentRow}>
                    <View pointerEvents="box-none" style={styles.sideColumnLeft}>
                        <Pressable
                            onPress={onPressLeft}
                            style={({ pressed }) => [
                                styles.arrowButton,
                                pressed && globalStyles.pressed,
                            ]}
                        >
                            <Text style={styles.arrowText}>‹</Text>
                        </Pressable>
                    </View>

                    <View pointerEvents="box-none" style={styles.centerColumn}>
                        <Text
                            style={[
                                globalStyles.navbarWorldText,
                                styles.worldText,
                            ]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {worldName}
                        </Text>
                    </View>

                    <View pointerEvents="box-none" style={styles.sideColumnRight}>
                        <Pressable
                            onPress={onPressRight}
                            style={({ pressed }) => [
                                styles.arrowButton,
                                pressed && globalStyles.pressed,
                            ]}
                        >
                            <Text style={styles.arrowText}>›</Text>
                        </Pressable>
                    </View>
                </View>
            </ImageBackground>
        </View>
    </SafeAreaView>
);
}

const styles = StyleSheet.create({
    
    safeArea: {
    position: 'absolute',
    top: -30,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 100,
    elevation: 100,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 0,
},

    container: {
        width: '100%',
        alignItems: 'center',
    },

    navbarImage: {
        width: '96%',
        height: 95,
        justifyContent: 'center',
    },

    navbarImageStyle: {
        width: '100%',
        height: '100%',
    },

    contentRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
    },

    sideColumnLeft: {
        width: '30%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    centerColumn: {
        width: '40%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    sideColumnRight: {
        width: '30%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
},

    worldText: {
        fontSize: 18,
        maxWidth: '100%',
        textShadowColor: 'rgba(255, 244, 210, 0.7)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },

    arrowButton: {
        width: 34,
        height: 34,
        borderRadius: 17,

        backgroundColor: colors.parchmentLight,
        borderWidth: 2,
        borderColor: colors.oldGold,

        alignItems: 'center',
        justifyContent: 'center',

        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.32,
        shadowRadius: 4,
        elevation: 6,
    },

    arrowText: {
        fontSize: 30,
        lineHeight: 30,
        color: colors.ink,
        fontWeight: 'bold',
        marginTop: -3,
    },
});