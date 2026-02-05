import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import colors from '@/constants/colors';
import { RecipeProvider, useRecipes } from '@/context/RecipeContext';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { hasCompletedOnboarding, isLoading } = useRecipes();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading || hasCompletedOnboarding === null) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {!hasCompletedOnboarding ? (
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
      ) : (
        <>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="add-recipe"
            options={{
              presentation: 'modal',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="plan-meal"
            options={{
              presentation: 'modal',
              gestureEnabled: true,
            }}
          />
          <Stack.Screen name="recipe/[id]" />
          <Stack.Screen
            name="cooking/[id]"
            options={{
              gestureEnabled: false,
              animation: 'fade',
            }}
          />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RecipeProvider>
          <RootLayoutNav />
        </RecipeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
