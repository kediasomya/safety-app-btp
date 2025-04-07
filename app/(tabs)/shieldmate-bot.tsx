import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Platform, TextInput, ScrollView, KeyboardAvoidingView, ViewStyle, TextStyle } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Send, MapPin, AlertTriangle, Shield, Info, Phone, MessageSquare, Bot } from 'lucide-react-native';
import * as Location from 'expo-location';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const SAFETY_TIPS = [
  "Always share your live location with trusted contacts when going out",
  "Keep emergency contacts updated in your phone",
  "Be aware of your surroundings at all times",
  "Trust your instincts - if something feels wrong, it probably is",
  "Keep your phone charged and carry a power bank",
  "Learn basic self-defense techniques",
  "Have a safety plan for different scenarios",
  "Keep emergency numbers saved in your phone",
  "Share your travel plans with someone you trust",
  "Avoid walking alone in isolated areas at night"
];

const EMERGENCY_GUIDANCE = {
  "medical": "Call emergency services immediately. If you're in India, dial 102 for ambulance. Stay calm and provide your location clearly.",
  "fire": "Call fire department immediately. If you're in India, dial 101. Evacuate the area and don't use elevators.",
  "police": "Call police immediately. If you're in India, dial 100. Provide your location and describe the situation clearly.",
  "natural_disaster": "Follow local authorities' instructions. Have an emergency kit ready with water, food, and first aid supplies.",
  "road_accident": "Call emergency services. If you're in India, dial 108 for emergency response. Provide exact location and number of injured.",
  "cyber_crime": "Report to cyber crime cell. In India, visit cybercrime.gov.in or call 1930. Preserve all evidence.",
  "domestic_violence": "Call women's helpline. In India, dial 181. Seek help from trusted friends or family immediately."
};

const LOCATION_INFO = {
  "nearest_police": "I can help you find the nearest police station. Please share your location.",
  "nearest_hospital": "I can help you find the nearest hospital. Please share your location.",
  "safe_route": "I can help you find the safest route. Please share your current location and destination.",
  "emergency_shelters": "I can help you find emergency shelters. Please share your location.",
  "public_transport": "I can help you find safe public transport options. Please share your location."
};

export default function ShieldMateBotScreen() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        id: '1',
        text: "Hello! I'm ShieldMate, your personal safety assistant. How can I help you today? You can ask me about:\n\n• Safety tips\n• Emergency guidance\n• Location information\n• Emergency contacts",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);

    // Request location permission
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      }
    })();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputText.toLowerCase());
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  const generateBotResponse = (userInput: string): string => {
    // Safety tips
    if (userInput.includes('tip') || userInput.includes('advice')) {
      const randomTip = SAFETY_TIPS[Math.floor(Math.random() * SAFETY_TIPS.length)];
      return `Here's a safety tip: ${randomTip}\n\nWould you like another tip?`;
    }

    // Emergency guidance
    for (const [key, value] of Object.entries(EMERGENCY_GUIDANCE)) {
      if (userInput.includes(key)) {
        return value;
      }
    }

    // Location information
    for (const [key, value] of Object.entries(LOCATION_INFO)) {
      if (userInput.includes(key)) {
        if (location) {
          return `${value}\n\nI have your location. Would you like me to find the nearest ${key.replace('_', ' ')}?`;
        } else {
          return "I need your location permission to help with that. Please enable location services in your settings.";
        }
      }
    }

    // Default responses
    if (userInput.includes('hello') || userInput.includes('hi')) {
      return "Hello! How can I help you stay safe today?";
    }

    if (userInput.includes('help')) {
      return "I can help you with:\n\n• Safety tips and advice\n• Emergency guidance\n• Finding nearby emergency services\n• Location-based safety information\n\nWhat would you like to know?";
    }

    return "I'm not sure I understand. Could you rephrase that? I can help with safety tips, emergency guidance, or location information.";
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Bot size={24} color="#fff" />
          <Text style={styles.title}>ShieldMate Bot</Text>
        </View>
      </View>
      <View style={styles.content}>
        <ScrollView style={styles.messagesContainer}>
          {messages.map((msg) => (
            <View 
              key={msg.id} 
              style={[
                styles.messageBubble,
                msg.sender === 'user' ? styles.userMessage : styles.botMessage
              ]}
            >
              <Text style={styles.messageText}>{msg.text}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor="#666"
            multiline
          />
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create<{
  container: ViewStyle;
  header: ViewStyle;
  headerContent: ViewStyle;
  backButton: ViewStyle;
  title: TextStyle;
  content: ViewStyle;
  messagesContainer: ViewStyle;
  messageBubble: ViewStyle;
  userMessage: ViewStyle;
  botMessage: ViewStyle;
  messageText: TextStyle;
  inputContainer: ViewStyle;
  input: TextStyle;
  sendButton: ViewStyle;
}>({
  container: {
    flex: 1,
    backgroundColor: '#4A0072',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 24 : 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF1493',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F8FAFC',
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#1E293B',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#1E293B',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF1493',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 