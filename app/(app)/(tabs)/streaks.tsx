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
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Query } from 'react-native-appwrite';
import { Card, Text } from 'react-native-paper';

const StreaksScreen = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<HabitCompletion[]>([]);

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
            fetchCompletions();
          }
        },
      );

      fetchHabits();
      fetchCompletions();

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

  const fetchCompletions = async () => {
    try {
      const result = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: COMPLETION_TABLE_ID,
        queries: [Query.equal('user_id', user?.$id ?? '')],
      });

      setCompletedHabits(result.rows as HabitCompletion[]);
    } catch (error) {}
  };

  interface StreakData {
    streak: number;
    bestStreak: number;
    total: number;
  }

  const getStreakData = (habitId: string): StreakData => {
    const habitCompletions = completedHabits
      .filter((h) => h.habit_id === habitId)
      .sort(
        (a, b) =>
          new Date(a.completed_at).getTime() -
          new Date(b.completed_at).getTime(),
      );

    if (habitCompletions?.length === 0) {
      return {
        streak: 0,
        bestStreak: 0,
        total: 0,
      };
    }

    // Build streak data
    let streak = 0;
    let bestStreak = 0;
    let total = habitCompletions.length;

    let lastDate: Date | null = null;
    let currentStreak = 0;

    habitCompletions?.forEach((h) => {
      const date = new Date(h.completed_at);
      if (lastDate) {
        const diff =
          (date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diff <= 1.5) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }

      if (currentStreak > bestStreak) bestStreak = currentStreak;
      streak = currentStreak;
      lastDate = date;
    });

    return { streak, bestStreak, total };
  };

  const habitStreaks = habits.map((habit) => {
    const { streak, bestStreak, total } = getStreakData(habit.$id);
    return { habit, streak, bestStreak, total };
  });

  const rankedHabits = habitStreaks.sort((a, b) => b.bestStreak - a.bestStreak);
  const badgeStyles = [styles.badge1, styles.badge2, styles.badge3];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Habit Streaks</Text>
      {rankedHabits.length > 0 && (
        <View style={styles.rankingContainer}>
          <Text style={styles.rankingTitle}>
            <MaterialCommunityIcons name="medal" size={18} color="#ff9800" />{' '}
            Top Streaks
          </Text>
          {rankedHabits.slice(0, 3).map(({ habit, bestStreak }, idx) => (
            <View key={habit?.$id} style={styles.rankingRow}>
              <View style={[styles.rankingBadge, badgeStyles[idx]]}>
                <Text style={styles.rankingBadgeText}>{idx + 1}</Text>
              </View>
              <Text style={styles.rankingHabit}>{habit.title}</Text>
              <Text style={styles.rankingStreak}>{bestStreak}</Text>
            </View>
          ))}
        </View>
      )}
      {habits.length === 0 ? (
        <Text style={styles.emptyStateText}>
          No Habits yet. Add your first habit.
        </Text>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.rankedHabitsContent}
        >
          {rankedHabits.map(({ habit, streak, bestStreak, total }, idx) => (
            <Card
              key={habit.$id}
              style={[styles.card, idx === 0 && styles.firstCard]}
            >
              <Card.Content>
                <Text style={styles.habitTitle} variant="titleMedium">
                  {habit.title}
                </Text>
                <Text style={styles.habitDescription}>{habit.description}</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statBadge}>
                    <Text style={styles.statBadgeText}>
                      <MaterialCommunityIcons
                        name="fire"
                        size={18}
                        color="#ff9800"
                      />{' '}
                      {streak}
                    </Text>
                    <Text style={styles.statLabel}>current</Text>
                  </View>
                  <View style={styles.statBadgeGold}>
                    <Text style={styles.statBadgeText}>
                      <MaterialCommunityIcons
                        name="trophy"
                        size={18}
                        color="#ff9800"
                      />{' '}
                      {bestStreak}
                    </Text>
                    <Text style={styles.statLabel}>Best</Text>
                  </View>
                  <View style={styles.statBadgeGreen}>
                    <Text style={styles.statBadgeText}>
                      <MaterialCommunityIcons
                        name="check"
                        size={18}
                        color="green"
                      />{' '}
                      {total}
                    </Text>
                    <Text style={styles.statLabel}>Total</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default StreaksScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  rankedHabitsContent: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  rankingContainer: {
    marginBottom: 24,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  rankingTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
    color: '#7c4dff',
    letterSpacing: 0.5,
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0f0',
    paddingBottom: 8,
  },
  rankingBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#E0E0E0',
  },
  badge1: {
    backgroundColor: '#FFD700', //gold
  },
  badge2: {
    backgroundColor: '#C0C0C0', //silver
  },
  badge3: {
    backgroundColor: '#cd7F32', //bronze
  },
  rankingBadgeText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 15,
  },
  rankingHabit: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: 600,
  },
  rankingStreak: {
    fontSize: 14,
    color: '#764DFF',
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: '#Fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  firstCard: {
    borderWidth: 2,
    borderColor: '#7C4DFF',
  },
  habitTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 2,
  },
  habitDescription: {
    color: '#6C6C80',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 8,
  },
  statBadge: {
    backgroundColor: '#FFF3e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 60,
  },
  statBadgeGold: {
    backgroundColor: '#fffde7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 60,
  },
  statBadgeGreen: {
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 60,
  },
  statBadgeText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#22223B',
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
    fontWeight: 500,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#666666',
  },
});
