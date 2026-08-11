import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getNotifications, markAllNotificationsRead, NotificationRecord } from '../api/client';
import { useTheme } from '../theme/ThemeContext';
import { BottomTabBar, getBottomTabBarHeight } from '../components/BottomTabBar';

type RootStackParamList = {
  Login: undefined;
  EmployeeDashboard: undefined;
  EmployeeProfile: undefined;
  AttendanceDetails: undefined;
  AttendanceHistory: undefined;
  AttendanceRequests: undefined;
  CreateEmployeeAccount: undefined;
  ForgotPassword: undefined;
  FaceCapture: { mode?: 'punch_in' | 'punch_out' | 'registration' } | undefined;
  NewRequest: undefined;
  Notifications: undefined;
  EditProfile: undefined;
};

type NotificationsNavigationProp = StackNavigationProp<RootStackParamList, 'Notifications'>;

const NotificationsScreen = () => {
  const navigation = useNavigation<NotificationsNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<NotificationRecord[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const syncNotifications = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const nextItems = await getNotifications();
      setItems(nextItems);
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Unable to fetch notifications from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void syncNotifications();
  }, []);

  const filteredItems = items.filter((item) => (filter === 'UNREAD' ? item.unread : true));

  const onMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
    } catch {
      // Ignore fallback
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant }]}>
        <View style={styles.topBarInner}>
          <Pressable style={styles.iconButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
          </Pressable>
          <Text style={[styles.title, { color: colors.primary }]}>Notifications & Alerts</Text>
          <Pressable style={styles.clearLink} onPress={() => void onMarkAllRead()}>
            <Text style={[styles.clearText, { color: colors.primary }]}>Mark all read</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.contentPadding, { paddingBottom: getBottomTabBarHeight(insets.bottom) }]}>
        <View style={styles.maxWidth}>
          <View style={[styles.filterBar, { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]}>
            <Pressable
              style={[styles.filterTab, filter === 'ALL' && { backgroundColor: colors.surface, elevation: 1 }]}
              onPress={() => setFilter('ALL')}
            >
              <Text style={[styles.filterText, { color: filter === 'ALL' ? colors.primary : colors.onSurfaceVariant }]}>
                All ({items.length})
              </Text>
            </Pressable>
            <Pressable
              style={[styles.filterTab, filter === 'UNREAD' && { backgroundColor: colors.surface, elevation: 1 }]}
              onPress={() => setFilter('UNREAD')}
            >
              <Text style={[styles.filterText, { color: filter === 'UNREAD' ? colors.primary : colors.onSurfaceVariant }]}>
                Unread ({items.filter((i) => i.unread).length})
              </Text>
            </Pressable>
          </View>

          {loading ? <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} /> : null}
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <View style={styles.list}>
            {filteredItems.map((item) => {
              const iconName = item.type === 'APPROVAL'
                ? 'checkmark-circle-outline'
                : item.type === 'GEOLOCATION'
                  ? 'location-outline'
                  : item.type === 'REMINDER'
                    ? 'alarm-outline'
                    : 'information-circle-outline';

              const iconBg = item.type === 'APPROVAL'
                ? colors.greenSoft
                : item.type === 'GEOLOCATION'
                  ? colors.secondaryContainer
                  : colors.primaryContainer;

              const iconColor = item.type === 'APPROVAL'
                ? colors.green
                : item.type === 'GEOLOCATION'
                  ? colors.secondary
                  : colors.primary;

              return (
                <View
                  key={item.id}
                  style={[
                    styles.itemCard,
                    { backgroundColor: colors.surface, borderColor: item.unread ? colors.primary : colors.outlineVariant },
                  ]}
                >
                  <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
                    <Ionicons name={iconName as any} size={20} color={iconColor} />
                  </View>

                  <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                      <Text style={[styles.itemTitle, { color: colors.onSurface }]}>{item.title}</Text>
                      {item.unread ? <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} /> : null}
                    </View>

                    <Text style={[styles.itemBody, { color: colors.onSurfaceVariant }]}>{item.body}</Text>
                    <Text style={[styles.itemTime, { color: colors.tertiary }]}>{item.time}</Text>
                  </View>
                </View>
              );
            })}

            {!loading && filteredItems.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]}>
                <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>No notifications in database for this filter.</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <BottomTabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, minHeight: 0, position: 'relative' },
  scrollView: { flex: 1, minHeight: 0 },
  topBar: { borderBottomWidth: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  topBarInner: { height: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800' },
  clearLink: { paddingHorizontal: 8, paddingVertical: 4 },
  clearText: { fontSize: 12, fontWeight: '800' },
  contentPadding: { paddingHorizontal: 16, paddingTop: 16, flexGrow: 1 },
  maxWidth: { width: '100%', maxWidth: 600, alignSelf: 'center' },
  filterBar: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, padding: 4, marginBottom: 14 },
  filterTab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8 },
  filterText: { fontSize: 13, fontWeight: '800' },
  list: { gap: 10 },
  itemCard: { flexDirection: 'row', gap: 12, borderWidth: 1, borderRadius: 16, padding: 14 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  itemContent: { flex: 1 },
  itemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemTitle: { fontSize: 15, fontWeight: '800' },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  itemBody: { marginTop: 4, fontSize: 13, lineHeight: 18 },
  itemTime: { marginTop: 6, fontSize: 11, fontWeight: '600' },
  errorText: { color: '#ba1a1a', fontSize: 12, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  emptyState: { borderWidth: 1, borderRadius: 16, padding: 24, alignItems: 'center' },
  emptyText: { fontSize: 14, fontWeight: '700' },
});

export default NotificationsScreen;
