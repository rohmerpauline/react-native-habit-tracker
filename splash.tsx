import { SplashScreen } from 'expo-router';
import { useAuth } from './contexts/AuthContext';

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { isLoadingUser } = useAuth();

  if (!isLoadingUser) {
    SplashScreen.hide();
  }

  return null;
}
