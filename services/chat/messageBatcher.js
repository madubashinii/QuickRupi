// Simple message batching for performance
class MessageBatcher {
  constructor(batchSize = 10, batchDelay = 1000) {
    this.batchSize = batchSize;
    this.batchDelay = batchDelay;
    this.batches = new Map(); // conversationId -> messages[]
    this.timers = new Map(); // conversationId -> timer
  }

  addMessage(conversationId, message, sendCallback) {
    if (!this.batches.has(conversationId)) {
      this.batches.set(conversationId, []);
    }

    const batch = this.batches.get(conversationId);
    batch.push({ message, sendCallback });

    // Send immediately if batch is full
    if (batch.length >= this.batchSize) {
      this.flushBatch(conversationId);
      return;
    }

    // Set timer for delayed sending
    if (this.timers.has(conversationId)) {
      clearTimeout(this.timers.get(conversationId));
    }

    const timer = setTimeout(() => {
      this.flushBatch(conversationId);
    }, this.batchDelay);

    this.timers.set(conversationId, timer);
  }

  flushBatch(conversationId) {
    const batch = this.batches.get(conversationId);
    if (!batch || batch.length === 0) return;

    // Clear timer
    if (this.timers.has(conversationId)) {
      clearTimeout(this.timers.get(conversationId));
      this.timers.delete(conversationId);
    }

    // Send all messages in batch
    const messages = batch.map(item => item.message);
    const callbacks = batch.map(item => item.sendCallback);

    // Send messages sequentially to maintain order
    const sendMessages = async () => {
      for (let i = 0; i < messages.length; i++) {
        try {
          await callbacks[i]();
          // Small delay between messages to avoid rate limits
          if (i < messages.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error(`Failed to send batched message ${i}:`, error);
        }
      }
    };

    sendMessages();

    // Clear batch
    this.batches.delete(conversationId);
  }

  flushAll() {
    for (const conversationId of this.batches.keys()) {
      this.flushBatch(conversationId);
    }
  }

  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.batches.clear();
  }
}

// Global batcher instance
export const messageBatcher = new MessageBatcher();

// Batched send message function
export const sendBatchedMessage = (conversationId, messageData, sendCallback) => {
  messageBatcher.addMessage(conversationId, messageData, sendCallback);
};
