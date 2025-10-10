import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { fetchEscrows, updateEscrowStatus } from "../../services/admin/escrowService";

export default function EscrowApprovalScreen({ navigation }) {
    const [escrows, setEscrows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [successMsg, setSuccessMsg] = useState("");
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [selectedEscrow, setSelectedEscrow] = useState(null);
    const [actionType, setActionType] = useState(""); // 'released' or 'refunded'
    const [walletUpdates, setWalletUpdates] = useState({}); // escrowId -> updated balance

    useEffect(() => {
        loadEscrows();
    }, []);

    const loadEscrows = async () => {
        setLoading(true);
        try {
            const data = await fetchEscrows();
            setEscrows(data);
        } catch (err) {
            console.error("Failed to load escrows:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEscrowUpdate = async (escrowId, newStatus, lenderId, amount) => {
        const result = await updateEscrowStatus(escrowId, newStatus, lenderId, amount);

        let msg = result.message;
        // Track wallet updates
        if (result.success) {
            setWalletUpdates(prev => ({
                ...prev,
                [escrowId]: {
                    ...prev[escrowId],
                    [newStatus]: amount
                }
            }));
            if (newStatus === "released") msg += " Repayment schedule has been created.";
        }

        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(""), 2000);

        if (result.success) {
            setEscrows(prev =>
                prev.map(e => (e.id === escrowId ? { ...e, status: newStatus } : e))
            );
        }
    };

    if (loading) return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Escrow Approvals</Text>
                <Text style={styles.subtitle}>Pending fund releases</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {escrows.map(escrow => (
                    <View key={escrow.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.loanTitle}>{`Loan #${escrow.id}`}</Text>
                            <Text
                                style={[
                                    styles.statusBadge,
                                    escrow.status === 'Pending'
                                        ? styles.pendingBadge
                                        : escrow.status === 'released'
                                            ? styles.approvedBadge
                                            : styles.rejectedBadge
                                ]}
                            >
                                {escrow.status}
                            </Text>
                        </View>

                        {escrow.status !== 'released' && escrow.status !== 'refunded' && (
                            <>
                                <View style={styles.infoGrid}>
                                    <View>
                                        <Text style={styles.infoItem}>Borrower</Text>
                                        <Text style={styles.infoValue}>{escrow.borrower}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.infoItem}>Lender</Text>
                                        <Text style={styles.infoValue}>{escrow.lender}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.infoItem}>Amount</Text>
                                        <Text style={[styles.infoValue, { color: '#0c6170' }]}>
                                            LKR {escrow.amount.toLocaleString()}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={styles.infoItem}>Request Date</Text>
                                        <Text style={styles.infoValue}>{escrow.requestDate}</Text>
                                    </View>
                                </View>

                                <View style={styles.purposeBox}>
                                    <Text style={styles.purposeLabel}>Purpose</Text>
                                    <Text style={styles.purposeText}>{escrow.purpose}</Text>
                                </View>

                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={styles.btnApprove}
                                        onPress={() => {
                                            setSelectedEscrow(escrow);
                                            setActionType('released');
                                            setConfirmVisible(true);
                                        }}
                                    >
                                        <FontAwesome5 name="check" size={16} color="#fff" style={{ marginRight: 6 }} />
                                        <Text style={styles.btnText}>Approve</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.btnReject}
                                        onPress={() => {
                                            setSelectedEscrow(escrow);
                                            setActionType('refunded');
                                            setConfirmVisible(true);
                                        }}
                                    >
                                        <FontAwesome5 name="times" size={16} color="#fff" style={{ marginRight: 6 }} />
                                        <Text style={styles.btnText}>Reject</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        {(escrow.status === 'released' || escrow.status === 'refunded') && (
                            <>
                                <View style={styles.approvedBox}>
                                    <FontAwesome5 name="check-circle" size={18} color="#107869" style={{ marginRight: 6 }} />
                                    <Text style={styles.approvedText}>
                                        {escrow.status === 'released' ? 'Funds released successfully' : 'Escrow refunded'}
                                    </Text>
                                </View>

                                {/* Borrower wallet update for released */}
                                {walletUpdates[escrow.id]?.released && (
                                    <View style={{ marginTop: 10 }}>
                                        <Text style={{ color: '#107869', fontSize: 13 }}>
                                            Borrower wallet updated with LKR {walletUpdates[escrow.id].released.toLocaleString()}
                                        </Text>
                                    </View>
                                )}

                                {/* Lender wallet update for refunded */}
                                {walletUpdates[escrow.id]?.refunded && (
                                    <View style={{ marginTop: 10 }}>
                                        <Text style={{ color: '#dc2626', fontSize: 13 }}>
                                            Lender wallet refunded with LKR {walletUpdates[escrow.id].refunded.toLocaleString()}
                                        </Text>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                ))}

                {escrows.length > 0 && escrows.every(e => e.status === 'released' || e.status === 'refunded') && (
                    <View style={styles.emptyState}>
                        <FontAwesome5 name="check-circle" size={48} color="#5cd85a" />
                        <Text style={styles.emptyTitle}>All Caught Up!</Text>
                        <Text style={styles.emptyText}>No more pending escrow approvals at this time.</Text>
                    </View>
                )}

                {successMsg !== "" && (
                    <View style={styles.successMsgBox}>
                        <Text style={styles.successMsgText}>{successMsg}</Text>
                    </View>
                )}
            </ScrollView>

            {/* Confirmation Modal */}
            {confirmVisible && selectedEscrow && (
                <Modal
                    visible={confirmVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setConfirmVisible(false)}
                >
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalBox}>
                            <Text style={styles.modalText}>
                                {`Are you sure you want to ${actionType === 'released' ? 'approve' : 'reject'} escrow for Loan #${selectedEscrow.id}?`}
                            </Text>
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalBtn, { backgroundColor: '#107869', marginRight: 6 }]}
                                    onPress={async () => {
                                        await handleEscrowUpdate(
                                            selectedEscrow.id,
                                            actionType,
                                            selectedEscrow.lenderId,
                                            selectedEscrow.amount
                                        );
                                        setConfirmVisible(false);
                                        setSelectedEscrow(null);
                                        setActionType("");
                                    }}
                                >
                                    <Text style={styles.modalBtnText}>Yes</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalBtn, { backgroundColor: '#dc2626', marginLeft: 6 }]}
                                    onPress={() => {
                                        setConfirmVisible(false);
                                        setSelectedEscrow(null);
                                        setActionType("");
                                    }}
                                >
                                    <Text style={styles.modalBtnText}>No</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#dbf5f0' },
    header: { paddingTop: 40, paddingBottom: 20, backgroundColor: '#0c6170', alignItems: 'center' },
    title: { fontSize: 22, color: '#fff', fontWeight: '700' },
    subtitle: { color: '#a4e5e0', opacity: 0.9, marginTop: 4 },
    content: { padding: 20, paddingBottom: 10 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 15, borderWidth: 2, borderColor: '#a4e5e0' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    loanTitle: { fontSize: 18, fontWeight: '700', color: '#0c6170' },
    statusBadge: { fontSize: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontWeight: '600' },
    pendingBadge: { backgroundColor: '#fef3c7', color: '#d97706' },
    approvedBadge: { backgroundColor: '#a4e5e0', color: '#107869' },
    rejectedBadge: { backgroundColor: '#fee2e2', color: '#dc2626' },
    infoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 12 },
    infoItem: { fontSize: 12, color: '#107869', fontWeight: '600', marginBottom: 4 },
    infoValue: { fontWeight: '600', color: '#08313a', marginTop: 2, fontSize: 11 },
    purposeBox: { backgroundColor: '#dbf5f0', padding: 12, borderRadius: 8, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#37beb0' },
    purposeLabel: { fontSize: 12, color: '#107869', marginBottom: 4, fontWeight: '600' },
    purposeText: { fontSize: 14, color: '#08313a', lineHeight: 20 },
    actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    btnApprove: { flex: 1, backgroundColor: '#107869', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginRight: 6 },
    btnReject: { flex: 1, backgroundColor: '#dc2626', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginLeft: 6 },
    btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    approvedBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#a4e5e0', padding: 12, borderRadius: 8 },
    approvedText: { color: '#107869', fontSize: 14, fontWeight: '600' },
    emptyState: { padding: 40, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', marginTop: 20, borderWidth: 2, borderColor: '#a4e5e0' },
    emptyTitle: { fontSize: 18, fontWeight: '700', marginVertical: 10, color: '#0c6170' },
    emptyText: { color: '#107869', textAlign: 'center', fontSize: 14 },
    successMsgBox: { position: 'absolute', top: 100, alignSelf: 'center', backgroundColor: '#107869', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, zIndex: 100 },
    successMsgText: { color: '#fff', fontWeight: '600' },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalBox: { width: '80%', backgroundColor: '#fff', borderRadius: 12, padding: 20 },
    modalText: { fontSize: 16, fontWeight: '600', marginBottom: 20 },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
    modalBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
    modalBtnText: { color: '#fff', fontWeight: '700' }
});
