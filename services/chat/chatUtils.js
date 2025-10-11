// Format message for display
export const formatMessageForDisplay = (message) => {
  if (!message) return null;
  
  return {
    id: message.id,
    text: message.text,
    senderId: message.senderId,
    senderRole: message.senderRole,
    type: message.type || 'text',
    timestamp: message.timestamp instanceof Date 
      ? message.timestamp 
      : message.timestamp?.toDate?.() || new Date(),
    read: message.read || false,
    isLender: message.senderRole === 'lender',
    isAdmin: message.senderRole === 'admin',
    isSystem: message.type === 'system'
  };
};

// Group messages by date
export const groupMessagesByDate = (messages) => {
  const groups = {};
  
  messages.forEach(message => {
    const timestamp = message.timestamp instanceof Date 
      ? message.timestamp 
      : new Date(message.timestamp);
    
    const dateKey = timestamp.toDateString();
    
    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: timestamp,
        dateLabel: formatDateLabel(timestamp),
        messages: []
      };
    }
    
    groups[dateKey].messages.push(formatMessageForDisplay(message));
  });
  
  return Object.values(groups).sort((a, b) => a.date - b.date);
};

// Format date label with enhanced grouping
const formatDateLabel = (timestamp) => {
  const now = new Date();
  const messageDate = new Date(timestamp);
  const diffMs = now - messageDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays === 2) return '2 days ago';
  if (diffDays === 3) return '3 days ago';
  if (diffDays === 4) return '4 days ago';
  if (diffDays === 5) return '5 days ago';
  if (diffDays === 6) return '6 days ago';
  if (diffDays >= 7 && diffDays < 14) return 'Last week';
  if (diffDays >= 14 && diffDays < 30) return '2 weeks ago';
  if (diffDays >= 30 && diffDays < 60) return 'Last month';
  if (diffDays >= 60 && diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
  
  return messageDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

// Format time
export const formatTime = (timestamp) => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
};

// Format date
export const formatDate = (timestamp) => formatDateLabel(timestamp);

// Should show date separator
export const shouldShowDateSeparator = (currentMessage, previousMessage) => {
  if (!previousMessage) return true;
  
  const currentDate = new Date(currentMessage.timestamp);
  const previousDate = new Date(previousMessage.timestamp);
  
  // Use UTC date comparison to avoid timezone issues
  const currentDateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
  const previousDateString = previousDate.toISOString().split('T')[0]; // YYYY-MM-DD
  
  const shouldShow = currentDateString !== previousDateString;
  
  // Debug logging
  if (shouldShow) {
    console.log('[shouldShowDateSeparator] Showing separator:', {
      currentTimestamp: currentMessage.timestamp,
      currentDateString,
      previousTimestamp: previousMessage.timestamp,
      previousDateString,
      currentFormatted: formatDateLabel(currentMessage.timestamp),
      previousFormatted: formatDateLabel(previousMessage.timestamp)
    });
  }
  
  return shouldShow;
};

// Validate message text
export const validateMessageText = (text, maxLength = 500) => {
  if (!text || !text.trim()) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  
  if (text.length > maxLength) {
    return { valid: false, error: `Message exceeds ${maxLength} characters` };
  }
  
  return { valid: true };
};

