import React from "react";
import {
    ActivityIndicator,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    useWindowDimensions,
} from "react-native";

import { fonts } from "../../styles/styles";

const clamp = (value, minimum, maximum) =>
    Math.min(Math.max(value, minimum), maximum);

export function AuthTextField({ label, inputRef, ...inputProps }) {
    return (
        <View style={styles.fieldContainer}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                ref={inputRef}
                style={styles.input}
                placeholderTextColor="#444"
                selectionColor="#3A1E78"
                {...inputProps}
            />
        </View>
    );
}

export default function AuthScreenLayout({
    backgroundSource,
    children,
    error,
    isSubmitting,
    submitLabel,
    onSubmit,
    linkPrefix,
    linkActionLabel,
    onLinkPress,
}) {
    const { width, height } = useWindowDimensions();
    const cardWidth = Math.min(width * 0.88, 480);
    const logoSize = clamp(width * 0.34, 112, 140);

    return (
        <ImageBackground
            source={backgroundSource}
            resizeMode="stretch"
            style={styles.background}
        >
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        {
                            minHeight: height,
                            paddingTop: clamp(height * 0.18, 72, 170),
                        },
                    ]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View
                        style={[
                            styles.logoContainer,
                            {
                                width: logoSize,
                                height: logoSize,
                                borderRadius: logoSize / 2,
                            },
                        ]}
                    >
                        <Text style={styles.logoText}>LOGO</Text>
                    </View>

                    <View style={[styles.card, { width: cardWidth }]}>
                        <View style={styles.cardContent}>
                            {children}

                            {error ? (
                                <Text
                                    accessibilityRole="alert"
                                    style={styles.errorText}
                                >
                                    {error}
                                </Text>
                            ) : null}
                        </View>

                        <Pressable
                            accessibilityRole="button"
                            style={({ pressed }) => [
                                styles.submitButton,
                                isSubmitting && styles.disabledButton,
                                pressed && !isSubmitting && styles.pressed,
                            ]}
                            onPress={onSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>
                                    {submitLabel}
                                </Text>
                            )}
                        </Pressable>

                        <Pressable
                            accessibilityRole="button"
                            style={({ pressed }) => [
                                styles.linkContainer,
                                pressed && styles.pressed,
                            ]}
                            onPress={onLinkPress}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.linkText}>
                                {linkPrefix}{" "}
                                <Text style={styles.linkTextEmphasis}>
                                    {linkActionLabel}
                                </Text>
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        alignItems: "center",
        paddingBottom: 36,
    },
    logoContainer: {
        backgroundColor: "#F4EAD0",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#000",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    logoText: {
        color: "#000",
        fontFamily: fonts.title,
        fontSize: 24,
    },
    card: {
        marginTop: 25,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#000",
        backgroundColor: "rgba(255,255,255,0.50)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
        overflow: "hidden",
    },
    cardContent: {
        padding: 20,
    },
    fieldContainer: {
        marginBottom: 18,
    },
    label: {
        color: "#000",
        fontFamily: fonts.textBold,
        marginBottom: 6,
        fontSize: 15,
    },
    input: {
        height: 50,
        backgroundColor: "rgba(255,255,255,0.50)",
        borderWidth: 1,
        borderColor: "#000",
        borderRadius: 10,
        paddingHorizontal: 12,
        color: "#000",
        fontFamily: fonts.text,
        fontSize: 16,
    },
    submitButton: {
        height: 55,
        backgroundColor: "rgba(107,70,193,0.70)",
        justifyContent: "center",
        alignItems: "center",
    },
    submitButtonText: {
        color: "#FFF",
        fontFamily: fonts.title,
        fontSize: 17,
    },
    disabledButton: {
        opacity: 0.65,
    },
    errorText: {
        marginTop: -4,
        color: "#7A1515",
        fontFamily: fonts.textBold,
        fontSize: 13,
        textAlign: "center",
    },
    linkContainer: {
        paddingVertical: 14,
        paddingHorizontal: 10,
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.35)",
    },
    linkText: {
        color: "#000",
        fontFamily: fonts.textBold,
        fontSize: 14,
        textAlign: "center",
    },
    linkTextEmphasis: {
        color: "#3A1E78",
        fontFamily: fonts.title,
    },
    pressed: {
        opacity: 0.78,
    },
});
