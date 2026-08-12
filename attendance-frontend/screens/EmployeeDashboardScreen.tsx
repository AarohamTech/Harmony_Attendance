import React, { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getDashboard, getDashboardCharts, getReportDownloadUrl } from '../api/client';
import { useTheme } from '../theme/ThemeContext';
import { BottomTabBar } from '../components/BottomTabBar';
import { Linking } from 'react-native';

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

type DashboardScreenNavigation = StackNavigationProp<RootStackParamList, 'EmployeeDashboard'>;

const EmployeeDashboardScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<DashboardScreenNavigation>();
  const { width } = useWindowDimensions();
  const contentMaxWidth = Math.min(width, 960);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [chartsData, setChartsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const datePart = now.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const timePart = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setCurrentTimeStr(`${datePart} • ${timePart} IST`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const syncData = async () => {
    setErrorMessage(null);
    try {
      const [dashboard, charts] = await Promise.all([
        getDashboard(),
        getDashboardCharts().catch(() => null)
      ]);
      setDashboardData(dashboard);
      setChartsData(charts);
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Unable to load live backend dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void syncData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void syncData();
  }, []);

  const operator = dashboardData?.operator;
  const attendanceToday = dashboardData?.attendanceToday;
  const kpis = dashboardData?.kpis;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant }]}>
        <View style={styles.topBarInner}>
          <View style={styles.topLeftWrap}>
            <View style={[styles.brandCircle, { backgroundColor: colors.primaryContainer }]}>
              <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.primary }]}>Harmony AI Attendance</Text>
          </View>
          <Pressable style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 90 }]}
        scrollEnabled={true}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        <View style={[styles.maxWidthContainer, { maxWidth: contentMaxWidth }]}>
          <View style={styles.greetingRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.greeting, { color: colors.onSurface }]}>Welcome Back,</Text>
              <Text style={[styles.liveClockText, { color: colors.primary }]}>{currentTimeStr}</Text>
            </View>
            <Pressable style={styles.refreshBtn} onPress={() => void syncData()}>
              <Ionicons name="refresh" size={18} color={colors.primary} />
            </Pressable>
          </View>

          <Pressable
            style={[styles.profileSummary, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
            onPress={() => navigation.navigate('EmployeeProfile')}
          >
            <Image
              source={{ uri: operator?.profilePhoto && operator.profilePhoto.trim() !== '' ? operator.profilePhoto : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80' }}
              style={styles.profileAvatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.profileName, { color: colors.onSurface }]}>{operator?.name ?? 'Loading...'}</Text>
              <Text style={[styles.employeeId, { color: colors.onSurfaceVariant }]}>{operator?.employeeId ?? ''} • {operator?.role ?? ''}</Text>
            </View>
            <View style={[styles.departmentBadge, { backgroundColor: colors.secondaryContainer }]}>
              <Text style={[styles.departmentText, { color: colors.onSecondaryContainer }]}>{operator?.department ?? 'Department'}</Text>
            </View>
          </Pressable>

          {/* Live KPI Metric Cards */}
          <View style={styles.kpiGrid}>
            <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <Ionicons name="people-outline" size={20} color={colors.primary} />
              <Text style={[styles.kpiVal, { color: colors.onSurface }]}>{kpis?.totalEmployees ?? '--'}</Text>
              <Text style={[styles.kpiLbl, { color: colors.onSurfaceVariant }]}>Total Staff</Text>
            </View>
            <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.green} />
              <Text style={[styles.kpiVal, { color: colors.green }]}>{kpis?.todayPresent ?? '--'}</Text>
              <Text style={[styles.kpiLbl, { color: colors.onSurfaceVariant }]}>Present Today</Text>
            </View>
            <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <Ionicons name="time-outline" size={20} color={colors.amber} />
              <Text style={[styles.kpiVal, { color: colors.amber }]}>{kpis?.lateCount ?? '--'}</Text>
              <Text style={[styles.kpiLbl, { color: colors.onSurfaceVariant }]}>Late Employees</Text>
            </View>
            <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <Ionicons name="document-text-outline" size={20} color={colors.secondary} />
              <Text style={[styles.kpiVal, { color: colors.secondary }]}>{kpis?.approvalsPending ?? '--'}</Text>
              <Text style={[styles.kpiLbl, { color: colors.onSurfaceVariant }]}>Pending Approvals</Text>
            </View>
          </View>

          {/* Today's Live Attendance Card */}
          <Pressable
            style={[styles.attendanceCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
            onPress={() => navigation.navigate('AttendanceDetails')}
          >
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>TODAY'S ATTENDANCE STATUS</Text>
                <Text style={[styles.dateText, { color: colors.onSurface }]}>{attendanceToday?.date ?? new Date().toISOString().slice(0, 10)}</Text>
              </View>
              <View style={styles.statusBadgeWrap}>
                <Text style={[styles.statusPill, { backgroundColor: attendanceToday?.status === 'LATE' ? '#fef3c7' : '#dcfce7', color: attendanceToday?.status === 'LATE' ? '#d97706' : '#15803d' }]}>
                  {attendanceToday?.status ?? 'ON TIME'}
                </Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={[styles.dataTile, { backgroundColor: colors.surfaceContainer }]}>
                <Text style={[styles.tileLabel, { color: colors.onSurfaceVariant }]}>Punch In</Text>
                <Text style={[styles.tileValue, { color: colors.onSurface }]}>{attendanceToday?.punchIn ?? '--:--'}</Text>
                <Text style={[styles.tileSubtle, { color: colors.green }]}>DB Verified</Text>
              </View>
              <View style={[styles.dataTile, { backgroundColor: colors.surfaceContainer }]}>
                <Text style={[styles.tileLabel, { color: colors.onSurfaceVariant }]}>Punch Out</Text>
                <Text style={[styles.tileValue, { color: colors.onSurface }]}>{attendanceToday?.punchOut ?? '--:--'}</Text>
                <Text style={[styles.tileSubtle, { color: colors.onSurfaceVariant }]}>Shift: 09:00 - 18:00</Text>
              </View>
            </View>

            <View style={styles.bottomMetaRow}>
              <View style={styles.metaChip}>
                <Ionicons name="scan-outline" size={16} color={colors.primary} />
                <Text style={[styles.metaText, { color: colors.onSurfaceVariant }]}>Face Verified ({kpis?.faceSuccessRate ?? 99.8}%)</Text>
              </View>
              <View style={styles.workHoursWrap}>
                <Text style={[styles.hoursLabel, { color: colors.onSurfaceVariant }]}>Total Working Hours</Text>
                <Text style={[styles.hoursValue, { color: colors.primary }]}>{attendanceToday?.totalHours ?? '00h 00m'}</Text>
              </View>
            </View>
          </Pressable>

          {/* Biometric Action Buttons */}
          <View style={styles.punchActionsGrid}>
            <Pressable
              style={[styles.punchAction, { backgroundColor: colors.green }]}
              onPress={() => navigation.navigate('FaceCapture', { mode: 'punch_in' })}
            >
              <Ionicons name="log-in-outline" size={32} color="#ffffff" />
              <Text style={styles.punchActionText}>Biometric Punch In</Text>
            </Pressable>
            <Pressable
              style={[styles.punchAction, { backgroundColor: colors.red }]}
              onPress={() => navigation.navigate('FaceCapture', { mode: 'punch_out' })}
            >
              <Ionicons name="log-out-outline" size={32} color="#ffffff" />
              <Text style={styles.punchActionText}>Biometric Punch Out</Text>
            </Pressable>
          </View>

          {/* Navigation Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text style={[styles.sectionHeading, { color: colors.onSurface }]}>Management Modules</Text>
            <View style={styles.quickActionsGrid}>
              <Pressable style={[styles.quickActionTile, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]} onPress={() => navigation.navigate('AttendanceHistory')}>
                <View style={[styles.quickIcon, { backgroundColor: colors.secondaryContainer }]}>
                  <Ionicons name="calendar-outline" size={20} color={colors.onSecondaryContainer} />
                </View>
                <Text style={[styles.quickActionText, { color: colors.onSurface }]}>Attendance Logs</Text>
              </Pressable>

              <Pressable style={[styles.quickActionTile, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]} onPress={() => navigation.navigate('AttendanceRequests')}>
                <View style={[styles.quickIcon, { backgroundColor: colors.secondaryContainer }]}>
                  <Ionicons name="document-text-outline" size={20} color={colors.onSecondaryContainer} />
                </View>
                <Text style={[styles.quickActionText, { color: colors.onSurface }]}>Leave Requests</Text>
              </Pressable>

              <Pressable style={[styles.quickActionTile, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]} onPress={() => navigation.navigate('Notifications')}>
                <View style={[styles.quickIcon, { backgroundColor: colors.secondaryContainer }]}>
                  <Ionicons name="notifications-outline" size={20} color={colors.onSecondaryContainer} />
                </View>
                <Text style={[styles.quickActionText, { color: colors.onSurface }]}>Alerts & Logs</Text>
              </Pressable>

              <Pressable style={[styles.quickActionTile, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]} onPress={() => navigation.navigate('EmployeeProfile')}>
                <View style={[styles.quickIcon, { backgroundColor: colors.secondaryContainer }]}>
                  <Ionicons name="person-outline" size={20} color={colors.onSecondaryContainer} />
                </View>
                <Text style={[styles.quickActionText, { color: colors.onSurface }]}>Employee Profile</Text>
              </Pressable>
            </View>
          </View>

          {/* Live Database Analytics Charts */}
          {chartsData ? (
            <View style={styles.chartsSection}>
              <Text style={[styles.sectionHeading, { color: colors.onSurface }]}>Live Database Analytics</Text>

              {/* Weekly Trend Chart Visual */}
              <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                <View style={styles.chartHeader}>
                  <Ionicons name="stats-chart" size={18} color={colors.primary} />
                  <Text style={[styles.chartTitle, { color: colors.onSurface }]}>Weekly Attendance Trend (Live DB Data)</Text>
                </View>
                <View style={styles.trendBarsRow}>
                  {chartsData.attendance_trend?.labels.map((day: string, idx: number) => {
                    const present = chartsData.attendance_trend.present[idx] || 0;
                    const maxVal = Math.max(1, ...chartsData.attendance_trend.present);
                    const barHeight = Math.max(12, Math.round((present / maxVal) * 70));
                    return (
                      <View key={day + idx} style={styles.trendCol}>
                        <Text style={[styles.barVal, { color: colors.primary }]}>{present}</Text>
                        <View style={[styles.barContainer, { backgroundColor: colors.surfaceContainer }]}>
                          <View style={[styles.barFill, { height: barHeight, backgroundColor: colors.primary }]} />
                        </View>
                        <Text style={[styles.barLabel, { color: colors.onSurfaceVariant }]}>{day}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Department Breakdown & Leave Stats */}
              <View style={styles.chartsRow}>
                <View style={[styles.chartHalfCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                  <Text style={[styles.chartSubTitle, { color: colors.onSurface }]}>Leave Requests Status</Text>
                  <View style={styles.leaveStatsList}>
                    <View style={styles.leaveStatItem}>
                      <Text style={[styles.statName, { color: colors.amber }]}>Pending</Text>
                      <Text style={[styles.statValNum, { color: colors.onSurface }]}>{chartsData.leave_statistics?.pending ?? 0}</Text>
                    </View>
                    <View style={styles.leaveStatItem}>
                      <Text style={[styles.statName, { color: colors.green }]}>Approved</Text>
                      <Text style={[styles.statValNum, { color: colors.onSurface }]}>{chartsData.leave_statistics?.approved ?? 0}</Text>
                    </View>
                    <View style={styles.leaveStatItem}>
                      <Text style={[styles.statName, { color: colors.red }]}>Rejected</Text>
                      <Text style={[styles.statValNum, { color: colors.onSurface }]}>{chartsData.leave_statistics?.rejected ?? 0}</Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.chartHalfCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                  <Text style={[styles.chartSubTitle, { color: colors.onSurface }]}>Biometric Match Rate</Text>
                  <View style={styles.rateCircleWrap}>
                    <Text style={[styles.ratePercent, { color: colors.green }]}>{chartsData.face_success_rate ?? 99.8}%</Text>
                    <Text style={[styles.rateSub, { color: colors.onSurfaceVariant }]}>Live Face Engine Verification</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : null}

          {/* Live Report Export Section */}
          <View style={styles.exportSection}>
            <Text style={[styles.sectionHeading, { color: colors.onSurface }]}>Export Live Reports</Text>
            <View style={styles.exportGrid}>
              <Pressable
                style={[styles.exportBtn, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
                onPress={() => void Linking.openURL(getReportDownloadUrl('csv'))}
              >
                <Ionicons name="document-text" size={22} color={colors.primary} />
                <Text style={[styles.exportBtnText, { color: colors.onSurface }]}>CSV Report</Text>
              </Pressable>

              <Pressable
                style={[styles.exportBtn, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
                onPress={() => void Linking.openURL(getReportDownloadUrl('xlsx'))}
              >
                <Ionicons name="grid" size={22} color={colors.green} />
                <Text style={[styles.exportBtnText, { color: colors.onSurface }]}>Excel (.xlsx)</Text>
              </Pressable>

              <Pressable
                style={[styles.exportBtn, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
                onPress={() => void Linking.openURL(getReportDownloadUrl('pdf'))}
              >
                <Ionicons name="document-attach" size={22} color={colors.red} />
                <Text style={[styles.exportBtnText, { color: colors.onSurface }]}>PDF Report</Text>
              </Pressable>
            </View>
          </View>

          {loading ? <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} /> : null}
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </View>
      </ScrollView>

      <BottomTabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, height: '100%', minHeight: 0 },
  scrollView: { flex: 1, minHeight: 0 },
  topBar: { flexShrink: 0, borderBottomWidth: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  topBarInner: { height: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topLeftWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800' },
  iconButton: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingTop: 16, flexGrow: 1 },
  maxWidthContainer: { width: '100%', alignSelf: 'center', paddingHorizontal: 16 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  greeting: { fontSize: 24, fontWeight: '800' },
  liveClockText: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  refreshBtn: { padding: 6 },
  profileSummary: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 18, padding: 14, marginBottom: 14 },
  profileAvatar: { width: 48, height: 48, borderRadius: 24 },
  profileName: { fontSize: 17, fontWeight: '800' },
  employeeId: { marginTop: 2, fontSize: 12, fontWeight: '600' },
  departmentBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  departmentText: { fontSize: 11, fontWeight: '800' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  kpiCard: { width: '48.5%', borderWidth: 1, borderRadius: 16, padding: 14, gap: 4 },
  kpiVal: { fontSize: 22, fontWeight: '800' },
  kpiLbl: { fontSize: 12, fontWeight: '600' },
  attendanceCard: { borderWidth: 1, borderRadius: 18, padding: 16, elevation: 2 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 0.4 },
  dateText: { marginTop: 4, fontSize: 18, fontWeight: '800' },
  statusBadgeWrap: { alignItems: 'flex-end' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, fontSize: 11, fontWeight: '800', overflow: 'hidden' },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  dataTile: { flex: 1, borderRadius: 12, padding: 12 },
  tileLabel: { fontSize: 12, fontWeight: '700' },
  tileValue: { marginTop: 4, fontSize: 20, fontWeight: '800' },
  tileSubtle: { marginTop: 2, fontSize: 11, fontWeight: '700' },
  bottomMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, fontWeight: '700' },
  workHoursWrap: { alignItems: 'flex-end' },
  hoursLabel: { fontSize: 11, fontWeight: '700' },
  hoursValue: { fontSize: 18, fontWeight: '800' },
  punchActionsGrid: { flexDirection: 'row', gap: 12, marginTop: 16 },
  punchAction: { flex: 1, height: 100, borderRadius: 18, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  punchActionText: { marginTop: 6, color: '#ffffff', fontSize: 15, fontWeight: '800' },
  quickActionsSection: { marginTop: 18 },
  sectionHeading: { fontSize: 18, fontWeight: '800', marginBottom: 10 },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickActionTile: { width: '47%', borderWidth: 1, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  quickIcon: { width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  quickActionText: { fontSize: 13, fontWeight: '800' },
  chartsSection: { marginTop: 20 },
  chartCard: { borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 12 },
  chartHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  chartTitle: { fontSize: 15, fontWeight: '800' },
  trendBarsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 120, paddingTop: 10 },
  trendCol: { alignItems: 'center', flex: 1 },
  barVal: { fontSize: 11, fontWeight: '800', marginBottom: 4 },
  barContainer: { width: 18, height: 75, borderRadius: 9, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 9 },
  barLabel: { marginTop: 6, fontSize: 11, fontWeight: '700' },
  chartsRow: { flexDirection: 'row', gap: 12 },
  chartHalfCard: { flex: 1, borderWidth: 1, borderRadius: 18, padding: 14 },
  chartSubTitle: { fontSize: 13, fontWeight: '800', marginBottom: 10 },
  leaveStatsList: { gap: 6 },
  leaveStatItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statName: { fontSize: 12, fontWeight: '700' },
  statValNum: { fontSize: 14, fontWeight: '800' },
  rateCircleWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  ratePercent: { fontSize: 26, fontWeight: '800' },
  rateSub: { marginTop: 4, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  exportSection: { marginTop: 20, marginBottom: 12 },
  exportGrid: { flexDirection: 'row', gap: 10 },
  exportBtn: { flex: 1, borderWidth: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', gap: 6 },
  exportBtnText: { fontSize: 12, fontWeight: '800' },
  errorText: { marginTop: 12, fontSize: 12, fontWeight: '700', color: '#ba1a1a', textAlign: 'center' },
});

export default EmployeeDashboardScreen;
