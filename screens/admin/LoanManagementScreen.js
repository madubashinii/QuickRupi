// import React, { useState } from "react";
// import { View, Text, ScrollView, StyleSheet, TextInput } from "react-native";
// import AdminFilterTabs from "../../components/admin/AdminFilterTabs";
// import AdminLoanCard from "../../components/admin/AdminLoanCard";
// import AdminLoanModal from "../../components/admin/AdminLoanModal";

// export default function LoanManagementScreen() {
//     const [filter, setFilter] = useState("all");
//     const [search, setSearch] = useState("");
//     const [selectedLoan, setSelectedLoan] = useState(null);

//     const loanData = {
//         LN008: {
//             id: "LN008",
//             borrower: "John Smith",
//             amount: 750000,
//             purpose: "Business Expansion - Equipment Purchase",
//             appliedDate: "Dec 20, 2024",
//             interestRate: "12%",
//             term: "18 months",
//             status: "pending",
//             email: "john.smith@email.com",
//             phone: "+94 77 123 4567",
//             monthlyIncome: "LKR 150,000",
//             creditScore: 725,
//             collateral: "Business Assets",
//             riskLevel: "Medium",
//             description:
//                 "Requesting funds to purchase new manufacturing equipment for textile business. The equipment will help increase production capacity by 40% and create 5 new job opportunities.",
//         },
//         LN009: {
//             id: "LN009",
//             borrower: "Emma Wilson",
//             amount: 450000,
//             purpose: "Higher Education",
//             appliedDate: "Dec 21, 2024",
//             interestRate: "10%",
//             term: "24 months",
//             status: "pending",
//             email: "emma.wilson@email.com",
//             phone: "+94 76 987 6543",
//             monthlyIncome: "LKR 85,000",
//             creditScore: 680,
//             collateral: "None",
//             riskLevel: "Low",
//             description:
//                 "Seeking financial assistance for Masters degree in Data Science. The education loan will cover tuition fees and living expenses for 2 years.",
//         },
//         LN007: {
//             id: "LN007",
//             borrower: "Mark Wilson",
//             amount: 300000,
//             purpose: "Home Renovation",
//             approvedDate: "Dec 19, 2024",
//             interestRate: "11%",
//             term: "12 months",
//             status: "approved",
//             email: "mark.wilson@email.com",
//             phone: "+94 71 456 7890",
//             monthlyIncome: "LKR 120,000",
//             creditScore: 750,
//             collateral: "Property",
//             riskLevel: "Low",
//             description:
//                 "Approved loan for home renovation including kitchen remodeling and bathroom upgrades. Funds to be disbursed upon final documentation.",
//         },
//         LN001: {
//             id: "LN001",
//             borrower: "Sarah Johnson",
//             amount: 1500000,
//             purpose: "Business Capital",
//             disbursedDate: "Jun 25, 2024",
//             interestRate: "12%",
//             term: "12 months",
//             status: "ongoing",
//             email: "sarah.johnson@email.com",
//             phone: "+94 77 234 5678",
//             monthlyIncome: "LKR 200,000",
//             creditScore: 780,
//             collateral: "Business & Property",
//             riskLevel: "Low",
//             paymentsCompleted: 6,
//             totalPayments: 12,
//             nextPaymentDate: "Dec 25, 2024",
//             nextPaymentAmount: 105000,
//             description:
//                 "Ongoing business loan for working capital. Customer has maintained excellent payment history with all payments made on time.",
//             repaymentSchedule: [
//                 { month: "Jul 2024", amount: 105000, status: "paid" },
//                 { month: "Aug 2024", amount: 105000, status: "paid" },
//                 { month: "Sep 2024", amount: 105000, status: "paid" },
//                 { month: "Oct 2024", amount: 105000, status: "paid" },
//                 { month: "Nov 2024", amount: 105000, status: "paid" },
//                 { month: "Dec 2024", amount: 105000, status: "pending" },
//                 { month: "Jan 2025", amount: 105000, status: "scheduled" },
//                 { month: "Feb 2025", amount: 105000, status: "scheduled" },
//             ],
//         },
//         LN006: {
//             id: "LN006",
//             borrower: "David Miller",
//             amount: 2000000,
//             purpose: "Real Estate Investment",
//             rejectedDate: "Dec 18, 2024",
//             interestRate: "N/A",
//             term: "24 months",
//             status: "rejected",
//             email: "david.miller@email.com",
//             phone: "+94 75 345 6789",
//             monthlyIncome: "LKR 80,000",
//             creditScore: 620,
//             collateral: "None",
//             riskLevel: "High",
//             rejectionReason:
//                 "Insufficient monthly income relative to loan amount. Debt-to-income ratio exceeds acceptable limits.",
//             description:
//                 "Application rejected due to high risk assessment. Monthly income insufficient to support requested loan amount.",
//         },
//         LN003: {
//             id: "LN003",
//             borrower: "Lisa Davis",
//             amount: 600000,
//             purpose: "Medical Expenses",
//             completedDate: "Dec 15, 2024",
//             interestRate: "9%",
//             term: "18 months",
//             status: "completed",
//             email: "lisa.davis@email.com",
//             phone: "+94 76 456 7891",
//             monthlyIncome: "LKR 95,000",
//             creditScore: 710,
//             collateral: "Life Insurance Policy",
//             riskLevel: "Low",
//             description:
//                 "Successfully completed medical loan. All 18 monthly payments made on time. Excellent customer with perfect repayment history.",
//         },
//     };

//     const loans = Object.values(loanData).filter((loan) => {
//         const matchSearch =
//             loan.id.toLowerCase().includes(search.toLowerCase()) ||
//             loan.borrower.toLowerCase().includes(search.toLowerCase()) ||
//             loan.amount.toString().includes(search);
//         const matchFilter = filter === "all" || loan.status === filter;
//         return matchSearch && matchFilter;
//     });

//     return (
//         <View style={styles.container}>
//             {/* Header */}
//             <View style={styles.header}>
//                 <Text style={styles.title}>Loan Management</Text>
//                 <Text style={styles.subtitle}>Review & manage loan applications</Text>
//             </View>

//             <ScrollView style={styles.content}>
//                 {/* Stats */}
//                 {/* <View style={styles.statsGrid}>
//                     <AdminStatCard number="47" label="Total Loans" />
//                     <AdminStatCard number="12" label="Pending" />
//                     <AdminStatCard number="23" label="Active" />
//                     <AdminStatCard number="8" label="Completed" />
//                 </View> */}

//                 {/* Search Bar */}
//                 <TextInput
//                     style={styles.searchBar}
//                     placeholder="Search by loan ID, borrower name, or amount..."
//                     placeholderTextColor="#107869"
//                     value={search}
//                     onChangeText={setSearch}
//                 />

//                 {/* Filter Tabs */}
//                 <AdminFilterTabs filter={filter} setFilter={setFilter} />

//                 {/* Loan List */}
//                 {loans.length > 0 ? (
//                     loans.map((loan) => (
//                         <AdminLoanCard
//                             key={loan.id}
//                             loan={loan}
//                             onPress={() => setSelectedLoan(loan)}
//                         />
//                     ))
//                 ) : (
//                     <View style={styles.emptyState}>
//                         <Text style={styles.emptyIcon}>🔍</Text>
//                         <Text style={styles.emptyTitle}>No loans found</Text>
//                         <Text style={styles.emptySubtitle}>
//                             Try adjusting your search or filter criteria
//                         </Text>
//                     </View>
//                 )}
//                 <View style={{ height: 60 }} />
//             </ScrollView>

//             {/* Modal */}
//             {selectedLoan && (
//                 <AdminLoanModal
//                     loan={selectedLoan}
//                     onClose={() => setSelectedLoan(null)}
//                     onUpdate={(updatedLoan) => {
//                         loanData[updatedLoan.id] = updatedLoan;
//                         setSelectedLoan(null);
//                     }}
//                 />
//             )}
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: "#dbf5f0"
//     },
//     header: {
//         paddingTop: 40,
//         paddingBottom: 20,
//         backgroundColor: "#0c6170",
//         alignItems: "center",
//         position: "relative",
//     },
//     title: {
//         fontSize: 22,
//         fontWeight: "700",
//         color: "#fff"
//     },
//     subtitle: {
//         color: "#a4e5e0",
//         opacity: 0.9,
//         marginTop: 4
//     },
//     content: {
//         padding: 20,
//         paddingBottom: 32
//     },
//     statsGrid: {
//         flexDirection: "row",
//         flexWrap: "wrap",
//         gap: 12
//     },
//     searchBar: {
//         borderWidth: 2,
//         borderColor: "#a4e5e0",
//         backgroundColor: "#fff",
//         borderRadius: 8,
//         padding: 12,
//         marginBottom: 16,
//         fontSize: 14,
//         color: "#08313a",
//         shadowColor: "#0c6170",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 2
//     },
//     emptyState: {
//         alignItems: "center",
//         marginTop: 40,
//         padding: 20,
//         backgroundColor: "#fff",
//         borderRadius: 12,
//         borderWidth: 2,
//         borderColor: "#a4e5e0",
//     },
//     emptyIcon: {
//         fontSize: 40,
//         color: "#107869",
//         marginBottom: 10
//     },
//     emptyTitle: {
//         fontSize: 16,
//         fontWeight: "700",
//         color: "#0c6170",
//         marginBottom: 8
//     },
//     emptySubtitle: {
//         color: "#107869",
//         textAlign: "center",
//         fontSize: 14
//     },
// });



import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import { db } from "../../services/firebaseConfig";
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";


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
        const fetchLoans = async () => {
            setLoading(true);
            try {
                const loanSnapshot = await getDocs(collection(db, "loans"));
                const loansData = loanSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

                const userSnapshot = await getDocs(collection(db, "users"));
                const usersData = userSnapshot.docs.map(doc => ({ ...doc.data(), userId: doc.id }));
                const usersMap = {};
                usersData.forEach(u => { usersMap[u.userId] = u; });

                const kycSnapshot = await getDocs(collection(db, "kycSubmissions"));
                const kycData = kycSnapshot.docs.map(doc => doc.data());
                const kycMap = {};
                kycData.forEach(k => {
                    if (k.userId) {
                        kycMap[k.userId] = k;
                    }
                });

                const mergedLoans = loansData.map(loan => {
                    const borrower = usersMap[loan.borrowerId] || {};
                    const kyc = kycMap[loan.borrowerId] || {};
                    return {
                        ...loan,
                        borrowerName: borrower.name || "Unknown",
                        borrowerEmail: borrower.email || "",
                        borrowerPhone: kyc.phone || "",
                        monthlyIncome: kyc.monthlyIncome || 0,
                        kycStatus: kyc.kycStatus || "pending",
                    };
                });
                console.log("Merged Loans:", mergedLoans);

                setLoans(mergedLoans);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching loans:", error);
                setLoading(false);
            }
        };

        fetchLoans();
    }, []);


    const filteredLoans = loans.filter(loan => {
        const matchSearch =
            loan.id.toLowerCase().includes(search.toLowerCase()) ||
            loan.borrowerName.toLowerCase().includes(search.toLowerCase()) ||
            loan.amountRequested?.toString().includes(search);
        const matchFilter = filter === "all" || loan.status === filter;
        return matchSearch && matchFilter;
    });

    const handleLoanUpdate = async (updatedLoan) => {
        try {
            const loanRef = doc(db, "loans", updatedLoan.id);
            await updateDoc(loanRef, { status: updatedLoan.status });

            // Send notification to borrower
            await addDoc(collection(db, "notifications"), {
                userId: updatedLoan.borrowerId,
                title:
                    updatedLoan.status === "funding"
                        ? "Loan Approved"
                        : updatedLoan.status === "rejected"
                            ? "Loan Rejected"
                            : updatedLoan.status === "disbursed"
                                ? "Funds Disbursed"
                                : "Loan Update",
                message:
                    updatedLoan.status === "funding"
                        ? `Your loan request #${updatedLoan.id} has been approved for funding.`
                        : updatedLoan.status === "rejected"
                            ? `Your loan request #${updatedLoan.id} was rejected.`
                            : updatedLoan.status === "disbursed"
                                ? `Funds for your loan #${updatedLoan.id} have been disbursed.`
                                : `Your loan #${updatedLoan.id} status changed to ${updatedLoan.status}.`,
                createdAt: serverTimestamp(),
                isRead: false,
            });

            setSuccessMsg(`Loan #${updatedLoan.id} updated to ${updatedLoan.status}`);
            setTimeout(() => setSuccessMsg(""), 1000);
        } catch (error) {
            console.error("Error updating loan:", error);
            setSuccessMsg("Error: Could not update loan status");
            setTimeout(() => setSuccessMsg(""), 3000);
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
                    filteredLoans.map(loan => (
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
                <View style={{ height: 60 }} />
            </ScrollView>

            {selectedLoan && (
                <AdminLoanModal
                    loan={selectedLoan}
                    onClose={() => setSelectedLoan(null)}
                    onUpdate={async (updatedLoan) => {
                        await handleLoanUpdate(updatedLoan);

                        // Update local UI immediately
                        setLoans(prev =>
                            prev.map(l =>
                                l.id === updatedLoan.id ? { ...l, status: updatedLoan.status } : l
                            )
                        );
                        setSelectedLoan(null);
                    }}
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
        paddingTop: 40,
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