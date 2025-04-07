import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Platform, Alert, ScrollView, Share } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Mic, Send, Play, Pause, Square, Trash2 } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useContacts } from '@/context/ContactsContext';
import { Audio } from 'expo-av';
import * as Linking from 'expo-linking';
import * as Sharing from 'expo-sharing';

interface Recording {
  id: string;
  uri: string;
  duration: number;
  timestamp: Date;
}

export default function RecordScreen() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768;
  const { contacts } = useContacts();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [sound, recording]);

  const handleBack = () => {
    router.back();
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (uri) {
        const newRecording: Recording = {
          id: Date.now().toString(),
          uri,
          duration: 0, // You can implement duration tracking if needed
          timestamp: new Date(),
        };
        setRecordings(prev => [...prev, newRecording]);
        setSelectedRecording(newRecording);
      }
      setRecording(null);
      setIsRecording(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const playRecording = async (recording: Recording) => {
    try {
      // If the same recording is already playing, pause it
      if (isPlaying && selectedRecording?.id === recording.id) {
        await pauseRecording();
        return;
      }

      // If a different recording is playing, stop it first
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync({ uri: recording.uri });
      setSound(newSound);
      setIsPlaying(true);
      setSelectedRecording(recording);
      
      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  const pauseRecording = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const deleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(rec => rec.id !== id));
    if (selectedRecording?.id === id) {
      setSelectedRecording(null);
    }
  };

  const handleSendRecording = async () => {
    if (!selectedRecording) {
      Alert.alert('Error', 'Please select a recording to send');
      return;
    }

    if (contacts.length === 0) {
      Alert.alert('No Contacts', 'Please add emergency contacts first');
      return;
    }

    setIsSending(true);

    try {
      const message = "I am sharing an emergency audio recording with you. Please listen to it.";
      
      if (Platform.OS === 'ios') {
        // For iOS, we'll use the Share API
        await Sharing.shareAsync(selectedRecording.uri, {
          mimeType: 'audio/m4a',
          dialogTitle: 'Share Emergency Recording',
          UTI: 'public.audio',
        });
      } else {
        // For Android, we'll use the Intent API for WhatsApp
        const intentUrl = `intent://send?text=${encodeURIComponent(message)}&file=${encodeURIComponent(selectedRecording.uri)}#Intent;scheme=whatsapp;package=com.whatsapp;end`;
        await Linking.openURL(intentUrl);
      }

      Alert.alert('Success', 'Recording shared with all emergency contacts');
    } catch (error) {
      Alert.alert('Error', 'Failed to share recording');
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
        <Text style={styles.headerTitle}>Record Audio</Text>
      </View>

      <ScrollView style={[styles.content, !isSmallScreen && styles.contentWide]}>
        <View style={styles.recordingCard}>
          <View style={styles.recordingHeader}>
            <Mic size={24} color="#FF1493" />
            <Text style={styles.recordingTitle}>Audio Recording</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.controlButton, isRecording && styles.recordingButton]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? (
                <>
                  <Square size={20} color="#fff" />
                  <Text style={styles.controlButtonText}>Stop Recording</Text>
                </>
              ) : (
                <>
                  <Mic size={20} color="#fff" />
                  <Text style={styles.controlButtonText}>Start Recording</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.recordingsList}>
          <Text style={styles.recordingsTitle}>Your Recordings</Text>
          {recordings.length > 0 ? (
            recordings.map((rec) => (
              <View 
                key={rec.id} 
                style={[
                  styles.recordingItem,
                  selectedRecording?.id === rec.id && styles.selectedRecording
                ]}
              >
                <TouchableOpacity 
                  style={styles.recordingInfo}
                  onPress={() => setSelectedRecording(rec)}
                >
                  <View style={styles.recordingDetails}>
                    <Text style={styles.recordingTime}>
                      {rec.timestamp.toLocaleTimeString()}
                    </Text>
                    <Text style={styles.recordingDate}>
                      {rec.timestamp.toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.recordingActions}>
                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={() => playRecording(rec)}
                    >
                      {isPlaying && selectedRecording?.id === rec.id ? (
                        <Pause size={20} color="#FF1493" />
                      ) : (
                        <Play size={20} color="#FF1493" />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteRecording(rec.id)}
                    >
                      <Trash2 size={20} color="#FF4444" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noRecordingsText}>No recordings yet</Text>
          )}
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
      </ScrollView>

      {selectedRecording && (
        <View style={[styles.footer, !isSmallScreen && styles.footerWide]}>
          <TouchableOpacity
            style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
            onPress={handleSendRecording}
            disabled={isSending}
          >
            <Send size={20} color="#fff" />
            <Text style={styles.sendButtonText}>
              {isSending ? 'Sending...' : 'Send Selected Recording'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  recordingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  recordingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordingTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#333',
    marginLeft: 8,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF1493',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  recordingButton: {
    backgroundColor: '#FF4444',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  recordingsList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  recordingsTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  recordingItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  selectedRecording: {
    borderWidth: 2,
    borderColor: '#FF1493',
  },
  recordingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  recordingDetails: {
    flex: 1,
  },
  recordingTime: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#333',
  },
  recordingDate: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  recordingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  playButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  noRecordingsText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#666',
    textAlign: 'center',
    padding: 16,
  },
  contactsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  footerWide: {
    maxWidth: 768,
    alignSelf: 'center',
    width: '100%',
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
});
