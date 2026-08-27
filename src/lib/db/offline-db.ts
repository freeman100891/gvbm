import Dexie, { type Table } from 'dexie';
import { SyncMutation } from '@/types';

export interface LocalClass {
  id: string;
  name: string;
  academicYear: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LocalStudent {
  id: string;
  classId: string;
  fullName: string;
  avatar?: string | null;
  parentName?: string | null;
  parentPhone?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LocalAttendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: string;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LocalPointLog {
  id: string;
  studentId: string;
  pointsChanged: number;
  reason: string;
  createdAt: string;
}

export interface LocalRankConfig {
  id: string;
  classId?: string | null;
  rank: string;
  displayName: string;
  avatarType: string;
  avatarValue: string;
  frameColor: string;
  minPoints: number;
  updatedAt: string;
}

export interface LocalEvaluation {
  id: string;
  studentId: string;
  classId: string;
  period: string;
  vocabulary?: string | null;
  grammar?: string | null;
  speaking?: string | null;
  attitude?: string | null;
  generalComment: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalMeetingNote {
  id: string;
  title: string;
  category: string;
  meetingDate: string;
  location?: string | null;
  attendees?: string | null;
  content: string;
  actionItems?: string | null;
  createdAt: string;
  updatedAt: string;
}

export class GVBMOfflineDatabase extends Dexie {
  classes!: Table<LocalClass, string>;
  students!: Table<LocalStudent, string>;
  attendances!: Table<LocalAttendance, string>;
  pointLogs!: Table<LocalPointLog, string>;
  rankConfigs!: Table<LocalRankConfig, string>;
  evaluations!: Table<LocalEvaluation, string>;
  meetingNotes!: Table<LocalMeetingNote, string>;
  syncQueue!: Table<SyncMutation, number>;

  constructor() {
    super('GVBM_OfflineDB');
    this.version(1).stores({
      classes: 'id, name, academicYear, createdAt',
      students: 'id, classId, fullName, parentPhone, createdAt',
      attendances: 'id, studentId, classId, date, [studentId+date]',
      pointLogs: 'id, studentId, createdAt',
      rankConfigs: 'id, classId, rank, [classId+rank]',
      evaluations: 'id, studentId, classId, period',
      meetingNotes: 'id, title, category, meetingDate',
      syncQueue: '++id, table, action, timestamp, synced',
    });
  }

  /**
   * Enqueue a mutation to the offline sync outbox
   */
  async enqueueMutation(
    table: SyncMutation['table'],
    action: SyncMutation['action'],
    payload: any
  ) {
    return await this.syncQueue.add({
      table,
      action,
      payload,
      timestamp: Date.now(),
      synced: 0,
    });
  }

  /**
   * Clear synced items
   */
  async clearSynced() {
    return await this.syncQueue.where('synced').equals(1).delete();
  }
}

export const offlineDb = new GVBMOfflineDatabase();
