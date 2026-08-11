import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AttendanceDetailsScreen from './screens/AttendanceDetailsScreen';
import AttendanceHistoryScreen from './screens/AttendanceHistoryScreen';
import AttendanceRequestsScreen from './screens/AttendanceRequestsScreen';
import CreateEmployeeAccountScreen from './screens/CreateEmployeeAccountScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import EmployeeDashboardScreen from './screens/EmployeeDashboardScreen';
import EmployeeProfileScreen from './screens/EmployeeProfileScreen';
import FaceCaptureScreen from './screens/FaceCaptureScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import LoginScreen from './screens/LoginScreen';
import NewRequestScreen from './screens/NewRequestScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import { ThemeProvider } from './theme/ThemeContext';

export type RootStackParamList = {
  Login: undefined;
  EmployeeDashboard: undefined;
  EmployeeProfile: undefined;
  AttendanceDetails: undefined;
  AttendanceHistory: undefined;
  AttendanceRequests: undefined;
  CreateEmployeeAccount: undefined;
  ForgotPassword: undefined;
  FaceCapture: { mode?: 'punch_in' | 'punch_out' | 'registration'; direction?: 'front' | 'left' | 'right' | 'up' | 'down' } | undefined;
  NewRequest: undefined;
  Notifications: undefined;
  EditProfile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }

    const style = document.createElement('style');
    style.textContent = `
      html,
      body,
      #root,
      #root > div {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
      }

      div[style*="overflow-y: auto"],
      div[style*="overflow-y: scroll"] {
        -webkit-overflow-scrolling: touch;
        touch-action: pan-y;
        overscroll-behavior-y: contain;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="EmployeeDashboard"
                component={EmployeeDashboardScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="EmployeeProfile"
                component={EmployeeProfileScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="AttendanceDetails"
                component={AttendanceDetailsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="AttendanceHistory"
                component={AttendanceHistoryScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="AttendanceRequests"
                component={AttendanceRequestsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="CreateEmployeeAccount"
                component={CreateEmployeeAccountScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="FaceCapture"
                component={FaceCaptureScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="NewRequest"
                component={NewRequestScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
