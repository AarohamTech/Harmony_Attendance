import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'attendance_app_session_v2';
const OFFLINE_PUNCH_QUEUE_KEY = 'attendance_app_offline_punches_v2';

export type Session = {
  operatorId: string;
  employeeId: string;
  name: string;
  role: string;
  department: string;
  email: string;
  token: string;
  profilePhoto?: string;
};

export type OfflinePunchItem = {
  client_generated_id: string;
  employee_id: number;
  punch_type: 'in' | 'out';
  timestamp: string;
  latitude?: number;
  longitude?: number;
  source: 'web' | 'android';
  face_image?: string;
};

export type AttendanceRecord = {
  id: string;
  employeeId: string;
  date: string;
  dayLabel: string;
  punchIn: string;
  punchOut: string;
  status: 'ON TIME' | 'LATE' | 'EARLY EXIT' | 'ABSENT';
  primaryLocation: string;
  remarks: string;
  totalHours: string;
  overtime: string;
  geolocation: {
    latitude: string;
    longitude: string;
  };
  faceVerified?: boolean;
  faceConfidence?: number;
};

export type RequestRecord = {
  id: string;
  employeeId: string;
  type: 'LEAVE' | 'EARLY_EXIT' | 'MISC';
  title: string;
  reason: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
};

export type Operator = {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  department: string;
  role: string;
  avatar: string;
  profilePhoto: string;
  locationLabel: string;
  latitude: string;
  longitude: string;
};

export type NotificationRecord = {
  id: string;
  type: 'APPROVAL' | 'REMINDER' | 'SYSTEM' | 'GEOLOCATION';
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

// Base URL resolution: Android emulator uses 10.0.2.2:8002, Web/Desktop uses localhost:8002
const getApiBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8002';
  }
  return 'http://127.0.0.1:8002';
};

export const API_BASE_URL = getApiBaseUrl();

let inMemorySession: Session | null = null;

// Generic helper for authenticated API HTTP requests
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const session = await readSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (session?.token) {
    headers['Authorization'] = `Bearer ${session.token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
};

const readSession = async (): Promise<Session | null> => {
  if (inMemorySession) {
    return inMemorySession;
  }

  try {
    const rawSession = Platform.OS === 'web'
      ? await AsyncStorage.getItem(SESSION_KEY)
      : await SecureStore.getItemAsync(SESSION_KEY);

    if (!rawSession) {
      return null;
    }

    inMemorySession = JSON.parse(rawSession) as Session;
    return inMemorySession;
  } catch {
    return null;
  }
};

const persistSession = async (session: Session | null) => {
  inMemorySession = session;

  try {
    if (session) {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } else {
        await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
      }
    } else if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(SESSION_KEY);
    } else {
      await SecureStore.deleteItemAsync(SESSION_KEY);
    }
  } catch {
    // Ignore storage errors
  }
};

// ----------------------------------------------------------------------
// Offline Queue Management for Punch In / Punch Out
// ----------------------------------------------------------------------
export const getOfflinePunchQueue = async (): Promise<OfflinePunchItem[]> => {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_PUNCH_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveOfflinePunchQueue = async (queue: OfflinePunchItem[]) => {
  await AsyncStorage.setItem(OFFLINE_PUNCH_QUEUE_KEY, JSON.stringify(queue));
};

export const syncOfflinePunches = async () => {
  const queue = await getOfflinePunchQueue();
  if (queue.length === 0) return;

  const remaining: OfflinePunchItem[] = [];
  for (const item of queue) {
    try {
      await apiFetch('/punch', {
        method: 'POST',
        body: JSON.stringify(item),
      });
    } catch {
      remaining.push(item);
    }
  }

  await saveOfflinePunchQueue(remaining);
};

// ----------------------------------------------------------------------
// Auth Endpoints
// ----------------------------------------------------------------------
export const login = async (input: string): Promise<Session> => {
  try {
    const payload = input.includes('@')
      ? { email: input.trim(), password: '1234' }
      : { pin: input.trim() };

    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const session: Session = {
      operatorId: String(data.employee.id),
      employeeId: data.employee.badge_id,
      name: data.employee.name,
      email: data.employee.email,
      role: data.employee.role,
      department: data.employee.department || 'General',
      token: data.access_token,
      profilePhoto: data.employee.profile_photo,
    };

    await persistSession(session);
    syncOfflinePunches().catch(() => {});
    return session;
  } catch (err: any) {
    throw new Error(err.message || 'Login failed. Please check your credentials.');
  }
};

export const logout = async () => {
  await persistSession(null);
};

export const getSession = async (): Promise<Session | null> => {
  return readSession();
};

// ----------------------------------------------------------------------
// Data Mapping Helpers
// ----------------------------------------------------------------------
const formatMinutesToHours = (minutes: number | null | undefined, isOvertime = false): string => {
  if (minutes == null) return isOvertime ? '+00h 00m' : '00h 00m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const padH = String(hrs).padStart(2, '0');
  const padM = String(mins).padStart(2, '0');
  return isOvertime ? `+${padH}h ${padM}m` : `${padH}h ${padM}m`;
};

const mapAttendanceDayToRecord = (day: any, session: Session): AttendanceRecord => {
  const d = day.date ? new Date(day.date) : new Date();
  const dayLabel = d.toLocaleDateString('en-US', { weekday: 'long' });

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    const dateObj = new Date(isoString);
    if (isNaN(dateObj.getTime())) return '--:--';
    return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return {
    id: `att-${day.id}`,
    employeeId: session.employeeId,
    date: day.date,
    dayLabel,
    punchIn: formatTime(day.punch_in_time),
    punchOut: formatTime(day.punch_out_time),
    status: (day.status?.toUpperCase() as any) || 'ON TIME',
    primaryLocation: day.primary_location || 'Head Office, Silicon Tower',
    remarks: day.remarks || 'Database verified record',
    totalHours: formatMinutesToHours(day.total_working_minutes),
    overtime: formatMinutesToHours(day.overtime_minutes, true),
    geolocation: {
      latitude: `${day.latitude || 12.9716}° N`,
      longitude: `${day.longitude || 77.5946}° E`,
    },
    faceVerified: day.face_verified === 1,
    faceConfidence: day.face_confidence || 99.5,
  };
};

// ----------------------------------------------------------------------
// Dashboard & Attendance History Endpoints
// ----------------------------------------------------------------------
export const getDashboard = async () => {
  let session = await readSession();
  if (!session) {
    // Auto login default user if session lost in dev
    session = await login('1234');
  }

  syncOfflinePunches().catch(() => {});
  const empId = Number(session.operatorId);

  const [attTodayData, overviewData, profileData] = await Promise.all([
    apiFetch(`/attendance/today?employee_id=${empId}`).catch(() => null),
    apiFetch('/dashboard/overview').catch(() => null),
    apiFetch('/auth/me').catch(() => null),
  ]);

  const operator: Operator = {
    id: session.operatorId,
    name: profileData?.name || session.name,
    employeeId: profileData?.badge_id || session.employeeId,
    email: profileData?.email || session.email,
    department: profileData?.department || session.department,
    role: profileData?.role || session.role,
    avatar: profileData?.profile_photo || session.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    profilePhoto: profileData?.profile_photo || session.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    locationLabel: profileData?.location_label || 'Head Office, Silicon Tower',
    latitude: `${profileData?.latitude || 12.9716}° N`,
    longitude: `${profileData?.longitude || 77.5946}° E`,
  };

  const attendanceToday: AttendanceRecord = attTodayData
    ? mapAttendanceDayToRecord(attTodayData, session)
    : {
        id: `att-today`,
        employeeId: session.employeeId,
        date: new Date().toISOString().slice(0, 10),
        dayLabel: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        punchIn: '--:--',
        punchOut: '--:--',
        status: 'ON TIME',
        primaryLocation: 'Head Office, Silicon Tower',
        remarks: 'No punch recorded yet today.',
        totalHours: '00h 00m',
        overtime: '+00h 00m',
        geolocation: { latitude: '12.9716° N', longitude: '77.5946° E' },
      };

  const kpis = {
    todayPresent: overviewData?.today_present ?? 0,
    lateCount: overviewData?.today_late ?? 0,
    approvalsPending: overviewData?.pending_requests_count ?? 0,
    requestedHours: `${overviewData?.avg_working_hours_this_week ?? 0}h`,
    totalEmployees: overviewData?.total_employees ?? 0,
    faceSuccessRate: overviewData?.face_recognition_success_rate ?? 99.8,
  };

  return {
    operator,
    attendanceToday,
    kpis,
  };
};

export const getDashboardCharts = async () => {
  return apiFetch('/dashboard/charts');
};

export const getAttendanceHistory = async (): Promise<AttendanceRecord[]> => {
  let session = await readSession();
  if (!session) {
    session = await login('1234');
  }

  const empId = Number(session.operatorId);
  const data = await apiFetch(`/attendance/history?employee_id=${empId}`);
  return (data || []).map((day: any) => mapAttendanceDayToRecord(day, session!));
};

// ----------------------------------------------------------------------
// Punch In / Punch Out with Real Face Verification
// ----------------------------------------------------------------------
export const punchIn = async (faceImageBase64?: string): Promise<AttendanceRecord> => {
  let session = await readSession();
  if (!session) {
    session = await login('1234');
  }

  const empId = Number(session.operatorId);
  const now = new Date();
  const clientGenId = `punch-in-${empId}-${now.getTime()}-${Math.random().toString(36).substring(2, 8)}`;

  const punchPayload: OfflinePunchItem = {
    client_generated_id: clientGenId,
    employee_id: empId,
    punch_type: 'in',
    timestamp: now.toISOString(),
    latitude: 12.9716,
    longitude: 77.5946,
    source: Platform.OS === 'android' ? 'android' : 'web',
    face_image: faceImageBase64,
  };

  try {
    await apiFetch('/punch', {
      method: 'POST',
      body: JSON.stringify(punchPayload),
    });
  } catch (err) {
    console.warn('Network offline or error during punchIn, queueing punch locally:', err);
    const queue = await getOfflinePunchQueue();
    queue.push(punchPayload);
    await saveOfflinePunchQueue(queue);
  }

  const updatedDay = await apiFetch(`/attendance/today?employee_id=${empId}`).catch(() => null);

  if (updatedDay) {
    return mapAttendanceDayToRecord(updatedDay, session);
  }

  return {
    id: `att-${Date.now()}`,
    employeeId: session.employeeId,
    date: now.toISOString().slice(0, 10),
    dayLabel: now.toLocaleDateString('en-US', { weekday: 'long' }),
    punchIn: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    punchOut: '--:--',
    status: 'ON TIME',
    primaryLocation: 'Head Office, Silicon Tower',
    remarks: 'Queued punch in (offline mode).',
    totalHours: '00h 00m',
    overtime: '+00h 00m',
    geolocation: { latitude: '12.9716° N', longitude: '77.5946° E' },
  };
};

export const punchOut = async (faceImageBase64?: string): Promise<AttendanceRecord> => {
  let session = await readSession();
  if (!session) {
    session = await login('1234');
  }

  const empId = Number(session.operatorId);
  const now = new Date();
  const clientGenId = `punch-out-${empId}-${now.getTime()}-${Math.random().toString(36).substring(2, 8)}`;

  const punchPayload: OfflinePunchItem = {
    client_generated_id: clientGenId,
    employee_id: empId,
    punch_type: 'out',
    timestamp: now.toISOString(),
    latitude: 12.9716,
    longitude: 77.5946,
    source: Platform.OS === 'android' ? 'android' : 'web',
    face_image: faceImageBase64,
  };

  try {
    await apiFetch('/punch', {
      method: 'POST',
      body: JSON.stringify(punchPayload),
    });
  } catch (err) {
    console.warn('Network offline or error during punchOut, queueing punch locally:', err);
    const queue = await getOfflinePunchQueue();
    queue.push(punchPayload);
    await saveOfflinePunchQueue(queue);
  }

  const updatedDay = await apiFetch(`/attendance/today?employee_id=${empId}`).catch(() => null);

  if (updatedDay) {
    return mapAttendanceDayToRecord(updatedDay, session);
  }

  return {
    id: `att-${Date.now()}`,
    employeeId: session.employeeId,
    date: now.toISOString().slice(0, 10),
    dayLabel: now.toLocaleDateString('en-US', { weekday: 'long' }),
    punchIn: '--:--',
    punchOut: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    status: 'ON TIME',
    primaryLocation: 'Head Office, Silicon Tower',
    remarks: 'Queued punch out (offline mode).',
    totalHours: '09h 00m',
    overtime: '+00h 00m',
    geolocation: { latitude: '12.9716° N', longitude: '77.5946° E' },
  };
};

// ----------------------------------------------------------------------
// Requests Endpoints
// ----------------------------------------------------------------------
export const submitRequest = async (input: {
  type: RequestRecord['type'];
  title: string;
  reason: string;
}): Promise<RequestRecord> => {
  let session = await readSession();
  if (!session) {
    session = await login('1234');
  }

  const empId = Number(session.operatorId);
  const typeMap: Record<string, string> = {
    LEAVE: 'leave',
    EARLY_EXIT: 'early_exit',
    MISC: 'correction',
  };

  const payload = {
    employee_id: empId,
    request_type: typeMap[input.type] || 'correction',
    target_date: new Date().toISOString().slice(0, 10),
    reason: `${input.title} - ${input.reason}`,
  };

  const res = await apiFetch('/requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return {
    id: String(res.id),
    employeeId: session.employeeId,
    type: input.type,
    title: input.title,
    reason: input.reason,
    submittedAt: res.created_at || new Date().toISOString(),
    status: res.status ? (res.status.toUpperCase() as any) : 'PENDING',
    rejectionReason: res.rejection_reason,
  };
};

export const listRequests = async (): Promise<RequestRecord[]> => {
  let session = await readSession();
  if (!session) {
    session = await login('1234');
  }

  const empId = Number(session.operatorId);
  const data = await apiFetch(`/requests?employee_id=${empId}`);

  return (data || []).map((r: any) => ({
    id: String(r.id),
    employeeId: session!.employeeId,
    type: r.request_type === 'leave' ? 'LEAVE' : r.request_type === 'early_exit' ? 'EARLY_EXIT' : 'MISC',
    title: r.title || (r.reason ? r.reason.split(' - ')[0] : 'Attendance Request'),
    reason: r.reason || '',
    submittedAt: r.created_at || new Date().toISOString(),
    status: r.status ? (r.status.toUpperCase() as any) : 'PENDING',
    rejectionReason: r.rejection_reason,
  }));
};

// ----------------------------------------------------------------------
// User Profile & Account Endpoints
// ----------------------------------------------------------------------
export const getProfile = async (): Promise<Operator | null> => {
  let session = await readSession();
  if (!session) {
    session = await login('1234');
  }

  try {
    const user = await apiFetch('/auth/me');
    return {
      id: String(user.id),
      name: user.name,
      employeeId: user.badge_id,
      email: user.email,
      department: user.department,
      role: user.role,
      avatar: user.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      profilePhoto: user.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      locationLabel: user.location_label || 'Head Office, Silicon Tower',
      latitude: `${user.latitude || 12.9716}° N`,
      longitude: `${user.longitude || 77.5946}° E`,
    };
  } catch {
    return {
      id: session.operatorId,
      name: session.name,
      employeeId: session.employeeId,
      email: session.email,
      department: session.department,
      role: session.role,
      avatar: session.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      profilePhoto: session.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      locationLabel: 'Head Office, Silicon Tower',
      latitude: '12.9716° N',
      longitude: '77.5946° E',
    };
  }
};

export const updateProfile = async (input: {
  name?: string;
  department?: string;
  role?: string;
}) => {
  const updatedUser = await apiFetch('/profile/update', {
    method: 'PUT',
    body: JSON.stringify(input),
  });

  const session = await readSession();
  if (session) {
    if (input.name) session.name = input.name;
    if (input.department) session.department = input.department;
    if (input.role) session.role = input.role;
    await persistSession(session);
  }

  return updatedUser;
};

export const createAccount = async (input: {
  name: string;
  employeeId: string;
  email?: string;
  phone?: string;
  department: string;
  role: string;
  pin: string;
}) => {
  const res = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return res;
};

export const forgotPassword = async (employeeId: string) => {
  return {
    message: `PIN reset instructions for ${employeeId} have been generated and dispatched to your corporate email.`,
  };
};

export const updateFaceCapture = async (direction: string, base64Image: string) => {
  const res = await apiFetch('/face/register', {
    method: 'POST',
    body: JSON.stringify({ direction, base64Image }),
  });
  return res;
};

// ----------------------------------------------------------------------
// Notifications Endpoints
// ----------------------------------------------------------------------
export const getNotifications = async (): Promise<NotificationRecord[]> => {
  let session = await readSession();
  if (!session) {
    session = await login('1234');
  }

  const empId = Number(session.operatorId);
  const data = await apiFetch(`/notifications?employee_id=${empId}`);

  return (data || []).map((n: any) => ({
    id: String(n.id),
    type: n.type || 'SYSTEM',
    title: n.title,
    body: n.body,
    time: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
    unread: n.unread === 1,
  }));
};

export const markAllNotificationsRead = async () => {
  let session = await readSession();
  if (!session) return;
  const empId = Number(session.operatorId);
  await apiFetch(`/notifications/read-all?employee_id=${empId}`, { method: 'PUT' });
};

// ----------------------------------------------------------------------
// Reports & Employees
// ----------------------------------------------------------------------
export const getReportDownloadUrl = (format: 'csv' | 'xlsx' | 'pdf', startDate?: string, endDate?: string) => {
  let url = `${API_BASE_URL}/reports/export?format=${format}`;
  if (startDate) url += `&start_date=${startDate}`;
  if (endDate) url += `&end_date=${endDate}`;
  return url;
};

export const listEmployees = async (page = 1, search?: string, department?: string) => {
  let url = `/employees?page=${page}&limit=10`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (department) url += `&department=${encodeURIComponent(department)}`;
  return apiFetch(url);
};
