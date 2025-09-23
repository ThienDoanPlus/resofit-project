import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { NavigatorScreenParams } from "@react-navigation/native"; // CÔNG CỤ QUAN TRỌNG

export interface User {
  id: number;
  username: string;
  email: string;
  role: "member" | "pt" | "manager";
}

export type ChatPartner = {
  id: number;
  username: string;
  role: string;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

// --- LUỒNG HỘI VIÊN (MEMBER) ---

export type MemberTabParamList = {
  Home: undefined;
  MyBookings: undefined;
  Progress: undefined;
  ChatList: undefined;
  Profile: undefined;
  WorkoutPlanList: undefined;
};

export interface MemberProfile {
  username: string;
  height: string | number | null;
  initial_weight: string | number | null;
  goal: string | null;
  dob: string | null;
}

export interface SummaryData {
  latest_log: Log;
  first_log_weight: number | null;
  weight_change: number | null;
  bmi: number | null;
  is_height_missing: boolean; // <-- Thêm trường này
}

// 2. Định nghĩa ParamList cho Stack Navigator "CHA"
export type MemberStackParamList = {
  MainTabs: NavigatorScreenParams<MemberTabParamList>;
  PackageList: undefined;
  Chat: { chatPartner: ChatPartner };
  AICoach: undefined;
  CreateBooking: undefined;
  ConfirmBooking: { date: string; time: string };
  Settings: undefined;
  ChangePassword: undefined; // <-- Thêm
  EditProfile: undefined; // <-- Thêm
  WorkoutPlanDetail: { planId: number };
  ExerciseList: {
    dayId: number;
    dayTitle: string | null;
    exercises: WorkoutDayExercise[];
  };
  WorkoutSession: {
    dayId: number;
    dayTitle: string | null;
    exercises: WorkoutDayExercise[];
  };
  ExerciseDetail: { exerciseId: number };
  PackageDetail: { packageItem: Package };
  PaymentWebView: { uri: string };
};

export type MemberNavigationProp =
  NativeStackNavigationProp<MemberStackParamList>;

// --- LUỒNG QUẢN LÝ (MANAGER) ---
export type ManagerStackParamList = {
  ManagerDashboard: undefined;
  ManagePackages: undefined;
  CreatePackage: undefined;
  EditPackage: { packageItem: Package }; // <-- Thêm
  ManageMembers: undefined; // <-- Thêm

  PackageDetail: { packageItem: Package };
  PaymentWebView: { uri: string };
};
export type ManagerNavigationProp =
  NativeStackNavigationProp<ManagerStackParamList>;

// 4. Định nghĩa kiểu cho package item

export interface Package {
  id: number;
  name: string;
  description: string;
  price: string;
  duration: number;
  pt_sessions: number;
  image_url?: string | null;
}

export type Member = {
  id: number;
  username: string;
  email: string;
};
export type PTAssignment = {
  member: Member;
  start_date: string;
  is_active: boolean;
};
export type PTStackParamList = {
  PTDashboard: undefined;
  MyMembers: undefined;
  MemberProgress: { memberId: number; memberName: string };
  ManageAppointments: undefined;
};
export type PTNavigationProp = NativeStackNavigationProp<PTStackParamList>;
export interface Log {
  id: number;
  date: string;
  weight: number;
  body_fat_percentage: number | null;
  notes: string | null;
  bmi: number | null; // <-- THÊM DÒNG NÀY
}

export type Booking = {
  id: number;
  start_time: string;
  end_time: string;
  status: "pending" | "approved" | "cancelled";
  member: { id: number; username: string };
  pt: { id: number; username: string } | null;
};

// --- THÊM CÁC TYPE MỚI CHO WORKOUT ---
export interface WorkoutPlan {
  id: number;
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  image_url: string | null;
  days?: WorkoutDay[]; // Thêm `days` là một mảng tùy chọn
  total_days: number; // <-- Thêm
  completed_days: number; // <-- Thêm
}
export interface Exercise {
  id: number;
  name: string;
  instructions: string[] | null; // Sửa từ description thành instructions (mảng chuỗi)
  video_url: string | null; // Phải là video_url
  gif_url: string | null; // Phải là gif_url
  ai_supported: boolean; // <-- Thêm

  equipment: string;
  muscle_group: string | null;
}
export interface WorkoutDayExercise {
  id: number;
  exercise: Exercise;
  sets: number;
  reps: string;
  rest_period: number;
  order: number;
}

export interface WorkoutDay {
  id: number;
  day_number: number;
  is_rest_day: boolean;
  title: string | null;
  exercises: WorkoutDayExercise[];
  is_completed: boolean; // <-- THÊM DÒNG NÀY
}
