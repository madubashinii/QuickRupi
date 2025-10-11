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
                You have agreed to these terms and conditions when registering with QuickRupi
              </Text>
            </View>

            {/* Platform Disclaimer */}
            <Section 
              icon="information-circle-outline"
              title="Platform Disclaimer"
              content="QuickRupi is an online peer-to-peer lending platform that facilitates connections between lenders and borrowers. We provide the technology and infrastructure to enable these transactions but do not participate in the lending decisions or guarantee any outcomes."
            />

            {/* Risk Disclosure */}
            <Section 
              icon="warning-outline"
              title="Risk Disclosure"
              content="Investing in peer-to-peer loans carries inherent risks, including but not limited to:"
              items={[
                "Loss of Principal: There is a risk that you may lose all or part of your invested capital.",
                "Default Risk: Borrowers may fail to repay their loans, resulting in losses.",
                "Liquidity Risk: Your investments may not be easily convertible to cash.",
                "Platform Risk: The platform's operation may be affected by technical, regulatory, or business challenges.",
                "No Government Insurance: Unlike bank deposits, investments are not insured by government agencies."
              ]}
            />

            {/* No Guarantee */}
            <Section 
              icon="shield-outline"
              title="No Guarantee of Returns"
              content="QuickRupi does not guarantee any specific returns on your investments. Historical performance is not indicative of future results. Interest rates and returns displayed are estimates and may vary based on actual borrower repayment behavior."
            />

            {/* Limited Liability */}
            <Section 
              icon="document-text-outline"
              title="Limited Liability"
              content="QuickRupi, its directors, employees, and affiliates shall not be held liable for:"
              items={[
                "Borrower defaults or failure to repay loans",
                "Investment losses incurred by lenders",
                "Accuracy of information provided by borrowers",
                "Technical issues or platform downtime",
                "Changes in regulatory environment affecting operations",
                "Any indirect, consequential, or incidental damages"
              ]}
            />

            {/* User Responsibilities */}
            <Section 
              icon="person-outline"
              title="Your Responsibilities"
              content="As a lender on QuickRupi, you are responsible for:"
              items={[
                "Conducting your own due diligence before investing",
                "Understanding the risks associated with each loan",
                "Making informed investment decisions based on your financial situation",
                "Complying with all applicable tax laws and regulations",
                "Maintaining the security of your account credentials"
              ]}
            />

            {/* Online Platform */}
            <Section 
              icon="globe-outline"
              title="Online Platform Terms"
              content="QuickRupi operates as an online platform. By using our services, you acknowledge that:"
              items={[
                "All transactions are conducted electronically",
                "Platform availability may be affected by internet connectivity and technical factors",
                "We use reasonable security measures but cannot guarantee absolute security",
                "You are responsible for maintaining compatible devices and software",
                "Platform features and terms may be updated periodically"
              ]}
            />

            {/* Regulatory Compliance */}
            <Section 
              icon="shield-checkmark-outline"
              title="Regulatory Compliance"
              content="QuickRupi operates in compliance with applicable laws and regulations. However, the regulatory environment for peer-to-peer lending may change, which could affect platform operations and your investments. We are not a licensed bank or financial institution."
            />

            {/* Dispute Resolution */}
            <Section 
              icon="hammer-outline"
              title="Dispute Resolution"
              content="Any disputes arising from your use of the platform will be subject to the dispute resolution mechanisms outlined in our Terms of Service. You agree to first attempt to resolve disputes through good faith negotiations with QuickRupi."
            />

            {/* Contact Information */}
            <View style={styles.contactSection}>
              <Ionicons name="mail-outline" size={20} color={colors.midnightBlue} />
              <View style={styles.contactText}>
                <Text style={styles.contactTitle}>Questions or Concerns?</Text>
                <Text style={styles.contactSubtitle}>Contact our legal team at legal@quickrupi.com</Text>
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
  // Modal Styles
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
  
  // Content
  scrollContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  
  // Notice Card
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
  
  // Section
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
  
  // List Items
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
  
  // Contact Section
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
  
  // Last Updated
  lastUpdated: {
    fontSize: fontSize.xs,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.lg,
    fontStyle: 'italic',
  },
  
  // Bottom Spacing
  bottomSpacing: {
    height: spacing.md,
  },
  
  // Footer
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

