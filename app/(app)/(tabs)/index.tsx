import { useAuth } from '@/contexts/AuthContext';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

export default function Index() {
  const { signOut } = useAuth();

  return (
    <View style={styles.view}>
      <Text>Home page</Text>
      <Button mode="text" onPress={signOut} icon={'logout'}>
        Sign Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  view: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
