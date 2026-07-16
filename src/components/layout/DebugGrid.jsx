import React from "react";
import { StyleSheet, View } from "react-native";

export default function DebugGrid({
    visible = false,
    rows,
    columns,
    cellWidth,
    cellHeight,
    borderColor = "rgba(255,255,255,0.7)",
    zIndex = 20,
}) {
    if (!visible) {
        return null;
    }

    const cells = [];

    for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
            cells.push(
                <View
                    key={`${row}-${column}`}
                    style={[
                        styles.cell,
                        {
                            width: cellWidth,
                            height: cellHeight,
                            top: row * cellHeight,
                            left: column * cellWidth,
                            borderColor,
                        },
                    ]}
                />
            );
        }
    }

    return (
        <View
            pointerEvents="none"
            style={[styles.grid, { zIndex, elevation: zIndex }]}
        >
            {cells}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: {
        ...StyleSheet.absoluteFillObject,
    },
    cell: {
        position: "absolute",
        borderWidth: StyleSheet.hairlineWidth,
    },
});
