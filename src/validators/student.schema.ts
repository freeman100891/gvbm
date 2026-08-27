import { z } from 'zod';

export const StudentUpsertSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Họ và tên học sinh phải có ít nhất 2 ký tự')
    .max(100, 'Tên quá dài'),
  avatar: z.string().optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).default('MALE'),
  parentName: z.string().trim().max(100).optional().nullable(),
  parentPhone: z
    .string()
    .trim()
    .regex(
      /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
      'Số điện thoại không đúng định dạng Việt Nam (VD: 0901234567 hoặc +84901234567)'
    )
    .optional()
    .or(z.literal(''))
    .nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
  classId: z.string().min(1, 'ID lớp học không hợp lệ'),
  initialPoints: z.number().optional().default(0),
});

export const StudentBatchDeleteSchema = z.object({
  studentIds: z
    .array(z.string().min(1))
    .min(1, 'Vui lòng chọn ít nhất một học sinh để xóa'),
  classId: z.string().min(1),
});

export const StudentTransferSchema = z.object({
  studentIds: z
    .array(z.string().min(1))
    .min(1, 'Vui lòng chọn ít nhất một học sinh để chuyển lớp'),
  sourceClassId: z.string().min(1),
  targetClassId: z.string().min(1, 'Vui lòng chọn lớp học đích'),
  keepPointHistory: z.boolean().default(false), // true: giữ lại điểm; false: reset về Dân (0 điểm)
});

export const StudentResetPointsSchema = z.object({
  studentIds: z
    .array(z.string().min(1))
    .min(1, 'Vui lòng chọn ít nhất một học sinh để đặt lại điểm'),
  classId: z.string().min(1),
  reason: z.string().optional().default('Đặt lại điểm đầu chu kỳ mới'),
});

export type StudentUpsertInput = z.infer<typeof StudentUpsertSchema>;
export type StudentBatchDeleteInput = z.infer<typeof StudentBatchDeleteSchema>;
export type StudentTransferInput = z.infer<typeof StudentTransferSchema>;
export type StudentResetPointsInput = z.infer<typeof StudentResetPointsSchema>;
