// Simple in-memory cache for conversations
class ConversationCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 50; // Limit cache size
    this.ttl = 5 * 60 * 1000; // 5 minutes TTL
  }

  set(key, data) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check if expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  has(key) {
    const item = this.cache.get(key);
    
    if (!item) return false;
    
    // Check if expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// Global cache instance
export const conversationCache = new ConversationCache();

// Cache utilities
export const getCachedConversations = (userId) => {
  return conversationCache.get(`conversations_${userId}`);
};

export const setCachedConversations = (userId, conversations) => {
  conversationCache.set(`conversations_${userId}`, conversations);
};

export const clearConversationCache = () => {
  conversationCache.clear();
};
