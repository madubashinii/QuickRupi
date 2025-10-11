export const REPUTATION_LEVELS = {
  0: { name: 'Newcomer', minScore: 0, badge: '🥚' },
  1: { name: 'Trusted', minScore: 100, badge: '⭐' },
  2: { name: 'Established', minScore: 500, badge: '🏆' },
  3: { name: 'Elite', minScore: 1000, badge: '👑' },
  4: { name: 'Legend', minScore: 5000, badge: '💎' }
};

export const ACTION_POINTS = {
  'complete_kyc': 100,
  'verify_email': 50,
  'link_bank': 75,
  'first_loan_paid': 150,
  'on_time_payment': 25,
  'late_payment': -50,
  'default': -200,
  'positive_review': 10,
  'negative_review': -15
};