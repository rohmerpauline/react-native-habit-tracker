import { useAuth } from '@/contexts/AuthContext';
import { DATABASE_ID, HABITS_TABLE_ID, tablesDB } from '@/lib/appwrite';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ID } from 'react-native-appwrite';
import {
  Button,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

const FREQUENCIES = ['daily', 'weekly', 'monthly'];
type Frequency = (typeof FREQUENCIES)[number];

const AddHabitScreen = () => {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [frequency, setFrequency] = useState<Frequency>(FREQUENCIES[0]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!user) return;

    try {
      await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: HABITS_TABLE_ID,
        rowId: ID.unique(),
        data: {
          user_id: user.$id,
          title: title,
          description: description,
          frequency: frequency,
          streak_count: 0,
          last_completed: new Date().toISOString(),
        },
      });
      router.back();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        return;
      }

      setError('There was an error creating the habit.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        label="Title"
        mode="outlined"
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        label="Description"
        mode="outlined"
        onChangeText={setDescription}
      />
      <View style={styles.frequencyContainer}>
        <SegmentedButtons
          buttons={FREQUENCIES.map((freq) => ({
            value: freq,
            label: freq.charAt(0).toUpperCase() + freq.slice(1),
          }))}
          multiSelect={false}
          onValueChange={(value) => setFrequency(value as Frequency)}
          value={frequency}
        />
      </View>
      {error && <Text style={{ color: theme.colors.error }}>{error}</Text>}
      <Button
        mode="contained"
        disabled={!title || !description}
        onPress={handleSubmit}
      >
        Add Habit
      </Button>
    </View>
  );
};

export default AddHabitScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  input: {
    marginBottom: 16,
  },
  frequencyContainer: {
    marginBottom: 24,
  },
});
