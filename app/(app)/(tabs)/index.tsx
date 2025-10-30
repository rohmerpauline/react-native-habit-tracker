import { useAuth } from '@/contexts/AuthContext';
import {
  client,
  COMPLETION_TABLE_ID,
  DATABASE_ID,
  HABITS_TABLE_ID,
  RealTimeResponse,
  tablesDB,
} from '@/lib/appwrite';
import { Habit, HabitCompletion } from '@/types/database.type';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ID, Query } from 'react-native-appwrite';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Button, Surface, Text } from 'react-native-paper';

export default function Index() {
  const { signOut, user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>();
  const [completedHabits, setCompletedHabits] = useState<string[]>();
  const swipeableRefs = useRef<any>({});

  useEffect(() => {
    if (user) {
      const habitsChannel = `databases.${DATABASE_ID}.tables.${HABITS_TABLE_ID}.rows`;
      const completionsChannel = `databases.${DATABASE_ID}.tables.${COMPLETION_TABLE_ID}.rows`;

      const habitSubscription = client.subscribe(
        habitsChannel,
        (response: RealTimeResponse) => {
          if (
            response.events.some(
              (e) =>
                e.endsWith('.create') ||
                e.endsWith('.update') ||
                e.endsWith('.delete'),
            )
          ) {
            fetchHabits();
          }
        },
      );

      const completionsSubscription = client.subscribe(
        completionsChannel,
        (response: RealTimeResponse) => {
          if (response.events.some((e) => e.endsWith('.create'))) {
            fetchTodayCompletions();
          }
        },
      );

      fetchHabits();
      fetchTodayCompletions();

      return () => {
        habitSubscription();
        completionsSubscription();
      };
    }
  }, [user]);

  const fetchHabits = async () => {
    try {
      const result = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: HABITS_TABLE_ID,
        queries: [Query.equal('user_id', user?.$id ?? '')],
      });
      setHabits(result.rows as Habit[]);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTodayCompletions = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0);

      const result = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: COMPLETION_TABLE_ID,
        queries: [
          Query.equal('user_id', user?.$id ?? ''),
          Query.greaterThanEqual('completed_at', today.toISOString()),
        ],
      });

      const completions = result.rows as HabitCompletion[];
      setCompletedHabits(completions.map((c) => c.habit_id));
    } catch (error) {}
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      await tablesDB.deleteRow({
        databaseId: DATABASE_ID,
        tableId: HABITS_TABLE_ID,
        rowId: id,
      });
    } catch (error) {}
  };

  const handleCompleteHabit = async (id: string) => {
    if (!user || completedHabits?.includes(id)) return;
    try {
      const currentDate = new Date().toISOString();

      await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: COMPLETION_TABLE_ID,
        rowId: ID.unique(),
        data: {
          user_id: user.$id,
          habit_id: id,
          completed_at: currentDate,
        },
      });

      const habit = habits?.find((h) => h.$id === id);
      if (!habit) return;

      await tablesDB.updateRow({
        databaseId: DATABASE_ID,
        tableId: HABITS_TABLE_ID,
        rowId: id,
        data: {
          streak_count: habit.streak_count + 1,
          last_completed: currentDate,
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const isHabitCompleted = (habitId: string) =>
    completedHabits?.includes(habitId);

  const renderRightActions = (habit_id: string) => (
    <View style={styles.swipeActionLeft}>
      {isHabitCompleted(habit_id) ? (
        <Text style={{ color: '#fff' }}>Completed</Text>
      ) : (
        <MaterialCommunityIcons
          name="check-circle-outline"
          size={32}
          color="#fff"
        />
      )}
    </View>
  );

  const renderLeftActions = () => (
    <View style={styles.swipeActionRight}>
      <MaterialCommunityIcons name="trash-can-outline" size={32} color="#fff" />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Today's Habits
        </Text>
        <Button mode="text" onPress={signOut} icon={'logout'}>
          Sign Out
        </Button>
      </View>

      {habits?.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No Habits yet. Add your first habit.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {habits?.map((habit) => (
            <Swipeable
              ref={(ref) => {
                swipeableRefs.current[habit.$id] = ref;
              }}
              key={habit.$id}
              overshootLeft={false}
              overshootRight={false}
              renderRightActions={() => renderRightActions(habit.$id)}
              renderLeftActions={renderLeftActions}
              onSwipeableOpen={(direction) => {
                if (direction === 'right') {
                  handleDeleteHabit(habit.$id);
                } else if (direction === 'left') {
                  handleCompleteHabit(habit.$id);
                }

                swipeableRefs.current[habit.$id].close();
              }}
            >
              <Surface
                style={[
                  styles.card,
                  isHabitCompleted(habit.$id) && styles.cardCompletedCard,
                ]}
                elevation={0}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{habit.title}</Text>
                  <Text style={styles.cardDescription}>
                    {habit.description}
                  </Text>
                  <View style={styles.cardFooter}>
                    <View style={styles.streakBadge}>
                      <MaterialCommunityIcons
                        name="fire"
                        size={18}
                        color="#ff9800"
                      />
                      <Text style={styles.streakText}>
                        {habit.streak_count} day streak
                      </Text>
                    </View>
                    <View style={styles.frequencyBadge}>
                      <Text style={styles.frequencyText}>
                        {habit.frequency}
                      </Text>
                    </View>
                  </View>
                </View>
              </Surface>
            </Swipeable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#666666',
  },
  card: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: '#f7f2fa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardCompletedCard: {
    opacity: 0.8,
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#22223b',
  },
  cardDescription: {
    fontSize: 15,
    marginBottom: 16,
    color: '#6c6c80',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3D0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakText: {
    marginLeft: 6,
    color: '#FF9800',
    fontWeight: 'bold',
    fontSize: 14,
  },
  frequencyBadge: {
    backgroundColor: '#ede7f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  frequencyText: {
    color: '#7c4DFF',
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  swipeActionRight: {
    backgroundColor: '#e53935',
    justifyContent: 'center',
    alignItems: 'flex-start',
    flex: 1,
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingLeft: 16,
  },
  swipeActionLeft: {
    backgroundColor: '#4caf5a',
    justifyContent: 'center',
    alignItems: 'flex-end',
    flex: 1,
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingRight: 16,
  },
});
