import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { createAccount } from '../api/client';
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

type CreateEmployeeAccountScreenNavigation = StackNavigationProp<RootStackParamList, 'CreateEmployeeAccount'>;

const CreateEmployeeAccountScreen = () => {
  const navigation = useNavigation<CreateEmployeeAccountScreenNavigation>();
  const { colors } = useTheme();

  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('Employee');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onRegister = async () => {
    setErrorMessage(null);

    if (!name.trim() || !employeeId.trim() || !email.trim() || !phone.trim() || !pin.trim() || !confirmPin.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (pin.trim() !== confirmPin.trim()) {
      setErrorMessage('PINs do not match.');
      return;
    }

    if (!agreeToTerms) {
      setErrorMessage('Please accept the terms and conditions to continue.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createAccount({
        name: name.trim(),
        employeeId: employeeId.trim(),
        department: department.trim() || 'Engineering',
        role: role.trim() || 'Employee',
        pin: pin.trim(),
      });

      navigation.navigate('Login');
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Unable to create employee account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.headerWrap}>
          <Pressable style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Enrollment</Text>
        </View>

        <View style={styles.heroWrap}>
          <Text style={[styles.heroTitle, { color: colors.onSurface }]}>Create Employee Account</Text>
          <Text style={[styles.heroSubtitle, { color: colors.onSurfaceVariant }]}>One-Time Registration</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}> 
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Full Name</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.outlineVariant }]}> 
              <Ionicons name="person-outline" size={18} color={colors.onSurfaceVariant} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor={colors.outlineVariant}
                style={[styles.input, { color: colors.onSurface }]}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Employee ID</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.outlineVariant }]}> 
              <Ionicons name="id-card-outline" size={18} color={colors.onSurfaceVariant} />
              <TextInput
                value={employeeId}
                onChangeText={setEmployeeId}
                placeholder="Employee ID"
                placeholderTextColor={colors.outlineVariant}
                style={[styles.input, { color: colors.onSurface }]}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Email Address</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.outlineVariant }]}> 
              <Ionicons name="mail-outline" size={18} color={colors.onSurfaceVariant} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="work@company.com"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholderTextColor={colors.outlineVariant}
                style={[styles.input, { color: colors.onSurface }]}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Phone Number</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.outlineVariant }]}> 
              <Ionicons name="call-outline" size={18} color={colors.onSurfaceVariant} />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+1..."
                keyboardType="phone-pad"
                placeholderTextColor={colors.outlineVariant}
                style={[styles.input, { color: colors.onSurface }]}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Department</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.outlineVariant }]}> 
              <Ionicons name="business-outline" size={18} color={colors.onSurfaceVariant} />
              <TextInput
                value={department}
                onChangeText={setDepartment}
                placeholder="Engineering"
                placeholderTextColor={colors.outlineVariant}
                style={[styles.input, { color: colors.onSurface }]}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Role</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.outlineVariant }]}> 
              <Ionicons name="briefcase-outline" size={18} color={colors.onSurfaceVariant} />
              <TextInput
                value={role}
                onChangeText={setRole}
                placeholder="Employee"
                placeholderTextColor={colors.outlineVariant}
                style={[styles.input, { color: colors.onSurface }]}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Password / Demo PIN</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.outlineVariant }]}> 
              <Ionicons name="lock-closed-outline" size={18} color={colors.onSurfaceVariant} />
              <TextInput
                value={pin}
                onChangeText={setPin}
                placeholder="••••••••"
                secureTextEntry
                placeholderTextColor={colors.outlineVariant}
                style={[styles.input, { color: colors.onSurface }]}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Confirm Password / PIN</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.outlineVariant }]}> 
              <Ionicons name="lock-closed-outline" size={18} color={colors.onSurfaceVariant} />
              <TextInput
                value={confirmPin}
                onChangeText={setConfirmPin}
                placeholder="••••••••"
                secureTextEntry
                placeholderTextColor={colors.outlineVariant}
                style={[styles.input, { color: colors.onSurface }]}
              />
            </View>
          </View>

          <Pressable
            style={styles.termsRow}
            onPress={() => setAgreeToTerms((prev) => !prev)}
          >
            <View style={[styles.checkbox, { borderColor: colors.outlineVariant, backgroundColor: agreeToTerms ? colors.primary : 'transparent' }]}>
              {agreeToTerms ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}
            </View>
            <Text style={[styles.termsText, { color: colors.onSurfaceVariant }]}>I agree to the Terms & Conditions and understand how my data is managed by the corporate HRMS system.</Text>
          </Pressable>

          {errorMessage ? <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text> : null}

          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primaryContainer }]}
            onPress={() => void onRegister()}
            disabled={isSubmitting}
          >
            <Text style={[styles.primaryButtonText, { color: colors.onPrimaryContainer }]}>{isSubmitting ? 'Registering…' : 'Register'}</Text>
            <Ionicons name="create-outline" size={18} color={colors.onPrimaryContainer} />
          </Pressable>
        </View>

        <Pressable style={styles.secondaryAction} onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.secondaryActionText, { color: colors.primary }]}>Already have an account? Sign In</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 60, flexGrow: 1 },
  headerWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  iconButton: { width: 40, height: 40, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  heroWrap: { alignItems: 'center', marginBottom: 20 },
  heroTitle: { fontSize: 28, fontWeight: '800', textAlign: 'center' },
  heroSubtitle: { marginTop: 4, fontSize: 14, fontWeight: '600' },
  card: { borderWidth: 1, borderRadius: 24, padding: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 6, letterSpacing: 0.4 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, gap: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 4, marginBottom: 14 },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderRadius: 5, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  termsText: { flex: 1, fontSize: 13, lineHeight: 18 },
  primaryButton: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 999 },
  primaryButtonText: { fontSize: 15, fontWeight: '800' },
  errorText: { fontSize: 12, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  secondaryAction: { marginTop: 18, alignItems: 'center' },
  secondaryActionText: { fontSize: 13, fontWeight: '700' },
});

export default CreateEmployeeAccountScreen;
