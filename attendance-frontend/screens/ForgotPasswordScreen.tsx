import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { forgotPassword } from '../api/client';
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

type ForgotPasswordScreenNavigation = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigation>();
  const { colors } = useTheme();
  const [employeeId, setEmployeeId] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onReset = async () => {
    setErrorMessage(null);
    setMessage(null);

    if (!employeeId.trim()) {
      setErrorMessage('Please enter your Employee Code or Email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await forgotPassword(employeeId.trim());
      setMessage(result.message);
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Unable to reset password.');
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
          <Text style={[styles.title, { color: colors.primary }]}>Forgot Password</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentPadding} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={true}> 
        <View style={styles.cardWrap}> 
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}> 
            <Ionicons name="key-outline" size={48} color={colors.primary} style={{ marginBottom: 14 }} />
            <Text style={[styles.heading, { color: colors.onSurface }]}>Reset your access</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>Enter your registered Employee Code or Email address to reset your PIN/password.</Text>

            <View style={styles.fieldWrap}>
              <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Employee Code or Email</Text>
              <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.outlineVariant }]}> 
                <Ionicons name="person-outline" size={18} color={colors.onSurfaceVariant} />
                <TextInput
                  value={employeeId}
                  onChangeText={setEmployeeId}
                  placeholder="e.g. EMP101 or alice@company.com"
                  placeholderTextColor={colors.outlineVariant}
                  style={[styles.input, { color: colors.onSurface }]}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <Pressable style={[styles.primaryButton, { backgroundColor: colors.primaryContainer }]} onPress={() => void onReset()} disabled={isSubmitting}>
              <Text style={[styles.primaryButtonText, { color: colors.onPrimaryContainer }]}>{isSubmitting ? 'Sending…' : 'Send Reset Info'}</Text>
            </Pressable>

            {message ? <Text style={[styles.successText, { color: colors.green }]}>{message}</Text> : null}
            {errorMessage ? <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text> : null}

            <Pressable style={styles.secondaryAction} onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.secondaryActionText, { color: colors.primary }]}>Back to Login</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, height: '100%', minHeight: 0 },
  scrollView: { flex: 1, minHeight: 0 },
  topBar: { flexShrink: 0, borderBottomWidth: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  topBarInner: { height: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700' },
  contentPadding: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40, flexGrow: 1, justifyContent: 'center' },
  cardWrap: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  card: { borderWidth: 1, borderRadius: 24, padding: 20, alignItems: 'center' },
  logo: { width: 72, height: 72, borderRadius: 16, marginBottom: 14 },
  heading: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  subtitle: { marginTop: 4, marginBottom: 18, textAlign: 'center', fontSize: 14, fontWeight: '600' },
  fieldWrap: { width: '100%', marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, gap: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16 },
  primaryButton: { width: '100%', borderRadius: 999, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { fontSize: 15, fontWeight: '800' },
  secondaryAction: { marginTop: 14 },
  secondaryActionText: { fontSize: 13, fontWeight: '700' },
  successText: { marginTop: 12, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  errorText: { marginTop: 12, fontSize: 12, fontWeight: '700', textAlign: 'center' },
});

export default ForgotPasswordScreen;
