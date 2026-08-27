export type AttendanceStatus = 'PRESENT' | 'LATE' | 'EXCUSED_ABSENCE' | 'UNEXCUSED_ABSENCE';

export type StudentRank = 'DAN' | 'LINH' | 'QUAN' | 'VUA';

export type MeetingCategory = 'DEPARTMENT' | 'PARENTS' | 'COUNCIL' | 'OTHER';

export type AvatarType = 'PRESET_ICON' | 'EMOJI' | 'CUSTOM_IMAGE';

export interface RankConfigItem {
  id?: string;
  classId?: string | null;
  rank: StudentRank;
  displayName: string;
  avatarType: AvatarType;
  avatarValue: string;
  frameColor: string;
  minPoints: number;
  updatedAt?: Date;
}

export interface StudentWithStats {
  id: string;
  classId: string;
  fullName: string;
  avatar?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  parentName?: string | null;
  parentPhone?: string | null;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  totalPoints: number;
  currentRank: StudentRank;
  rankConfig: RankConfigItem;
  recentLogs?: PointLogItem[];
  attendances?: AttendanceItem[];
  attendanceRate?: number;
}

export interface PointLogItem {
  id: string;
  studentId: string;
  pointsChanged: number;
  reason: string;
  createdAt: Date | string;
}

export interface AttendanceItem {
  id: string;
  studentId: string;
  classId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  note?: string | null;
}

export interface ClassItem {
  id: string;
  name: string;
  academicYear: string;
  description?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  studentCount?: number;
  students?: StudentWithStats[];
  rankConfigs?: RankConfigItem[];
}

export interface EvaluationItem {
  id: string;
  studentId: string;
  classId: string;
  period: string; // e.g. "Tháng 09/2026", "Học kỳ 1", "Cả năm"
  vocabulary?: string | null;
  grammar?: string | null;
  speaking?: string | null;
  attitude?: string | null;
  generalComment: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  student?: {
    id: string;
    fullName: string;
    avatar?: string | null;
  };
}

export interface MeetingNoteItem {
  id: string;
  title: string;
  category: MeetingCategory;
  meetingDate: Date | string;
  location?: string | null;
  attendees?: string | null;
  content: string;
  actionItems?: string | null; // JSON string or text checklist
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ActionItemChecklist {
  id: string;
  task: string;
  assignee?: string;
  deadline?: string;
  completed: boolean;
}

export type PeriodFilter = 
  | { type: 'month'; month: number; year: number }
  | { type: 'semester'; semester: 1 | 2; year: number }
  | { type: 'year'; year: number }
  | { type: 'all' };

export interface RankThemePreset {
  id: string;
  name: string;
  description: string;
  ranks: {
    [key in StudentRank]: {
      displayName: string;
      avatarType: AvatarType;
      avatarValue: string;
      frameColor: string;
      minPoints: number;
      badgeIcon: string;
    };
  };
}

export interface SyncMutation {
  id?: number;
  table: 'classes' | 'students' | 'attendances' | 'pointLogs' | 'rankConfigs' | 'evaluations' | 'meetingNotes';
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'BATCH_ATTENDANCE' | 'ADD_POINTS';
  payload: any;
  timestamp: number;
  synced: number; // 0 = false, 1 = true
}

export interface ExcelImportRow {
  index: number;
  fullName: string;
  parentName?: string;
  parentPhone?: string;
  notes?: string;
  isValid: boolean;
  errors: { field: string; message: string }[];
}
