import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput } from "react-native";
import AdminFilterTabs from "../../components/admin/AdminFilterTabs";
import AdminLoanCard from "../../components/admin/AdminLoanCard";
import AdminLoanModal from "../../components/admin/AdminLoanModal";

export default function LoanManagementScreen() {
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [selectedLoan, setSelectedLoan] = useState(null);

    const loanData = {
        LN008: {
            id: "LN008",
            borrower: "John Smith",
            amount: 750000,
            purpose: "Business Expansion - Equipment Purchase",
            appliedDate: "Dec 20, 2024",
            interestRate: "12%",
            term: "18 months",
            status: "pending",
            email: "john.smith@email.com",
            phone: "+94 77 123 4567",
            monthlyIncome: "LKR 150,000",
            creditScore: 725,
            collateral: "Business Assets",
            riskLevel: "Medium",
            description:
                "Requesting funds to purchase new manufacturing equipment for textile business. The equipment will help increase production capacity by 40% and create 5 new job opportunities.",
        },
        LN009: {
            id: "LN009",
            borrower: "Emma Wilson",
            amount: 450000,
            purpose: "Higher Education",
            appliedDate: "Dec 21, 2024",
            interestRate: "10%",
            term: "24 months",
            status: "pending",
            email: "emma.wilson@email.com",
            phone: "+94 76 987 6543",
            monthlyIncome: "LKR 85,000",
            creditScore: 680,
            collateral: "None",
            riskLevel: "Low",
            description:
                "Seeking financial assistance for Masters degree in Data Science. The education loan will cover tuition fees and living expenses for 2 years.",
        },
        LN007: {
            id: "LN007",
            borrower: "Mark Wilson",
            amount: 300000,
            purpose: "Home Renovation",
            approvedDate: "Dec 19, 2024",
            interestRate: "11%",
            term: "12 months",
            status: "approved",
            email: "mark.wilson@email.com",
            phone: "+94 71 456 7890",
            monthlyIncome: "LKR 120,000",
            creditScore: 750,
            collateral: "Property",
            riskLevel: "Low",
            description:
                "Approved loan for home renovation including kitchen remodeling and bathroom upgrades. Funds to be disbursed upon final documentation.",
        },
        LN001: {
            id: "LN001",
            borrower: "Sarah Johnson",
            amount: 1500000,
            purpose: "Business Capital",
            disbursedDate: "Jun 25, 2024",
            interestRate: "12%",
            term: "12 months",
            status: "ongoing",
            email: "sarah.johnson@email.com",
            phone: "+94 77 234 5678",
            monthlyIncome: "LKR 200,000",
            creditScore: 780,
            collateral: "Business & Property",
            riskLevel: "Low",
            paymentsCompleted: 6,
            totalPayments: 12,
            nextPaymentDate: "Dec 25, 2024",
            nextPaymentAmount: 105000,
            description:
                "Ongoing business loan for working capital. Customer has maintained excellent payment history with all payments made on time.",
            repaymentSchedule: [
                { month: "Jul 2024", amount: 105000, status: "paid" },
                { month: "Aug 2024", amount: 105000, status: "paid" },
                { month: "Sep 2024", amount: 105000, status: "paid" },
                { month: "Oct 2024", amount: 105000, status: "paid" },
                { month: "Nov 2024", amount: 105000, status: "paid" },
                { month: "Dec 2024", amount: 105000, status: "pending" },
                { month: "Jan 2025", amount: 105000, status: "scheduled" },
                { month: "Feb 2025", amount: 105000, status: "scheduled" },
            ],
        },
        LN006: {
            id: "LN006",
            borrower: "David Miller",
            amount: 2000000,
            purpose: "Real Estate Investment",
            rejectedDate: "Dec 18, 2024",
            interestRate: "N/A",
            term: "24 months",
            status: "rejected",
            email: "david.miller@email.com",
            phone: "+94 75 345 6789",
            monthlyIncome: "LKR 80,000",
            creditScore: 620,
            collateral: "None",
            riskLevel: "High",
            rejectionReason:
                "Insufficient monthly income relative to loan amount. Debt-to-income ratio exceeds acceptable limits.",
            description:
                "Application rejected due to high risk assessment. Monthly income insufficient to support requested loan amount.",
        },
        LN003: {
            id: "LN003",
            borrower: "Lisa Davis",
            amount: 600000,
            purpose: "Medical Expenses",
            completedDate: "Dec 15, 2024",
            interestRate: "9%",
            term: "18 months",
            status: "completed",
            email: "lisa.davis@email.com",
            phone: "+94 76 456 7891",
            monthlyIncome: "LKR 95,000",
            creditScore: 710,
            collateral: "Life Insurance Policy",
            riskLevel: "Low",
            description:
                "Successfully completed medical loan. All 18 monthly payments made on time. Excellent customer with perfect repayment history.",
        },
    };

    const loans = Object.values(loanData).filter((loan) => {
        const matchSearch =
            loan.id.toLowerCase().includes(search.toLowerCase()) ||
            loan.borrower.toLowerCase().includes(search.toLowerCase()) ||
            loan.amount.toString().includes(search);
        const matchFilter = filter === "all" || loan.status === filter;
        return matchSearch && matchFilter;
    });

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Loan Management</Text>
                <Text style={styles.subtitle}>Review & manage loan applications</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Stats */}
                {/* <View style={styles.statsGrid}>
                    <AdminStatCard number="47" label="Total Loans" />
                    <AdminStatCard number="12" label="Pending" />
                    <AdminStatCard number="23" label="Active" />
                    <AdminStatCard number="8" label="Completed" />
                </View> */}

                {/* Search Bar */}
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search by loan ID, borrower name, or amount..."
                    value={search}
                    onChangeText={setSearch}
                />

                {/* Filter Tabs */}
                <AdminFilterTabs filter={filter} setFilter={setFilter} />

                {/* Loan List */}
                {loans.length > 0 ? (
                    loans.map((loan) => (
                        <AdminLoanCard
                            key={loan.id}
                            loan={loan}
                            onPress={() => setSelectedLoan(loan)}
                        />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🔍</Text>
                        <Text style={styles.emptyTitle}>No loans found</Text>
                        <Text style={styles.emptySubtitle}>
                            Try adjusting your search or filter criteria
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Modal */}
            {selectedLoan && (
                <AdminLoanModal
                    loan={selectedLoan}
                    onClose={() => setSelectedLoan(null)}
                    onUpdate={(updatedLoan) => {
                        loanData[updatedLoan.id] = updatedLoan;
                        setSelectedLoan(null);
                    }}
                />

            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: {
        paddingTop: 40,
        paddingBottom: 20,
        backgroundColor: "#667eea",
        alignItems: "center",
        position: "relative",
    },
    title: { fontSize: 22, fontWeight: "700", color: "#fff" },
    subtitle: { color: "#fff", opacity: 0.9, marginTop: 4 },
    content: { padding: 20, paddingBottom: 16 },
    statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    searchBar: {
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    emptyState: { alignItems: "center", marginTop: 40 },
    emptyIcon: { fontSize: 40, color: "#9ca3af", marginBottom: 10 },
    emptyTitle: { fontSize: 16, fontWeight: "700", color: "#374151" },
    emptySubtitle: { color: "#6b7280", textAlign: "center" },
});
