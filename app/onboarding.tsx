import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BookOpen, Calendar, ShoppingCart, ChefHat, Sparkles, Link, Camera, FileText } from 'lucide-react-native';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Animated,
  FlatList,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecipes } from '@/context/RecipeContext';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  titleParts: { text: string; bold?: boolean }[];
  subtitle: string;
  mockupType: 'intro' | 'vault' | 'calendar' | 'shopping' | 'final';
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    titleParts: [
      { text: 'Save recipes.\n' },
      { text: 'Actually ', bold: true },
      { text: 'cook', bold: true },
      { text: ' them.' },
    ],
    subtitle: 'All your recipes from videos, links, and books —\norganized into a simple plan with shopping lists and reminders.',
    mockupType: 'intro',
  },
  {
    id: '2',
    titleParts: [
      { text: 'Save recipes from ' },
      { text: 'anywhere', bold: true },
      { text: '.' },
    ],
    subtitle: 'Videos, links, screenshots, cookbooks — all in one place.',
    mockupType: 'vault',
  },
  {
    id: '3',
    titleParts: [
      { text: 'Decide once. Eat ' },
      { text: 'stress-free', bold: true },
      { text: '.' },
    ],
    subtitle: 'Choose when you\'ll cook — breakfast, lunch, or dinner.',
    mockupType: 'calendar',
  },
  {
    id: '4',
    titleParts: [
      { text: 'Shop only for what ' },
      { text: 'you need', bold: true },
      { text: '.' },
    ],
    subtitle: 'We combine all ingredients from your planned meals.',
    mockupType: 'shopping',
  },
  {
    id: '5',
    titleParts: [
      { text: 'From recipe to plate — ' },
      { text: 'effortlessly', bold: true },
      { text: '.' },
    ],
    subtitle: 'We combine all ingredients from your planned meals.',
    mockupType: 'final',
  },
];

const RecipeCardMini = ({ title, color }: { title: string; color: string }) => (
  <View style={[mockupStyles.recipeCardMini, { backgroundColor: color }]}>
    <View style={mockupStyles.recipeCardImage} />
    <Text style={mockupStyles.recipeCardTitle} numberOfLines={1}>{title}</Text>
  </View>
);

const IntroMockup = () => (
  <View style={mockupStyles.introContainer}>
    <View style={mockupStyles.floatingCard}>
      <View style={mockupStyles.cardHeader}>
        <BookOpen size={18} color="#1E5AA8" />
        <Text style={mockupStyles.cardHeaderText}>Recipe Vault</Text>
      </View>
      <View style={mockupStyles.recipeGrid}>
        <RecipeCardMini title="Pasta Carbonara" color="#FFF5E6" />
        <RecipeCardMini title="Chicken Stir Fry" color="#E8F5E9" />
        <RecipeCardMini title="Caesar Salad" color="#FFF3E0" />
      </View>
    </View>
    <View style={[mockupStyles.sourceIcon, mockupStyles.sourceIcon1]}>
      <Link size={14} color="#1E5AA8" />
    </View>
    <View style={[mockupStyles.sourceIcon, mockupStyles.sourceIcon2]}>
      <Camera size={14} color="#1E5AA8" />
    </View>
    <View style={[mockupStyles.sourceIcon, mockupStyles.sourceIcon3]}>
      <FileText size={14} color="#1E5AA8" />
    </View>
  </View>
);

const VaultMockup = () => (
  <View style={mockupStyles.vaultContainer}>
    <View style={mockupStyles.mainVaultCard}>
      <View style={mockupStyles.cardHeader}>
        <BookOpen size={16} color="#1E5AA8" />
        <Text style={mockupStyles.cardHeaderText}>Recipe Vault</Text>
      </View>
      <View style={mockupStyles.vaultGrid}>
        <View style={mockupStyles.vaultRecipeCard}>
          <View style={[mockupStyles.vaultRecipeImage, { backgroundColor: '#FFE4D6' }]} />
          <Text style={mockupStyles.vaultRecipeTitle}>Chicken Stir Fry</Text>
          <Text style={mockupStyles.vaultRecipeMeta}>25 min</Text>
        </View>
        <View style={mockupStyles.vaultRecipeCard}>
          <View style={[mockupStyles.vaultRecipeImage, { backgroundColor: '#D6F5E3' }]} />
          <Text style={mockupStyles.vaultRecipeTitle}>Olive Oil</Text>
          <Text style={mockupStyles.vaultRecipeMeta}>10 min</Text>
        </View>
        <View style={mockupStyles.vaultRecipeCard}>
          <View style={[mockupStyles.vaultRecipeImage, { backgroundColor: '#FFF5D6' }]} />
          <Text style={mockupStyles.vaultRecipeTitle}>Caesar Salad</Text>
          <Text style={mockupStyles.vaultRecipeMeta}>15 min</Text>
        </View>
        <View style={mockupStyles.vaultRecipeCard}>
          <View style={[mockupStyles.vaultRecipeImage, { backgroundColor: '#E3D6F5' }]} />
          <Text style={mockupStyles.vaultRecipeTitle}>Greek Salad</Text>
          <Text style={mockupStyles.vaultRecipeMeta}>10 min</Text>
        </View>
      </View>
    </View>
    <View style={mockupStyles.addRecipeBubble}>
      <Sparkles size={12} color="#1E5AA8" />
      <Text style={mockupStyles.addRecipeText}>No rewriting. No copy-paste.</Text>
    </View>
  </View>
);

const CalendarMockup = () => (
  <View style={mockupStyles.calendarContainer}>
    <View style={mockupStyles.calendarCard}>
      <View style={mockupStyles.calendarHeader}>
        <View style={mockupStyles.calendarTabs}>
          <View style={[mockupStyles.calendarTab, mockupStyles.calendarTabActive]}>
            <Text style={mockupStyles.calendarTabTextActive}>Today</Text>
          </View>
          <View style={mockupStyles.calendarTab}>
            <Text style={mockupStyles.calendarTabText}>Apr 21-27</Text>
          </View>
        </View>
      </View>
      <View style={mockupStyles.mealSlots}>
        <View style={mockupStyles.mealSlot}>
          <Text style={mockupStyles.mealSlotLabel}>Breakfast</Text>
          <View style={[mockupStyles.mealSlotCard, { backgroundColor: '#FFF5E6' }]}>
            <Text style={mockupStyles.mealSlotTitle}>Overnight Oats</Text>
          </View>
        </View>
        <View style={mockupStyles.mealSlot}>
          <Text style={mockupStyles.mealSlotLabel}>Lunch</Text>
          <View style={[mockupStyles.mealSlotCard, { backgroundColor: '#E8F5E9' }]}>
            <Text style={mockupStyles.mealSlotTitle}>Caesar Salad</Text>
          </View>
        </View>
        <View style={mockupStyles.mealSlot}>
          <Text style={mockupStyles.mealSlotLabel}>Dinner</Text>
          <View style={[mockupStyles.mealSlotCard, { backgroundColor: '#FFE4E4' }]}>
            <Text style={mockupStyles.mealSlotTitle}>Pasta Tuna</Text>
          </View>
        </View>
      </View>
    </View>
    <View style={mockupStyles.calendarBubble}>
      <Text style={mockupStyles.bubbleText}>Turn saved recipes into a weekly plan.</Text>
    </View>
  </View>
);

const ShoppingMockup = () => (
  <View style={mockupStyles.shoppingContainer}>
    <View style={mockupStyles.pantryCard}>
      <Text style={mockupStyles.pantryTitle}>In Your Pantry</Text>
      <View style={mockupStyles.pantryItems}>
        <View style={mockupStyles.pantryItem}>
          <View style={[mockupStyles.checkbox, mockupStyles.checkboxChecked]} />
          <Text style={mockupStyles.pantryItemText}>Garlic</Text>
        </View>
        <View style={mockupStyles.pantryItem}>
          <View style={[mockupStyles.checkbox, mockupStyles.checkboxChecked]} />
          <Text style={mockupStyles.pantryItemText}>Olive Oil</Text>
        </View>
        <View style={mockupStyles.pantryItem}>
          <View style={mockupStyles.checkbox} />
          <Text style={mockupStyles.pantryItemText}>Onions</Text>
        </View>
        <View style={mockupStyles.pantryItem}>
          <View style={mockupStyles.checkbox} />
          <Text style={mockupStyles.pantryItemText}>Chicken Breast</Text>
        </View>
      </View>
    </View>
    <View style={mockupStyles.shoppingListCard}>
      <Text style={mockupStyles.shoppingListTitle}>Shopping List</Text>
      <View style={mockupStyles.shoppingItems}>
        <View style={mockupStyles.shoppingItem}>
          <View style={mockupStyles.shoppingDot} />
          <Text style={mockupStyles.shoppingItemText}>Chicken Breast</Text>
        </View>
        <View style={mockupStyles.shoppingItem}>
          <View style={mockupStyles.shoppingDot} />
          <Text style={mockupStyles.shoppingItemText}>Diced Tomatoes</Text>
        </View>
        <View style={mockupStyles.shoppingItem}>
          <View style={mockupStyles.shoppingDot} />
          <Text style={mockupStyles.shoppingItemText}>Bell Peppers</Text>
        </View>
        <View style={mockupStyles.shoppingItem}>
          <View style={mockupStyles.shoppingDot} />
          <Text style={mockupStyles.shoppingItemText}>Rice</Text>
        </View>
      </View>
    </View>
    <View style={mockupStyles.shoppingBubble}>
      <Text style={mockupStyles.bubbleText}>Check what you already have. We handle the rest.</Text>
    </View>
  </View>
);

const FinalMockup = () => (
  <View style={mockupStyles.finalContainer}>
    <View style={mockupStyles.finalFlow}>
      <View style={mockupStyles.finalStep}>
        <View style={mockupStyles.finalStepIcon}>
          <BookOpen size={20} color="#1E5AA8" />
        </View>
        <Text style={mockupStyles.finalStepText}>Save recipes</Text>
      </View>
      <View style={mockupStyles.finalArrow}>
        <Text style={mockupStyles.finalArrowText}>→</Text>
      </View>
      <View style={mockupStyles.finalStep}>
        <View style={mockupStyles.finalStepIcon}>
          <Calendar size={20} color="#1E5AA8" />
        </View>
        <Text style={mockupStyles.finalStepText}>Plan & Prep</Text>
      </View>
      <View style={mockupStyles.finalArrow}>
        <Text style={mockupStyles.finalArrowText}>→</Text>
      </View>
      <View style={mockupStyles.finalStep}>
        <View style={mockupStyles.finalStepIcon}>
          <ShoppingCart size={20} color="#1E5AA8" />
        </View>
        <Text style={mockupStyles.finalStepText}>Check your pantry</Text>
      </View>
      <View style={mockupStyles.finalArrow}>
        <Text style={mockupStyles.finalArrowText}>→</Text>
      </View>
      <View style={mockupStyles.finalStep}>
        <View style={mockupStyles.finalStepIcon}>
          <ChefHat size={20} color="#1E5AA8" />
        </View>
        <Text style={mockupStyles.finalStepText}>Shop & Cook</Text>
      </View>
    </View>
    <View style={mockupStyles.finalBubble}>
      <Text style={mockupStyles.bubbleText}>No more forgotten recipes.</Text>
    </View>
  </View>
);

const renderMockup = (type: string) => {
  switch (type) {
    case 'intro':
      return <IntroMockup />;
    case 'vault':
      return <VaultMockup />;
    case 'calendar':
      return <CalendarMockup />;
    case 'shopping':
      return <ShoppingMockup />;
    case 'final':
      return <FinalMockup />;
    default:
      return <IntroMockup />;
  }
};

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useRecipes();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = () => {
    completeOnboarding();
    router.replace('/');
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    const isFirstSlide = item.id === '1';
    const isLastSlide = item.id === '5';

    return (
      <View style={styles.slide}>
        <LinearGradient
          colors={['#4A90D9', '#1E5AA8', '#0D3B7A']}
          locations={[0, 0.5, 1]}
          style={styles.gradient}
        />
        <View style={styles.glowOverlay} />
        
        <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
          <Text style={styles.title}>
            {item.titleParts.map((part, index) => (
              <Text
                key={index}
                style={part.bold ? styles.titleBold : styles.titleNormal}
              >
                {part.text}
              </Text>
            ))}
          </Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>

        <View style={styles.mockupContainer}>
          {renderMockup(item.mockupType)}
        </View>

        {isFirstSlide && (
          <View style={[styles.footerSingle, { paddingBottom: insets.bottom + 20 }]}>
            <Pressable
              style={({ pressed }) => [
                styles.getStartedButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleNext}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </Pressable>
            <Pressable onPress={handleGetStarted}>
              <Text style={styles.howItWorks}>See how it works</Text>
            </Pressable>
          </View>
        )}

        {!isFirstSlide && !isLastSlide && (
          <View style={[styles.footerSingle, { paddingBottom: insets.bottom + 20 }]}>
            <Pressable
              style={({ pressed }) => [
                styles.nextButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </Pressable>
          </View>
        )}

        {isLastSlide && (
          <View style={[styles.footerSingle, { paddingBottom: insets.bottom + 20 }]}>
            <Pressable
              style={({ pressed }) => [
                styles.startButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleGetStarted}
            >
              <Text style={styles.startButtonText}>Start Saving Recipes</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  const renderDots = () => {
    return (
      <View style={[styles.dotsContainer, { top: insets.top + 20 }]}>
        {slides.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          const dotScale = scrollX.interpolate({
            inputRange,
            outputRange: [1, 1.3, 1],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  opacity: dotOpacity,
                  transform: [{ scale: dotScale }],
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
      />
      {renderDots()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D3B7A',
  },
  slide: {
    width,
    height,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  glowOverlay: {
    position: 'absolute',
    top: -100,
    left: -50,
    right: -50,
    height: 400,
    backgroundColor: 'rgba(120, 180, 255, 0.15)',
    borderRadius: 200,
  },
  content: {
    paddingHorizontal: 28,
    zIndex: 10,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    marginBottom: 12,
  },
  titleNormal: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
  },
  titleBold: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 22,
  },
  mockupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  dotsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  footerSingle: {
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  getStartedButton: {
    backgroundColor: '#2EAA7A',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  howItWorks: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginTop: 16,
    textDecorationLine: 'underline',
  },
  nextButton: {
    backgroundColor: '#2EAA7A',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#2EAA7A',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});

const mockupStyles = StyleSheet.create({
  introContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  floatingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: width * 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E5AA8',
  },
  recipeGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  recipeCardMini: {
    flex: 1,
    borderRadius: 10,
    padding: 8,
  },
  recipeCardImage: {
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 6,
    marginBottom: 6,
  },
  recipeCardTitle: {
    fontSize: 10,
    fontWeight: '500',
    color: '#333',
  },
  sourceIcon: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sourceIcon1: {
    top: -20,
    left: 20,
  },
  sourceIcon2: {
    top: 40,
    right: 0,
  },
  sourceIcon3: {
    bottom: -10,
    left: 40,
  },
  vaultContainer: {
    alignItems: 'center',
  },
  mainVaultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    width: width * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  vaultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  vaultRecipeCard: {
    width: '47%',
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    padding: 8,
  },
  vaultRecipeImage: {
    height: 60,
    borderRadius: 6,
    marginBottom: 6,
  },
  vaultRecipeTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  vaultRecipeMeta: {
    fontSize: 9,
    color: '#999',
  },
  addRecipeBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addRecipeText: {
    fontSize: 12,
    color: '#1E5AA8',
    fontWeight: '500',
  },
  calendarContainer: {
    alignItems: 'center',
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    width: width * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  calendarHeader: {
    marginBottom: 14,
  },
  calendarTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  calendarTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  calendarTabActive: {
    backgroundColor: '#1E5AA8',
  },
  calendarTabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  calendarTabTextActive: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  mealSlots: {
    gap: 10,
  },
  mealSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mealSlotLabel: {
    width: 60,
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  mealSlotCard: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  mealSlotTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  calendarBubble: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bubbleText: {
    fontSize: 12,
    color: '#1E5AA8',
    fontWeight: '500',
    textAlign: 'center',
  },
  shoppingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 10,
  },
  pantryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  pantryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E5AA8',
    marginBottom: 10,
  },
  pantryItems: {
    gap: 8,
  },
  pantryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CCC',
  },
  checkboxChecked: {
    backgroundColor: '#2EAA7A',
    borderColor: '#2EAA7A',
  },
  pantryItemText: {
    fontSize: 11,
    color: '#333',
  },
  shoppingListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  shoppingListTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E5AA8',
    marginBottom: 10,
  },
  shoppingItems: {
    gap: 8,
  },
  shoppingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shoppingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E07A5F',
  },
  shoppingItemText: {
    fontSize: 11,
    color: '#333',
  },
  shoppingBubble: {
    position: 'absolute',
    bottom: -50,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  finalContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  finalFlow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: width * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    gap: 12,
  },
  finalStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  finalStepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finalStepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  finalArrow: {
    marginLeft: 14,
  },
  finalArrowText: {
    fontSize: 16,
    color: '#1E5AA8',
    fontWeight: '600',
  },
  finalBubble: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
