import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getProfile, logout } from '../api/client';
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

type EmployeeProfileScreenNavigation = StackNavigationProp<RootStackParamList, 'EmployeeProfile'>;

const EmployeeProfileScreen = () => {
  const navigation = useNavigation<EmployeeProfileScreenNavigation>();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const syncProfile = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const nextProfile = await getProfile();
      setProfile(nextProfile);
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Unable to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void syncProfile();
  }, []);

  const onLogout = async () => {
    try {
      await logout();
      navigation.navigate('Login');
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Unable to log out.');
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant }]}>
        <View style={styles.topBarInner}>
          <Text style={[styles.title, { color: colors.primary }]}>Harmony AI Attendance</Text>
          <View style={styles.topRightWrap}>
            <Pressable style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={22} color={colors.primary} />
            </Pressable>
            <Pressable style={[styles.avatarBubble, { backgroundColor: colors.secondaryContainer }]} onPress={() => navigation.navigate('EditProfile')}>
              <Image source={{ uri: profile?.profilePhoto ?? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80' }} style={styles.avatarImage} />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentPadding}>
        <View style={styles.maxWidth}>
          <View style={[styles.profileHero, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
            <View style={styles.heroAvatarWrap}>
              <Image source={{ uri: profile?.profilePhoto ?? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80' }} style={styles.heroAvatar} />
              <View style={[styles.verifiedBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="checkmark" size={16} color={colors.white} />
              </View>
            </View>
            <Text style={[styles.nameText, { color: colors.onSurface }]}>{profile?.name ?? 'Alexander Bennett'}</Text>
            <Text style={[styles.idText, { color: colors.onSurfaceVariant }]}>ID: {profile?.employeeId ?? 'EMP-884210'}</Text>

            <View style={styles.heroActions}>
              <Pressable style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('EditProfile')}>
                <Ionicons name="create-outline" size={18} color={colors.white} />
                <Text style={[styles.primaryButtonText, { color: colors.white }]}>Edit Profile</Text>
              </Pressable>
              <Pressable style={[styles.secondaryButton, { borderColor: colors.outlineVariant }]} onPress={() => void onLogout()}>
                <Ionicons name="log-out-outline" size={18} color={colors.red} />
                <Text style={[styles.secondaryButtonText, { color: colors.red }]}>Logout</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}> <Ionicons name="person-outline" size={18} color={colors.primary} /> Personal Details</Text>
            <View style={[styles.detailCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <View style={styles.detailRow}>
                <View>
                  <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>Phone</Text>
                  <Text style={[styles.detailValue, { color: colors.onSurface }]}>+1 (555) 012-3456</Text>
                </View>
                <Ionicons name="call-outline" size={18} color={colors.outlineVariant} />
              </View>
              <View style={styles.detailRow}>
                <View>
                  <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>Email</Text>
                  <Text style={[styles.detailValue, { color: colors.onSurface }]}>{profile?.email ?? 'a.bennett@harmony.ai'}</Text>
                </View>
                <Ionicons name="mail-outline" size={18} color={colors.outlineVariant} />
              </View>
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}> <Ionicons name="briefcase-outline" size={18} color={colors.primary} /> Job Details</Text>
            <View style={styles.twoColumnGrid}>
              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>Department</Text>
                <Text style={[styles.detailValue, { color: colors.onSurface }]}>{profile?.department ?? 'Engineering'}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
                <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>Designation</Text>
                <Text style={[styles.detailValue, { color: colors.onSurface }]}>{profile?.role ?? 'Senior Developer'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}> <Ionicons name="time-outline" size={18} color={colors.primary} /> Work Details</Text>
            <View style={[styles.detailCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <View style={styles.detailRow}>
                <View style={[styles.locationIcon, { backgroundColor: colors.surfaceContainer }]}>
                  <Ionicons name="location-outline" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>Office Location</Text>
                  <Text style={[styles.detailValue, { color: colors.onSurface }]}>{profile?.locationLabel ?? 'San Francisco Tech Hub, Tower A, 12th Floor'}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <View style={[styles.locationIcon, { backgroundColor: colors.surfaceContainer }]}>
                  <Ionicons name="sunny-outline" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>Shift</Text>
                  <Text style={[styles.detailValue, { color: colors.onSurface }]}>09:00 AM - 06:00 PM</Text>
                </View>
              </View>
            </View>
          </View>

          {loading ? <Text style={styles.statusText}>Loading profile…</Text> : null}
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </View>
      </ScrollView>

      <BottomTabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, position: 'relative' },
  scrollView: { flex: 1 },
  topBar: { borderBottomWidth: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  topBarInner: { height: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: '700' },
  topRightWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  avatarBubble: { width: 32, height: 32, borderRadius: 999, overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  contentPadding: { paddingBottom: 110, paddingTop: 16, flexGrow: 1 },
  maxWidth: { width: '100%', alignSelf: 'center', paddingHorizontal: 16 },
  profileHero: { borderWidth: 1, borderRadius: 20, padding: 18, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  heroAvatarWrap: { position: 'relative', marginBottom: 10 },
  heroAvatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: '#ffffff' },
  verifiedBadge: { position: 'absolute', right: 2, bottom: 2, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#ffffff' },
  nameText: { fontSize: 24, fontWeight: '800' },
  idText: { marginTop: 2, fontSize: 12, fontWeight: '700', letterSpacing: 0.8 },
  heroActions: { marginTop: 16, width: '100%', gap: 10 },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 14, paddingVertical: 12 },
  primaryButtonText: { fontSize: 14, fontWeight: '800' },
  secondaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 14, borderWidth: 1, paddingVertical: 12 },
  secondaryButtonText: { fontSize: 14, fontWeight: '800' },
  sectionBlock: { marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  detailCard: { borderWidth: 1, borderRadius: 16, padding: 12, gap: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  detailLabel: { fontSize: 12, fontWeight: '700', marginBottom: 4, letterSpacing: 0.4 },
  detailValue: { fontSize: 16, fontWeight: '700' },
  twoColumnGrid: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 12 },
  locationIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', borderTopWidth: 1, paddingBottom: 6 },
  navItem: { alignItems: 'center', justifyContent: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  navItemActive: { transform: [{ scale: 0.95 }] },
  navLabel: { marginTop: 2, fontSize: 11, fontWeight: '600' },
  statusText: { marginTop: 12, fontSize: 12, fontWeight: '700', color: '#525657' },
  errorText: { marginTop: 8, fontSize: 12, fontWeight: '700', color: '#ba1a1a' },
});

export default EmployeeProfileScreen;
