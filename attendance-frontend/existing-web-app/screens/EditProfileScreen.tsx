import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProfile, updateProfile } from '../api/client';
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
  FaceCapture: { mode?: 'punch_in' | 'punch_out' | 'registration'; direction?: 'front' | 'left' | 'right' | 'up' | 'down' } | undefined;
  NewRequest: undefined;
  Notifications: undefined;
  EditProfile: undefined;
};

type EditProfileNavigationProp = StackNavigationProp<RootStackParamList, 'EditProfile'>;

const EditProfileScreen = () => {
  const navigation = useNavigation<EditProfileNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const sync = async () => {
      try {
        setLoading(true);
        const profile = await getProfile();
        if (profile) {
          setName(profile.name);
          setDepartment(profile.department);
          setRole(profile.role);
        }
      } catch (err: any) {
        setErrorMessage(err?.message ?? 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    void sync();
  }, []);

  const onSave = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await updateProfile({
        name: name.trim(),
        department: department.trim(),
        role: role.trim(),
      });
      navigation.navigate('EmployeeProfile');
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Failed to save changes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant }]}>
        <View style={styles.topBarInner}>
          <Pressable style={styles.iconButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
          </Pressable>
          <Text style={[styles.title, { color: colors.primary }]}>Edit Profile</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.contentPadding, { paddingBottom: getBottomTabBarHeight(insets.bottom) }]}>
        <View style={styles.maxWidth}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
            <View style={styles.avatarSection}>
              <View style={styles.avatarWrap}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80' }}
                  style={styles.avatar}
                />
                <Pressable
                  style={[styles.cameraBadge, { backgroundColor: colors.primary }]}
                  onPress={() => navigation.navigate('FaceCapture', { mode: 'registration', direction: 'front' })}
                >
                  <Ionicons name="camera" size={14} color={colors.white} />
                </Pressable>
              </View>
              <Text style={[styles.avatarHint, { color: colors.onSurfaceVariant }]}>Tap camera to update face biometric scan</Text>
            </View>

            <View style={styles.fieldWrap}>
              <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Full Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
                placeholderTextColor={colors.outlineVariant}
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.outlineVariant, color: colors.onSurface }]}
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Department</Text>
              <TextInput
                value={department}
                onChangeText={setDepartment}
                placeholder="Department"
                placeholderTextColor={colors.outlineVariant}
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.outlineVariant, color: colors.onSurface }]}
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Designation / Role</Text>
              <TextInput
                value={role}
                onChangeText={setRole}
                placeholder="Designation"
                placeholderTextColor={colors.outlineVariant}
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.outlineVariant, color: colors.onSurface }]}
              />
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            {loading ? <Text style={styles.statusText}>Loading profile data…</Text> : null}

            <View style={styles.actionRow}>
              <Pressable style={[styles.secondaryButton, { borderColor: colors.outlineVariant }]} onPress={() => navigation.goBack()}>
                <Text style={[styles.secondaryButtonText, { color: colors.onSurfaceVariant }]}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.primaryButton, { backgroundColor: colors.primaryContainer }]}
                onPress={() => void onSave()}
                disabled={isSubmitting || loading}
              >
                <Text style={[styles.primaryButtonText, { color: colors.onPrimaryContainer }]}>
                  {isSubmitting ? 'Saving…' : 'Save Changes'}
                </Text>
              </Pressable>
            </View>
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
  topBarInner: { height: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700' },
  contentPadding: { paddingHorizontal: 16, paddingTop: 18, flexGrow: 1 },
  maxWidth: { width: '100%', maxWidth: 500, alignSelf: 'center' },
  card: { borderWidth: 1, borderRadius: 24, padding: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#2563eb' },
  cameraBadge: { position: 'absolute', right: 0, bottom: 0, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#ffffff' },
  avatarHint: { marginTop: 8, fontSize: 12, fontWeight: '600' },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  errorText: { color: '#ba1a1a', fontSize: 12, fontWeight: '700', marginBottom: 14, textAlign: 'center' },
  statusText: { color: '#525657', fontSize: 12, fontWeight: '700', marginBottom: 14, textAlign: 'center' },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  secondaryButton: { flex: 1, borderWidth: 1, borderRadius: 999, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { fontSize: 14, fontWeight: '700' },
  primaryButton: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 999, paddingVertical: 12 },
  primaryButtonText: { fontSize: 14, fontWeight: '800' },
});

export default EditProfileScreen;
