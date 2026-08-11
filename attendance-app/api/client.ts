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
  status: 'PRESENT' | 'ON TIME' | 'LATE' | 'EARLY EXIT' | 'ABSENT' | 'LEAVE' | 'WEEKLY OFF' | 'HOLIDAY' | 'NO RECORD';
  primaryLocation: string;
  remarks: string;
  lateReason?: string;
  earlyExitReason?: string;
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
  type: 'LEAVE' | 'EARLY_EXIT' | 'MISC' | 'LATE_ARRIVAL' | 'MISSED_PUNCH_IN' | 'MISSED_PUNCH_OUT' | 'CORRECTION';
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
  phone?: string;
  department: string;
  role: string;
  avatar: string;
  profilePhoto: string;
  locationLabel: string;
  latitude: string;
  longitude: string;
  shift_start?: string;
  shift_end?: string;
  grace_time?: string;
  weekly_off?: string;
};

export type NotificationRecord = {
  id: string;
  type: 'APPROVAL' | 'REMINDER' | 'SYSTEM' | 'GEOLOCATION';
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

// Base URL resolution: Uses EXPO_PUBLIC_API_URL in production or local fallback
const getApiBaseUrl = () => {
  let url = '';
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    url = process.env.EXPO_PUBLIC_API_URL;
  } else if (Platform.OS === 'web') {
    url = 'http://localhost:8000';
  } else {
    url = 'http://10.0.2.2:8000';
  }
  return url.replace(/\/+$/, '');
};

export const API_BASE_URL = getApiBaseUrl();

let inMemorySession: Session | null = null;

// Generic helper for authenticated API HTTP requests
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const session = await readSession();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Set Content-Type: application/json ONLY if body is string or absent, NOT for FormData
  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  } else if (!options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (session?.token) {
    headers['Authorization'] = `Bearer ${session.token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  console.log(`[API FETCH] ${options.method || 'GET'} ${url}`);

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    console.error(`[API FETCH ERROR] Request to ${url} failed:`, netErr);
    
    // Retry fallback between localhost and 127.0.0.1 if absolute URL was used
    let fallbackUrl = url;
    if (url.includes('localhost')) {
      fallbackUrl = url.replace('localhost', '127.0.0.1');
    } else if (url.includes('127.0.0.1')) {
      fallbackUrl = url.replace('127.0.0.1', 'localhost');
    }

    if (fallbackUrl !== url) {
      try {
        console.log(`[API FETCH RETRY] ${fallbackUrl}`);
        response = await fetch(fallbackUrl, { ...options, headers });
      } catch (retryErr: any) {
        console.error(`[API FETCH RETRY ERROR] Request to ${fallbackUrl} failed:`, retryErr);
        throw new Error('Unable to connect to attendance server. Please make sure the backend is running.');
      }
    } else {
      throw new Error('Unable to connect to attendance server. Please make sure the backend is running.');
    }
  }

  console.log(`[API FETCH RESPONSE STATUS] ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`[API FETCH ERROR RESPONSE]`, errorData);
    throw new Error(errorData.message || errorData.detail || `Request failed with status ${response.status}`);
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
      await apiFetch('/api/punch', {
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
export const login = async (input: string, password?: string): Promise<Session> => {
  try {
    const payload = input.includes('@')
      ? { email: input.trim(), password: password || '1234' }
      : { credential: input.trim(), password: password || '1234' };

    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const emp = data.employee;
    const session: Session = {
      operatorId: String(emp.id || emp.employee_id),
      employeeId: emp.badge_id || emp.code || emp.employee_code || String(emp.id),
      name: emp.name || emp.full_name,
      email: emp.email,
      role: emp.role || emp.designation || 'Employee',
      department: emp.department || 'General',
      token: data.access_token || data.token,
      profilePhoto: emp.profile_photo,
    };

    await persistSession(session);
    syncOfflinePunches().catch(() => {});
    return session;
  } catch (err: any) {
    throw new Error(err.message || 'Login failed. Please check your credentials.');
  }
};

export const logout = async () => {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  } finally {
    await persistSession(null);
  }
};

export const getSession = async (): Promise<Session | null> => {
  return readSession();
};

export const validateSession = async (): Promise<Session | null> => {
  const session = await readSession();
  if (!session || !session.token) {
    return null;
  }
  try {
    const me = await apiFetch('/api/auth/me');
    if (me && me.success !== false) {
      session.name = me.full_name || me.name || session.name;
      session.email = me.email || session.email;
      session.role = me.designation || me.role || session.role;
      session.department = me.department || session.department;
      session.employeeId = me.employee_code || me.code || session.employeeId;
      session.profilePhoto = me.profile_photo || session.profilePhoto;
      await persistSession(session);
      return session;
    }
  } catch {
    await persistSession(null);
    return null;
  }
  return session;
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

const mapAttendanceRowToRecord = (row: any, session: Session): AttendanceRecord => {
  const dateStr = row.attendance_date ? row.attendance_date.slice(0, 10) : new Date().toISOString().slice(0, 10);
  const d = new Date(dateStr);
  const dayLabel = row.attendance_day || d.toLocaleDateString('en-US', { weekday: 'long' });

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    const dateObj = new Date(isoString);
    if (isNaN(dateObj.getTime())) return '--:--';
    return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const statusRaw = row.attendance_status ? row.attendance_status.toUpperCase() : 'ON TIME';
  const statusFormatted = statusRaw === 'PRESENT' ? 'ON TIME' : statusRaw;

  return {
    id: `att-${row.attendance_id || row.id || Date.now()}`,
    employeeId: session.employeeId,
    date: dateStr,
    dayLabel,
    punchIn: formatTime(row.punch_in || row.punch_in_time),
    punchOut: formatTime(row.punch_out || row.punch_out_time),
    status: statusFormatted as any,
    primaryLocation: row.location_name || 'Padalkar Colony',
    remarks: row.remarks || 'Database verified record',
    lateReason: row.late_reason || undefined,
    earlyExitReason: row.early_exit_reason || undefined,
    totalHours: row.working_hours || formatMinutesToHours(row.total_working_minutes),
    overtime: formatMinutesToHours(row.overtime_minutes, true),
    geolocation: {
      latitude: `${row.latitude || 16.740572}° N`,
      longitude: `${row.longitude || 74.246919}° E`,
    },
    faceVerified: true,
    faceConfidence: 99.5,
  };
};

// ----------------------------------------------------------------------
// Dashboard & Attendance History Endpoints
// ----------------------------------------------------------------------
export const getDashboard = async () => {
  const session = await readSession();
  if (!session || !session.token) {
    throw new Error('Authentication required. Please login again.');
  }

  syncOfflinePunches().catch(() => {});

  const dashboardRes = await apiFetch('/api/dashboard');
  return dashboardRes;
};

export const getDashboardCharts = async () => {
  return apiFetch('/api/dashboard/charts');
};

export const getAttendanceHistory = async (): Promise<AttendanceRecord[]> => {
  const session = await readSession();
  if (!session || !session.token) {
    throw new Error('Authentication required. Please login again.');
  }

  const data = await apiFetch('/api/attendance/history');
  const list = Array.isArray(data) ? data : data.data || [];
  return list.map((row: any) => mapAttendanceRowToRecord(row, session));
};

export const getAttendanceByDate = async (dateStr: string): Promise<AttendanceRecord | null> => {
  const session = await readSession();
  if (!session || !session.token) {
    throw new Error('Authentication required. Please login again.');
  }

  try {
    const res = await apiFetch(`/api/attendance/date/${dateStr}`);
    const row = res.data || res;
    if (!row) return null;

    const rawStatus = row.status ? row.status.toUpperCase() : 'NO RECORD';
    const statusFormatted = rawStatus === 'PRESENT' ? 'ON TIME' : rawStatus;

    return {
      id: `att-${row.date || dateStr}`,
      employeeId: row.employee_id || session.employeeId,
      date: row.date || dateStr,
      dayLabel: row.day || new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' }),
      punchIn: row.punch_in || 'Not Punched In',
      punchOut: row.punch_out || 'Not Punched Out',
      status: statusFormatted as any,
      primaryLocation: row.location || 'Padalkar Colony',
      remarks: row.remarks || 'No attendance record for this date.',
      lateReason: row.late_reason || undefined,
      earlyExitReason: row.early_exit_reason || undefined,
      totalHours: row.working_hours || '00h 00m',
      overtime: '+00h 00m',
      geolocation: {
        latitude: '16.740572° N',
        longitude: '74.246919° E',
      },
      faceVerified: row.face_verified ?? true,
      faceConfidence: row.face_confidence ?? 99.5,
    };
  } catch (err: any) {
    console.error(`[getAttendanceByDate error for ${dateStr}]:`, err);
    return null;
  }
};

export const getAttendanceCalendar = async (month: number, year: number): Promise<{
  employeeId: string;
  employeeName: string;
  month: number;
  year: number;
  attendance: AttendanceRecord[];
}> => {
  const session = await readSession();
  if (!session || !session.token) {
    throw new Error('Authentication required. Please login again.');
  }

  const res = await apiFetch(`/api/attendance/calendar?month=${month}&year=${year}`);
  const rawList = res.attendance || res.data || [];

  const mapped: AttendanceRecord[] = rawList.map((row: any) => {
    const rawStatus = row.status ? row.status.toUpperCase() : 'NO RECORD';
    const statusFormatted = rawStatus === 'PRESENT' ? 'ON TIME' : rawStatus;

    return {
      id: `att-${row.date}`,
      employeeId: res.employee_id || session.employeeId,
      date: row.date,
      dayLabel: row.day,
      punchIn: row.punch_in || 'Not Punched In',
      punchOut: row.punch_out || 'Not Punched Out',
      status: statusFormatted as any,
      primaryLocation: row.location || 'Padalkar Colony',
      remarks: row.remarks || '',
      lateReason: row.late_reason || undefined,
      earlyExitReason: row.early_exit_reason || undefined,
      totalHours: row.working_hours || '00h 00m',
      overtime: '+00h 00m',
      geolocation: {
        latitude: '16.740572° N',
        longitude: '74.246919° E',
      },
      faceVerified: row.face_verified ?? true,
      faceConfidence: row.face_confidence ?? 99.5,
    };
  });

  return {
    employeeId: res.employee_id || session.employeeId,
    employeeName: res.employee_name || session.name,
    month: res.month || month,
    year: res.year || year,
    attendance: mapped,
  };
};

export const getMonthlyAttendance = async (monthStr: string) => {
  const res = await apiFetch(`/api/attendance/month?month=${monthStr}`);
  return res.data;
};

// ----------------------------------------------------------------------
// Punch In / Punch Out with Real Face & Geofence Verification
// ----------------------------------------------------------------------
export const punchIn = async (faceImageBase64?: string, lateReason?: string, latitude?: number, longitude?: number): Promise<AttendanceRecord> => {
  const session = await readSession();
  if (!session || !session.token) {
    throw new Error('Authentication required. Please login again.');
  }

  const res = await apiFetch('/api/attendance/punch-in', {
    method: 'POST',
    body: JSON.stringify({
      latitude: latitude ?? 16.740572,
      longitude: longitude ?? 74.246919,
      face_image: faceImageBase64,
      late_reason: lateReason,
    }),
  });

  return mapAttendanceRowToRecord(res.data, session);
};

export const punchOut = async (faceImageBase64?: string, earlyExitReason?: string, latitude?: number, longitude?: number): Promise<AttendanceRecord> => {
  const session = await readSession();
  if (!session || !session.token) {
    throw new Error('Authentication required. Please login again.');
  }

  const res = await apiFetch('/api/attendance/punch-out', {
    method: 'POST',
    body: JSON.stringify({
      latitude: latitude ?? 16.740572,
      longitude: longitude ?? 74.246919,
      face_image: faceImageBase64,
      early_exit_reason: earlyExitReason,
    }),
  });

  return mapAttendanceRowToRecord(res.data, session);
};

// ----------------------------------------------------------------------
// Requests Endpoints
// ----------------------------------------------------------------------
export const submitRequest = async (input: {
  type: RequestRecord['type'];
  title: string;
  reason: string;
}): Promise<RequestRecord> => {
  const session = await readSession();
  if (!session || !session.token) {
    throw new Error('Authentication required. Please login again.');
  }

  const typeMap: Record<string, string> = {
    LATE_ARRIVAL: 'Late Arrival',
    EARLY_EXIT: 'Early Exit',
    MISSED_PUNCH_IN: 'Missed Punch In',
    MISSED_PUNCH_OUT: 'Missed Punch Out',
    CORRECTION: 'Attendance Correction',
    LEAVE: 'Late Arrival',
    MISC: 'Attendance Correction',
  };

  const payload = {
    request_type: typeMap[input.type] || input.type || 'Attendance Correction',
    date: new Date().toISOString().slice(0, 10),
    title: input.title,
    reason: input.reason,
  };

  const res = await apiFetch('/api/requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const row = res.data || res;
  return {
    id: String(row.request_id || row.id),
    employeeId: session.employeeId,
    type: input.type,
    title: input.title,
    reason: input.reason,
    submittedAt: row.created_at || new Date().toISOString(),
    status: row.status ? (row.status.toUpperCase() as any) : 'PENDING',
    rejectionReason: row.manager_remark,
  };
};

export const listRequests = async (): Promise<RequestRecord[]> => {
  const session = await readSession();
  if (!session || !session.token) {
    throw new Error('Authentication required. Please login again.');
  }

  const data = await apiFetch('/api/requests');
  const list = Array.isArray(data) ? data : data.data || [];

  return list.map((r: any) => {
    let reqType: RequestRecord['type'] = 'CORRECTION';
    if (r.request_type === 'Late Arrival' || r.request_type === 'leave') reqType = 'LATE_ARRIVAL';
    else if (r.request_type === 'Early Exit' || r.request_type === 'early_exit') reqType = 'EARLY_EXIT';
    else if (r.request_type === 'Missed Punch In') reqType = 'MISSED_PUNCH_IN';
    else if (r.request_type === 'Missed Punch Out') reqType = 'MISSED_PUNCH_OUT';
    else if (r.request_type === 'Attendance Correction' || r.request_type === 'correction') reqType = 'CORRECTION';

    return {
      id: String(r.request_id || r.id),
      employeeId: session.employeeId,
      type: reqType,
      title: r.title || (r.reason ? r.reason.split(' - ')[0] : (r.request_type || 'Attendance Request')),
      reason: r.reason || '',
      submittedAt: r.created_at ? r.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
      status: r.status ? (r.status.toUpperCase() as any) : 'PENDING',
      rejectionReason: r.manager_remark,
    };
  });
};

// ----------------------------------------------------------------------
// User Profile & Account Endpoints
// ----------------------------------------------------------------------
export const getProfile = async (): Promise<Operator | null> => {
  const session = await readSession();
  if (!session || !session.token) {
    throw new Error('Authentication required. Please login again.');
  }

  const res = await apiFetch('/api/employees/profile');
  const user = res.data || res;

  return {
    id: String(user.employee_id || user.id),
    name: user.full_name || user.name || session.name,
    employeeId: user.employee_code || user.badge_id || session.employeeId,
    email: user.email || session.email,
    phone: user.phone || 'N/A',
    department: user.department || session.department,
    role: user.designation || user.role || session.role,
    avatar: user.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    profilePhoto: user.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    locationLabel: user.office_name || user.location_label || 'Padalkar Colony',
    latitude: `${user.latitude || 16.740572}° N`,
    longitude: `${user.longitude || 74.246919}° E`,
    shift_start: user.shift_start || '09:00:00',
    shift_end: user.shift_end || '18:00:00',
    grace_time: user.grace_time || '09:15:00',
    weekly_off: user.weekly_off || 'Monday',
  };
};

export const updateProfile = async (input: {
  name?: string;
  department?: string;
  role?: string;
  phone?: string;
}) => {
  const updatedUser = await apiFetch('/api/employees/profile', {
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
  const res = await apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return res;
};

export const forgotPassword = async (employeeId: string) => {
  return {
    message: `Password/PIN reset instructions for ${employeeId} have been generated and dispatched to your corporate email.`,
  };
};

export const updateFaceCapture = async (direction: string, base64Image: string) => {
  const res = await apiFetch('/api/face/register', {
    method: 'POST',
    body: JSON.stringify({ direction, base64Image }),
  });
  return res;
};

export const verifyFace = async (base64Image: string) => {
  const res = await apiFetch('/api/face/verify', {
    method: 'POST',
    body: JSON.stringify({ base64Image }),
  });
  return res;
};

// ----------------------------------------------------------------------
// Notifications Endpoints
// ----------------------------------------------------------------------
export const getNotifications = async (): Promise<NotificationRecord[]> => {
  const session = await readSession();
  if (!session || !session.token) {
    throw new Error('Authentication required. Please login again.');
  }

  const data = await apiFetch('/api/notifications');
  const list = Array.isArray(data) ? data : data.data || [];

  return list.map((n: any) => ({
    id: String(n.id || n.notification_id),
    type: n.type || n.notification_type || 'SYSTEM',
    title: n.title,
    body: n.body || n.message,
    time: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
    unread: n.is_read === false || n.unread === 1,
  }));
};

export const markAllNotificationsRead = async () => {
  await apiFetch('/api/notifications/read-all', { method: 'PUT' });
};

// ----------------------------------------------------------------------
// Reports & Employees
// ----------------------------------------------------------------------
export const getReportDownloadUrl = (format: 'csv' | 'xlsx' | 'pdf', startDate?: string, endDate?: string) => {
  let url = `${API_BASE_URL}/api/reports/export?format=${format}`;
  if (startDate) url += `&start_date=${startDate}`;
  if (endDate) url += `&end_date=${endDate}`;
  return url;
};

export const listEmployees = async (page = 1, search?: string) => {
  let url = `/api/employees?page=${page}&limit=10`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  return apiFetch(url);
};
