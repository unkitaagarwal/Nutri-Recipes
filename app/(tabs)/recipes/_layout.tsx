import { Stack } from 'expo-router';
import React from 'react';
import colors from '@/constants/colors';

export default function RecipesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
