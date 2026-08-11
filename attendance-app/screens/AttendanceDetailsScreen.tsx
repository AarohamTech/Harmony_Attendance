import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getAttendanceHistory, getDashboard, AttendanceRecord } from '../api/client';
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

type AttendanceDetailsScreenNavigation = StackNavigationProp<RootStackParamList, 'AttendanceDetails'>;

const AttendanceDetailsScreen = () => {
  const navigation = useNavigation<AttendanceDetailsScreenNavigation>();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const contentMaxWidth = Math.min(width, 960);

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const syncData = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [dashboard, history] = await Promise.all([getDashboard(), getAttendanceHistory()]);
      setDashboardData(dashboard);
      setAttendanceHistory(history);
    } catch (fetchError: any) {
      setErrorMessage(fetchError?.message ?? 'Unable to load live attendance details from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void syncData();
  }, []);

  const attendanceToday = useMemo(() => attendanceHistory[0] ?? dashboardData?.attendanceToday, [attendanceHistory, dashboardData]);
  const operator = dashboardData?.operator;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant }]}>
        <View style={styles.topBarInner}>
          <View style={styles.topLeftWrap}>
            <Pressable style={styles.iconButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color={colors.primary} />
            </Pressable>
            <Text style={[styles.title, { color: colors.primary }]}>Attendance Record Details</Text>
          </View>

          <View style={styles.topRightWrap}>
            <Pressable style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={22} color={colors.primary} />
            </Pressable>
            <Pressable onPress={() => navigation.navigate('EmployeeProfile')}>
              <Image source={{ uri: operator?.profilePhoto && operator.profilePhoto.trim() !== '' ? operator.profilePhoto : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80' }} style={styles.avatar} />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingBottom: 90 }]} scrollEnabled={true} showsVerticalScrollIndicator={true} keyboardShouldPersistTaps="handled">
        <View style={[styles.maxWidthContainer, { maxWidth: contentMaxWidth }]}>
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
          ) : (
            <>
              <Pressable
                style={[styles.profileHeader, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}
                onPress={() => navigation.navigate('EmployeeProfile')}
              >
                <Image source={{ uri: operator?.profilePhoto && operator.profilePhoto.trim() !== '' ? operator.profilePhoto : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80' }} style={styles.profileImage} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.profileName, { color: colors.onSurface }]}>{operator?.name}</Text>
                  <View style={styles.chipRow}>
                    <View style={[styles.chip, { backgroundColor: colors.secondaryContainer, borderColor: colors.outlineVariant }]}>
                      <Text style={[styles.chipText, { color: colors.onSecondaryContainer }]}>ID: {operator?.employeeId}</Text>
                    </View>
                    <Text style={[styles.subtitleText, { color: colors.secondary }]}>{operator?.department} • {operator?.role}</Text>
                  </View>
                </View>
              </Pressable>

              <View style={styles.bentoGrid}>
                <View style={[styles.bentoItemLarge, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                  <View style={styles.bentoRow}>
                    <View>
                      <Text style={[styles.label, { color: colors.secondary }]}>Date & Day</Text>
                      <Text style={[styles.bodyTitle, { color: colors.onSurface }]}>
                        {attendanceToday?.date}{' '}
                        <Text style={[styles.bodySubtitle, { color: colors.secondary }]}>· {attendanceToday?.dayLabel}</Text>
                      </Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: attendanceToday?.status === 'LATE' ? '#fef3c7' : '#dcfce7' }]}>
                      <Ionicons name="checkmark-circle" size={18} color={attendanceToday?.status === 'LATE' ? '#d97706' : '#15803d'} />
                      <Text style={[styles.statusText, { color: attendanceToday?.status === 'LATE' ? '#d97706' : '#15803d' }]}>
                        {attendanceToday?.status ?? 'ON TIME'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                  <Text style={[styles.label, { color: colors.secondary }]}>Punch In</Text>
                  <Text style={[styles.displayLarge, { color: colors.primary }]}>{attendanceToday?.punchIn ?? '--:--'}</Text>
                  <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={14} color={colors.tertiary} />
                    <Text style={[styles.metaText, { color: colors.tertiary }]}>Standard: 09:00 AM</Text>
                  </View>
                </View>

                <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                  <Text style={[styles.label, { color: colors.secondary }]}>Punch Out</Text>
                  <Text style={[styles.displayLarge, { color: colors.secondary }]}>{attendanceToday?.punchOut ?? '--:--'}</Text>
                  <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={14} color={colors.tertiary} />
                    <Text style={[styles.metaText, { color: colors.tertiary }]}>Standard: 06:00 PM</Text>
                  </View>
                </View>

                <View style={[styles.workingHoursCard, { backgroundColor: colors.primaryContainer }]}>
                  <View style={styles.bentoRow}>
                    <View>
                      <Text style={[styles.workingLabel, { color: '#dbeafe' }]}>Total Working Hours</Text>
                      <Text style={[styles.workingTitle, { color: '#ffffff' }]}>{attendanceToday?.totalHours ?? '00h 00m'}</Text>
                    </View>
                    <View style={styles.rightAligned}>
                      <Text style={[styles.workingLabel, { color: '#dbeafe' }]}>Overtime</Text>
                      <Text style={[styles.workingOvertime, { color: '#ffffff' }]}>{attendanceToday?.overtime ?? '+00h 00m'}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                  <Ionicons name="location-outline" size={18} color={colors.primary} /> Geolocation & Biometric Match
                </Text>
                <View style={styles.locationContent}>
                  <View style={styles.locationHeader}>
                    <View>
                      <Text style={[styles.label, { color: colors.secondary }]}>Location</Text>
                      <Text style={[styles.locationPrimary, { color: colors.onSurface }]}>{attendanceToday?.primaryLocation}</Text>
                    </View>
                    <View style={styles.bioTag}>
                      <Ionicons name="scan-outline" size={16} color={colors.green} />
                      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.green }}>
                        Face Confidence: {attendanceToday?.faceConfidence ?? 99.5}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.coordinatesGrid}>
                    <View>
                      <Text style={[styles.label, { color: colors.secondary }]}>Latitude</Text>
                      <Text style={[styles.codeBlock, { backgroundColor: colors.surfaceContainer, color: colors.onSurface }]}>
                        {attendanceToday?.geolocation?.latitude}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.label, { color: colors.secondary }]}>Longitude</Text>
                      <Text style={[styles.codeBlock, { backgroundColor: colors.surfaceContainer, color: colors.onSurface }]}>
                        {attendanceToday?.geolocation?.longitude}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.primary} /> Record Remarks
                </Text>
                <View style={[styles.remarkBox, { backgroundColor: colors.surfaceContainer }]}>
                  <Text style={[styles.remarkText, { color: colors.onSurfaceVariant }]}>"{attendanceToday?.remarks}"</Text>
                  {attendanceToday?.lateReason ? (
                    <Text style={[styles.remarkText, { color: colors.amber, marginTop: 4, fontWeight: '700' }]}>Late Reason: {attendanceToday.lateReason}</Text>
                  ) : null}
                  {attendanceToday?.earlyExitReason ? (
                    <Text style={[styles.remarkText, { color: colors.secondary, marginTop: 4, fontWeight: '700' }]}>Early Exit Reason: {attendanceToday.earlyExitReason}</Text>
                  ) : null}
                </View>
                <View style={styles.editRow}>
                  <Pressable style={styles.editButton} onPress={() => navigation.navigate('NewRequest')}>
                    <Ionicons name="create-outline" size={16} color={colors.primary} />
                    <Text style={[styles.editText, { color: colors.primary }]}>Submit Request for Adjustment</Text>
                  </Pressable>
                </View>
              </View>
            </>
          )}

          {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
        </View>
      </ScrollView>

      <BottomTabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, height: '100%', minHeight: 0 },
  scrollView: { flex: 1, minHeight: 0 },
  topBar: { flexShrink: 0, borderBottomWidth: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  topBarInner: { height: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topLeftWrap: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  topRightWrap: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  iconButton: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800' },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  scrollContent: { flexGrow: 1 },
  maxWidthContainer: { width: '100%', alignSelf: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
  profileHeader: { flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 12, padding: 16, borderWidth: 1, borderRadius: 16 },
  profileImage: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#2563eb' },
  profileName: { fontSize: 18, fontWeight: '800' },
  chipRow: { marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  chip: { borderWidth: 1, borderRadius: 999, paddingVertical: 2, paddingHorizontal: 8 },
  chipText: { fontSize: 11, fontWeight: '700' },
  subtitleText: { fontSize: 12, fontWeight: '600' },
  bentoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  bentoItemLarge: { width: '100%', borderWidth: 1, borderRadius: 16, padding: 16 },
  bentoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  bodyTitle: { marginTop: 4, fontSize: 18, fontWeight: '800' },
  bodySubtitle: { fontSize: 16, fontWeight: '500' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  statusText: { fontSize: 11, fontWeight: '800' },
  infoCard: { width: '48.5%', borderWidth: 1, borderRadius: 16, padding: 16, minHeight: 110 },
  displayLarge: { marginTop: 6, fontSize: 26, fontWeight: '800' },
  metaRow: { marginTop: 6, flexDirection: 'row', gap: 4, alignItems: 'center' },
  metaText: { fontSize: 11, fontWeight: '600' },
  workingHoursCard: { width: '100%', borderRadius: 16, padding: 16 },
  workingLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  workingTitle: { marginTop: 4, fontSize: 28, fontWeight: '800' },
  rightAligned: { alignItems: 'flex-end' },
  workingOvertime: { marginTop: 4, fontSize: 18, fontWeight: '800' },
  sectionCard: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', marginBottom: 12 },
  locationContent: { gap: 12 },
  locationHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  locationPrimary: { marginTop: 4, fontSize: 15, fontWeight: '800' },
  bioTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  coordinatesGrid: { flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: '#c3c6d7', paddingTop: 12 },
  codeBlock: { marginTop: 4, fontSize: 13, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  remarkBox: { borderRadius: 12, padding: 12 },
  remarkText: { fontSize: 14, fontStyle: 'italic' },
  editRow: { marginTop: 12, alignItems: 'flex-end' },
  editButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editText: { fontSize: 12, fontWeight: '800' },
  errorMessage: { marginTop: 12, color: '#ba1a1a', fontSize: 12, fontWeight: '700' },
});

export default AttendanceDetailsScreen;
