import { Tabs } from 'expo-router';
import {
  Chrome as Home,
  Phone,
  Mic,
  CircleUser as UserCircle,
  Bell,
  MapPin,
  Bot,
  UserPlus,
} from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#FF1493',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontFamily: 'Inter_400Regular',
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Bell size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Contacts',
          tabBarIcon: ({ color, size }) => <Phone size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="emergency-sms"
        options={{
          title: 'Emergency SMS',
          tabBarIcon: ({ color }) => <Phone size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="track-me"
        options={{
          title: 'Track Me',
          tabBarIcon: ({ color }) => <MapPin size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: 'Record',
          tabBarIcon: ({ color }) => <Mic size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="shieldmate-bot"
        options={{
          title: 'ShieldMate Bot',
          tabBarIcon: ({ color }) => <Bot size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="update-contacts"
        options={{
          title: 'Update Contacts',
          tabBarIcon: ({ color }) => <UserPlus size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <UserCircle size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
