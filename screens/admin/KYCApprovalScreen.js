// import React, { useState } from "react";
// import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal } from "react-native";
// import { FontAwesome5 } from "@expo/vector-icons";

// export default function KYCApprovalScreen({ navigation }) {
//     const [kycRequests, setKycRequests] = useState([
//         {
//             id: "USR003",
//             name: "John Smith",
//             email: "john.smith@email.com",
//             applied: "5 days ago",
//             accountType: "Business Borrower",
//             loanRequest: "LKR 900,000.00",
//             riskScore: "High",
//             priority: "urgent",
//             documents: ["NIC", "Income", "Business", "Bank"],
//         },
//         {
//             id: "USR006",
//             name: "David Miller",
//             email: "david.m@email.com",
//             applied: "2 days ago",
//             accountType: "Personal Lender",
//             investmentAmount: "LKR 500,000.00",
//             riskScore: "Low",
//             priority: "normal",
//             documents: ["NIC", "Address", "Income", "Selfie"],
//         },
//         {
//             id: "USR007",
//             name: "Anna Thompson",
//             email: "anna.t@email.com",
//             applied: "1 day ago",
//             accountType: "Personal Borrower",
//             loanRequest: "LKR 250,000.00",
//             riskScore: "Medium",
//             priority: "normal",
//             documents: ["NIC", "Income", "Bank", "Selfie"],
//         },
//     ]);

//     const [selectedDocument, setSelectedDocument] = useState(null);
//     const [approvedCount, setApprovedCount] = useState(142);

//     const approveKYC = (user) => {
//         Alert.alert("Approve KYC", `KYC approved for ${user.name}`);
//         setKycRequests((prev) => prev.filter((req) => req.id !== user.id));
//         setApprovedCount((prev) => prev + 1);
//     };

//     const rejectKYC = (user) => {
//         Alert.prompt("Reject KYC", `Enter reason for rejecting ${user.name}:`, [
//             { text: "Cancel", style: "cancel" },
//             {
//                 text: "OK",
//                 onPress: (reason) => {
//                     Alert.alert("KYC Rejected", `Rejected ${user.name} - Reason: ${reason || "No reason"}`);
//                     setKycRequests((prev) => prev.filter((req) => req.id !== user.id));
//                 },
//             },
//         ]);
//     };

//     const requestMoreInfo = (user) => {
//         Alert.alert("Request Info", `Requesting additional info from ${user.name}`);
//     };

//     const openDocument = (doc, user) => {
//         setSelectedDocument({ doc, user });
//     };

//     const closeDocument = () => {
//         setSelectedDocument(null);
//     };

//     return (
//         <View style={styles.container}>
//             {/* Header */}
//             <View style={styles.header}>
//                 <TouchableOpacity style={styles.backBtn}
//                     onPress={() => navigation.goBack()}
//                 >
//                     <FontAwesome5 name="arrow-left" size={18} color="#fff" />
//                 </TouchableOpacity>
//                 <Text style={styles.headerTitle}>KYC Approvals</Text>
//                 <Text style={styles.headerSubtitle}>Review & approve user verifications</Text>
//             </View>

//             <ScrollView contentContainerStyle={styles.content}>
//                 {/* Summary Stats */}
//                 <View style={styles.statsSummary}>
//                     <View style={styles.statCard}>
//                         <Text style={styles.statNumber}>{kycRequests.length}</Text>
//                         <Text style={styles.statLabel}>Pending</Text>
//                     </View>
//                     <View style={styles.statCard}>
//                         <Text style={styles.statNumber}>
//                             {kycRequests.filter((u) => u.priority === "urgent").length}
//                         </Text>
//                         <Text style={styles.statLabel}>Urgent</Text>
//                     </View>
//                     <View style={styles.statCard}>
//                         <Text style={styles.statNumber}>{approvedCount}</Text>
//                         <Text style={styles.statLabel}>Approved</Text>
//                     </View>
//                 </View>

//                 {kycRequests.length === 0 && (
//                     <View style={styles.emptyState}>
//                         <FontAwesome5 name="check-circle" size={48} color="#5cd85a" />
//                         <Text style={styles.emptyTitle}>All Caught Up!</Text>
//                         <Text style={styles.emptySubtitle}>No pending KYC approvals at this time.</Text>
//                     </View>
//                 )}

//                 {kycRequests.map((user) => (
//                     <View
//                         key={user.id}
//                         style={[
//                             styles.kycCard,
//                             user.priority === "urgent" ? styles.urgent : styles.normal,
//                         ]}
//                     >
//                         {/* User Info */}
//                         <View style={styles.kycHeader}>
//                             <View style={styles.userAvatar}>
//                                 <Text style={styles.avatarText}>{user.name[0] + user.name.split(" ")[1][0]}</Text>
//                             </View>
//                             <View style={styles.userInfo}>
//                                 <Text style={styles.userName}>{user.name}</Text>
//                                 <Text style={styles.userDetails}>
//                                     {user.email} • Applied: {user.applied}
//                                 </Text>
//                             </View>
//                             <View
//                                 style={[
//                                     styles.priorityBadge,
//                                     user.priority === "urgent" ? styles.priorityUrgent : styles.priorityNormal,
//                                 ]}
//                             >
//                                 <Text style={[styles.badgeText, user.priority === "normal" && { color: "#d97706" }]}>
//                                     {user.priority === "urgent" ? "URGENT" : "NORMAL"}
//                                 </Text>
//                             </View>
//                         </View>

//                         {/* Verification Info */}
//                         <View style={styles.verificationInfo}>
//                             <View style={styles.infoRow}>
//                                 <Text style={styles.infoLabel}>Account Type:</Text>
//                                 <Text style={styles.infoValue}>{user.accountType}</Text>
//                             </View>
//                             {user.loanRequest && (
//                                 <View style={styles.infoRow}>
//                                     <Text style={styles.infoLabel}>Loan Request:</Text>
//                                     <Text style={styles.infoValue}>{user.loanRequest}</Text>
//                                 </View>
//                             )}
//                             {user.investmentAmount && (
//                                 <View style={styles.infoRow}>
//                                     <Text style={styles.infoLabel}>Investment Amount:</Text>
//                                     <Text style={styles.infoValue}>{user.investmentAmount}</Text>
//                                 </View>
//                             )}
//                             <View style={styles.infoRow}>
//                                 <Text style={styles.infoLabel}>Risk Score:</Text>
//                                 <Text
//                                     style={[
//                                         styles.infoValue,
//                                         { color: user.riskScore === "High" ? "#dc2626" : user.riskScore === "Medium" ? "#f59e0b" : "#5cd85a" },
//                                     ]}
//                                 >
//                                     {user.riskScore}
//                                 </Text>
//                             </View>
//                         </View>

//                         {/* Documents */}
//                         <View style={styles.documentGrid}>
//                             {user.documents.map((doc) => (
//                                 <TouchableOpacity
//                                     key={doc}
//                                     style={styles.documentItem}
//                                     onPress={() => openDocument(doc, user.name)}
//                                 >
//                                     <FontAwesome5
//                                         name={
//                                             doc === "NIC"
//                                                 ? "id-card"
//                                                 : doc === "Income"
//                                                     ? "file-invoice"
//                                                     : doc === "Business"
//                                                         ? "building"
//                                                         : doc === "Bank"
//                                                             ? "university"
//                                                             : doc === "Address"
//                                                                 ? "home"
//                                                                 : "camera"
//                                         }
//                                         size={24}
//                                         color="#0c6170"
//                                     />
//                                     <Text style={styles.docLabel}>{doc}</Text>
//                                 </TouchableOpacity>
//                             ))}
//                         </View>

//                         {/* Actions */}
//                         <View style={styles.actionButtons}>
//                             <TouchableOpacity style={styles.btnApprove} onPress={() => approveKYC(user)}>
//                                 <FontAwesome5 name="check" size={16} color="#fff" style={{ marginRight: 5 }} />
//                                 <Text style={styles.btnText}>Approve</Text>
//                             </TouchableOpacity>
//                             {user.priority === "normal" && (
//                                 <TouchableOpacity style={styles.btnReview} onPress={() => requestMoreInfo(user)}>
//                                     <FontAwesome5
//                                         name="question-circle"
//                                         size={16}
//                                         color="#fff"
//                                         style={{ marginRight: 5 }}
//                                     />
//                                     <Text style={styles.btnText}>More Info</Text>
//                                 </TouchableOpacity>
//                             )}
//                             <TouchableOpacity style={styles.btnReject} onPress={() => rejectKYC(user)}>
//                                 <FontAwesome5 name="times" size={16} color="#fff" style={{ marginRight: 5 }} />
//                                 <Text style={styles.btnText}>Reject</Text>
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                 ))}
//             </ScrollView>

//             {/* Document Modal */}
//             <Modal visible={!!selectedDocument} transparent animationType="fade">
//                 <View style={styles.modalBackground}>
//                     <View style={styles.modalContent}>
//                         <Text style={styles.modalTitle}>{selectedDocument?.doc} Document</Text>
//                         <FontAwesome5
//                             name="file-image"
//                             size={48}
//                             color="#0c6170"
//                             style={{ marginVertical: 20, alignSelf: "center" }}
//                         />
//                         <Text style={{ textAlign: "center", marginBottom: 20, color: "#08313a" }}>
//                             Document for {selectedDocument?.user}
//                         </Text>
//                         <View style={{ flexDirection: "row", gap: 10 }}>
//                             <TouchableOpacity style={styles.modalBtnClose} onPress={closeDocument}>
//                                 <Text style={{ color: "#0c6170", textAlign: "center", fontWeight: "600" }}>Close</Text>
//                             </TouchableOpacity>
//                             <TouchableOpacity
//                                 style={styles.modalBtnDownload}
//                                 onPress={() => {
//                                     Alert.alert("Download", `Downloading ${selectedDocument.doc} for ${selectedDocument.user}`);
//                                     closeDocument();
//                                 }}
//                             >
//                                 <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>Download</Text>
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                 </View>
//             </Modal>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: "#dbf5f0" },
//     header: { paddingTop: 40, paddingBottom: 20, backgroundColor: '#0c6170', alignItems: 'center', position: 'relative' },
//     backBtn: { position: 'absolute', left: 20, top: 45, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(55, 190, 176, 0.3)', justifyContent: 'center', alignItems: 'center' },
//     headerTitle: { fontSize: 22, fontWeight: "700", color: "#fff" },
//     headerSubtitle: { fontSize: 12, color: "#a4e5e0", marginTop: 4 },
//     content: { padding: 16 },
//     emptyState: { alignItems: "center", marginTop: 50, backgroundColor: "#fff", padding: 30, borderRadius: 12, borderWidth: 2, borderColor: "#a4e5e0" },
//     emptyTitle: { fontSize: 18, fontWeight: "700", marginVertical: 5, color: "#0c6170" },
//     emptySubtitle: { color: "#107869", fontSize: 14 },
//     kycCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: "#0c6170", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
//     urgent: { borderColor: "#dc2626", borderWidth: 2, backgroundColor: "#fef2f2" },
//     normal: { borderColor: "#f59e0b", borderWidth: 2, backgroundColor: "#fffbeb" },
//     kycHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
//     userAvatar: {
//         width: 50,
//         height: 50,
//         borderRadius: 25,
//         backgroundColor: "#0c6170",
//         alignItems: "center",
//         justifyContent: "center",
//         marginRight: 10,
//         borderWidth: 2,
//         borderColor: "#a4e5e0"
//     },
//     avatarText: { color: "#fff", fontWeight: "700" },
//     userInfo: { flex: 1 },
//     userName: { fontWeight: "700", fontSize: 16, color: "#08313a" },
//     userDetails: { fontSize: 12, color: "#107869" },
//     priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
//     priorityUrgent: { backgroundColor: "#fee2e2" },
//     priorityNormal: { backgroundColor: "#fef3c7" },
//     badgeText: { fontSize: 10, fontWeight: "600", color: "#dc2626" },
//     verificationInfo: { marginBottom: 12, backgroundColor: "#dbf5f0", padding: 12, borderRadius: 8 },
//     infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
//     infoLabel: { fontSize: 12, color: "#107869", fontWeight: "600" },
//     infoValue: { fontSize: 12, fontWeight: "600", color: "#08313a" },
//     documentGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
//     documentItem: {
//         width: "22%",
//         padding: 8,
//         backgroundColor: "#dbf5f0",
//         borderRadius: 8,
//         alignItems: "center",
//         justifyContent: "center",
//         borderWidth: 1,
//         borderColor: "#a4e5e0"
//     },
//     docLabel: { fontSize: 10, marginTop: 4, textAlign: "center", color: "#107869", fontWeight: "600" },
//     actionButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, gap: 5 },
//     btnApprove: { flex: 1, backgroundColor: "#107869", flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 10, borderRadius: 8, shadowColor: "#0c6170", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
//     btnReject: { flex: 1, backgroundColor: "#dc2626", flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 10, borderRadius: 8, shadowColor: "#dc2626", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
//     btnReview: { flex: 1, backgroundColor: "#37beb0", flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 10, borderRadius: 8, shadowColor: "#0c6170", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
//     btnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
//     modalBackground: { flex: 1, backgroundColor: "rgba(8, 49, 58, 0.8)", justifyContent: "center", alignItems: "center" },
//     modalContent: { backgroundColor: "#fff", borderRadius: 12, padding: 20, width: "80%", borderWidth: 2, borderColor: "#a4e5e0" },
//     modalTitle: { fontWeight: "700", fontSize: 18, textAlign: "center", color: "#0c6170", marginBottom: 10 },
//     modalBtnClose: { flex: 1, padding: 10, borderWidth: 2, borderColor: "#0c6170", borderRadius: 6 },
//     modalBtnDownload: { flex: 1, padding: 10, backgroundColor: "#0c6170", borderRadius: 6, shadowColor: "#0c6170", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
//     statsSummary: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
//     statCard: { backgroundColor: "#fff", padding: 12, borderRadius: 8, alignItems: "center", flex: 1, marginHorizontal: 4, borderWidth: 2, borderColor: "#a4e5e0", shadowColor: "#0c6170", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
//     statNumber: { fontSize: 18, fontWeight: "700", color: "#0c6170" },
//     statLabel: { fontSize: 10, color: "#107869", marginTop: 4, fontWeight: "600" },
// });


import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { db } from "../../services/firebaseConfig";
import { collection, onSnapshot, getDocs, query, where, doc, updateDoc, addDoc } from "firebase/firestore";

export default function KYCApprovalScreen({ navigation }) {
    const [kycRequests, setKycRequests] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [approvedCount, setApprovedCount] = useState(142);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState({ visible: false, action: null, user: null });
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "kycSubmissions"), async (snapshot) => {
            const data = snapshot.docs.map(docSnap => ({
                id: docSnap.id,
                ...docSnap.data(),
            }));
            // Calculate approved count
            const approved = data.filter(u => u.kycStatus === "approved").length;
            setApprovedCount(approved);

            // Map KYC + loan info
            const mappedData = await Promise.all(data.map(async (user) => {
                let loanRequest = null;

                try {
                    if (user.userId) {
                        const loansQuery = query(
                            collection(db, "loans"),
                            where("borrowerId", "==", user.userId)
                        );
                        const loanSnapshot = await getDocs(loansQuery);

                        if (!loanSnapshot.empty) {
                            const latestLoan = loanSnapshot.docs
                                .map(doc => doc.data())
                                .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))[0];
                            loanRequest = latestLoan.amountRequested || null;
                        }
                    }
                } catch (err) {
                    console.error("Error fetching loan info:", err);
                }

                return {
                    id: user.id,
                    userId: user.userId || null,
                    name: user.fullName || "Unknown",
                    email: user.email || "No email",
                    applied: user.submittedAt
                        ? new Date(user.submittedAt.seconds * 1000).toLocaleDateString()
                        : "N/A",
                    accountType: user.accountType || (user.isBusiness ? "Business Borrower" : "Personal Borrower"),
                    loanRequest,
                    riskScore: user.riskScore || "Medium",
                    priority: user.priority || "normal",
                    documents: user.documents || ["NIC", "Income", "Address", "Selfie"],
                    kycStatus: user.kycStatus || "pending",
                };
            }));
            // Show only non-approved requests
            setKycRequests(mappedData.filter(u => u.kycStatus !== "approved"));
            setLoading(false);
        }, (error) => {
            console.error("Firestore listener error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleConfirmAction = async () => {
        const { action, user } = confirmModal;
        if (!user) return;

        try {
            const kycRef = doc(db, "kycSubmissions", user.id);
            await updateDoc(kycRef, {
                kycStatus: action === "approve" ? "approved" : "rejected",
            });

            // Only add notification if we have userId
            if (user.userId) {
                await addDoc(collection(db, "notifications"), {
                    userId: user.userId,
                    message:
                        action === "approve"
                            ? "Your KYC has been approved! You can now apply for or fund loans."
                            : "Your KYC submission was rejected. Please review and resubmit your details.",
                    type: action === "approve" ? "kycApproved" : "kycRejected",
                    isRead: false,
                    timestamp: new Date(),
                });
            } else {
                console.warn(`⚠️ Missing userId for KYC ${user.id}`);
            }

            setSuccessMsg(`KYC ${action === "approve" ? "approved" : "rejected"} for ${user.name}`);
            setKycRequests(prev => prev.filter(req => req.id !== user.id));
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (err) {
            console.error("Error updating KYC:", err);
        } finally {
            setConfirmModal({ visible: false, action: null, user: null });
        }
    };

    const approveKYC = (user) => setConfirmModal({ visible: true, action: "approve", user });
    const rejectKYC = (user) => setConfirmModal({ visible: true, action: "reject", user });
    const openDocument = (doc, user) => setSelectedDocument({ doc, user });
    const closeDocument = () => setSelectedDocument(null);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color="#107869" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <FontAwesome5 name="arrow-left" size={18} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>KYC Approvals</Text>
                <Text style={styles.headerSubtitle}>Review & approve user verifications</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.statsSummary}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{kycRequests.length}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{kycRequests.filter(u => u.priority === "urgent").length}</Text>
                        <Text style={styles.statLabel}>Urgent</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{approvedCount}</Text>
                        <Text style={styles.statLabel}>Approved</Text>
                    </View>
                </View>

                {kycRequests.length === 0 && (
                    <View style={styles.emptyState}>
                        <FontAwesome5 name="check-circle" size={48} color="#5cd85a" />
                        <Text style={styles.emptyTitle}>All Caught Up!</Text>
                        <Text style={styles.emptySubtitle}>No pending KYC approvals at this time.</Text>
                    </View>
                )}

                {kycRequests.map(user => (
                    <View key={user.id} style={[styles.kycCard, user.priority === "urgent" ? styles.urgent : styles.normal]}>
                        <View style={styles.kycHeader}>
                            <View style={styles.userAvatar}>
                                <Text style={styles.avatarText}>{user.name[0] + (user.name.split(" ")[1]?.[0] || "")}</Text>
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{user.name}</Text>
                                <Text style={styles.userDetails}>{user.email} • Applied: {user.applied}</Text>
                            </View>
                        </View>

                        <View style={styles.verificationInfo}>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Account Type:</Text>
                                <Text style={styles.infoValue}>{user.accountType}</Text>
                            </View>
                            {user.loanRequest && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Loan Request:</Text>
                                    <Text style={styles.infoValue}>LKR {Number(user.loanRequest).toLocaleString()}</Text>
                                </View>
                            )}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Risk Score:</Text>
                                <Text
                                    style={[
                                        styles.infoValue,
                                        {
                                            color:
                                                user.riskScore === "High"
                                                    ? "#dc2626"
                                                    : user.riskScore === "Medium"
                                                        ? "#f59e0b"
                                                        : "#5cd85a",
                                        },
                                    ]}
                                >
                                    {user.riskScore}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.btnApprove} onPress={() => approveKYC(user)}>
                                <FontAwesome5 name="check" size={16} color="#fff" style={{ marginRight: 5 }} />
                                <Text style={styles.btnText}>Approve</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnReject} onPress={() => rejectKYC(user)}>
                                <FontAwesome5 name="times" size={16} color="#fff" style={{ marginRight: 5 }} />
                                <Text style={styles.btnText}>Reject</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                {successMsg ? (
                    <View style={{ padding: 12, backgroundColor: "#107869", margin: 10, borderRadius: 8 }}>
                        <Text style={{ color: "#fff", textAlign: "center" }}>{successMsg}</Text>
                    </View>
                ) : null}
            </ScrollView>

            {/* Confirmation Modal */}
            <Modal visible={confirmModal.visible} transparent animationType="fade">
                <View style={styles.modalBackground}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {confirmModal.action === "approve" ? "Approve KYC" : "Reject KYC"}
                        </Text>
                        <Text style={{ textAlign: "center", color: "#08313a", marginBottom: 20 }}>
                            {confirmModal.action === "approve"
                                ? `Are you sure you want to approve ${confirmModal.user?.name}'s KYC?`
                                : `Are you sure you want to reject ${confirmModal.user?.name}'s KYC?`}
                        </Text>

                        <View style={{ flexDirection: "row", justifyContent: "center", gap: 10 }}>
                            <TouchableOpacity
                                style={styles.modalBtnClose}
                                onPress={() => setConfirmModal({ visible: false, action: null, user: null })}
                            >
                                <Text style={{ color: "#0c6170", fontWeight: "600" }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalBtnDownload}
                                onPress={handleConfirmAction}
                            >
                                <Text style={{ color: "#fff", fontWeight: "600" }}>
                                    {confirmModal.action === "approve" ? "Approve" : "Reject"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#dbf5f0" },
    header: { paddingTop: 40, paddingBottom: 20, backgroundColor: '#0c6170', alignItems: 'center', position: 'relative' },
    backBtn: { position: 'absolute', left: 20, top: 45, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(55, 190, 176, 0.3)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: "700", color: "#fff" },
    headerSubtitle: { fontSize: 12, color: "#a4e5e0", marginTop: 4 },
    content: { padding: 16 },
    emptyState: { alignItems: "center", marginTop: 50, backgroundColor: "#fff", padding: 30, borderRadius: 12, borderWidth: 2, borderColor: "#a4e5e0" },
    emptyTitle: { fontSize: 18, fontWeight: "700", marginVertical: 5, color: "#0c6170" },
    emptySubtitle: { color: "#107869", fontSize: 14 },
    kycCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16 },
    urgent: { borderColor: "#dc2626", borderWidth: 2, backgroundColor: "#fef2f2" },
    normal: { borderColor: "#f59e0b", borderWidth: 2, backgroundColor: "#fffbeb" },
    kycHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    userAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#0c6170", alignItems: "center", justifyContent: "center", marginRight: 10 },
    avatarText: { color: "#fff", fontWeight: "700" },
    userInfo: { flex: 1 },
    userName: { fontWeight: "700", fontSize: 16, color: "#08313a" },
    userDetails: { fontSize: 12, color: "#107869" },
    verificationInfo: { marginBottom: 12, backgroundColor: "#dbf5f0", padding: 12, borderRadius: 8 },
    infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
    infoLabel: { fontSize: 12, color: "#107869", fontWeight: "600" },
    infoValue: { fontSize: 12, fontWeight: "600", color: "#08313a" },
    actionButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, gap: 5 },
    btnApprove: { flex: 1, backgroundColor: "#107869", flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 10, borderRadius: 8 },
    btnReject: { flex: 1, backgroundColor: "#dc2626", flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 10, borderRadius: 8 },
    btnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
    modalBackground: { flex: 1, backgroundColor: "rgba(8, 49, 58, 0.8)", justifyContent: "center", alignItems: "center" },
    modalContent: { backgroundColor: "#fff", borderRadius: 12, padding: 20, width: "80%", borderWidth: 2, borderColor: "#a4e5e0" },
    modalTitle: { fontWeight: "700", fontSize: 18, textAlign: "center", color: "#0c6170", marginBottom: 10 },
    modalBtnClose: { flex: 1, padding: 10, borderWidth: 2, borderColor: "#0c6170", borderRadius: 6 },
    modalBtnDownload: { flex: 1, padding: 10, backgroundColor: "#0c6170", borderRadius: 6 },
    statsSummary: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
    statCard: { backgroundColor: "#fff", padding: 12, borderRadius: 8, alignItems: "center", flex: 1, marginHorizontal: 4, borderWidth: 2, borderColor: "#a4e5e0" },
    statNumber: { fontSize: 18, fontWeight: "700", color: "#0c6170" },
    statLabel: { fontSize: 10, color: "#107869", marginTop: 4, fontWeight: "600" },
});
