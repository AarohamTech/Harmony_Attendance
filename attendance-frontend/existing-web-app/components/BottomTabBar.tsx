import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

export const BOTTOM_TAB_BAR_BASE_HEIGHT = 64;
export const BOTTOM_TAB_BAR_WEB_BOTTOM_PADDING = 6;
export const BOTTOM_TAB_BAR_IOS_BOTTOM_PADDING = 12;

export const getBottomTabBarHeight = (bottomInset = 0) =>
  BOTTOM_TAB_BAR_BASE_HEIGHT +
  Math.max(
    bottomInset,
    Platform.OS === 'ios' ? BOTTOM_TAB_BAR_IOS_BOTTOM_PADDING : BOTTOM_TAB_BAR_WEB_BOTTOM_PADDING
  );

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
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(
    insets.bottom,
    Platform.OS === 'ios' ? BOTTOM_TAB_BAR_IOS_BOTTOM_PADDING : BOTTOM_TAB_BAR_WEB_BOTTOM_PADDING
  );

  const currentRouteName = route.name;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface ?? '#ffffff',
          borderTopColor: colors.outlineVariant ?? '#e2e8f0',
          paddingBottom: bottomPadding,
          height: getBottomTabBarHeight(insets.bottom),
        },
      ]}
    >
      {TABS.map((tab) => {
        const isActive = tab.activeRoutes.includes(currentRouteName);
        const iconName = isActive ? tab.activeIcon : tab.inactiveIcon;
        const activeColor = colors.primary ?? '#2563eb';
        const inactiveColor = colors.onSurfaceVariant ?? '#64748b';

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
            <View style={styles.iconContainer}>
              <Ionicons
                name={iconName}
                size={24}
                color={isActive ? activeColor : inactiveColor}
              />
            </View>
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? activeColor : inactiveColor,
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
    position: Platform.OS === 'web' ? ('fixed' as any) : 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingHorizontal: 8,
    paddingTop: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 999,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default BottomTabBar;
