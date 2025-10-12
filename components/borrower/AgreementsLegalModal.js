import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

const AgreementsLegalModal = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Agreements & Legal</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.gray} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Terms Accepted Notice */}
            <View style={styles.noticeCard}>
              <View style={styles.noticeIconContainer}>
                <Ionicons name="checkmark-circle" size={24} color={colors.blueGreen} />
              </View>
              <Text style={styles.noticeText}>
                You have agreed to these borrower terms and conditions when registering with QuickRupi.
              </Text>
            </View>

            {/* Platform Disclaimer */}
            <Section 
              icon="information-circle-outline"
              title="Platform Disclaimer"
              content="QuickRupi is an online peer-to-peer micro-lending platform that connects borrowers with individual lenders. We provide the technology to facilitate these connections but do not offer financial advice or make lending decisions on behalf of users."
            />

            {/* Borrower Obligations */}
            <Section 
              icon="document-text-outline"
              title="Borrower Obligations"
              content="As a registered borrower on QuickRupi, you are required to:"
              items={[
                "Provide accurate, complete, and verifiable personal and financial information.",
                "Use borrowed funds only for the declared purpose.",
                "Repay all borrowed amounts (principal and interest) according to the agreed schedule.",
                "Avoid providing false or misleading information.",
                "Inform QuickRupi of any major changes in your financial situation that may affect repayment."
              ]}
            />

            {/* Interest & Repayment Terms */}
            <Section 
              icon="cash-outline"
              title="Interest & Repayment Terms"
              content="Interest rates and repayment schedules are determined based on your loan agreement with the lender(s). QuickRupi does not control or alter these terms once both parties have agreed."
              items={[
                "Late repayments may result in additional charges or penalties.",
                "Failure to repay on time may negatively impact your credit reputation within the platform.",
                "All payments are to be made through approved QuickRupi payment methods only."
              ]}
            />

            {/* Risk & Responsibility */}
            <Section 
              icon="warning-outline"
              title="Risk & Responsibility"
              content="Borrowing through QuickRupi involves certain risks and responsibilities. You acknowledge and agree that:"
              items={[
                "Defaulting on a loan can lead to collection actions, legal processes, or account suspension.",
                "Providing inaccurate details may result in immediate account termination.",
                "QuickRupi is not responsible for disputes between borrowers and lenders beyond facilitating communication and records."
              ]}
            />

            {/* Data Privacy */}
            <Section 
              icon="lock-closed-outline"
              title="Data Privacy & Security"
              content="Your privacy is important to us. QuickRupi collects and processes your personal data in accordance with our Privacy Policy."
              items={[
                "Your data will only be shared with verified lenders or authorities when legally required.",
                "We use encryption and secure data handling practices to protect your information.",
                "You are responsible for maintaining the confidentiality of your login credentials."
              ]}
            />

            {/* Fees & Charges */}
            <Section 
              icon="card-outline"
              title="Fees & Charges"
              content="Certain administrative or processing fees may apply when submitting loan requests or making repayments. These will be transparently shown before confirmation."
              items={[
                "QuickRupi does not deduct hidden charges or unauthorized fees.",
                "All payment processing fees (if any) will be communicated upfront."
              ]}
            />

            {/* Legal Compliance */}
            <Section 
              icon="shield-checkmark-outline"
              title="Legal Compliance"
              content="You agree to comply with all applicable financial, consumer protection, and anti-fraud laws. QuickRupi reserves the right to report suspicious or fraudulent activity to regulatory authorities."
            />

            {/* Dispute Resolution */}
            <Section 
              icon="hammer-outline"
              title="Dispute Resolution"
              content="Any disputes regarding loans or repayments will be handled through the dispute resolution mechanisms described in our Terms of Service. You agree to first attempt an amicable resolution before pursuing other remedies."
            />

            {/* Contact Information */}
            <View style={styles.contactSection}>
              <Ionicons name="mail-outline" size={20} color={colors.midnightBlue} />
              <View style={styles.contactText}>
                <Text style={styles.contactTitle}>Questions or Concerns?</Text>
                <Text style={styles.contactSubtitle}>Contact our support team at support@quickrupi.com</Text>
              </View>
            </View>

            {/* Last Updated */}
            <Text style={styles.lastUpdated}>Last Updated: October 2025</Text>
            
            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>

          {/* Footer Button */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.acknowledgeButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.acknowledgeButtonText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Section Component
const Section = ({ icon, title, content, items }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={22} color={colors.midnightBlue} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <Text style={styles.sectionContent}>{content}</Text>
    {items && (
      <View style={styles.itemsList}>
        {items.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <View style={styles.bullet} />
            <Text style={styles.listItemText}>{item}</Text>
          </View>
        ))}
      </View>
    )}
  </View>
);

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
    height: '70%',
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.midnightBlue,
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  noticeCard: {
    backgroundColor: colors.babyBlue,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.blueGreen,
  },
  noticeIconContainer: {
    marginRight: spacing.md,
  },
  noticeText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.midnightBlue,
    fontWeight: '500',
    lineHeight: 20,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginLeft: spacing.sm,
  },
  sectionContent: {
    fontSize: fontSize.sm,
    color: colors.gray,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  itemsList: {
    marginTop: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingLeft: spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.blueGreen,
    marginRight: spacing.sm,
    marginTop: 7,
  },
  listItemText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.gray,
    lineHeight: 20,
  },
  contactSection: {
    backgroundColor: colors.babyBlue,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  contactText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  contactTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.midnightBlue,
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: fontSize.sm,
    color: colors.gray,
  },
  lastUpdated: {
    fontSize: fontSize.xs,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.lg,
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  acknowledgeButton: {
    backgroundColor: colors.blueGreen,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.blueGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  acknowledgeButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
});

export default AgreementsLegalModal;
