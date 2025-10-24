import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';

export default function AuthScreen() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
        <Text style={{ fontSize: 24, textAlign: 'center' }}>
          Create Account
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
