import React, { useContext } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, AuthContext } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import CreateAccountScreen from './src/screens/CreateAccountScreen';
import SetLocationsScreen from './src/screens/SetLocationsScreen';
import TripReadyScreen from './src/screens/TripReadyScreen';
import RouteViewScreen from './src/screens/RouteViewScreen';

const Stack = createNativeStackNavigator();

const AppNav = () => {
  const { isLoggedIn, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0F9D58" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFFFF' }
        }}
      >
        {isLoggedIn ? (
          // Main App Flow
          <>
            <Stack.Screen name="SetLocations" component={SetLocationsScreen} />
            <Stack.Screen name="TripReady" component={TripReadyScreen} />
            <Stack.Screen name="RouteView" component={RouteViewScreen} />
          </>
        ) : (
          // Auth Flow
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNav />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
