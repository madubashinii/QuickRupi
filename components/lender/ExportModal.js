import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import { exportAndShareCSV, exportAndSharePDF, getExportSummary, getAllTransactionsForExport, formatTransactionForDisplay } from '../../services/transactions';
import Toast from 'react-native-toast-message';

// Helper function to get user-friendly error message
const getUserFriendlyError = (error) => {
  const errorMessage = error.message || '';
  
  // Map common errors to friendly messages
  if (errorMessage.includes('No transactions')) {
    return 'No transactions available to export';
  }
  if (errorMessage.includes('not available') || errorMessage.includes('permission')) {
    return 'File sharing is not available on this device';
  }
  if (errorMessage.includes('save') || errorMessage.includes('cache')) {
    return 'Unable to save file. Please check device storage';
  }
  if (errorMessage.includes('timestamp') || errorMessage.includes('Invalid')) {
    return 'Transaction data format error. Please try again';
  }
  if (errorMessage.includes('cancelled') || errorMessage.includes('cancel')) {
    return 'Export was cancelled';
  }
  
  // Return original message if no match
  return errorMessage || 'Failed to export transactions';
};

const ExportModal = ({ visible, onClose, transactions, filterType = 'all', userId, showOnlyAll = false }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportScope, setExportScope] = useState(showOnlyAll ? 'all' : 'current'); // 'current' or 'all'
  const [exportFormat, setExportFormat] = useState('csv'); // 'csv' or 'pdf'
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const [allTransactionsSummary, setAllTransactionsSummary] = useState({ count: 0, totalCredits: 0, totalDebits: 0 });

  // Get transaction summary based on selected scope (memoized for performance)
  const currentViewSummary = useMemo(
    () => getExportSummary(transactions || []),
    [transactions]
  );
  const summary = (exportScope === 'current' && !showOnlyAll) ? currentViewSummary : allTransactionsSummary;

  // Fetch all transactions summary when "All Transactions" is selected or showOnlyAll is true
  useEffect(() => {
    let isMounted = true;

    const fetchAllTransactionsSummary = async () => {
      if (visible && userId && (exportScope === 'all' || showOnlyAll)) {
        setIsLoadingCount(true);
        try {
          // Fetch all transactions
          const allTransactions = await getAllTransactionsForExport(userId);
          
          // Format and calculate summary
          const formattedTransactions = allTransactions.map(formatTransactionForDisplay);
          const calculatedSummary = getExportSummary(formattedTransactions);
          
          if (isMounted) {
            setAllTransactionsSummary(calculatedSummary);
          }
        } catch (error) {
          console.error('Error fetching all transactions summary:', error);
          if (isMounted) {
            setAllTransactionsSummary({ count: 0, totalCredits: 0, totalDebits: 0 });
          }
        } finally {
          if (isMounted) {
            setIsLoadingCount(false);
          }
        }
      }
    };

    fetchAllTransactionsSummary();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [visible, userId, exportScope, showOnlyAll]);

  // Format filter display name
  const getFilterDisplayName = () => {
    const filterNames = {
      all: 'All Transactions',
      deposits: 'Deposits',
      payouts: 'Payouts',
      repayments: 'Repayments',
      fees: 'Fees'
    };
    return filterNames[filterType] || 'All Transactions';
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      let transactionsToExport = [];

      // Fetch transactions based on selected scope
      if (exportScope === 'all') {
        if (!userId) {
          throw new Error('User ID is required to export all transactions');
        }
        
        // Fetch all transactions from Firestore
        const allTransactions = await getAllTransactionsForExport(userId);
        
        // Format for display
        transactionsToExport = allTransactions.map(formatTransactionForDisplay);
      } else {
        transactionsToExport = transactions || [];
      }

      // Safety check
      if (!transactionsToExport || transactionsToExport.length === 0) {
        throw new Error('No transactions available to export');
      }

      // Export based on selected format
      const result = exportFormat === 'pdf' 
        ? await exportAndSharePDF(transactionsToExport, filterType)
        : await exportAndShareCSV(transactionsToExport, filterType);

      // Show success toast (CSV clipboard mode handles its own Alert)
      if (!result.usedClipboard) {
        Toast.show({
          type: 'success',
          text1: ' Export Complete',
          text2: `${result.filename} shared successfully`
        });
      }

      onClose();
    } catch (error) {
      console.error('Export failed:', error.message);

      const friendlyError = getUserFriendlyError(error);

      Toast.show({
        type: 'error',
        text1: 'Export Failed',
        text2: friendlyError
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCancel = () => {
    if (!isExporting) {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Export Transactions</Text>
            <TouchableOpacity onPress={handleCancel} disabled={isExporting}>
              <Ionicons name="close" size={20} color={colors.gray} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.modalBody}>
            {/* Export Scope Section */}
            {!showOnlyAll && (
              <>
                <Text style={styles.sectionTitle}>Scope</Text>
                <TouchableOpacity 
                  style={[styles.scopeOption, exportScope === 'current' && styles.activeScopeOption]}
                  onPress={() => setExportScope('current')}
                  disabled={isExporting}
                >
                  <View style={styles.radioButton}>
                    {exportScope === 'current' && <View style={styles.radioButtonSelected} />}
                  </View>
                  <View style={styles.scopeContent}>
                    <Text style={[styles.scopeText, exportScope === 'current' && styles.activeScopeText]}>
                      Current View
                    </Text>
                    <Text style={styles.scopeSubtext}>
                      {currentViewSummary.count} transactions
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.scopeOption, exportScope === 'all' && styles.activeScopeOption]}
                  onPress={() => setExportScope('all')}
                  disabled={isExporting}
                >
                  <View style={styles.radioButton}>
                    {exportScope === 'all' && <View style={styles.radioButtonSelected} />}
                  </View>
                  <View style={styles.scopeContent}>
                    <Text style={[styles.scopeText, exportScope === 'all' && styles.activeScopeText]}>
                      All Transactions
                    </Text>
                    {isLoadingCount ? (
                      <ActivityIndicator size="small" color={colors.blueGreen} />
                    ) : (
                      <Text style={styles.scopeSubtext}>
                        All {allTransactionsSummary.count} transactions
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </>
            )}

            {/* Format Section */}
            <Text style={[styles.sectionTitle, { marginTop: spacing.sm }]}>Format</Text>
            
            <TouchableOpacity 
              style={[styles.formatOption, exportFormat === 'csv' && styles.activeFormatOption]}
              onPress={() => setExportFormat('csv')}
              disabled={isExporting}
            >
              <View style={styles.radioButton}>
                {exportFormat === 'csv' && <View style={styles.radioButtonSelected} />}
              </View>
              <Ionicons name="document-text" size={18} color={colors.blueGreen} style={styles.formatIcon} />
              <Text style={styles.formatText}>CSV</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.formatOption, exportFormat === 'pdf' && styles.activeFormatOption]}
              onPress={() => setExportFormat('pdf')}
              disabled={isExporting}
            >
              <View style={styles.radioButton}>
                {exportFormat === 'pdf' && <View style={styles.radioButtonSelected} />}
              </View>
              <Ionicons name="document" size={18} color={colors.blueGreen} style={styles.formatIcon} />
              <Text style={styles.formatText}>PDF</Text>
            </TouchableOpacity>

            {/* Transaction Count Preview */}
            <View style={styles.previewSection}>
              <View style={styles.previewHeader}>
                <Ionicons name="information-circle" size={20} color={colors.blueGreen} />
                <Text style={styles.previewTitle}>Export Preview</Text>
              </View>
              
              <View style={styles.previewDetails}>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Filter:</Text>
                  <Text style={styles.previewValue}>{getFilterDisplayName()}</Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Transactions:</Text>
                  <Text style={styles.previewValue}>{summary.count}</Text>
                </View>
                {summary.count > 0 && (
                  <>
                    <View style={styles.previewRow}>
                      <Text style={styles.previewLabel}>Total Credits:</Text>
                      <Text style={[styles.previewValue, styles.creditText]}>
                        + LKR {summary.totalCredits.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.previewRow}>
                      <Text style={styles.previewLabel}>Total Debits:</Text>
                      <Text style={[styles.previewValue, styles.debitText]}>
                        - LKR {summary.totalDebits.toLocaleString()}
                      </Text>
                    </View>
                  </>
                )}
              </View>

              {summary.count === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="alert-circle-outline" size={32} color={colors.gray} />
                  <Text style={styles.emptyText}>No transactions to export</Text>
                </View>
              )}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleCancel}
              disabled={isExporting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.exportButton, 
                (isExporting || summary.count === 0) && styles.exportButtonDisabled
              ]} 
              onPress={handleExport}
              disabled={isExporting || summary.count === 0}
            >
              {isExporting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Ionicons name="download" size={18} color={colors.white} style={styles.buttonIcon} />
                  <Text style={styles.exportButtonText}>Export</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.black,
  },
  modalBody: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.gray,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scopeOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginBottom: spacing.xs,
  },
  activeScopeOption: {
    borderColor: colors.blueGreen,
    backgroundColor: colors.babyBlue,
  },
  scopeContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  scopeText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.black,
  },
  activeScopeText: {
    color: colors.blueGreen,
    fontWeight: '600',
  },
  scopeSubtext: {
    fontSize: 11,
    color: colors.gray,
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginBottom: spacing.xs,
  },
  activeFormatOption: {
    borderColor: colors.blueGreen,
    backgroundColor: colors.babyBlue,
  },
  radioButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.blueGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.blueGreen,
  },
  formatIcon: {
    marginLeft: spacing.sm,
  },
  formatText: {
    fontSize: fontSize.sm,
    color: colors.black,
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
  previewSection: {
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  previewTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.black,
    marginLeft: spacing.xs,
  },
  previewDetails: {
    gap: spacing.xs,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  previewLabel: {
    fontSize: fontSize.sm,
    color: colors.gray,
  },
  previewValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.black,
  },
  creditText: {
    color: colors.forestGreen,
  },
  debitText: {
    color: colors.red,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.gray,
    marginTop: spacing.sm,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  cancelButton: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.gray,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.blueGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportButtonDisabled: {
    backgroundColor: colors.gray,
    opacity: 0.5,
  },
  exportButtonText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.white,
  },
  buttonIcon: {
    marginRight: spacing.xs,
  },
});

export default ExportModal;

