import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import { fetchAllLoans, updateLoanStatus } from "../../services/admin/adminLoanService";

import AdminFilterTabs from "../../components/admin/AdminFilterTabs";
import AdminLoanCard from "../../components/admin/AdminLoanCard";
import AdminLoanModal from "../../components/admin/AdminLoanModal";

export default function LoanManagementScreen() {
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        const loadLoans = async () => {
            setLoading(true);
            try {
                const fetchedLoans = await fetchAllLoans();
                setLoans(fetchedLoans);
            } catch {
                console.error("Failed to load loans");
            } finally {
                setLoading(false);
            }
        };
        loadLoans();
    }, []);

    const filteredLoans = loans.filter((loan) => {
        const matchSearch =
            loan.id.toLowerCase().includes(search.toLowerCase()) ||
            loan.borrowerName.toLowerCase().includes(search.toLowerCase()) ||
            loan.amountRequested?.toString().includes(search);
        const matchFilter = filter === "all" || loan.status === filter;
        return matchSearch && matchFilter;
    });

    const handleLoanUpdate = async (updatedLoan) => {
        const result = await updateLoanStatus(updatedLoan);
        setSuccessMsg(result.message);
        setTimeout(() => setSuccessMsg(""), 2000);

        if (result.success) {
            setLoans((prev) =>
                prev.map((l) => (l.id === updatedLoan.id ? { ...l, status: updatedLoan.status } : l))
            );
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color="#107869" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Loan Management</Text>
                <Text style={styles.subtitle}>Review & manage loan applications</Text>
            </View>

            <ScrollView style={styles.content}>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search by loan ID, borrower name, or amount..."
                    placeholderTextColor="#107869"
                    value={search}
                    onChangeText={setSearch}
                />

                <AdminFilterTabs filter={filter} setFilter={setFilter} />

                {filteredLoans.length > 0 ? (
                    filteredLoans.map((loan) => (
                        <AdminLoanCard key={loan.id} loan={loan} onPress={() => setSelectedLoan(loan)} />
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
                <View style={{ height: 60 }} />
            </ScrollView>

            {selectedLoan && (
                <AdminLoanModal
                    loan={selectedLoan}
                    onClose={() => setSelectedLoan(null)}
                    onUpdate={handleLoanUpdate}
                />
            )}
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
        paddingBottom: 32
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12
    },
    searchBar: {
        borderWidth: 2,
        borderColor: "#a4e5e0",
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 14,
        color: "#08313a",
        shadowColor: "#0c6170",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    emptyState: {
        alignItems: "center",
        marginTop: 40,
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#a4e5e0",
    },
    emptyIcon: {
        fontSize: 40,
        color: "#107869",
        marginBottom: 10
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0c6170",
        marginBottom: 8
    },
    emptySubtitle: {
        color: "#107869",
        textAlign: "center",
        fontSize: 14
    },
});