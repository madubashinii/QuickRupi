import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const escrowData = [
    {
        id: 'LN004',
        borrower: 'John Smith',
        lender: 'Michael Brown',
        amount: 900000,
        requestDate: 'Dec 20, 2024',
        purpose: 'Business expansion - equipment purchase for manufacturing unit. Need funds to buy 2 new machines to increase production capacity.',
        status: 'Pending',
    },
    {
        id: 'LN006',
        borrower: 'Lisa Davis',
        lender: 'Sarah Johnson',
        amount: 450000,
        requestDate: 'Dec 21, 2024',
        purpose: 'Medical expenses coverage for surgery and rehabilitation costs.',
        status: 'Pending',
    },
    {
        id: 'LN007',
        borrower: 'Mark Wilson',
        lender: 'Emma Thompson',
        amount: 300000,
        approvedDate: 'Dec 19, 2024',
        status: 'Approved',
    },
];

export default function EscrowApprovalScreen({ navigation }) {
    const [loans, setLoans] = useState(escrowData);

    const approveEscrow = (loanId) => {
        setLoans(loans.map(loan =>
            loan.id === loanId ? { ...loan, status: 'Approved' } : loan
        ));
        Alert.alert('Success', 'Escrow approved successfully!');
    };

    const rejectEscrow = (loanId) => {
        setLoans(loans.map(loan =>
            loan.id === loanId ? { ...loan, status: 'Rejected' } : loan
        ));
        Alert.alert('Rejected', 'Escrow request rejected');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Escrow Approvals</Text>
                <Text style={styles.subtitle}>Pending fund releases</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {loans.map(loan => (
                    <View key={loan.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.loanTitle}>{`Loan #${loan.id}`}</Text>
                            <Text style={[
                                styles.statusBadge,
                                loan.status === 'Pending' ? styles.pendingBadge :
                                    loan.status === 'Approved' ? styles.approvedBadge :
                                        styles.rejectedBadge
                            ]}>
                                {loan.status}
                            </Text>
                        </View>

                        {loan.status !== 'Approved' && (
                            <>
                                <View style={styles.infoGrid}>
                                    <View>
                                        <Text style={styles.infoItem}>Borrower</Text>
                                        <Text style={styles.infoValue}>{loan.borrower}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.infoItem}>Lender</Text>
                                        <Text style={styles.infoValue}>{loan.lender}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.infoItem}>Amount</Text>
                                        <Text style={[styles.infoValue, { color: '#0c6170' }]}>
                                            LKR {loan.amount.toLocaleString()}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={styles.infoItem}>Request Date</Text>
                                        <Text style={styles.infoValue}>{loan.requestDate}</Text>
                                    </View>
                                </View>

                                <View style={styles.purposeBox}>
                                    <Text style={styles.purposeLabel}>Purpose</Text>
                                    <Text style={styles.purposeText}>{loan.purpose}</Text>
                                </View>

                                <View style={styles.actionButtons}>
                                    <TouchableOpacity style={styles.btnApprove} onPress={() => approveEscrow(loan.id)}>
                                        <FontAwesome5 name="check" size={16} color="#fff" style={{ marginRight: 6 }} />
                                        <Text style={styles.btnText}>Approve</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.btnReject} onPress={() => rejectEscrow(loan.id)}>
                                        <FontAwesome5 name="times" size={16} color="#fff" style={{ marginRight: 6 }} />
                                        <Text style={styles.btnText}>Reject</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        {loan.status === 'Approved' && (
                            <View style={styles.approvedBox}>
                                <FontAwesome5 name="check-circle" size={18} color="#107869" style={{ marginRight: 6 }} />
                                <Text style={styles.approvedText}>Funds released successfully</Text>
                            </View>
                        )}
                    </View>
                ))}

                {loans.filter(l => l.status === 'Pending').length === 0 && (
                    <View style={styles.emptyState}>
                        <FontAwesome5 name="check-circle" size={48} color="#5cd85a" />
                        <Text style={styles.emptyTitle}>All Caught Up!</Text>
                        <Text style={styles.emptyText}>No more pending escrow approvals at this time.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#dbf5f0'
    },
    header: {
        paddingTop: 40,
        paddingBottom: 20,
        backgroundColor: '#0c6170',
        alignItems: 'center',
        position: 'relative'
    },
    title: {
        fontSize: 22,
        color: '#fff',
        fontWeight: '700'
    },
    subtitle: {
        color: '#a4e5e0',
        opacity: 0.9,
        marginTop: 4
    },
    content: {
        padding: 20,
        paddingBottom: 10
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: '#a4e5e0',
        shadowColor: '#0c6170',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    loanTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0c6170'
    },
    statusBadge: {
        fontSize: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        fontWeight: '600'
    },
    pendingBadge: {
        backgroundColor: '#fef3c7',
        color: '#d97706'
    },
    approvedBadge: {
        backgroundColor: '#a4e5e0',
        color: '#107869'
    },
    rejectedBadge: {
        backgroundColor: '#fee2e2',
        color: '#dc2626'
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 12
    },
    infoItem: {
        fontSize: 12,
        color: '#107869',
        fontWeight: '600',
        marginBottom: 4
    },
    infoValue: {
        fontWeight: '600',
        color: '#08313a',
        marginTop: 2
    },
    purposeBox: {
        backgroundColor: '#dbf5f0',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#37beb0'
    },
    purposeLabel: {
        fontSize: 12,
        color: '#107869',
        marginBottom: 4,
        fontWeight: '600'
    },
    purposeText: {
        fontSize: 14,
        color: '#08313a',
        lineHeight: 20
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10
    },
    btnApprove: {
        flex: 1,
        backgroundColor: '#107869',
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
        shadowColor: '#0c6170',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3
    },
    btnReject: {
        flex: 1,
        backgroundColor: '#dc2626',
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 6,
        shadowColor: '#dc2626',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3
    },
    btnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14
    },
    approvedBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#a4e5e0',
        padding: 12,
        borderRadius: 8
    },
    approvedText: {
        color: '#107869',
        fontSize: 14,
        fontWeight: '600'
    },
    emptyState: {
        padding: 40,
        backgroundColor: '#fff',
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        borderWidth: 2,
        borderColor: '#a4e5e0'
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginVertical: 10,
        color: '#0c6170'
    },
    emptyText: {
        color: '#107869',
        textAlign: 'center',
        fontSize: 14
    },
});