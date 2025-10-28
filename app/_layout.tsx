import { Stack } from 'expo-router';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreenController } from '../splash';

export default function Root() {
  return (
    <AuthProvider>
      <PaperProvider>
        <SafeAreaProvider>
          <SplashScreenController />
          <RootNavigator />
        </SafeAreaProvider>
      </PaperProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { user, isLoadingUser } = useAuth();

  if (isLoadingUser) {
    return null;
  }

  return (
    <Stack>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!user}>
        <Stack.Screen name="auth" />
      </Stack.Protected>
    </Stack>
  );
}
