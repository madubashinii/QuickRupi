import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from "react-native";

const filters = ["all", "pending", "funding", "funded", "disbursed", "repaying", "completed", "defaulted"];

export default function AdminFilterTabs({ filter, setFilter }) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
            <View style={styles.row}>
                {filters.map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.tab, filter === f && styles.activeTab]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.tabText, filter === f && styles.activeText]}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    row: {
        flexDirection: "row",
        gap: 8,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: "#dbf5f0",
        borderWidth: 1,
        borderColor: "#a4e5e0",
    },
    activeTab: {
        backgroundColor: "#0c6170",
        borderColor: "#37beb0",
        shadowColor: "#0c6170",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    tabText: {
        fontSize: 12,
        color: "#107869",
        fontWeight: "600",
    },
    activeText: {
        color: "#fff",
        fontWeight: "700",
    },
});
