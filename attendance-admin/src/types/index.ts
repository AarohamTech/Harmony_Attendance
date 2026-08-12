export interface Employee {
  employee_id: number;
  employee_code: string;
  full_name: string;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  role?: string;
  status?: string;
  created_at?: string;
  joining_date?: string;
  profile_photo?: string;
  shift_start?: string;
  shift_end?: string;
  weekly_off?: string;
  office_id?: number;
  office_name?: string;
}

export interface AttendanceRecord {
  attendance_id: number;
  employee_id: number;
  employee_code: string;
  full_name: string;
  department?: string;
  designation?: string;
  attendance_date: string;
  attendance_day?: string;
  punch_in?: string | null;
  punch_out?: string | null;
  working_hours?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  location_name?: string | null;
  attendance_status: string;
  late_reason?: string | null;
  early_exit_reason?: string | null;
  remarks?: string | null;
  created_at?: string;
}

export interface AttendanceRequest {
  request_id: number;
  employee_id: number;
  employee_name?: string;
  employee_code?: string;
  department?: string;
  designation?: string;
  request_type: string;
  request_date: string;
  requested_time?: string | null;
  reason: string;
  remarks?: string | null;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  manager_remark?: string | null;
  created_at: string;
}

export interface Department {
  department_id: number;
  department_name: string;
  description?: string;
  manager_id?: number | null;
  manager_name?: string | null;
  employee_count?: number;
  created_at?: string;
}

export interface OfficeLocation {
  office_id: number;
  office_name: string;
  address?: string;
  latitude: number;
  longitude: number;
  allowed_radius: number;
  created_at?: string;
}

export interface NotificationItem {
  notification_id: number;
  employee_id?: number;
  title: string;
  message: string;
  notification_type?: string;
  is_read: boolean;
  created_at: string;
}

export interface CompanySettings {
  setting_id?: number;
  company_name: string;
  shift_start: string;
  shift_end: string;
  grace_period_mins: number;
  weekly_off: string;
  leave_policy_days: number;
  allow_remote_punch?: boolean;
  geo_fencing_strict?: boolean;
  updated_at?: string;
}

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  onLeaveToday: number;
  pendingLeaveRequests: number;
  currentlyPunchedIn: number;
}

export interface DashboardCharts {
  attendance_trend: {
    labels: string[];
    present: number[];
    absent: number[];
    late: number[];
  };
  leave_statistics: {
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
  };
}

export interface AuthState {
  token: string | null;
  user: Employee | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
