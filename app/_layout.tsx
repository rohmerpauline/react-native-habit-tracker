import { Stack } from 'expo-router';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SplashScreenController } from '../splash';

export default function Root() {
  return (
    <AuthProvider>
      <SplashScreenController />
      <RootNavigator />
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
