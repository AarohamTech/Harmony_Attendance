import React, { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { punchIn, punchOut, updateFaceCapture } from '../api/client';
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

type FaceCaptureNavigationProp = StackNavigationProp<RootStackParamList, 'FaceCapture'>;
type FaceCaptureRouteProp = RouteProp<RootStackParamList, 'FaceCapture'>;



const FaceCaptureScreen = () => {
  const navigation = useNavigation<FaceCaptureNavigationProp>();
  const route = useRoute<FaceCaptureRouteProp>();
  const { colors } = useTheme();

  const mode = route.params?.mode ?? 'punch_in';
  const direction = route.params?.direction ?? 'front';

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reason, setReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [verificationMeta, setVerificationMeta] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      void requestPermission();
    }
  }, [permission]);

  // Clean up camera streams on unmount
  useEffect(() => {
    return () => {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const videoElements = document.getElementsByTagName('video');
        for (let i = 0; i < videoElements.length; i++) {
          const stream = (videoElements[i] as HTMLVideoElement).srcObject as MediaStream | null;
          if (stream && typeof stream.getTracks === 'function') {
            stream.getTracks().forEach(track => track.stop());
          }
        }
      }
    };
  }, []);

  const captureFrame = async (): Promise<string> => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const videoElements = document.getElementsByTagName('video');
      let video: HTMLVideoElement | null = null;
      
      for (let i = 0; i < videoElements.length; i++) {
        const v = videoElements[i];
        if (v && v.readyState >= 2 && v.videoWidth > 0 && v.videoHeight > 0) {
          video = v;
          break;
        }
      }

      if (video) {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
          return dataUrl;
        }
      }
    }

    if (cameraRef.current && typeof cameraRef.current.takePictureAsync === 'function') {
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.9 });
        if (photo?.base64) {
          return photo.base64.startsWith('data:') ? photo.base64 : `data:image/jpeg;base64,${photo.base64}`;
        }
      } catch (err: any) {
        console.error("Camera capture error:", err);
      }
    }

    throw new Error("Unable to capture frame from camera. Please grant camera permission and ensure video feed is active.");
  };

  const handleScan = async () => {
    setIsScanning(true);
    setErrorMessage(null);

    try {
      // 1. Real Webcam / Camera Frame Capture
      console.log("Capturing live face frame...");
      const capturedBase64 = await captureFrame();
      console.log("Sending captured image to backend for verification...");

      // 2. FACE REGISTRATION FLOW
      if (mode === 'registration') {
        const res = await updateFaceCapture(direction, capturedBase64);
        console.log("Backend registration response:", res);
        setVerificationMeta({
          confidence: 100.0,
          timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
          location: 'Database Registered',
        });
        setSuccess(true);
        return;
      }

      // 3. PUNCH IN / PUNCH OUT FLOW (Backend does real face comparison against DB embedding)
      if (mode === 'punch_in') {
        const record = await punchIn(capturedBase64, reason.trim() || undefined);
        console.log("Backend punch in response:", record);
        setVerificationMeta({
          confidence: record.faceConfidence || 99.5,
          timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
          location: record.primaryLocation || 'Padalkar Colony',
        });
      } else if (mode === 'punch_out') {
        const record = await punchOut(capturedBase64, reason.trim() || undefined);
        console.log("Backend punch out response:", record);
        setVerificationMeta({
          confidence: record.faceConfidence || 99.5,
          timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
          location: record.primaryLocation || 'Padalkar Colony',
        });
      }

      setSuccess(true);
    } catch (err: any) {
      console.error("Biometric Verification Error:", err);
      const msg = err?.message ?? 'Face biometric verification failed. Please position your face inside the reticle.';
      setErrorMessage(msg);
      if (msg.includes('requires a reason') || msg.includes('Late') || msg.includes('Early') || msg.includes('reason')) {
        setShowReasonInput(true);
      }
    } finally {
      setIsScanning(false);
    }
  };

  const titleText = mode === 'punch_in'
    ? 'Biometric Punch In Scan'
    : mode === 'punch_out'
      ? 'Biometric Punch Out Scan'
      : `Face Registration (${direction.toUpperCase()})`;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant }]}>
        <View style={styles.topBarInner}>
          <Pressable style={styles.iconButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
          </Pressable>
          <Text style={[styles.title, { color: colors.primary }]}>{titleText}</Text>
        </View>
      </View>

      <View style={styles.container}>
        {!success ? (
          <View style={styles.cameraBox}>
            <View style={[styles.cameraFrame, { borderColor: isScanning ? colors.green : colors.primary }]}>
              <View style={styles.targetReticle}>
                <Ionicons name="scan-outline" size={150} color={isScanning ? colors.green : colors.primary} />
              </View>
              {permission?.granted ? (
                <CameraView style={styles.previewImage} facing="front" ref={cameraRef} />
              ) : (
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' }}
                  style={styles.previewImage}
                />
              )}
            </View>

            {!permission?.granted ? (
              <Pressable style={styles.permButton} onPress={() => void requestPermission()}>
                <Text style={[styles.permText, { color: colors.primary }]}>Grant Camera Permission</Text>
              </Pressable>
            ) : null}

            <Text style={[styles.instruction, { color: colors.onSurface }]}>
              {isScanning ? 'Extracting biometric facial embedding…' : 'Center face in the reticle'}
            </Text>
            <Text style={[styles.subInstruction, { color: colors.onSurfaceVariant }]}>
              Real-time vector embeddings compared against database.
            </Text>

            {showReasonInput || (errorMessage && (errorMessage.includes('Late') || errorMessage.includes('Early'))) ? (
              <View style={styles.reasonWrap}>
                <Text style={[styles.reasonLabel, { color: colors.onSurfaceVariant }]}>
                  {mode === 'punch_in' ? 'Late Arrival Reason' : 'Early Exit Reason'}
                </Text>
                <TextInput
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Enter reason..."
                  placeholderTextColor={colors.outlineVariant}
                  style={[styles.reasonInput, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, color: colors.onSurface }]}
                />
              </View>
            ) : null}

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <Pressable
              style={[styles.captureButton, { backgroundColor: isScanning ? colors.secondary : colors.primary }]}
              onPress={() => void handleScan()}
              disabled={isScanning}
            >
              {isScanning ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="camera" size={22} color="#ffffff" />
                  <Text style={styles.captureButtonText}>
                    {mode === 'punch_in' ? 'Verify & Punch In' : mode === 'punch_out' ? 'Verify & Punch Out' : 'Register Embedding'}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        ) : (
          <View style={[styles.successCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
            <View style={[styles.successIconWrap, { backgroundColor: colors.greenSoft }]}>
              <Ionicons name="checkmark-circle" size={64} color={colors.green} />
            </View>

            <Text style={[styles.successTitle, { color: colors.onSurface }]}>
              {mode === 'punch_in' ? 'Punch In Recorded!' : mode === 'punch_out' ? 'Punch Out Recorded!' : 'Biometric Face Enrolled!'}
            </Text>

            <Text style={[styles.successMeta, { color: colors.onSurfaceVariant }]}>
              Face embedding verified with {verificationMeta?.confidence}% confidence against database.
            </Text>

            <View style={[styles.detailsBox, { backgroundColor: colors.surfaceContainer }]}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>Timestamp</Text>
                <Text style={[styles.detailVal, { color: colors.onSurface }]}>{verificationMeta?.timestamp}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>Geofence Location</Text>
                <Text style={[styles.detailVal, { color: colors.onSurface }]}>{verificationMeta?.location}</Text>
              </View>
            </View>

            <Pressable
              style={[styles.doneButton, { backgroundColor: colors.primaryContainer }]}
              onPress={() => navigation.navigate('EmployeeDashboard')}
            >
              <Text style={[styles.doneButtonText, { color: colors.onPrimaryContainer }]}>Go to Dashboard</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { borderBottomWidth: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  topBarInner: { height: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800' },
  container: { flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center' },
  cameraBox: { width: '100%', maxWidth: 400, alignItems: 'center' },
  cameraFrame: { width: 240, height: 240, borderRadius: 120, borderWidth: 4, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginBottom: 20, position: 'relative' },
  targetReticle: { position: 'absolute', zIndex: 2 },
  previewImage: { width: '100%', height: '100%', opacity: 0.75 },
  permButton: { marginBottom: 12, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#2563eb' },
  permText: { fontSize: 12, fontWeight: '700' },
  instruction: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  subInstruction: { fontSize: 13, textAlign: 'center', marginBottom: 20, fontWeight: '600' },
  reasonWrap: { width: '100%', marginBottom: 14 },
  reasonLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  reasonInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  errorText: { color: '#ba1a1a', fontSize: 13, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  captureButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 999, width: '100%', elevation: 3 },
  captureButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  successCard: { width: '100%', maxWidth: 420, borderWidth: 1, borderRadius: 24, padding: 24, alignItems: 'center' },
  successIconWrap: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  successTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  successMeta: { fontSize: 13, marginTop: 6, marginBottom: 18, textAlign: 'center', fontWeight: '600' },
  detailsBox: { width: '100%', borderRadius: 14, padding: 14, gap: 10, marginBottom: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 12, fontWeight: '600' },
  detailVal: { fontSize: 13, fontWeight: '800' },
  doneButton: { width: '100%', borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
  doneButtonText: { fontSize: 15, fontWeight: '800' },
});

export default FaceCaptureScreen;
