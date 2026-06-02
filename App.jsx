import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import {COLORS} from './src/theme/colors';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex: 1, backgroundColor: COLORS.PRIMARY}} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.PRIMARY} />
        <AppNavigator />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
