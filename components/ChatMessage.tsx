import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { User, Bot } from 'lucide-react-native';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.type === 'user';

  return (
    <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.assistantMessage]}>
      <View style={[styles.avatar, isUser ? styles.userAvatar : styles.assistantAvatar]}>
        {isUser ? (
          <User size={16} color="#fff" />
        ) : (
          <Bot size={16} color="#fff" />
        )}
      </View>
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
          {message.content}
        </Text>
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  userMessage: {
    flexDirection: 'row-reverse',
  },
  assistantMessage: {
    flexDirection: 'row',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  userAvatar: {
    backgroundColor: '#3B82F6',
  },
  assistantAvatar: {
    backgroundColor: '#8B5CF6',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#1f2937',
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.7,
    alignSelf: 'flex-end',
  },
});