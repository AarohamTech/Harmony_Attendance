import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { login } from '../api/client';
import { useTheme } from '../theme/ThemeContext';

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

type LoginScreenNavigation = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigation>();
  const { colors } = useTheme();
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    const checkTokenOnStart = async () => {
      const { getSession, getProfile } = require('../api/client');
      const session = await getSession();
      if (session?.token) {
        try {
          await getProfile();
          navigation.navigate('EmployeeDashboard');
        } catch {
          // Token expired or server unreachable
        }
      }
    };
    void checkTokenOnStart();
  }, []);

  const onLogin = async () => {
    if (!credential.trim()) {
      setErrorMessage('Please enter your PIN, employee ID, or registered email address.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login(credential.trim(), password.trim() || undefined);
      navigation.navigate('EmployeeDashboard');
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Unable to sign in. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.bgOrbOne} />
      <View style={styles.bgOrbTwo} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: `${colors.surface}EE`, borderColor: colors.outlineVariant }]}>
          <View style={[styles.logoWrap, { backgroundColor: colors.primaryContainer }]}>
            <Ionicons name="shield-checkmark" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.onSurface }]}>Harmony AI Attendance</Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>Secure Biometric & Cloud HRMS Portal</Text>

          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Employee Code or Email</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <Ionicons name="person-outline" size={18} color={colors.onSurfaceVariant} />
              <TextInput
                value={credential}
                onChangeText={setCredential}
                placeholder="e.g. EMP101 or alice@company.com"
                placeholderTextColor={colors.outlineVariant}
                style={[styles.input, { color: colors.onSurface }]}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Password or PIN</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.onSurfaceVariant} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password / PIN (Default: 1234)"
                placeholderTextColor={colors.outlineVariant}
                style={[styles.input, { color: colors.onSurface }]}
                secureTextEntry
              />
            </View>
          </View>

          <Pressable style={styles.forgotLink} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot Password / PIN?</Text>
          </Pressable>

          <Pressable
            onPress={() => void onLogin()}
            style={[styles.primaryButton, { backgroundColor: colors.primaryContainer }]}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.onPrimaryContainer} />
            ) : (
              <>
                <Text style={[styles.primaryButtonText, { color: colors.onPrimaryContainer }]}>Sign In</Text>
                <Ionicons name="log-in-outline" size={18} color={colors.onPrimaryContainer} />
              </>
            )}
          </Pressable>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: colors.onSurfaceVariant }]}>Don&apos;t have an account?</Text>
            <Pressable onPress={() => navigation.navigate('CreateEmployeeAccount')}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>Register Employee</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, position: 'relative' },
  scrollView: { flex: 1, width: '100%' },
  scrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  bgOrbOne: { position: 'absolute', top: -80, left: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: '#dbe1ff', opacity: 0.5 },
  bgOrbTwo: { position: 'absolute', right: -100, bottom: -100, width: 320, height: 320, borderRadius: 160, backgroundColor: '#d0e1fb', opacity: 0.45 },
  card: { width: '100%', maxWidth: 420, borderWidth: 1, borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 18, elevation: 4 },
  logoWrap: { width: 68, height: 68, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 13, marginTop: 4, marginBottom: 24, textAlign: 'center', fontWeight: '600' },
  fieldWrap: { width: '100%', marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 6, letterSpacing: 0.3 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, gap: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15 },
  forgotLink: { alignSelf: 'flex-end', marginBottom: 18 },
  forgotText: { fontSize: 12, fontWeight: '700' },
  primaryButton: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, paddingVertical: 14, elevation: 2 },
  primaryButtonText: { fontSize: 15, fontWeight: '800', letterSpacing: 0.4 },
  errorText: { marginTop: 14, color: '#ba1a1a', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  footerRow: { marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 13 },
  footerLink: { fontSize: 13, fontWeight: '700' },
});

export default LoginScreen;
