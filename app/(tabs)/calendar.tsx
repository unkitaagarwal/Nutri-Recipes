import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MealCard from '@/components/MealCard';
import colors from '@/constants/colors';
import { useRecipes } from '@/context/RecipeContext';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getMealsForDate } = useRecipes();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentDate]);

  const mealsForSelectedDate = useMemo(() => {
    return getMealsForDate(selectedDate);
  }, [selectedDate, getMealsForDate]);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleSelectDate = (date: Date) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleAddMeal = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push({
      pathname: '/plan-meal',
      params: { date: selectedDate },
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return date.toISOString().split('T')[0] === selectedDate;
  };

  const hasMeals = (date: Date) => {
    return getMealsForDate(date.toISOString().split('T')[0]).length > 0;
  };

  const formatSelectedDate = () => {
    const date = new Date(selectedDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (selectedDate === today.toISOString().split('T')[0]) {
      return 'Today';
    }
    if (selectedDate === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Meal Plan</Text>
      </View>

      <View style={styles.calendar}>
        <View style={styles.monthHeader}>
          <Pressable onPress={handlePrevMonth} style={styles.monthButton}>
            <ChevronLeft size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.monthTitle}>
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          <Pressable onPress={handleNextMonth} style={styles.monthButton}>
            <ChevronRight size={24} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.weekDays}>
          {DAYS.map((day) => (
            <Text key={day} style={styles.weekDayText}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {calendarDays.map((date, index) => (
            <View key={index} style={styles.dayCell}>
              {date ? (
                <Pressable
                  style={[
                    styles.dayButton,
                    isToday(date) && styles.todayButton,
                    isSelected(date) && styles.selectedButton,
                  ]}
                  onPress={() => handleSelectDate(date)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isToday(date) && styles.todayText,
                      isSelected(date) && styles.selectedText,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                  {hasMeals(date) && (
                    <View
                      style={[
                        styles.mealDot,
                        isSelected(date) && styles.mealDotSelected,
                      ]}
                    />
                  )}
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.mealsSection}>
        <View style={styles.mealsSectionHeader}>
          <View>
            <Text style={styles.selectedDateText}>{formatSelectedDate()}</Text>
            <Text style={styles.mealCount}>
              {mealsForSelectedDate.length} meal
              {mealsForSelectedDate.length !== 1 ? 's' : ''} planned
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.addMealButton,
              pressed && styles.addMealButtonPressed,
            ]}
            onPress={handleAddMeal}
          >
            <Plus size={20} color={colors.white} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.mealsContent}
        >
          {mealsForSelectedDate.length === 0 ? (
            <View style={styles.emptyState}>
              <CalendarDays size={40} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No meals planned</Text>
              <Text style={styles.emptyText}>
                Tap the + button to add a meal for this day
              </Text>
            </View>
          ) : (
            mealsForSelectedDate.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  calendar: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  dayButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  todayButton: {
    backgroundColor: colors.backgroundAlt,
  },
  selectedButton: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  todayText: {
    color: colors.primary,
    fontWeight: '700',
  },
  selectedText: {
    color: colors.white,
  },
  mealDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.secondary,
    marginTop: 2,
  },
  mealDotSelected: {
    backgroundColor: colors.white,
  },
  mealsSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  mealsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedDateText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  mealCount: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  addMealButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMealButtonPressed: {
    opacity: 0.9,
  },
  mealsContent: {
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
});
