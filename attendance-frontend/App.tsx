import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
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
  PunchIn: { mode?: 'punch_in' | 'punch_out' | 'registration'; direction?: 'front' | 'left' | 'right' | 'up' | 'down' } | undefined;
  PunchOut: { mode?: 'punch_in' | 'punch_out' | 'registration'; direction?: 'front' | 'left' | 'right' | 'up' | 'down' } | undefined;
  Attendance: undefined;
  Dashboard: undefined;
  Leave: undefined;
  LeaveRequest: undefined;
  MissedPunch: undefined;
  Settings: undefined;
};

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'https://harmony-attendance.vercel.app',
    'https://harmony-attendance-api.vercel.app',
    'http://localhost:8081',
    'harmony://',
  ],
  config: {
    screens: {
      Login: {
        path: 'login',
        alias: [''],
      },
      EmployeeDashboard: 'dashboard',
      Dashboard: 'dashboard-overview',
      EmployeeProfile: 'profile',
      Settings: 'settings',
      EditProfile: 'edit-profile',
      AttendanceDetails: 'attendance-details',
      AttendanceHistory: 'attendance-history',
      Attendance: 'attendance',
      AttendanceRequests: 'requests',
      Leave: 'leave',
      CreateEmployeeAccount: 'register',
      ForgotPassword: 'forgot-password',
      FaceCapture: 'face-capture',
      PunchIn: 'punch-in',
      PunchOut: 'punch-out',
      NewRequest: 'new-request',
      LeaveRequest: 'leave-request',
      MissedPunch: 'missed-punch',
      Notifications: 'notifications',
    },
  },
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }

    const style = document.createElement('style');
    style.id = 'harmony-app-web-styles';
    style.textContent = `
      html,
      body,
      #root {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
      }

      #root,
      #root > div,
      div[data-reactroot],
      div[role="region"] {
        width: 100%;
        height: 100%;
        display: flex !important;
        flex-direction: column !important;
        flex: 1 1 0% !important;
        min-height: 0 !important;
        max-height: 100% !important;
        overflow: hidden !important;
        box-sizing: border-box;
      }

      /* React Navigation Scene Card Containers */
      div[class*="r-pointerEvents-"],
      div[class*="r-position-absolute"],
      div[style*="position: absolute"] {
        min-height: 0 !important;
      }

      /* Comprehensive React Native Web ScrollView Height Clamping & Touch Action */
      div[style*="overflow-y: auto"],
      div[style*="overflow-y: scroll"],
      div[class*="r-overflowY-auto"],
      div[class*="r-overflowY-scroll"],
      div[data-scrollable="true"] {
        flex: 1 1 0% !important;
        height: 100% !important;
        max-height: 100% !important;
        min-height: 0 !important;
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch !important;
        touch-action: pan-y !important;
        overscroll-behavior-y: contain !important;
      }

      /* Visible & Draggable Styled Web Scrollbars */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.05);
      }
      ::-webkit-scrollbar-thumb {
        background: #2563eb;
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #1d4ed8;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existing = document.getElementById('harmony-app-web-styles');
      if (existing) document.head.removeChild(existing);
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, height: '100%', minHeight: 0 }}>
      <SafeAreaProvider style={{ flex: 1, height: '100%', minHeight: 0 }}>
        <ThemeProvider>
          <NavigationContainer linking={linking}>
            <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false, cardStyle: { flex: 1, height: '100%', minHeight: 0 } }}>
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

              {/* Route Aliases to support all navigation route names */}
              <Stack.Screen
                name="PunchIn"
                component={FaceCaptureScreen}
                initialParams={{ mode: 'punch_in' }}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="PunchOut"
                component={FaceCaptureScreen}
                initialParams={{ mode: 'punch_out' }}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Attendance"
                component={AttendanceHistoryScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Dashboard"
                component={EmployeeDashboardScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Leave"
                component={AttendanceRequestsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="LeaveRequest"
                component={NewRequestScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="MissedPunch"
                component={NewRequestScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Settings"
                component={EmployeeProfileScreen}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
