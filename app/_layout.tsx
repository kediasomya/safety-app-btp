import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/hooks/useAuth';
import { ContactsProvider } from '@/context/ContactsContext';

export default function RootLayout() {
  useFrameworkReady();
  const { user, loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return null;
  }

  return (
    <ContactsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="update-contacts" options={{ headerShown: false }} />
            <Stack.Screen name="track-me" options={{ headerShown: false }} />
          </>
        )}
      </Stack>
      <StatusBar style="auto" />
    </ContactsProvider>
  );
}