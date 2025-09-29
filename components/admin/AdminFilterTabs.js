import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from "react-native";

const filters = ["all", "pending", "approved", "ongoing", "rejected", "completed"];

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
    container: { marginBottom: 16 },
    row: { flexDirection: "row", gap: 8 },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: "#f8fafc",
    },
    activeTab: { backgroundColor: "#667eea" },
    tabText: { fontSize: 12, color: "#6b7280" },
    activeText: { color: "#fff", fontWeight: "600" },
});
