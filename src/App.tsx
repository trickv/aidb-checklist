import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import HomeScreen from './screens/HomeScreen';
import ResolutionDetailScreen from './screens/ResolutionDetailScreen';
import ResolutionEditScreen from './screens/ResolutionEditScreen';
import {colors} from './theme';

type RootStackParamList = {
  Home: undefined;
  ResolutionDetail: {id: string};
  ResolutionEdit: {id?: string};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar barStyle="light-content" backgroundColor={colors.background} />
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: colors.background,
              },
              headerTintColor: colors.textPrimary,
              headerTitleStyle: {
                fontWeight: '600',
              },
              contentStyle: {
                backgroundColor: colors.background,
              },
            }}>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="ResolutionDetail"
              component={ResolutionDetailScreen}
              options={{
                title: 'Resolution',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="ResolutionEdit"
              component={ResolutionEditScreen}
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
