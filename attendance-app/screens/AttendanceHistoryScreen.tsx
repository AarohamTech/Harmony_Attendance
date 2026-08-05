import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getAttendanceHistory, getDashboard, getReportDownloadUrl, AttendanceRecord } from '../api/client';
import { useTheme } from '../theme/ThemeContext';
import { BottomTabBar } from '../components/BottomTabBar';

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

type AttendanceHistoryScreenNavigation = StackNavigationProp<RootStackParamList, 'AttendanceHistory'>;

const AttendanceHistoryScreen = () => {
  const navigation = useNavigation<AttendanceHistoryScreenNavigation>();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const maxWidth = Math.min(width, 960);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const syncData = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const [history, dashboard] = await Promise.all([getAttendanceHistory(), getDashboard()]);
      setAttendanceHistory(history);
      setDashboardData(dashboard);
      if (history.length > 0) {
        setSelectedDateStr(history[0].date);
      }
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Unable to load live attendance history from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void syncData();
  }, []);

  const historyMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    attendanceHistory.forEach((rec) => {
      map.set(rec.date, rec);
    });
    return map;
  }, [attendanceHistory]);

  const selectedRecord = useMemo(() => {
    return historyMap.get(selectedDateStr) || null;
  }, [historyMap, selectedDateStr]);

  const stats = useMemo(() => {
    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;

    attendanceHistory.forEach((r) => {
      if (r.status === 'ON TIME') presentCount++;
      else if (r.status === 'LATE') lateCount++;
      else if (r.status === 'ABSENT') absentCount++;
      else presentCount++;
    });

    return {
      present: presentCount,
      late: lateCount,
      absent: absentCount,
      totalLogs: attendanceHistory.length,
    };
  }, [attendanceHistory]);

  const monthHeaderLabel = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, []);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant }]}>
        <View style={styles.headerInner}>
          <View style={styles.headerLeft}>
            <Pressable style={styles.iconButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color={colors.primary} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: colors.primary }]}>Attendance Logs</Text>
          </View>
          <Pressable style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentPadding}>
        <View style={[styles.maxWidth, { maxWidth }]}>
          <View style={styles.filterCard}>
            <Text style={[styles.monthTitle, { color: colors.onSurface }]}>{monthHeaderLabel}</Text>
            <Text style={[styles.monthCaption, { color: colors.onSurfaceVariant }]}>{stats.totalLogs} Logged Database Records</Text>
          </View>

          {/* Real Backend Statistics Cards */}
          <View style={styles.statGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Total Present</Text>
              <Text style={[styles.statValue, { color: colors.primary }]}>{stats.present} Days</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Late Days</Text>
              <Text style={[styles.statValue, { color: colors.amber }]}>{stats.late} Days</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Absent Days</Text>
              <Text style={[styles.statValue, { color: colors.red }]}>{stats.absent} Days</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Staff Present</Text>
              <Text style={[styles.statValue, { color: colors.green }]}>{dashboardData?.kpis?.todayPresent ?? 0} Staff</Text>
            </View>
          </View>
          {/* Export Report Buttons */}
          <View style={styles.exportBar}>
            <Text style={[styles.exportBarTitle, { color: colors.onSurface }]}>Export History Log:</Text>
            <View style={styles.exportButtonsRow}>
              <Pressable style={[styles.miniExportBtn, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]} onPress={() => void Linking.openURL(getReportDownloadUrl('csv'))}>
                <Ionicons name="document-text-outline" size={14} color={colors.primary} />
                <Text style={[styles.miniExportText, { color: colors.primary }]}>CSV</Text>
              </Pressable>
              <Pressable style={[styles.miniExportBtn, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]} onPress={() => void Linking.openURL(getReportDownloadUrl('xlsx'))}>
                <Ionicons name="grid-outline" size={14} color={colors.green} />
                <Text style={[styles.miniExportText, { color: colors.green }]}>Excel</Text>
              </Pressable>
              <Pressable style={[styles.miniExportBtn, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]} onPress={() => void Linking.openURL(getReportDownloadUrl('pdf'))}>
                <Ionicons name="document-attach-outline" size={14} color={colors.red} />
                <Text style={[styles.miniExportText, { color: colors.red }]}>PDF</Text>
              </Pressable>
            </View>
          </View>

          {/* List of Live Attendance Log Entries */}
          <Text style={[styles.listSectionTitle, { color: colors.onSurface }]}>Recorded Attendance Days</Text>

          {loading ? <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} /> : null}
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <View style={styles.logList}>
            {attendanceHistory.map((item) => {
              const isSelected = item.date === selectedDateStr;
              const statusColor = item.status === 'LATE' ? colors.amber : item.status === 'ABSENT' ? colors.red : colors.green;
              const statusBg = item.status === 'LATE' ? '#fef3c7' : item.status === 'ABSENT' ? '#fee2e2' : '#dcfce7';

              return (
                <Pressable
                  key={item.id}
                  style={[
                    styles.logCard,
                    { backgroundColor: colors.surface, borderColor: isSelected ? colors.primary : colors.outlineVariant },
                  ]}
                  onPress={() => setSelectedDateStr(item.date)}
                >
                  <View style={styles.logHeaderRow}>
                    <View>
                      <Text style={[styles.logDate, { color: colors.onSurface }]}>{item.date}</Text>
                      <Text style={[styles.logDayLabel, { color: colors.onSurfaceVariant }]}>{item.dayLabel}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusColor }]}>{item.status}</Text>
                    </View>
                  </View>

                  <View style={styles.logDetailsRow}>
                    <View style={styles.logCol}>
                      <Text style={[styles.colLabel, { color: colors.onSurfaceVariant }]}>Punch In</Text>
                      <Text style={[styles.colVal, { color: colors.onSurface }]}>{item.punchIn}</Text>
                    </View>
                    <View style={styles.logCol}>
                      <Text style={[styles.colLabel, { color: colors.onSurfaceVariant }]}>Punch Out</Text>
                      <Text style={[styles.colVal, { color: colors.onSurface }]}>{item.punchOut}</Text>
                    </View>
                    <View style={styles.logCol}>
                      <Text style={[styles.colLabel, { color: colors.onSurfaceVariant }]}>Working Hours</Text>
                      <Text style={[styles.colVal, { color: colors.primary }]}>{item.totalHours}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}

            {!loading && attendanceHistory.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]}>
                <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>No attendance records in backend database yet.</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* Selected Day Quick Inspector */}
      {selectedRecord ? (
        <View style={[styles.sheet, { backgroundColor: colors.surface, borderTopColor: colors.outlineVariant }]}>
          <Text style={[styles.sheetTitle, { color: colors.onSurface }]}>Log Details: {selectedRecord.date}</Text>
          <Text style={[styles.sheetRemarks, { color: colors.onSurfaceVariant }]}>{selectedRecord.remarks}</Text>
        </View>
      ) : null}

      <BottomTabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, position: 'relative' },
  scrollView: { flex: 1 },
  header: { borderBottomWidth: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  headerInner: { height: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  iconButton: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  contentPadding: { paddingBottom: 160, flexGrow: 1 },
  maxWidth: { width: '100%', alignSelf: 'center', paddingHorizontal: 16, paddingTop: 16 },
  filterCard: { alignItems: 'center', backgroundColor: '#f3f3fe', borderRadius: 16, borderWidth: 1, borderColor: '#c3c6d7', padding: 12, marginBottom: 14 },
  monthTitle: { fontSize: 18, fontWeight: '800' },
  monthCaption: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  statCard: { width: '48.5%', borderWidth: 1, borderRadius: 16, padding: 14 },
  statLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  statValue: { marginTop: 4, fontSize: 20, fontWeight: '800' },
  exportBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, marginTop: 4, paddingHorizontal: 4 },
  exportBarTitle: { fontSize: 13, fontWeight: '800' },
  exportButtonsRow: { flexDirection: 'row', gap: 8 },
  miniExportBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  miniExportText: { fontSize: 12, fontWeight: '800' },
  listSectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  logList: { gap: 10 },
  logCard: { borderWidth: 1, borderRadius: 16, padding: 14, elevation: 1 },
  logHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  logDate: { fontSize: 16, fontWeight: '800' },
  logDayLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusBadgeText: { fontSize: 11, fontWeight: '800' },
  logDetailsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  logCol: { gap: 2 },
  colLabel: { fontSize: 11, fontWeight: '700' },
  colVal: { fontSize: 14, fontWeight: '800' },
  errorText: { color: '#ba1a1a', fontSize: 12, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  emptyBox: { borderWidth: 1, borderRadius: 16, padding: 24, alignItems: 'center' },
  emptyText: { fontSize: 14, fontWeight: '700' },
  sheet: { position: 'absolute', bottom: 72, left: 0, right: 0, borderTopWidth: 1, padding: 16, borderTopLeftRadius: 20, borderTopRightRadius: 20, zIndex: 90 },
  sheetTitle: { fontSize: 15, fontWeight: '800' },
  sheetRemarks: { marginTop: 4, fontSize: 13, fontStyle: 'italic' },
});

export default AttendanceHistoryScreen;
