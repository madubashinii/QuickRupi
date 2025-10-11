# Chat Service

Comprehensive conversation-based messaging system for QuickRupi with real-time updates.

## Structure

```
conversations/
  └── {conversationId}
      ├── conversationId: string
      ├── participants: { lenderId, adminId }
      ├── participantIds: string[]
      ├── lastMessage: { text, senderId, timestamp, read }
      ├── unreadCount: { [userId]: number }
      ├── createdAt: Timestamp
      ├── updatedAt: Timestamp
      └── messages/
          └── {messageId}
              ├── conversationId: string
              ├── text: string
              ├── senderId: string
              ├── senderRole: "lender" | "admin"
              ├── recipientId: string
              ├── type: "text" | "system"
              ├── timestamp: Timestamp
              ├── read: boolean
              └── readAt?: Timestamp
```

## API Reference

### Core Functions

#### `generateConversationId(lenderId, adminId)`
Generates a unique conversation ID.

```javascript
const id = generateConversationId('L001', 'ADMIN001');
// Returns: "CONV_L001_ADMIN001"
```

#### `createConversation(lenderId, adminId)`
Creates a new conversation.

```javascript
const conversation = await createConversation('L001');
```

#### `getOrCreateConversation(lenderId, adminId)`
Gets existing or creates new conversation.

```javascript
const conversation = await getOrCreateConversation('L001');
```

#### `sendMessage(conversationId, senderId, senderRole, text, type)`
Sends a message.

```javascript
await sendMessage('CONV_L001_ADMIN001', 'L001', 'lender', 'Hello!', 'text');
```

#### `subscribeToConversation(conversationId, callback)`
Real-time conversation metadata updates.

```javascript
const unsubscribe = subscribeToConversation('CONV_L001_ADMIN001', (conversation) => {
  console.log('Unread:', conversation.unreadCount);
});
```

#### `subscribeToMessages(conversationId, callback, limit)`
Real-time message updates with optional limit.

```javascript
const unsubscribe = subscribeToMessages('CONV_L001_ADMIN001', (messages) => {
  setMessages(messages);
}, 50); // Limit to last 50 messages
```

#### `markMessagesAsRead(conversationId, userId)`
Marks messages as read.

```javascript
await markMessagesAsRead('CONV_L001_ADMIN001', 'L001');
```

#### `getConversationsForUser(userId, userRole)`
Gets all conversations for a user.

```javascript
const conversations = await getConversationsForUser('L001', 'lender');
```

#### `subscribeToConversationsForUser(userId, userRole, callback)`
Real-time user conversations.

```javascript
const unsubscribe = subscribeToConversationsForUser('L001', 'lender', (conversations) => {
  setConversations(conversations);
});
```

#### `getUnreadCount(conversationId, userId)`
Gets unread count for a conversation.

```javascript
const count = await getUnreadCount('CONV_L001_ADMIN001', 'L001');
```

### Utility Functions

#### `formatMessageForDisplay(message)`
Formats message with computed properties.

```javascript
const formatted = formatMessageForDisplay(message);
// Adds: isLender, isAdmin, isSystem, formatted timestamp
```

#### `groupMessagesByDate(messages)`
Groups messages by date with labels.

```javascript
const grouped = groupMessagesByDate(messages);
// [
//   { date, dateLabel: "Today", messages: [...] },
//   { date, dateLabel: "Yesterday", messages: [...] }
// ]
```

#### `formatTime(timestamp)`
```javascript
formatTime(new Date()); // "2:30 PM"
```

#### `formatDate(timestamp)`
```javascript
formatDate(new Date()); // "Today", "Yesterday", or "Jan 15"
```

#### `shouldShowDateSeparator(current, previous)`
```javascript
const showSeparator = shouldShowDateSeparator(currentMsg, previousMsg);
```

#### `validateMessageText(text, maxLength)`
```javascript
const { valid, error } = validateMessageText(text, 500);
```

## Usage Example

```javascript
import {
  getOrCreateConversation,
  sendMessage,
  subscribeToMessages,
  markMessagesAsRead,
  groupMessagesByDate,
  formatMessageForDisplay
} from '../../services/chat';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);

  useEffect(() => {
    const init = async () => {
      // Get or create conversation
      const conv = await getOrCreateConversation('L001');
      setConversationId(conv.conversationId);

      // Subscribe to messages
      const unsubscribe = subscribeToMessages(
        conv.conversationId,
        (msgs) => setMessages(msgs),
        50
      );

      // Mark as read
      await markMessagesAsRead(conv.conversationId, 'L001');

      return unsubscribe;
    };

    const cleanup = init();
    return () => cleanup.then(unsub => unsub?.());
  }, []);

  const handleSend = async (text) => {
    await sendMessage(conversationId, 'L001', 'lender', text);
  };

  // Group messages by date
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <View>
      {groupedMessages.map(group => (
        <View key={group.dateLabel}>
          <Text>{group.dateLabel}</Text>
          {group.messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </View>
      ))}
    </View>
  );
};
```

## Firestore Indexes

Required indexes (see `chat.indexes.json`):

1. `conversations`: `participantIds` (array) + `updatedAt` (desc)
2. `messages`: `recipientId` (asc) + `read` (asc)

## Features

✅ Real-time messaging  
✅ Unread count tracking  
✅ Message grouping by date  
✅ Conversation metadata  
✅ Read receipts  
✅ System messages support  
✅ Message limiting  
✅ Clean, minimal code

