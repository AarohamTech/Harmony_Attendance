import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { submitRequest } from '../api/client';
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

type NewRequestNavigationProp = StackNavigationProp<RootStackParamList, 'NewRequest'>;

const requestTypes = [
  { id: 'LATE_ARRIVAL', label: 'Late Arrival', icon: 'alarm-outline' },
  { id: 'EARLY_EXIT', label: 'Early Exit', icon: 'time-outline' },
  { id: 'MISSED_PUNCH_IN', label: 'Missed Punch In', icon: 'log-in-outline' },
  { id: 'MISSED_PUNCH_OUT', label: 'Missed Punch Out', icon: 'log-out-outline' },
  { id: 'CORRECTION', label: 'Attendance Correction', icon: 'construct-outline' },
] as const;

const NewRequestScreen = () => {
  const navigation = useNavigation<NewRequestNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [selectedType, setSelectedType] = useState<any>('LATE_ARRIVAL');
  const [title, setTitle] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!title.trim() || !reason.trim()) {
      setErrorMessage('Please provide both a title and reason for your request.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await submitRequest({
        type: selectedType,
        title: title.trim(),
        reason: reason.trim(),
      });

      navigation.navigate('AttendanceRequests');
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Failed to submit request.');
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
          <Text style={[styles.title, { color: colors.primary }]}>New Attendance Request</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.contentPadding, { paddingBottom: getBottomTabBarHeight(insets.bottom) }]}>
        <View style={styles.cardWrap}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
            <Text style={[styles.sectionHeading, { color: colors.onSurface }]}>Request Type</Text>
            <View style={styles.typesGrid}>
              {requestTypes.map((item) => {
                const isSelected = selectedType === item.id;
                return (
                  <Pressable
                    key={item.id}
                    style={[
                      styles.typeTile,
                      {
                        backgroundColor: isSelected ? colors.primaryContainer : colors.surfaceContainer,
                        borderColor: isSelected ? colors.primary : colors.outlineVariant,
                      },
                    ]}
                    onPress={() => setSelectedType(item.id)}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={22}
                      color={isSelected ? colors.onPrimaryContainer : colors.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        styles.typeText,
                        { color: isSelected ? colors.onPrimaryContainer : colors.onSurface },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.fieldWrap}>
              <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Request Title / Subject</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Doctor appointment early departure"
                placeholderTextColor={colors.outlineVariant}
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.outlineVariant, color: colors.onSurface }]}
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Detailed Reason</Text>
              <TextInput
                value={reason}
                onChangeText={setReason}
                placeholder="Explain the context or justification for this request..."
                placeholderTextColor={colors.outlineVariant}
                multiline
                numberOfLines={4}
                style={[styles.inputMultiline, { backgroundColor: colors.background, borderColor: colors.outlineVariant, color: colors.onSurface }]}
              />
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <View style={styles.actionRow}>
              <Pressable style={[styles.secondaryButton, { borderColor: colors.outlineVariant }]} onPress={() => navigation.goBack()}>
                <Text style={[styles.secondaryButtonText, { color: colors.onSurfaceVariant }]}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.primaryButton, { backgroundColor: colors.primaryContainer }]}
                onPress={() => void onSubmit()}
                disabled={isSubmitting}
              >
                <Text style={[styles.primaryButtonText, { color: colors.onPrimaryContainer }]}>
                  {isSubmitting ? 'Submitting…' : 'Submit Request'}
                </Text>
                <Ionicons name="paper-plane-outline" size={16} color={colors.onPrimaryContainer} />
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
  cardWrap: { width: '100%', maxWidth: 500, alignSelf: 'center' },
  card: { borderWidth: 1, borderRadius: 24, padding: 20 },
  sectionHeading: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  typesGrid: { gap: 10, marginBottom: 18 },
  typeTile: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 14, padding: 14 },
  typeText: { fontSize: 14, fontWeight: '700' },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  inputMultiline: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, height: 100, textAlignVertical: 'top' },
  errorText: { color: '#ba1a1a', fontSize: 12, fontWeight: '700', marginBottom: 14, textAlign: 'center' },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  secondaryButton: { flex: 1, borderWidth: 1, borderRadius: 999, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { fontSize: 14, fontWeight: '700' },
  primaryButton: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, paddingVertical: 12 },
  primaryButtonText: { fontSize: 14, fontWeight: '800' },
});

export default NewRequestScreen;
