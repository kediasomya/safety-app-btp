import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';
import { LogOut, UserCircle } from 'lucide-react-native';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const handleLogout = () => {
    // TODO: Implement logout logic
    router.replace('/(auth)/signin');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <UserCircle size={24} color="#fff" />
        <Text style={styles.title}>Profile</Text>
      </View>
      
      <View style={styles.content}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#FF1493" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create<{
  container: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  content: ViewStyle;
  logoutButton: ViewStyle;
  logoutText: TextStyle;
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
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    backgroundColor: '#4A0072',
    padding: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#FF1493',
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
}); 