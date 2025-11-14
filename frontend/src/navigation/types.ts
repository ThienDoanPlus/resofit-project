import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { NavigatorScreenParams } from "@react-navigation/native";

// ===================================================================
// == 1. CÁC TYPE DỮ LIỆU (DATA TYPES)
// ===================================================================
export interface User {
  id: number;
  username: string;
  email: string;
  role: "member" | "pt" | "manager";
}

export interface MemberProfile {
  username: string;
  height: string | number | null;
  initial_weight: string | number | null;
  goal: string | null;
  dob: string | null;
}

export interface Package {
  id: number;
  name: string;
  description: string;
  price: string;
  duration: number;
  pt_sessions: number;
  image_url?: string | null;
}

export interface Subscription {
  id: number;
  package: Package;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface Booking {
  id: number;
  start_time: string;
  end_time: string;
  status: "pending" | "approved" | "cancelled";
  member: { id: number; username: string };
  pt: { id: number; username: string } | null;
}

export interface Log {
  id: number;
  date: string;
  weight: number;
  body_fat_percentage: number | null;
  notes: string | null;
  bmi: number | null;
}

export interface SummaryData {
  latest_log: Log;
  first_log_weight: number | null;
  weight_change: number | null;
  bmi: number | null;
  is_height_missing: boolean;
}

export interface Exercise {
  id: number;
  name: string;
  instructions: string[] | null;
  video_url: string | null;
  gif_url: string | null;
  ai_supported: boolean;
  rep_counting_logic: string | null;
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
  is_completed: boolean;
}

export interface WorkoutPlan {
  id: number;
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  image_url: string | null;
  days?: WorkoutDay[];
  total_days: number;
  completed_days: number;
}

export interface UserWorkoutPlanAssignment {
  id: number;
  pt: User;
  member: User;
  plan: WorkoutPlan;
  assigned_at: string;
}

export interface WaterLog {
  id: number;
  date: string;
  amount: number;
}
export interface WorkoutProgressSummary {
  plan_name: string;
  completed_days: number;
  total_days: number;
  progress_percent: number;
}

// ===================================================================
// == 2. CÁC TYPE ĐIỀU HƯỚNG (NAVIGATION TYPES)
// ===================================================================

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

export type RootStackParamList = AuthStackParamList &
  MemberStackParamList &
  PTStackParamList &
  ManagerStackParamList;

// --- LUỒNG HỘI VIÊN (MEMBER) ---

export type MemberTabParamList = {
  Home: undefined;
  MyBookings: undefined;
  Progress: undefined;
  ChatList: { [key: string]: any } | undefined;
  Profile: undefined;
  Reminder: undefined;
  WorkoutPlanList: undefined;
};

export type MemberStackParamList = {
  MainTabs: NavigatorScreenParams<MemberTabParamList>;
  PackageList: undefined;
  Chat: { chatPartner: ChatPartner };
  AICoach: { exercise: Exercise };
  // AICoach: undefined;
  CreateBooking: undefined;
  ConfirmBooking: { date: string; time: string };
  Settings: undefined;
  ChangePassword: undefined;
  EditProfile: undefined;
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

// --- LUỒNG PT ---
export type PTStackParamList = {
  PTDashboard: undefined;
  MyMembers: undefined;
  MemberProgress: { memberId: number; memberName: string };
  ManageAppointments: undefined;
  MemberDetail: { memberId: number; memberName: string };
  MemberBookings: { memberId: number; memberName: string };
  Chat: { chatPartner: ChatPartner };
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Settings: undefined;
  AssignPlan: { memberId: number; memberName: string };
  ChatList_For_PT: undefined;
};

// --- LUỒNG QUẢN LÝ (MANAGER) ---
export type ManagerStackParamList = {
  ManagerDashboard: undefined;
  ManagePackages: undefined;
  CreatePackage: undefined;
  EditPackage: { packageItem: Package };
  ManageMembers: undefined;
  ManageStaff: undefined;
  Reports: undefined;

  PackageDetail: { packageItem: Package };
  PaymentWebView: { uri: string };
};
export type ManagerNavigationProp =
  NativeStackNavigationProp<ManagerStackParamList>;

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

export type PTNavigationProp = NativeStackNavigationProp<PTStackParamList>;
