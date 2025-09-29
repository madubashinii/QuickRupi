import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

export default function AdminPieChart({ size = 120, strokeWidth = 20, data }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Compute cumulative offset for each segment
    let cumulativePercent = 0;

    return (
        <View style={styles.container}>
            <Svg width={size} height={size}>
                <G rotation="-90" originX={size / 2} originY={size / 2}>
                    {data.map((item, index) => {
                        const dash = (item.percent / 100) * circumference;
                        const dashOffset = circumference - (cumulativePercent / 100) * circumference;
                        cumulativePercent += item.percent;

                        return (
                            <Circle
                                key={index}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke={item.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${dash} ${circumference - dash}`}
                                strokeDashoffset={dashOffset}
                                fill="transparent"
                            />
                        );
                    })}
                </G>
            </Svg>

            <View style={[styles.center, { width: radius * 2, height: radius * 2, borderRadius: radius }]}>
                <Text style={styles.text}>
                    {data[0].percent + data[1].percent + data[2].percent}%
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { alignItems: "center", justifyContent: "center" },
    center: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    text: { fontSize: 18, fontWeight: "700" },
});
