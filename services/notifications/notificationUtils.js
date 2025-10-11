/**
 * Format Firestore timestamp to human-readable string
 * @param {Timestamp|Date|string} timestamp - Firestore timestamp or Date
 * @returns {string} Formatted timestamp
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Map notification type to icon and color
 * @param {string} type - Notification type
 * @returns {object} { icon, color }
 */
export const getNotificationTypeConfig = (type) => {
  const typeMap = {
    FUNDING_CONFIRMED: { icon: 'checkmark-circle', color: '#00BFA5' },
    ESCROW_APPROVED: { icon: 'shield-checkmark', color: '#1E88E5' },
    LOAN_DISBURSED: { icon: 'cash', color: '#43A047' },
    LOAN_ACTIVE: { icon: 'trending-up', color: '#FB8C00' },
    PAYMENT_RECEIVED: { icon: 'wallet', color: '#00BFA5' },
    LOAN_COMPLETED: { icon: 'checkmark-done', color: '#7B1FA2' },
    MONTHLY_RETURNS: { icon: 'stats-chart', color: '#5E35B1' },
    ROI_MILESTONE: { icon: 'trophy', color: '#FFB300' },
    FUNDS_ADDED: { icon: 'add-circle', color: '#43A047' },
    WITHDRAWAL_PROCESSED: { icon: 'arrow-down-circle', color: '#E53935' },
  };
  
  return typeMap[type] || { icon: 'notifications', color: '#607D8B' };
};

