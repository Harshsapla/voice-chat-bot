import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, MicOff, Volume2, VolumeX, MessageCircle } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import ChatMessage from './ChatMessage';
import AudioVisualizer from './AudioVisualizer';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const { width: screenWidth } = Dimensions.get('window');

export default function VoiceChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const pulseAnimation = useSharedValue(0);
  const waveAnimation = useSharedValue(0);

  const { transcript, startListening, stopListening, isSupported: speechSupported } = useSpeechRecognition();
  const { speak, stop: stopSpeaking, isSupported: speechSynthesisSupported } = useSpeechSynthesis();

  useEffect(() => {
    if (isListening) {
      pulseAnimation.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0, { duration: 1000 })
        ),
        -1,
        false
      );
    } else {
      pulseAnimation.value = withTiming(0, { duration: 300 });
    }
  }, [isListening]);

  useEffect(() => {
    if (isSpeaking) {
      waveAnimation.value = withRepeat(
        withTiming(1, { duration: 500 }),
        -1,
        true
      );
    } else {
      waveAnimation.value = withTiming(0, { duration: 300 });
    }
  }, [isSpeaking]);

  const animatedMicStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulseAnimation.value, [0, 1], [1, 1.2]);
    const opacity = interpolate(pulseAnimation.value, [0, 1], [0.7, 1]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const animatedSpeakerStyle = useAnimatedStyle(() => {
    const scale = interpolate(waveAnimation.value, [0, 1], [1, 1.1]);
    return {
      transform: [{ scale }],
    };
  });

  useEffect(() => {
    if (transcript) {
      handleUserMessage(transcript);
    }
  }, [transcript]);

  const handleUserMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I heard you say: "${text}". This is a placeholder response. Please integrate with your preferred AI service.`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);

      // Speak the response
      if (speechSynthesisSupported) {
        setIsSpeaking(true);
        speak(assistantMessage.content, {
          onEnd: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      }
    }, 1500);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      if (isSpeaking) {
        stopSpeaking();
        setIsSpeaking(false);
      }
      startListening();
      setIsListening(true);
    }
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Chat AI</Text>
        <Text style={styles.subtitle}>Speak naturally to interact</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <MessageCircle size={64} color="rgba(255, 255, 255, 0.6)" />
            <Text style={styles.emptyText}>
              Tap the microphone to start your conversation
            </Text>
          </View>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        {isProcessing && (
          <View style={styles.processingContainer}>
            <Text style={styles.processingText}>AI is thinking...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.controlsContainer}>
        <AudioVisualizer isActive={isListening || isSpeaking} />
        
        <View style={styles.buttonContainer}>
          <Animated.View style={animatedSpeakerStyle}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                styles.speakerButton,
                isSpeaking && styles.activeButton,
              ]}
              onPress={toggleSpeaking}
              disabled={!isSpeaking}
            >
              {isSpeaking ? (
                <VolumeX size={24} color="#fff" />
              ) : (
                <Volume2 size={24} color="rgba(255, 255, 255, 0.6)" />
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={animatedMicStyle}>
            <TouchableOpacity
              style={[
                styles.micButton,
                isListening && styles.activeMicButton,
              ]}
              onPress={toggleListening}
              disabled={!speechSupported}
            >
              {isListening ? (
                <MicOff size={32} color="#fff" />
              ) : (
                <Mic size={32} color="#fff" />
              )}
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.placeholder} />
        </View>

        <Text style={styles.statusText}>
          {isListening
            ? 'Listening...'
            : isSpeaking
            ? 'Speaking...'
            : isProcessing
            ? 'Processing...'
            : 'Tap to speak'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 40,
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  processingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  controlsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  speakerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: '#EF4444',
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  activeMicButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    borderColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  placeholder: {
    width: 60,
    height: 60,
  },
  statusText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
});