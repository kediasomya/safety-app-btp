import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, MapPin, Send } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useContacts } from '../../context/ContactsContext';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';

export default function TrackMeScreen() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768;
  const { contacts } = useContacts();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to track your location.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleSendLocation = async () => {
    if (!location) {
      Alert.alert('Error', 'Unable to get your current location. Please try again.');
      return;
    }

    if (contacts.length === 0) {
      Alert.alert('No Contacts', 'Please add emergency contacts first.');
      return;
    }

    setIsSending(true);

    try {
      const locationString = `https://www.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}`;
      const message = `I am sharing my current location with you: ${locationString}`;

      // Get all phone numbers
      const phoneNumbers = contacts.map(contact => contact.phone).join(';');
      
      // Send to all contacts at once
      const smsUrl = `sms:${phoneNumbers}?body=${encodeURIComponent(message)}`;
      await Linking.openURL(smsUrl);

      Alert.alert('Success', 'Location shared with all emergency contacts.');
    } catch (error) {
      Alert.alert('Error', 'Failed to share location. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, !isSmallScreen && styles.headerWide]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Me</Text>
      </View>

      <View style={[styles.content, !isSmallScreen && styles.contentWide]}>
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <MapPin size={24} color="#FF1493" />
            <Text style={styles.locationTitle}>Current Location</Text>
          </View>

          {location ? (
            <View style={styles.locationDetails}>
              <Text style={styles.locationText}>
                Latitude: {location.coords.latitude.toFixed(6)}
              </Text>
              <Text style={styles.locationText}>
                Longitude: {location.coords.longitude.toFixed(6)}
              </Text>
              <Text style={styles.locationText}>
                Accuracy: {location.coords.accuracy?.toFixed(2) ?? 'Unknown'} meters
              </Text>
            </View>
          ) : (
            <Text style={styles.loadingText}>Getting your location...</Text>
          )}

          <TouchableOpacity 
            style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
            onPress={handleSendLocation}
            disabled={isSending || !location}
          >
            <Send size={20} color="#fff" />
            <Text style={styles.sendButtonText}>
              {isSending ? 'Sending...' : 'Share Location'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contactsCard}>
          <Text style={styles.contactsTitle}>Emergency Contacts</Text>
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <View key={contact.id} style={styles.contactItem}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noContactsText}>No emergency contacts added</Text>
          )}
        </View>
      </View>
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
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  contentWide: {
    maxWidth: 768,
    alignSelf: 'center',
    width: '100%',
  },
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#333',
    marginLeft: 8,
  },
  locationDetails: {
    gap: 8,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    marginBottom: 16,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF1493',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  contactsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  contactsTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  contactItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  contactName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#333',
  },
  contactPhone: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  noContactsText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    textAlign: 'center',
  },
}); 