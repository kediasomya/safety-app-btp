import { View, Text, TextInput, TouchableOpacity, StyleSheet, useWindowDimensions, Platform, ScrollView, Alert, Linking, AppState, KeyboardAvoidingView } from 'react-native';
import { ChevronLeft, MessageSquare, Send, MapPin, Phone } from 'lucide-react-native';
import { router } from 'expo-router';
import { useContacts } from '../../context/ContactsContext';
import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';

export default function EmergencySMSScreen() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768;
  const { contacts, emergencyMessage, updateEmergencyMessage } = useContacts();
  const [message, setMessage] = useState(emergencyMessage);
  const [isSending, setIsSending] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    checkLocation();
    
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to foreground
        if (isSending) {
          Alert.alert(
            'Success',
            'Emergency message has been sent successfully',
            [{ text: 'OK' }]
          );
          setIsSending(false);
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isSending]);

  const checkLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationError('Permission to access location was denied');
      return;
    }

    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    } catch (error) {
      setLocationError('Could not get location');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleUpdateMessage = () => {
    updateEmergencyMessage(message);
  };

  const getLocationString = () => {
    if (!location) return '';
    return `\n\nMy current location: https://www.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}`;
  };

  const handleSendSOS = async () => {
    if (contacts.length === 0) {
      Alert.alert(
        'No Contacts',
        'Please add emergency contacts first',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSending(true);
    
    try {
      // Get all phone numbers
      const phoneNumbers = contacts.map(contact => contact.phone).join(';');
      
      // Add location to message if available
      const locationString = getLocationString();
      const messageWithLocation = message + locationString;
      
      if (Platform.OS === 'android') {
        // For Android, use the native SMS intent with body parameter
        const smsUrl = `smsto:${phoneNumbers}?body=${encodeURIComponent(messageWithLocation)}`;
        
        const supported = await Linking.canOpenURL(smsUrl);
        
        if (supported) {
          await Linking.openURL(smsUrl);
        } else {
          Alert.alert('Error', 'Unable to open SMS app');
          setIsSending(false);
        }
      } else {
        // For iOS, use the standard SMS URL scheme
        const smsUrl = `sms:${phoneNumbers}&body=${encodeURIComponent(messageWithLocation)}`;
        const supported = await Linking.canOpenURL(smsUrl);
        
        if (supported) {
          await Linking.openURL(smsUrl);
        } else {
          Alert.alert('Error', 'Unable to open SMS app');
          setIsSending(false);
        }
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      Alert.alert('Error', 'Failed to send emergency message');
      setIsSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, !isSmallScreen && styles.headerWide]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Phone size={24} color="#fff" />
          <Text style={styles.headerTitle}>Emergency SMS</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView style={[styles.content, !isSmallScreen && styles.contentWide]}>
          <View style={styles.messageSection}>
            <View style={styles.messageHeader}>
              <MessageSquare size={24} color="#FF1493" />
              <Text style={styles.messageTitle}>Emergency Message</Text>
            </View>
            
            <TextInput
              style={styles.messageInput}
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
              placeholder="Enter your emergency message"
              placeholderTextColor="#666"
            />

            <TouchableOpacity 
              style={styles.updateButton}
              onPress={handleUpdateMessage}
            >
              <Text style={styles.updateButtonText}>Update Message</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.locationSection}>
            <View style={styles.locationHeader}>
              <MapPin size={24} color="#FF1493" />
              <Text style={styles.locationTitle}>Current Location</Text>
            </View>
            {location ? (
              <Text style={styles.locationText}>
                Latitude: {location.coords.latitude.toFixed(6)}
                {'\n'}
                Longitude: {location.coords.longitude.toFixed(6)}
              </Text>
            ) : (
              <Text style={styles.locationText}>
                {locationError || 'Getting location...'}
              </Text>
            )}
          </View>

          <View style={styles.contactsSection}>
            <Text style={styles.contactsTitle}>Message will be sent to:</Text>
            
            {contacts.map((contact) => (
              <View key={contact.id} style={styles.contactCard}>
                <View>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactRelation}>{contact.relation}</Text>
                </View>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
              </View>
            ))}

            {contacts.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No contacts added yet</Text>
                <TouchableOpacity 
                  style={styles.addContactButton}
                  onPress={() => router.push('/(tabs)/contacts')}
                >
                  <Text style={styles.addContactButtonText}>Add Contacts</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        {contacts.length > 0 && (
          <View style={[styles.footer, !isSmallScreen && styles.footerWide]}>
            <TouchableOpacity 
              style={[styles.sosButton, isSending && styles.sosButtonSending]}
              onPress={handleSendSOS}
              disabled={isSending}
            >
              <Send size={24} color="#fff" />
              <Text style={styles.sosButtonText}>
                {isSending ? 'Sending SOS...' : 'Send SOS Message'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  headerWide: {
    maxWidth: 768,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    backgroundColor: '#4A0072',
    padding: 16,
  },
  contentWide: {
    maxWidth: 768,
    alignSelf: 'center',
    width: '100%',
  },
  messageSection: {
    marginBottom: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  messageTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1E293B',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  updateButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FF1493',
    marginTop: 12,
  },
  updateButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  locationSection: {
    marginBottom: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  locationTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1E293B',
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    lineHeight: 20,
  },
  contactsSection: {
    gap: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  contactsTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1E293B',
    marginBottom: 8,
  },
  contactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  contactName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1E293B',
  },
  contactRelation: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    marginTop: 4,
  },
  contactPhone: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
  },
  emptyState: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  emptyStateText: {
    color: '#64748B',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  addContactButton: {
    backgroundColor: '#FF1493',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addContactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerWide: {
    maxWidth: 768,
    alignSelf: 'center',
    width: '100%',
  },
  sosButton: {
    backgroundColor: '#FF4444',
    height: Platform.OS === 'web' ? 56 : 48,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  sosButtonSending: {
    backgroundColor: '#666',
  },
  sosButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});