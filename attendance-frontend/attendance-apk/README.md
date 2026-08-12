# Harmony AI Attendance - Android APK & Web Application

Production-ready dual build configuration for **Harmony AI Attendance** featuring both Web Application and Native Android APK powered by Capacitor and Node.js / Supabase PostgreSQL backend.

---

## 🚀 Applications Overview

### 1. Web Application
- **Location**: `frontend/` & `frontend/existing-web-app/`
- **Start Command**: `run_frontend.bat` (or `npm run web` inside `frontend`)
- **Web URL**: `http://localhost:8081`
- **Backend Connection**: `http://localhost:8000` (or `http://172.20.10.3:8000`)

### 2. Native Android Application (APK)
- **Location**: `attendance-apk/`
- **Capacitor Sync Command**: `npx cap sync android`
- **Debug APK Build Command**: `npm run build:apk:debug` (or `cd android && gradlew.bat assembleDebug`)
- **Release APK Build Command**: `npm run build:apk:release` (or `cd android && gradlew.bat assembleRelease`)
- **Package ID**: `com.harmony.aiattendance`
- **App Name**: `Harmony AI Attendance`

---

## 📦 APK Output Locations

- **Debug APK**: `attendance-apk/android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `attendance-apk/android/app/build/outputs/apk/release/app-release.apk`
- **Release Copy Directory**:
  - `attendance-apk/releases/harmony-attendance-debug.apk`
  - `attendance-apk/releases/harmony-attendance-release.apk`

---

## ⚡ Backend & Database Single Source of Truth

- **Backend API**: Node.js Express server running on port `8000` (`backend/server.js`)
- **Host IP for Mobile/Android**: `http://172.20.10.3:8000` (Configurable via `src/config/api.ts` or `EXPO_PUBLIC_API_URL` / `VITE_API_BASE_URL`)
- **Database**: Supabase PostgreSQL database (`db.hgtwhgnschadrwhtimne.supabase.co`)

---

## 🔒 Android Permissions & Capabilities

The Android application requests the following native permissions configured in `android/app/src/main/AndroidManifest.xml`:
- `android.permission.INTERNET`
- `android.permission.CAMERA`
- `android.permission.READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE`
- `android.permission.READ_MEDIA_IMAGES`
- Cleartext HTTP traffic enabled for local development backend IPs (`http://172.20.10.3:8000`) via `network_security_config.xml`.

---

## 📱 Features Tested & Verified

1. **JWT Authentication & Profile Management**
2. **One-Time Biometric Face Registration** (Camera capture decodes live frame & saves 128-d normalized vector to PostgreSQL `face_registrations`)
3. **Real-Time Biometric Face Verification for Punch In & Punch Out** (Cosine similarity comparison against DB embedding)
4. **Automatic Working Hours Computation**
5. **Interactive Attendance Calendar & Date Selection**
6. **Attendance Adjustments & Leave Requests**
7. **Real-Time Notifications**
8. **Responsive UI & Touch Scrolling**
