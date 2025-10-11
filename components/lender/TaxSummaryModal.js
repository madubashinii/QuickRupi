import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';
import { calculateTaxSummary, exportTaxSummaryPDF, getAvailableTaxYears } from '../../services/lender/taxSummaryService';

const TaxSummaryModal = ({ visible, onClose, userId }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [taxData, setTaxData] = useState(null);
  const [error, setError] = useState(null);
  
  const availableYears = getAvailableTaxYears();

  // Calculate tax summary when modal opens or year changes
  useEffect(() => {
    if (visible && userId) {
      loadTaxSummary();
    }
  }, [visible, selectedYear, userId]);

  const loadTaxSummary = async () => {
    setIsCalculating(true);
    setError(null);
    try {
      const data = await calculateTaxSummary(userId, selectedYear);
      setTaxData(data);
    } catch (err) {
      console.error('Failed to calculate tax summary:', err);
      setError('Failed to load tax summary. Please try again.');
      setTaxData(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportTaxSummaryPDF(userId, selectedYear);
      Alert.alert(
        'Success',
        `Tax summary for ${selectedYear} has been exported successfully!`,
        [{ text: 'OK' }]
      );
    } catch (err) {
      console.error('Failed to export tax summary:', err);
      Alert.alert(
        'Export Failed',
        'Unable to export tax summary. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      setTaxData(null);
      setError(null);
      onClose();
    }
  };

  const formatCurrency = (amount) => {
    return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Annual Tax Summary</Text>
            <TouchableOpacity onPress={handleClose} disabled={isExporting}>
              <Ionicons name="close" size={24} color={colors.gray} />
            </TouchableOpacity>
          </View>

          {/* Year Selector */}
          <View style={styles.yearSelector}>
            <Text style={styles.sectionLabel}>Tax Year</Text>
            <View style={styles.yearButtons}>
              {availableYears.map(year => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.yearButton,
                    selectedYear === year && styles.yearButtonActive
                  ]}
                  onPress={() => setSelectedYear(year)}
                  disabled={isCalculating || isExporting}
                >
                  <Text style={[
                    styles.yearButtonText,
                    selectedYear === year && styles.yearButtonTextActive
                  ]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {isCalculating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.blueGreen} />
                <Text style={styles.loadingText}>Calculating tax summary...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={colors.red} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadTaxSummary}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : taxData ? (
              <>
                {/* Summary Cards */}
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryCard}>
                    <Ionicons name="cash-outline" size={20} color={colors.blueGreen} />
                    <Text style={styles.cardLabel}>Interest Income</Text>
                    <Text style={styles.cardValue}>{formatCurrency(taxData.totalInterestIncome)}</Text>
                  </View>
                  <View style={styles.summaryCard}>
                    <Ionicons name="trending-up-outline" size={20} color={colors.midnightBlue} />
                    <Text style={styles.cardLabel}>Principal Invested</Text>
                    <Text style={styles.cardValue}>{formatCurrency(taxData.totalPrincipalInvested)}</Text>
                  </View>
                  <View style={styles.summaryCard}>
                    <Ionicons name="receipt-outline" size={20} color={colors.red} />
                    <Text style={styles.cardLabel}>Estimated Tax</Text>
                    <Text style={styles.cardValue}>{formatCurrency(taxData.estimatedTax)}</Text>
                  </View>
                  <View style={styles.summaryCard}>
                    <Ionicons name="checkmark-circle-outline" size={20} color={colors.blueGreen} />
                    <Text style={styles.cardLabel}>Net Income</Text>
                    <Text style={styles.cardValue}>{formatCurrency(taxData.netIncome)}</Text>
                  </View>
                </View>

                {/* Additional Info */}
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>ROI</Text>
                    <Text style={styles.infoValue}>{taxData.roi}%</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Loans Completed</Text>
                    <Text style={styles.infoValue}>{taxData.loansCompleted}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Tax Rate</Text>
                    <Text style={styles.infoValue}>{taxData.taxRate}%</Text>
                  </View>
                </View>

                {/* Note */}
                <View style={styles.note}>
                  <Ionicons name="information-circle-outline" size={14} color={colors.gray} />
                  <Text style={styles.noteText}>
                    Tax estimate at {taxData.taxRate}% rate. Actual liability may vary based on your total income, 
                    deductions, and applicable Sri Lankan tax laws. Consult a certified tax advisor for filing.
                  </Text>
                </View>

                {/* Export Button */}
                <TouchableOpacity
                  style={[styles.exportButton, isExporting && styles.exportButtonDisabled]}
                  onPress={handleExport}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <>
                      <Ionicons name="download-outline" size={20} color={colors.white} />
                      <Text style={styles.exportButtonText}>Export as PDF</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.midnightBlue,
  },
  yearSelector: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    color: colors.gray,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  yearButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  yearButton: {
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.babyBlue,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  yearButtonActive: {
    backgroundColor: colors.blueGreen,
    borderColor: colors.blueGreen,
  },
  yearButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.midnightBlue,
  },
  yearButtonTextActive: {
    color: colors.white,
  },
  content: {
    padding: spacing.md,
    maxHeight: 500,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.gray,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  errorText: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.red,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.blueGreen,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.babyBlue,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: fontSize.xs,
    color: colors.gray,
    marginTop: 4,
    textAlign: 'center',
  },
  cardValue: {
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginBottom: spacing.sm,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: fontSize.xs,
    color: colors.gray,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.midnightBlue,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.babyBlue,
    padding: spacing.xs,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  noteText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.gray,
    lineHeight: 16,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blueGreen,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});

export default TaxSummaryModal;

