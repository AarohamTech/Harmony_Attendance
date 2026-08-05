import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../theme/ThemeContext';

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

type TabConfig = {
  key: string;
  label: string;
  routeName: keyof RootStackParamList;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
  activeRoutes: string[];
};

const TABS: TabConfig[] = [
  {
    key: 'home',
    label: 'Home',
    routeName: 'EmployeeDashboard',
    activeIcon: 'home',
    inactiveIcon: 'home-outline',
    activeRoutes: ['EmployeeDashboard'],
  },
  {
    key: 'attendance',
    label: 'Attendance',
    routeName: 'AttendanceHistory',
    activeIcon: 'finger-print',
    inactiveIcon: 'finger-print-outline',
    activeRoutes: ['AttendanceHistory', 'AttendanceDetails'],
  },
  {
    key: 'requests',
    label: 'Requests',
    routeName: 'AttendanceRequests',
    activeIcon: 'document-text',
    inactiveIcon: 'document-text-outline',
    activeRoutes: ['AttendanceRequests', 'NewRequest'],
  },
  {
    key: 'profile',
    label: 'Profile',
    routeName: 'EmployeeProfile',
    activeIcon: 'person',
    inactiveIcon: 'person-outline',
    activeRoutes: ['EmployeeProfile', 'EditProfile'],
  },
];

export const BottomTabBar = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { colors } = useTheme();

  const currentRouteName = route.name;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.outlineVariant }]}>
      {TABS.map((tab) => {
        const isActive = tab.activeRoutes.includes(currentRouteName);
        const iconName = isActive ? tab.activeIcon : tab.inactiveIcon;

        return (
          <Pressable
            key={tab.key}
            style={styles.tabItem}
            onPress={() => {
              if (currentRouteName !== tab.routeName) {
                navigation.navigate(tab.routeName as any);
              }
            }}
          >
            <View
              style={[
                styles.iconPill,
                isActive && { backgroundColor: colors.secondaryContainer ?? '#dbeafe' },
              ]}
            >
              <Ionicons
                name={iconName}
                size={22}
                color={isActive ? (colors.primaryContainer ?? '#2563eb') : (colors.onSurfaceVariant ?? '#64748b')}
              />
            </View>
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? (colors.primaryContainer ?? '#2563eb') : (colors.onSurfaceVariant ?? '#64748b'),
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingHorizontal: 8,
    paddingBottom: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 999,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconPill: {
    width: 52,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    textAlign: 'center',
  },
});

export default BottomTabBar;
