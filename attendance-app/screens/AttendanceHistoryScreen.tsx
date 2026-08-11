import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getAttendanceCalendar, getAttendanceByDate, getDashboard, getReportDownloadUrl, AttendanceRecord } from '../api/client';
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

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0])) return dateStr;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getDayNameStr = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0])) return '';
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString('en-US', { weekday: 'long' });
};

const AttendanceHistoryScreen = () => {
  const navigation = useNavigation<AttendanceHistoryScreenNavigation>();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const maxWidth = Math.min(width, 960);

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [todayStr] = useState<string>(new Date().toISOString().slice(0, 10));
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().slice(0, 10));
  const [showDetailsCard, setShowDetailsCard] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonthIdx = currentDate.getMonth(); // 0-11

  const syncData = useCallback(async (year: number, month: number) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const [calData, dashboard] = await Promise.all([
        getAttendanceCalendar(month, year),
        getDashboard().catch(() => null),
      ]);

      setAttendanceHistory(calData.attendance || []);
      if (dashboard) setDashboardData(dashboard);
    } catch (err: any) {
      console.error("Error loading attendance calendar:", err);
      setErrorMessage(err?.message ?? 'Unable to load attendance data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void syncData(currentYear, currentMonthIdx + 1);
    }, [currentYear, currentMonthIdx, syncData])
  );

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

  const handleSelectDate = async (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setShowDetailsCard(true);

    if (!historyMap.has(dateStr)) {
      try {
        const fetched = await getAttendanceByDate(dateStr);
        if (fetched) {
          setAttendanceHistory(prev => {
            const exists = prev.some(r => r.date === dateStr);
            return exists ? prev : [...prev, fetched];
          });
        }
      } catch (e) {
        // Silently ignore single date fetch errors
      }
    }
  };

  const stats = useMemo(() => {
    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;
    let leaveCount = 0;

    attendanceHistory.forEach((r) => {
      const st = (r.status || '').toUpperCase();
      if (st === 'PRESENT' || st === 'ON TIME') presentCount++;
      else if (st === 'LATE') lateCount++;
      else if (st === 'ABSENT') absentCount++;
      else if (st === 'LEAVE') leaveCount++;
    });

    return {
      present: presentCount,
      late: lateCount,
      absent: absentCount,
      leave: leaveCount,
      totalLogs: attendanceHistory.length,
    };
  }, [attendanceHistory]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Calendar Grid Calculation
  const calendarGrid = useMemo(() => {
    const firstDayOfWeek = new Date(currentYear, currentMonthIdx, 1).getDay(); // 0 = Sun
    const totalDays = new Date(currentYear, currentMonthIdx + 1, 0).getDate();

    const cells: ({ dayNum: number; dateStr: string } | null)[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(null);
    }

    for (let day = 1; day <= totalDays; day++) {
      const monthPad = String(currentMonthIdx + 1).padStart(2, '0');
      const dayPad = String(day).padStart(2, '0');
      const dateStr = `${currentYear}-${monthPad}-${dayPad}`;
      cells.push({ dayNum: day, dateStr });
    }

    return cells;
  }, [currentYear, currentMonthIdx]);

  const monthLabel = useMemo(() => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  const operatorName = dashboardData?.operator?.name || 'Employee';
  const operatorCode = dashboardData?.operator?.employeeId || selectedRecord?.employeeId || 'EMP';

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant }]}>
        <View style={styles.headerInner}>
          <View style={styles.headerLeft}>
            <Pressable style={styles.iconButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color={colors.primary} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: colors.primary }]}>Attendance Calendar</Text>
          </View>
          <Pressable style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.contentPadding, { paddingBottom: 90 }]} scrollEnabled={true} showsVerticalScrollIndicator={true} keyboardShouldPersistTaps="handled">
        <View style={[styles.maxWidth, { maxWidth }]}>
          {/* Month Navigation & Title Card */}
          <View style={[styles.filterCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
            <View style={styles.monthNavRow}>
              <Pressable style={styles.navBtn} onPress={handlePrevMonth}>
                <Ionicons name="chevron-back" size={20} color={colors.primary} />
              </Pressable>
              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.monthTitle, { color: colors.onSurface }]}>{monthLabel}</Text>
                <Text style={[styles.monthCaption, { color: colors.onSurfaceVariant }]}>{stats.totalLogs} Days Loaded from Database</Text>
              </View>
              <Pressable style={styles.navBtn} onPress={handleNextMonth}>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </Pressable>
            </View>
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
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Leave Days</Text>
              <Text style={[styles.statValue, { color: colors.green }]}>{stats.leave} Days</Text>
            </View>
          </View>

          {/* Interactive Attendance Calendar Grid */}
          <View style={[styles.calendarCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
            <View style={styles.calendarCardHeader}>
              <Text style={[styles.calendarCardTitle, { color: colors.onSurface }]}>Interactive Monthly Calendar</Text>
              <Text style={[styles.calendarCardSubtitle, { color: colors.onSurfaceVariant }]}>Tap any date for full details</Text>
            </View>
            
            {/* Weekday Labels Header */}
            <View style={styles.weekdayHeader}>
              {WEEKDAYS.map((w, idx) => (
                <Text key={idx} style={[styles.weekdayText, { color: colors.onSurfaceVariant }]}>{w}</Text>
              ))}
            </View>

            {/* Calendar Grid Cells */}
            <View style={styles.daysGrid}>
              {calendarGrid.map((cell, index) => {
                if (!cell) {
                  return <View key={`empty-${index}`} style={styles.dayCellEmpty} />;
                }

                const rec = historyMap.get(cell.dateStr);
                const isToday = cell.dateStr === todayStr;
                const isSelected = cell.dateStr === selectedDateStr;

                let dotColor = '#cbd5e1'; // neutral slate
                let badgeBg = '#f8fafc';

                const statusUpper = (rec?.status || (cell.dateStr <= todayStr ? 'ABSENT' : 'NO RECORD')).toUpperCase();

                if (statusUpper === 'PRESENT' || statusUpper === 'ON TIME') {
                  dotColor = colors.green;
                  badgeBg = '#dcfce7';
                } else if (statusUpper === 'LATE') {
                  dotColor = colors.amber;
                  badgeBg = '#fef3c7';
                } else if (statusUpper === 'ABSENT') {
                  dotColor = colors.red;
                  badgeBg = '#fee2e2';
                } else if (statusUpper === 'LEAVE') {
                  dotColor = colors.secondary;
                  badgeBg = '#f3e8ff';
                } else if (statusUpper === 'HOLIDAY') {
                  dotColor = colors.primary;
                  badgeBg = '#dbeafe';
                }

                return (
                  <Pressable
                    key={cell.dateStr}
                    style={[
                      styles.dayCell,
                      { backgroundColor: isSelected ? colors.primaryContainer : badgeBg },
                      isToday ? { borderWidth: 2, borderColor: colors.primary } : { borderWidth: 1, borderColor: isSelected ? colors.primary : colors.outlineVariant },
                    ]}
                    onPress={() => void handleSelectDate(cell.dateStr)}
                  >
                    <Text
                      style={[
                        styles.dayNumberText,
                        { color: isSelected ? colors.onPrimaryContainer : isToday ? colors.primary : colors.onSurface },
                      ]}
                    >
                      {cell.dayNum}
                    </Text>
                    <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Selected Date Details Card */}
          {showDetailsCard ? (
            <View style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <View style={styles.detailsHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailsDateText, { color: colors.onSurface }]}>
                    {formatDisplayDate(selectedDateStr)}
                  </Text>
                  <Text style={[styles.detailsDayText, { color: colors.onSurfaceVariant }]}>
                    {selectedRecord?.dayLabel || getDayNameStr(selectedDateStr)}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  {
                    backgroundColor: selectedRecord?.status === 'LATE' ? '#fef3c7'
                      : (selectedRecord?.status === 'PRESENT' || selectedRecord?.status === 'ON TIME') ? '#dcfce7'
                      : selectedRecord?.status === 'ABSENT' ? '#fee2e2'
                      : selectedRecord?.status === 'LEAVE' ? '#f3e8ff'
                      : selectedRecord?.status === 'HOLIDAY' ? '#dbeafe'
                      : '#f1f5f9'
                  }
                ]}>
                  <Text style={[
                    styles.statusBadgeText,
                    {
                      color: selectedRecord?.status === 'LATE' ? '#d97706'
                        : (selectedRecord?.status === 'PRESENT' || selectedRecord?.status === 'ON TIME') ? '#15803d'
                        : selectedRecord?.status === 'ABSENT' ? '#b91c1c'
                        : selectedRecord?.status === 'LEAVE' ? '#7e22ce'
                        : selectedRecord?.status === 'HOLIDAY' ? '#1d4ed8'
                        : '#64748b'
                    }
                  ]}>
                    {selectedRecord ? selectedRecord.status : (selectedDateStr <= todayStr ? 'Absent' : 'No Record')}
                  </Text>
                </View>
                <Pressable style={styles.closeBtn} onPress={() => setShowDetailsCard(false)}>
                  <Ionicons name="close-circle-outline" size={24} color={colors.secondary} />
                </Pressable>
              </View>

              <View style={[styles.employeeInfoBox, { backgroundColor: colors.surfaceContainer }]}>
                <View style={styles.empMetaCol}>
                  <Text style={[styles.empMetaLabel, { color: colors.onSurfaceVariant }]}>Employee Name</Text>
                  <Text style={[styles.empMetaValue, { color: colors.onSurface }]}>{operatorName}</Text>
                </View>
                <View style={styles.empMetaCol}>
                  <Text style={[styles.empMetaLabel, { color: colors.onSurfaceVariant }]}>Employee ID</Text>
                  <Text style={[styles.empMetaValue, { color: colors.primary }]}>{operatorCode}</Text>
                </View>
              </View>

              <View style={styles.detailsGrid}>
                <View style={[styles.detailItem, { backgroundColor: colors.surfaceContainer }]}>
                  <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>Punch In</Text>
                  <Text style={[styles.detailVal, { color: colors.onSurface }]}>
                    {selectedRecord?.punchIn || 'Not Punched In'}
                  </Text>
                </View>
                <View style={[styles.detailItem, { backgroundColor: colors.surfaceContainer }]}>
                  <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>Punch Out</Text>
                  <Text style={[styles.detailVal, { color: colors.onSurface }]}>
                    {selectedRecord?.punchOut || 'Not Punched Out'}
                  </Text>
                </View>
                <View style={[styles.detailItem, { backgroundColor: colors.primaryContainer }]}>
                  <Text style={[styles.detailLabel, { color: colors.onPrimaryContainer }]}>Working Hours</Text>
                  <Text style={[styles.detailVal, { color: colors.primary, fontWeight: '800' }]}>
                    {selectedRecord?.totalHours || (selectedRecord?.punchIn && !selectedRecord?.punchOut ? 'In Progress' : '00h 00m')}
                  </Text>
                </View>
              </View>

              <View style={styles.detailsFooter}>
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={14} color={colors.primary} />
                  <Text style={[styles.metaText, { color: colors.onSurfaceVariant }]}>
                    Location: {selectedRecord?.primaryLocation || 'Padalkar Colony'}
                  </Text>
                </View>
                {selectedRecord?.faceVerified ? (
                  <View style={styles.metaRow}>
                    <Ionicons name="shield-checkmark-outline" size={14} color={colors.green} />
                    <Text style={[styles.metaText, { color: colors.green }]}>
                      Face Biometric Verified ({selectedRecord.faceConfidence || 99.5}%)
                    </Text>
                  </View>
                ) : null}
                {selectedRecord?.remarks ? (
                  <Text style={[styles.remarkText, { color: colors.onSurfaceVariant, marginTop: 4 }]}>
                    Remarks: {selectedRecord.remarks}
                  </Text>
                ) : (
                  <Text style={[styles.remarkText, { color: colors.onSurfaceVariant, marginTop: 4 }]}>
                    No attendance record for this date.
                  </Text>
                )}
                {selectedRecord?.lateReason ? (
                  <Text style={[styles.remarkText, { color: colors.amber, fontWeight: '700', marginTop: 2 }]}>
                    Late Reason: {selectedRecord.lateReason}
                  </Text>
                ) : null}
                {selectedRecord?.earlyExitReason ? (
                  <Text style={[styles.remarkText, { color: colors.secondary, fontWeight: '700', marginTop: 2 }]}>
                    Early Exit Reason: {selectedRecord.earlyExitReason}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}

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

          {/* Recorded Log Entries Header */}
          <Text style={[styles.listSectionTitle, { color: colors.onSurface }]}>Recorded Attendance Days</Text>

          {loading ? <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} /> : null}
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          {/* List of Live Attendance Log Cards */}
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
                  onPress={() => void handleSelectDate(item.date)}
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

      <BottomTabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, height: '100%', minHeight: 0 },
  scrollView: { flex: 1, minHeight: 0 },
  header: { flexShrink: 0, borderBottomWidth: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  headerInner: { height: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  iconButton: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  contentPadding: { flexGrow: 1 },
  maxWidth: { width: '100%', alignSelf: 'center', paddingHorizontal: 16, paddingTop: 16 },
  filterCard: { backgroundColor: '#f3f3fe', borderRadius: 16, borderWidth: 1, borderColor: '#c3c6d7', padding: 12, marginBottom: 14 },
  monthNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  navBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center' },
  monthTitle: { fontSize: 18, fontWeight: '800' },
  monthCaption: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  statCard: { width: '48.5%', borderWidth: 1, borderRadius: 16, padding: 14 },
  statLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  statValue: { marginTop: 4, fontSize: 20, fontWeight: '800' },
  calendarCard: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 16 },
  calendarCardHeader: { marginBottom: 10 },
  calendarCardTitle: { fontSize: 15, fontWeight: '800' },
  calendarCardSubtitle: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  weekdayHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 6 },
  weekdayText: { width: '14%', textAlign: 'center', fontSize: 12, fontWeight: '700' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCellEmpty: { width: '14.28%', height: 44 },
  dayCell: { width: '14.28%', height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', padding: 2 },
  dayNumberText: { fontSize: 13, fontWeight: '800' },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
  detailsCard: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 16 },
  detailsHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  detailsDateText: { fontSize: 18, fontWeight: '800' },
  detailsDayText: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  closeBtn: { padding: 4, marginLeft: 8 },
  employeeInfoBox: { flexDirection: 'row', justifyContent: 'space-between', borderRadius: 12, padding: 10, marginBottom: 12 },
  empMetaCol: { gap: 2 },
  empMetaLabel: { fontSize: 11, fontWeight: '700' },
  empMetaValue: { fontSize: 14, fontWeight: '800' },
  detailsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  detailItem: { flex: 1, borderRadius: 12, padding: 10, gap: 2 },
  detailLabel: { fontSize: 11, fontWeight: '700' },
  detailVal: { fontSize: 14, fontWeight: '800' },
  detailsFooter: { gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, fontWeight: '600' },
  remarkText: { fontSize: 12, fontStyle: 'italic' },
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
});

export default AttendanceHistoryScreen;
