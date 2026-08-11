import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { listRequests, RequestRecord } from '../api/client';
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

type AttendanceRequestsScreenNavigation = StackNavigationProp<RootStackParamList, 'AttendanceRequests'>;

const tabs = ['PENDING', 'APPROVED', 'REJECTED'] as const;
type TabKey = (typeof tabs)[number];
const FAB_BOTTOM_OFFSET = 86;
const FAB_SIZE = 56;

const AttendanceRequestsScreen = () => {
  const navigation = useNavigation<AttendanceRequestsScreenNavigation>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const maxWidth = Math.min(width, 960);
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('PENDING');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const syncRequests = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const nextRequests = await listRequests();
      setRequests(nextRequests);
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Unable to load leave requests from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void syncRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((entry) => entry.status === activeTab);
  }, [activeTab, requests]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant }]}>
        <View style={styles.topBarInner}>
          <View style={styles.topLeftWrap}>
            <View style={[styles.brandCircle, { backgroundColor: colors.secondaryContainer }]}>
              <Ionicons name="document-text" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.primary }]}>Attendance Requests</Text>
          </View>

          <Pressable style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentPadding,
          { paddingBottom: Math.max(getBottomTabBarHeight(insets.bottom), FAB_BOTTOM_OFFSET + FAB_SIZE) },
        ]}
      >
        <View style={[styles.maxWidth, { maxWidth }]}>
          <Text style={[styles.heading, { color: colors.onSurface }]}>Request Management</Text>

          <View style={[styles.tabCard, { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              const count = requests.filter((r) => r.status === tab).length;
              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[
                    styles.tabButton,
                    isActive && { backgroundColor: colors.surface, borderColor: colors.outlineVariant, elevation: 1 },
                  ]}
                >
                  <Text style={[styles.tabText, { color: isActive ? colors.primary : colors.onSurfaceVariant }]}>
                    {tab[0] + tab.slice(1).toLowerCase()} ({count})
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {loading ? <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} /> : null}
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <View style={styles.cardList}>
            {filteredRequests.map((request) => {
              const statusColor = request.status === 'PENDING' ? colors.amber : request.status === 'APPROVED' ? colors.green : colors.red;
              const statusBg = request.status === 'PENDING' ? '#fef3c7' : request.status === 'APPROVED' ? '#dcfce7' : '#fee2e2';

              const iconName = request.type === 'LEAVE' ? 'calendar-outline' : request.type === 'EARLY_EXIT' ? 'time-outline' : 'home-outline';

              return (
                <View key={request.id} style={[styles.requestCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleWrap}>
                      <View style={[styles.iconWrap, { backgroundColor: colors.primaryContainer }]}>
                        <Ionicons name={iconName as any} size={18} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.requestTitle, { color: colors.onSurface }]}>{request.title}</Text>
                        <Text style={[styles.requestMeta, { color: colors.onSurfaceVariant }]}>ID: #{request.id} • {request.type}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusColor }]}>{request.status}</Text>
                    </View>
                  </View>

                  <Text style={[styles.reasonText, { color: colors.onSurfaceVariant }]}>{request.reason}</Text>

                  <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={14} color={colors.onSurfaceVariant} />
                    <Text style={[styles.metaText, { color: colors.onSurfaceVariant }]}>Applied: {request.submittedAt.slice(0, 10)}</Text>
                  </View>

                  {request.status === 'REJECTED' && request.rejectionReason ? (
                    <View style={[styles.rejectBox, { backgroundColor: `${colors.red}12`, borderColor: `${colors.red}55` }]}>
                      <Text style={[styles.rejectTitle, { color: colors.red }]}>HR Rejection Decision:</Text>
                      <Text style={[styles.rejectText, { color: colors.onSurfaceVariant }]}>"{request.rejectionReason}"</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}

            {!loading && filteredRequests.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]}>
                <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>No requests in this tab yet.</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <Pressable style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('NewRequest')}>
        <Ionicons name="add" size={28} color="#ffffff" />
      </Pressable>

      <BottomTabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, minHeight: 0, position: 'relative' },
  scrollView: { flex: 1, minHeight: 0 },
  topBar: { borderBottomWidth: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  topBarInner: { height: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topLeftWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800' },
  iconButton: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  contentPadding: { flexGrow: 1 },
  maxWidth: { width: '100%', alignSelf: 'center', paddingHorizontal: 16, paddingTop: 16 },
  heading: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  tabCard: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, padding: 4, marginBottom: 14 },
  tabButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8 },
  tabText: { fontSize: 12, fontWeight: '800' },
  errorText: { marginTop: 8, color: '#ba1a1a', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  cardList: { gap: 12 },
  requestCard: { borderWidth: 1, borderRadius: 16, padding: 14, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  cardTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  requestTitle: { fontSize: 15, fontWeight: '800' },
  requestMeta: { marginTop: 2, fontSize: 11, fontWeight: '600' },
  statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusBadgeText: { fontSize: 11, fontWeight: '800' },
  reasonText: { marginTop: 10, fontSize: 13, lineHeight: 18 },
  metaRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, fontWeight: '600' },
  rejectBox: { marginTop: 10, borderWidth: 1, borderRadius: 10, padding: 10 },
  rejectTitle: { fontSize: 12, fontWeight: '800', marginBottom: 4 },
  rejectText: { fontSize: 12, fontStyle: 'italic' },
  emptyState: { borderWidth: 1, borderRadius: 16, padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 14, fontWeight: '700' },
  fab: { position: 'absolute', bottom: 86, right: 18, width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', elevation: 4, zIndex: 95 },
});

export default AttendanceRequestsScreen;
