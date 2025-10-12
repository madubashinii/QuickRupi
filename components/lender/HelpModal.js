import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

const HelpModal = ({ visible, onClose }) => {
  const [expandedItems, setExpandedItems] = useState([]);

  const toggleItem = (id) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const faqData = [
    {
      id: 1,
      category: 'Getting Started',
      icon: 'rocket-outline',
      question: 'How do I start investing on QuickRupi?',
      answer: 'To start investing, you need to: 1) Complete your profile verification, 2) Add funds to your wallet using your payment method, 3) Browse available loan requests, 4) Review borrower details and loan terms, 5) Select the amount you want to invest, and 6) Confirm your investment. Your funds will be automatically disbursed to the borrower upon loan approval.'
    },
    {
      id: 2,
      category: 'Getting Started',
      icon: 'wallet-outline',
      question: 'How do I add funds to my wallet?',
      answer: 'Go to your Dashboard and tap the "Add Funds" button. You can add funds using your saved payment methods (cards or bank accounts). Enter the amount you wish to add and confirm the transaction. Funds are typically available in your wallet within minutes.'
    },
    {
      id: 3,
      category: 'Investments',
      icon: 'trending-up-outline',
      question: 'What is the minimum investment amount?',
      answer: 'The minimum investment amount varies by loan but typically starts from Rs. 1,000. This allows you to diversify your portfolio across multiple loans and minimize risk. You can invest different amounts in different loans based on your preference.'
    },
    {
      id: 4,
      category: 'Investments',
      icon: 'pie-chart-outline',
      question: 'How should I diversify my portfolio?',
      answer: 'We recommend diversifying across multiple loans with different risk levels, loan purposes, and borrowers. A good strategy is to invest smaller amounts in 10-15 different loans rather than putting all your money in one loan. This helps spread risk and improve overall returns.'
    },
    {
      id: 5,
      category: 'Returns & Payments',
      icon: 'cash-outline',
      question: 'When will I receive my returns?',
      answer: 'Returns are paid according to the loan repayment schedule, which is typically monthly. You will receive both principal and interest payments as borrowers make their monthly repayments. These funds are automatically credited to your wallet and can be withdrawn or reinvested.'
    },
    {
      id: 6,
      category: 'Returns & Payments',
      icon: 'calendar-outline',
      question: 'What if a borrower misses a payment?',
      answer: 'If a borrower misses a payment, our team immediately initiates recovery procedures. We contact the borrower, send reminders, and work to resolve the situation. Late payments may affect your expected returns. You can track payment status in your investment details.'
    },
    {
      id: 7,
      category: 'Risk Management',
      icon: 'shield-outline',
      question: 'What are the risks of peer-to-peer lending?',
      answer: 'P2P lending carries risks including: borrower default (non-payment), delayed payments, loss of principal, and platform risk. Unlike bank deposits, P2P investments are not government-insured. We recommend only investing amounts you can afford to lose and diversifying across multiple loans.'
    },
    {
      id: 8,
      category: 'Risk Management',
      icon: 'analytics-outline',
      question: 'How are borrowers verified?',
      answer: 'All borrowers undergo a comprehensive KYC (Know Your Customer) verification process including identity verification, income assessment, credit checks, and document verification. Our admin team reviews each application before approval. However, verification does not guarantee repayment.'
    },
    {
      id: 9,
      category: 'Withdrawals',
      icon: 'arrow-down-circle-outline',
      question: 'How do I withdraw money from my wallet?',
      answer: 'Navigate to your Transactions screen and tap "Withdraw". Enter the amount you wish to withdraw and select your preferred payment method. Withdrawals are typically processed within 1-3 business days. Note that you can only withdraw available wallet balance, not invested amounts.'
    },
    {
      id: 10,
      category: 'Withdrawals',
      icon: 'time-outline',
      question: 'Can I withdraw my invested money anytime?',
      answer: 'No, once invested in a loan, your money is locked until the loan is repaid according to the schedule. You cannot withdraw invested amounts early. This is why it\'s important to only invest money you won\'t need immediately and maintain sufficient liquid funds in your wallet.'
    },
    {
      id: 11,
      category: 'Account & Security',
      icon: 'lock-closed-outline',
      question: 'How is my data protected?',
      answer: 'We use bank-grade 256-bit encryption to protect all sensitive data. Your payment information is encrypted before storage and never stored in plain text. We comply with data protection regulations and never share your personal information with third parties without consent.'
    },
    {
      id: 12,
      category: 'Account & Security',
      icon: 'card-outline',
      question: 'How many payment methods can I add?',
      answer: 'You can add up to 2 cards and 1 bank account to your QuickRupi account. This limit helps ensure security and regulatory compliance. You can set one as your default payment method and manage them from your Profile settings.'
    },
    {
      id: 13,
      category: 'Tax & Reporting',
      icon: 'document-text-outline',
      question: 'Do I need to pay taxes on my earnings?',
      answer: 'Yes, interest earned from P2P lending is taxable income. You are responsible for reporting this income in your tax returns. QuickRupi provides tax summary reports and transaction history to help with your tax filing. We recommend consulting a tax professional for specific advice.'
    },
    {
      id: 14,
      category: 'Tax & Reporting',
      icon: 'download-outline',
      question: 'How can I download my investment reports?',
      answer: 'You can generate and download various reports from the app including portfolio reports, tax summaries, and transaction history. Go to Transactions or Profile section and look for export/download options. Reports are available in PDF format.'
    },
    {
      id: 15,
      category: 'Support',
      icon: 'chatbubbles-outline',
      question: 'How can I contact customer support?',
      answer: 'You can contact us through: 1) In-app chat support (tap the chatbot icon on any screen), 2) Email at support@quickrupi.com, 3) Phone support during business hours. We typically respond within 24 hours. For urgent issues, use the chat feature for faster assistance.'
    }
  ];

  // Group FAQs by category
  const groupedFaqs = faqData.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

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
            <Text style={styles.modalTitle}>Help & FAQs</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.gray} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Introduction */}
            <View style={styles.introCard}>
              <View style={styles.introIconContainer}>
                <Ionicons name="help-circle" size={28} color={colors.blueGreen} />
              </View>
              <Text style={styles.introTitle}>How can we help you?</Text>
              <Text style={styles.introText}>
                Find answers to common questions about investing, payments, and managing your account on QuickRupi.
              </Text>
            </View>

            {/* FAQ Categories */}
            {Object.entries(groupedFaqs).map(([category, faqs]) => (
              <View key={category} style={styles.categorySection}>
                <Text style={styles.categoryTitle}>{category}</Text>
                {faqs.map((faq) => (
                  <FAQItem
                    key={faq.id}
                    faq={faq}
                    isExpanded={expandedItems.includes(faq.id)}
                    onToggle={() => toggleItem(faq.id)}
                  />
                ))}
              </View>
            ))}

            {/* Contact Support Card */}
            <View style={styles.contactCard}>
              <View style={styles.contactHeader}>
                <Ionicons name="headset-outline" size={24} color={colors.midnightBlue} />
                <Text style={styles.contactTitle}>Still need help?</Text>
              </View>
              <Text style={styles.contactText}>
                Our support team is here to assist you with any questions or concerns.
              </Text>
              <View style={styles.contactMethods}>
                <View style={styles.contactMethod}>
                  <Ionicons name="mail-outline" size={16} color={colors.blueGreen} />
                  <Text style={styles.contactMethodText}>support@quickrupi.com</Text>
                </View>
                <View style={styles.contactMethod}>
                  <Ionicons name="chatbubble-outline" size={16} color={colors.blueGreen} />
                  <Text style={styles.contactMethodText}>Live Chat (tap chatbot icon)</Text>
                </View>
              </View>
            </View>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.closeButtonFooter}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// FAQ Item Component
const FAQItem = ({ faq, isExpanded, onToggle }) => (
  <TouchableOpacity 
    style={styles.faqItem}
    onPress={onToggle}
    activeOpacity={0.7}
  >
    <View style={styles.faqHeader}>
      <View style={styles.faqIconContainer}>
        <Ionicons name={faq.icon} size={18} color={colors.blueGreen} />
      </View>
      <Text style={styles.faqQuestion}>{faq.question}</Text>
      <View style={styles.expandIcon}>
        <Ionicons 
          name={isExpanded ? "remove-circle" : "add-circle"} 
          size={24} 
          color={isExpanded ? colors.midnightBlue : colors.blueGreen} 
        />
      </View>
    </View>
    {isExpanded && (
      <View style={styles.faqAnswer}>
        <Text style={styles.faqAnswerText}>{faq.answer}</Text>
      </View>
    )}
  </TouchableOpacity>
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
  
  // Intro Card
  introCard: {
    backgroundColor: colors.babyBlue,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.blueGreen,
  },
  introIconContainer: {
    marginBottom: spacing.sm,
  },
  introTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  introText: {
    fontSize: fontSize.sm,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Category Section
  categorySection: {
    marginBottom: spacing.lg,
  },
  categoryTitle: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginBottom: spacing.sm,
    paddingLeft: spacing.xs,
  },
  
  // FAQ Item
  faqItem: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.lightGray,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  faqIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.babyBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  faqQuestion: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.midnightBlue,
    lineHeight: 20,
  },
  expandIcon: {
    marginLeft: spacing.sm,
  },
  faqAnswer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingLeft: 48, // Align with question text
  },
  faqAnswerText: {
    fontSize: fontSize.sm,
    color: colors.gray,
    lineHeight: 22,
  },
  
  // Contact Card
  contactCard: {
    backgroundColor: colors.babyBlue,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  contactTitle: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginLeft: spacing.sm,
  },
  contactText: {
    fontSize: fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  contactMethods: {
    gap: spacing.sm,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactMethodText: {
    fontSize: fontSize.sm,
    color: colors.midnightBlue,
    marginLeft: spacing.sm,
    fontWeight: '500',
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
  closeButtonFooter: {
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
  closeButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
});

export default HelpModal;

