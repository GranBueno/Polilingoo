import React from "react";
import { Image, StyleSheet, View } from "react-native";

const SLIP_IMAGE = require("../assets/images/Pergamino_Slip.png");

export default function ParchmentSlip({
    children,
    visualScale = { width: 1, height: 1 },
    shadow = { offsetX: 0, offsetY: 0, opacity: 0, scale: 1 },
    contentStyle,
    tintColor = null,
    tintBorderRadius = 18,
}) {
    const width = `${visualScale.width * 100}%`;
    const height = `${visualScale.height * 100}%`;
    const shadowWidth = `${visualScale.width * shadow.scale * 100}%`;
    const shadowHeight = `${visualScale.height * shadow.scale * 100}%`;

    return (
        <View style={styles.frame}>
            <Image
                source={SLIP_IMAGE}
                resizeMode="stretch"
                style={[
                    styles.layer,
                    {
                        width: shadowWidth,
                        height: shadowHeight,
                        opacity: shadow.opacity,
                        transform: [
                            { translateX: shadow.offsetX },
                            { translateY: shadow.offsetY },
                        ],
                    },
                    styles.shadow,
                ]}
            />

            <Image
                source={SLIP_IMAGE}
                resizeMode="stretch"
                style={[styles.layer, { width, height }]}
            />

            {tintColor ? (
                <View
                    pointerEvents="none"
                    style={[
                        styles.layer,
                        {
                            width,
                            height,
                            borderRadius: tintBorderRadius,
                            backgroundColor: tintColor,
                        },
                    ]}
                />
            ) : null}

            <View style={[styles.content, contentStyle]}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    frame: {
        flex: 1,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        overflow: "visible",
    },
    layer: {
        position: "absolute",
    },
    shadow: {
        tintColor: "#000",
    },
    content: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
});
