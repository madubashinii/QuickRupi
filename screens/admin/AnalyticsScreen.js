import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import PieChart from "../../components/admin/AdminPieChart";
import { FontAwesome5 } from "@expo/vector-icons";
import { fetchAnalyticsData } from "../../services/admin/analyticsService";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';


export default function AnalyticsScreen() {
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        setLoading(true);
        const data = await fetchAnalyticsData();
        setAnalytics(data);
        setLoading(false);
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color="#0c6170" />
                <Text style={{ marginTop: 10, color: "#0c6170" }}>Loading analytics...</Text>
            </View>
        );
    }

    const repaymentData = analytics?.repaymentData || [];


    const generatePDF = async (analytics) => {
        if (!analytics) return;

        const htmlContent = `
    <html>
      <head> 
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #0c6170; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #0c6170; padding: 10px; text-align: left; }
          th { background-color: #a4e5e0; }
        </style>
      </head>
      <body>
        <h1>Platform Analytics Report</h1>
        <table>
          <tr><th>Metric</th><th>Value</th></tr>
          <tr><td>Total Volume</td><td>LKR ${analytics.totalVolume.toLocaleString()}</td></tr>
          <tr><td>Active Users</td><td>${analytics.activeUsers}</td></tr>
          <tr><td>Success Rate</td><td>${analytics.successRate}%</td></tr>
          <tr><td>Average Loan Size</td><td>LKR ${analytics.avgLoanSize.toLocaleString()}</td></tr>
          <tr><td>New Borrowers</td><td>${analytics.userGrowth.newBorrowers} (↑ ${analytics.userGrowthPercent.newBorrowers}%)</td></tr>
          <tr><td>New Lenders</td><td>${analytics.userGrowth.newLenders} (↑ ${analytics.userGrowthPercent.newLenders}%)</td></tr>
          <tr><td>Total Users</td><td>${analytics.userGrowth.totalUsers} (↑ ${analytics.userGrowthPercent.totalUsers}%)</td></tr>
        </table>
      </body>
    </html>
  `;

        // Generate PDF file
        const { uri } = await Print.printToFileAsync({ html: htmlContent });

        // Share it
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share Analytics PDF' });
    };




    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Analytics & Reports</Text>
                <Text style={styles.subtitle}>Platform performance insights</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>LKR {analytics.totalVolume.toLocaleString()}</Text>
                        <Text style={styles.statLabel}>Total Volume</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{analytics.activeUsers}</Text>
                        <Text style={styles.statLabel}>Active Users</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{analytics.successRate}%</Text>
                        <Text style={styles.statLabel}>Success Rate</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>LKR {analytics.avgLoanSize.toLocaleString()}</Text>
                        <Text style={styles.statLabel}>Avg. Loan Size</Text>
                    </View>
                </View>

                {/* Repayment Performance */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Repayment Performance</Text>
                    <PieChart size={120} strokeWidth={20} data={repaymentData} />

                    {/* Pie Chart Labels */}
                    <View style={styles.pieLabels}>
                        {repaymentData.map((item, idx) => (
                            <View key={idx} style={styles.pieLabelItem}>
                                <View style={[styles.pieDot, { backgroundColor: item.color }]} />
                                <Text style={styles.pieText}>{item.label}</Text>
                                <Text style={styles.piePercent}>{item.percent}%</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* User Growth */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>User Growth</Text>
                    {[
                        {
                            title: "New Borrowers",
                            value: `+${analytics.userGrowth.newBorrowers}`,
                            percent: `↑ ${analytics.userGrowthPercent.newBorrowers}%`,
                            color: "#5cd85a",
                        },
                        {
                            title: "New Lenders",
                            value: `+${analytics.userGrowth.newLenders}`,
                            percent: `↑ ${analytics.userGrowthPercent.newLenders}%`,
                            color: "#5cd85a",
                        },
                        {
                            title: "Total Users",
                            value: analytics.userGrowth.totalUsers,
                            percent: `↑ ${analytics.userGrowthPercent.totalUsers}%`,
                            color: "#5cd85a",
                        },
                    ].map((item, idx) => (
                        <View key={idx} style={styles.transactionItem}>
                            <View>
                                <Text style={styles.transactionTitle}>{item.title}</Text>
                                <Text style={styles.transactionDate}>This month</Text>
                            </View>
                            <View style={{ alignItems: "flex-end" }}>
                                <Text style={[styles.transactionAmount, { color: item.color }]}>{item.value}</Text>
                                <Text style={{ fontSize: 12, color: item.color }}>{item.percent}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Button */}
                <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => generatePDF(analytics)}
                >
                    <FontAwesome5
                        name="download"
                        size={16}
                        color="#0c6170"
                        style={{ marginRight: 8 }}
                    />
                    <Text style={styles.secondaryBtnText}>Generate Detailed Report</Text>
                </TouchableOpacity>


            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#dbf5f0"
    },
    header: {
        paddingTop: 80,
        paddingBottom: 20,
        backgroundColor: "#0c6170",
        alignItems: "center",
        position: "relative",
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#fff"
    },
    subtitle: {
        color: "#a4e5e0",
        opacity: 0.9,
        marginTop: 4
    },
    content: {
        padding: 20,
        paddingBottom: 16
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: "#a4e5e0",
        elevation: 2,
        shadowColor: "#0c6170",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 12,
        color: "#0c6170"
    },

    barChart: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-around",
        height: 120,
        paddingVertical: 10,
        backgroundColor: "#dbf5f0",
        borderRadius: 8,
    },
    bar: {
        width: 20,
        backgroundColor: "#37beb0",
        borderRadius: 2
    },
    barLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10
    },
    barLabel: {
        fontSize: 10,
        color: "#107869",
        fontWeight: "600"
    },

    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 12,
    },
    statCard: {
        flex: 1,
        minWidth: "45%",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#a4e5e0",
        shadowColor: "#0c6170",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0c6170"
    },
    statLabel: {
        fontSize: 12,
        color: "#107869",
        marginTop: 4,
        fontWeight: "600"
    },

    pieLabels: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 10
    },
    pieLabelItem: {
        alignItems: "center"
    },
    pieDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginBottom: 5
    },
    pieText: {
        fontSize: 12,
        color: "#08313a",
        fontWeight: "600"
    },
    piePercent: {
        fontWeight: "700",
        color: "#0c6170",
        fontSize: 13
    },

    transactionItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: "#dbf5f0",
    },
    transactionTitle: {
        fontWeight: "600",
        color: "#08313a"
    },
    transactionDate: {
        fontSize: 12,
        color: "#107869"
    },
    transactionAmount: {
        fontWeight: "600"
    },

    secondaryBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#0c6170",
        borderRadius: 12,
        padding: 14,
        marginVertical: 20,
        shadowColor: "#0c6170",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    secondaryBtnText: {
        color: "#0c6170",
        fontWeight: "600",
        fontSize: 16
    },
});