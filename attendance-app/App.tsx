import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
