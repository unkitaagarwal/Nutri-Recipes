import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  ChefHat,
} from 'lucide-react-native';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { useRecipes } from '@/context/RecipeContext';

const { width } = Dimensions.get('window');

export default function CookingModeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRecipeById } = useRecipes();

  const recipe = getRecipeById(id || '');
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const progressAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (recipe) {
      Animated.timing(progressAnim, {
        toValue: (currentStep + 1) / recipe.steps.length,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [currentStep, recipe]);

  const animateSlide = (direction: 'left' | 'right') => {
    const startValue = direction === 'left' ? width : -width;
    slideAnim.setValue(startValue);
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  if (!recipe) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Recipe not found</Text>
      </View>
    );
  }

  const step = recipe.steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === recipe.steps.length - 1;

  const handlePrevStep = () => {
    if (!isFirstStep) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setCurrentStep(currentStep - 1);
      animateSlide('right');
    }
  };

  const handleNextStep = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setCompletedSteps((prev) => new Set(prev).add(currentStep));
    
    if (isLastStep) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.back();
    } else {
      setCurrentStep(currentStep + 1);
      animateSlide('left');
    }
  };

  const handleClose = () => {
    router.back();
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient
      colors={[colors.text, '#2A2D3E', '#1E2030']}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <X size={24} color={colors.white} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.recipeName} numberOfLines={1}>
            {recipe.title}
          </Text>
          <Text style={styles.stepIndicator}>
            Step {currentStep + 1} of {recipe.steps.length}
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressFill, { width: progressWidth }]}
          />
        </View>
      </View>

      <View style={styles.stepsDotsContainer}>
        {recipe.steps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.stepDot,
              currentStep === index && styles.stepDotActive,
              completedSteps.has(index) && styles.stepDotCompleted,
            ]}
          >
            {completedSteps.has(index) && (
              <Check size={10} color={colors.white} />
            )}
          </View>
        ))}
      </View>

      <Animated.View
        style={[
          styles.stepContent,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <View style={styles.stepNumberContainer}>
          <View style={styles.stepNumberCircle}>
            <Text style={styles.stepNumber}>{step.order}</Text>
          </View>
        </View>

        <Text style={styles.stepInstruction}>{step.instruction}</Text>

        {step.duration && (
          <View style={styles.durationBadge}>
            <Clock size={18} color={colors.primary} />
            <Text style={styles.durationText}>~{step.duration} minutes</Text>
          </View>
        )}
      </Animated.View>

      <View style={[styles.navigationContainer, { paddingBottom: insets.bottom + 20 }]}>
        <Pressable
          style={[styles.navButton, isFirstStep && styles.navButtonDisabled]}
          onPress={handlePrevStep}
          disabled={isFirstStep}
        >
          <ChevronLeft
            size={28}
            color={isFirstStep ? 'rgba(255,255,255,0.3)' : colors.white}
          />
          <Text
            style={[
              styles.navButtonText,
              isFirstStep && styles.navButtonTextDisabled,
            ]}
          >
            Back
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.nextButton,
            isLastStep && styles.doneButton,
            pressed && styles.nextButtonPressed,
          ]}
          onPress={handleNextStep}
        >
          {isLastStep ? (
            <>
              <ChefHat size={24} color={colors.white} />
              <Text style={styles.nextButtonText}>Done!</Text>
            </>
          ) : (
            <>
              <Text style={styles.nextButtonText}>Next</Text>
              <ChevronRight size={24} color={colors.white} />
            </>
          )}
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  stepIndicator: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  placeholder: {
    width: 44,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  stepsDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: colors.primary,
    transform: [{ scale: 1.2 }],
  },
  stepDotCompleted: {
    backgroundColor: colors.secondary,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  stepNumberContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepNumberCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  stepNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.white,
  },
  stepInstruction: {
    fontSize: 24,
    fontWeight: '500',
    color: colors.white,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 32,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(224, 122, 95, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    alignSelf: 'center',
  },
  durationText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 16,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '500',
  },
  navButtonTextDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  doneButton: {
    backgroundColor: colors.secondary,
  },
  nextButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  errorText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 100,
  },
});
