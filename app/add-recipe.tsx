import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { X, Plus, Trash2, Link, ChefHat, Youtube, Instagram, Globe, Sparkles, Loader } from 'lucide-react-native';
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { useRecipes } from '@/context/RecipeContext';
import { Ingredient, Step } from '@/types/recipe';

const difficulties = ['Easy', 'Medium', 'Hard'] as const;
const categories = ['Breakfast', 'Lunch', 'Dinner', 'Pasta', 'Asian', 'Salads', 'Desserts', 'Snacks'];

const placeholderImages = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
];

export default function AddRecipeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addRecipe } = useRecipes();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('4');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [category, setCategory] = useState('Dinner');
  const [ingredients, setIngredients] = useState<Omit<Ingredient, 'id'>[]>([
    { name: '', amount: '', unit: '' },
  ]);
  const [steps, setSteps] = useState<Omit<Step, 'id'>[]>([
    { order: 1, instruction: '' },
  ]);
  const [importUrl, setImportUrl] = useState('');
  const [showUrlImport, setShowUrlImport] = useState(true);

  const detectPlatform = (url: string): { name: string; icon: 'youtube' | 'instagram' | 'globe' } => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return { name: 'YouTube', icon: 'youtube' };
    }
    if (url.includes('instagram.com')) {
      return { name: 'Instagram', icon: 'instagram' };
    }
    if (url.includes('tiktok.com')) {
      return { name: 'TikTok', icon: 'globe' };
    }
    return { name: 'Website', icon: 'globe' };
  };

  const importMutation = useMutation({
    mutationFn: async (url: string): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const platform = detectPlatform(url);
      const mockRecipes: Record<string, { title: string; description: string; ingredients: Omit<Ingredient, 'id'>[]; steps: Omit<Step, 'id'>[]; prepTime: string; cookTime: string; difficulty: 'Easy' | 'Medium' | 'Hard'; category: string }> = {
        youtube: {
          title: 'Creamy Garlic Tuscan Shrimp',
          description: 'A rich and creamy shrimp dish with sun-dried tomatoes and spinach in a garlic parmesan sauce.',
          ingredients: [
            { name: 'Large Shrimp', amount: '1', unit: 'lb' },
            { name: 'Heavy Cream', amount: '1', unit: 'cup' },
            { name: 'Parmesan Cheese', amount: '1/2', unit: 'cup' },
            { name: 'Garlic', amount: '4', unit: 'cloves' },
            { name: 'Sun-dried Tomatoes', amount: '1/2', unit: 'cup' },
            { name: 'Fresh Spinach', amount: '2', unit: 'cups' },
          ],
          steps: [
            { order: 1, instruction: 'Season shrimp with salt, pepper, and Italian seasoning.' },
            { order: 2, instruction: 'Cook shrimp in butter until pink, about 2-3 minutes per side. Set aside.' },
            { order: 3, instruction: 'Sauté minced garlic until fragrant, then add heavy cream and parmesan.' },
            { order: 4, instruction: 'Add sun-dried tomatoes and spinach, simmer until spinach wilts.' },
            { order: 5, instruction: 'Return shrimp to the pan and coat with sauce. Serve immediately.' },
          ],
          prepTime: '10',
          cookTime: '15',
          difficulty: 'Easy',
          category: 'Dinner',
        },
        instagram: {
          title: 'Viral Cloud Bread',
          description: 'Light and fluffy cloud bread that went viral on social media.',
          ingredients: [
            { name: 'Egg Whites', amount: '3', unit: 'large' },
            { name: 'Sugar', amount: '2', unit: 'tbsp' },
            { name: 'Cornstarch', amount: '1', unit: 'tbsp' },
            { name: 'Vanilla Extract', amount: '1', unit: 'tsp' },
          ],
          steps: [
            { order: 1, instruction: 'Preheat oven to 300°F (150°C).' },
            { order: 2, instruction: 'Beat egg whites until foamy, gradually add sugar.' },
            { order: 3, instruction: 'Fold in cornstarch and vanilla gently.' },
            { order: 4, instruction: 'Shape into a cloud on parchment paper.' },
            { order: 5, instruction: 'Bake for 25 minutes until golden.' },
          ],
          prepTime: '10',
          cookTime: '25',
          difficulty: 'Easy',
          category: 'Snacks',
        },
        default: {
          title: 'Quick Pasta Primavera',
          description: 'A colorful vegetable pasta dish perfect for weeknight dinners.',
          ingredients: [
            { name: 'Penne Pasta', amount: '400', unit: 'g' },
            { name: 'Bell Peppers', amount: '2', unit: 'mixed' },
            { name: 'Zucchini', amount: '1', unit: 'medium' },
            { name: 'Cherry Tomatoes', amount: '1', unit: 'cup' },
            { name: 'Olive Oil', amount: '3', unit: 'tbsp' },
            { name: 'Garlic', amount: '3', unit: 'cloves' },
          ],
          steps: [
            { order: 1, instruction: 'Cook pasta according to package directions.' },
            { order: 2, instruction: 'Sauté garlic and vegetables in olive oil.' },
            { order: 3, instruction: 'Toss pasta with vegetables and season to taste.' },
          ],
          prepTime: '10',
          cookTime: '20',
          difficulty: 'Easy',
          category: 'Pasta',
        },
      };

      const recipeKey = platform.icon === 'youtube' ? 'youtube' : platform.icon === 'instagram' ? 'instagram' : 'default';
      const mockData = mockRecipes[recipeKey];

      setTitle(mockData.title);
      setDescription(mockData.description);
      setIngredients(mockData.ingredients);
      setSteps(mockData.steps);
      setPrepTime(mockData.prepTime);
      setCookTime(mockData.cookTime);
      setDifficulty(mockData.difficulty);
      setCategory(mockData.category);
      setShowUrlImport(false);
    },
    onSuccess: () => {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
    onError: () => {
      Alert.alert('Import Failed', 'Could not extract recipe from this URL. Please try again or enter manually.');
    },
  });

  const handleImportUrl = () => {
    if (!importUrl.trim()) {
      Alert.alert('Missing URL', 'Please enter a recipe URL.');
      return;
    }
    importMutation.mutate(importUrl.trim());
  };

  const PlatformIcon = ({ url }: { url: string }) => {
    const platform = detectPlatform(url);
    const iconProps = { size: 20, color: colors.primary };
    switch (platform.icon) {
      case 'youtube': return <Youtube {...iconProps} color="#FF0000" />;
      case 'instagram': return <Instagram {...iconProps} color="#E4405F" />;
      default: return <Globe {...iconProps} />;
    }
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '', unit: '' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const handleUpdateIngredient = (
    index: number,
    field: keyof Omit<Ingredient, 'id'>,
    value: string
  ) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const handleAddStep = () => {
    setSteps([...steps, { order: steps.length + 1, instruction: '' }]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length > 1) {
      const updated = steps.filter((_, i) => i !== index);
      setSteps(updated.map((step, i) => ({ ...step, order: i + 1 })));
    }
  };

  const handleUpdateStep = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], instruction: value };
    setSteps(updated);
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a recipe title.');
      return;
    }

    if (ingredients.every((i) => !i.name.trim())) {
      Alert.alert('Missing Ingredients', 'Please add at least one ingredient.');
      return;
    }

    if (steps.every((s) => !s.instruction.trim())) {
      Alert.alert('Missing Steps', 'Please add at least one cooking step.');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];

    addRecipe({
      title: title.trim(),
      description: description.trim() || 'A delicious homemade recipe',
      imageUrl: randomImage,
      prepTime: parseInt(prepTime) || 10,
      cookTime: parseInt(cookTime) || 20,
      servings: parseInt(servings) || 4,
      difficulty,
      category,
      ingredients: ingredients
        .filter((i) => i.name.trim())
        .map((i, index) => ({ ...i, id: `new-${index}` })),
      steps: steps
        .filter((s) => s.instruction.trim())
        .map((s, index) => ({ ...s, id: `step-${index}` })),
      isFavorite: false,
      sourceType: 'manual',
      importedAt: new Date().toISOString(),
      tags: [difficulty],
    });

    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Add Recipe</Text>
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.saveButtonPressed,
          ]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        {showUrlImport && (
          <View style={styles.importSection}>
            <View style={styles.importHeader}>
              <View style={styles.importTitleRow}>
                <Sparkles size={20} color={colors.primary} />
                <Text style={styles.importTitle}>Import from URL</Text>
              </View>
              <Text style={styles.importSubtitle}>
                Paste a link from YouTube, TikTok, Instagram, or any recipe website
              </Text>
            </View>

            <View style={styles.platformIcons}>
              <View style={styles.platformBadge}>
                <Youtube size={18} color="#FF0000" />
                <Text style={styles.platformText}>YouTube</Text>
              </View>
              <View style={styles.platformBadge}>
                <Instagram size={18} color="#E4405F" />
                <Text style={styles.platformText}>Instagram</Text>
              </View>
              <View style={styles.platformBadge}>
                <Globe size={18} color="#00F2EA" />
                <Text style={styles.platformText}>TikTok</Text>
              </View>
              <View style={styles.platformBadge}>
                <Link size={18} color={colors.textLight} />
                <Text style={styles.platformText}>Any URL</Text>
              </View>
            </View>

            <View style={styles.urlInputContainer}>
              {importUrl ? <PlatformIcon url={importUrl} /> : <Link size={20} color={colors.textMuted} />}
              <TextInput
                style={styles.urlInput}
                placeholder="https://youtube.com/watch?v=..."
                placeholderTextColor={colors.textMuted}
                value={importUrl}
                onChangeText={setImportUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.importButton,
                pressed && styles.importButtonPressed,
                importMutation.isPending && styles.importButtonLoading,
              ]}
              onPress={handleImportUrl}
              disabled={importMutation.isPending}
            >
              {importMutation.isPending ? (
                <>
                  <Loader size={18} color={colors.white} />
                  <Text style={styles.importButtonText}>Extracting Recipe...</Text>
                </>
              ) : (
                <>
                  <Sparkles size={18} color={colors.white} />
                  <Text style={styles.importButtonText}>Extract Recipe</Text>
                </>
              )}
            </Pressable>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or add manually</Text>
              <View style={styles.divider} />
            </View>
          </View>
        )}

        {!showUrlImport && (
          <Pressable
            style={styles.showImportButton}
            onPress={() => setShowUrlImport(true)}
          >
            <Link size={16} color={colors.primary} />
            <Text style={styles.showImportText}>Import from another URL</Text>
          </Pressable>
        )}

        <View style={styles.imageSection}>
          <View style={styles.imagePlaceholder}>
            <ChefHat size={40} color={colors.textMuted} />
            <Text style={styles.imagePlaceholderText}>
              A beautiful image will be assigned
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Recipe Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Creamy Garlic Pasta"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Briefly describe your recipe..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.label}>Prep Time (min)</Text>
            <TextInput
              style={styles.input}
              placeholder="10"
              placeholderTextColor={colors.textMuted}
              value={prepTime}
              onChangeText={setPrepTime}
              keyboardType="number-pad"
            />
          </View>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.label}>Cook Time (min)</Text>
            <TextInput
              style={styles.input}
              placeholder="20"
              placeholderTextColor={colors.textMuted}
              value={cookTime}
              onChangeText={setCookTime}
              keyboardType="number-pad"
            />
          </View>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.label}>Servings</Text>
            <TextInput
              style={styles.input}
              placeholder="4"
              placeholderTextColor={colors.textMuted}
              value={servings}
              onChangeText={setServings}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Difficulty</Text>
          <View style={styles.chipRow}>
            {difficulties.map((d) => (
              <Pressable
                key={d}
                style={[styles.chip, difficulty === d && styles.chipActive]}
                onPress={() => setDifficulty(d)}
              >
                <Text
                  style={[
                    styles.chipText,
                    difficulty === d && styles.chipTextActive,
                  ]}
                >
                  {d}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {categories.map((c) => (
              <Pressable
                key={c}
                style={[styles.chip, category === c && styles.chipActive]}
                onPress={() => setCategory(c)}
              >
                <Text
                  style={[
                    styles.chipText,
                    category === c && styles.chipTextActive,
                  ]}
                >
                  {c}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Ingredients *</Text>
            <Pressable onPress={handleAddIngredient} style={styles.addButton}>
              <Plus size={18} color={colors.primary} />
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
          </View>
          {ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientRow}>
              <TextInput
                style={[styles.input, styles.amountInput]}
                placeholder="Amt"
                placeholderTextColor={colors.textMuted}
                value={ingredient.amount}
                onChangeText={(v) => handleUpdateIngredient(index, 'amount', v)}
              />
              <TextInput
                style={[styles.input, styles.unitInput]}
                placeholder="Unit"
                placeholderTextColor={colors.textMuted}
                value={ingredient.unit}
                onChangeText={(v) => handleUpdateIngredient(index, 'unit', v)}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Ingredient name"
                placeholderTextColor={colors.textMuted}
                value={ingredient.name}
                onChangeText={(v) => handleUpdateIngredient(index, 'name', v)}
              />
              {ingredients.length > 1 && (
                <Pressable
                  onPress={() => handleRemoveIngredient(index)}
                  style={styles.removeButton}
                >
                  <Trash2 size={18} color={colors.error} />
                </Pressable>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Cooking Steps *</Text>
            <Pressable onPress={handleAddStep} style={styles.addButton}>
              <Plus size={18} color={colors.primary} />
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
          </View>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <TextInput
                style={[styles.input, styles.stepInput]}
                placeholder="Describe this step..."
                placeholderTextColor={colors.textMuted}
                value={step.instruction}
                onChangeText={(v) => handleUpdateStep(index, v)}
                multiline
              />
              {steps.length > 1 && (
                <Pressable
                  onPress={() => handleRemoveStep(index)}
                  style={styles.removeButton}
                >
                  <Trash2 size={18} color={colors.error} />
                </Pressable>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveButtonPressed: {
    opacity: 0.9,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
  },
  imageSection: {
    marginBottom: 24,
  },
  imagePlaceholder: {
    height: 160,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textLight,
  },
  chipTextActive: {
    color: colors.white,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  ingredientRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  amountInput: {
    width: 60,
    textAlign: 'center',
  },
  unitInput: {
    width: 70,
  },
  removeButton: {
    padding: 8,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  stepNumberText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  stepInput: {
    flex: 1,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  importSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  importHeader: {
    marginBottom: 16,
  },
  importTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  importTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  importSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  platformIcons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  platformText: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
  },
  urlInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  urlInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 15,
    color: colors.text,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  importButtonPressed: {
    opacity: 0.9,
  },
  importButtonLoading: {
    backgroundColor: colors.textLight,
  },
  importButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  showImportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
  },
  showImportText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});
