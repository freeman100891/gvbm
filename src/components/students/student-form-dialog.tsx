'use client';

import React, { useState, useEffect, useRef } from 'react';
import { StudentWithStats } from '@/types';
import {
  X,
  User,
  Phone,
  BookOpen,
  Image as ImageIcon,
  Sparkles,
  Check,
  Upload,
  AlertCircle,
} from 'lucide-react';
import { AdaptiveModal } from '../shared/adaptive-modal';

interface StudentFormDialogProps {
  classId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  studentToEdit?: StudentWithStats | null;
}

const PRESET_AVATARS = [
  { id: 'lion', emoji: '🦁', label: 'Sư tử' },
  { id: 'tiger', emoji: '🐯', label: 'Hổ dũng mãnh' },
  { id: 'fox', emoji: '🦊', label: 'Cáo thông minh' },
  { id: 'panda', emoji: '🐼', label: 'Gấu trúc' },
  { id: 'koala', emoji: '🐨', label: 'Koala' },
  { id: 'rabbit', emoji: '🐰', label: 'Thỏ nhanh nhẹn' },
  { id: 'unicorn', emoji: '🦄', label: 'Kỳ lân' },
  { id: 'rocket', emoji: '🚀', label: 'Tên lửa' },
  { id: 'star', emoji: '⭐', label: 'Ngôi sao' },
  { id: 'sparkles', emoji: '🌟', label: 'Tỏa sáng' },
  { id: 'scholar', emoji: '🎓', label: 'Học giả' },
  { id: 'crown', emoji: '👑', label: 'Vương miện' },
];

export const StudentFormDialog: React.FC<StudentFormDialogProps> = ({
  classId,
  isOpen,
  onClose,
  onSuccess,
  studentToEdit,
}) => {
  const isEditing = Boolean(studentToEdit);

  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [avatar, setAvatar] = useState<string>('🦁');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [initialPoints, setInitialPoints] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (studentToEdit) {
      setFullName(studentToEdit.fullName || '');
      setGender((studentToEdit.gender as any) || 'MALE');
      setAvatar(studentToEdit.avatar || '🦁');
      setParentName(studentToEdit.parentName || '');
      setParentPhone(studentToEdit.parentPhone || '');
      setNotes(studentToEdit.notes || '');
      setInitialPoints(0);
    } else {
      setFullName('');
      setGender('MALE');
      setAvatar('🦁');
      setParentName('');
      setParentPhone('');
      setNotes('');
      setInitialPoints(0);
    }
    setErrorMsg(null);
  }, [studentToEdit, isOpen]);

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Ảnh vượt quá dung lượng 2MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatar(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const formattedName = fullName
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const phoneRegex = /^0\d{9}$/;
    if (parentPhone.trim() && !phoneRegex.test(parentPhone.trim())) {
      setErrorMsg('SĐT phụ huynh không hợp lệ! Vui lòng nhập đúng 10 chữ số bắt đầu bằng 0.');
      return;
    }

    setLoading(true);

    try {
      if (isEditing && studentToEdit) {
        const res = await fetch(
          `/api/classes/${classId}/students/${studentToEdit.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fullName: formattedName,
              gender,
              avatar,
              parentName: parentName.trim() || undefined,
              parentPhone: parentPhone.trim() || undefined,
              notes: notes.trim() || undefined,
            }),
          }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Cập nhật học sinh thất bại');
        }
      } else {
        const res = await fetch(`/api/classes/${classId}/students`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: formattedName,
            gender,
            avatar,
            parentName: parentName.trim() || undefined,
            parentPhone: parentPhone.trim() || undefined,
            notes: notes.trim() || undefined,
            initialPoints: Number(initialPoints) || 0,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Thêm học sinh thất bại');
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const isCustomImageUrl = avatar.startsWith('data:') || avatar.startsWith('http');

  if (!isOpen) return null;

  return (
    <AdaptiveModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEditing ? 'Chỉnh Sửa Hồ Sơ Học Sinh' : 'Thêm Học Sinh Mới'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEditing ? `Cập nhật thông tin em ${studentToEdit?.fullName}` : 'Thêm học viên vào danh sách lớp'}
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Selector Area */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Ảnh Đại Diện / Biểu Tượng
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
              >
                <Upload className="w-3.5 h-3.5" />
                Tải ảnh từ máy
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCustomImageUpload}
                className="hidden"
              />
            </div>

            {/* Selected Avatar Preview + Grid of 12 Presets */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border-2 border-primary shadow-md flex items-center justify-center shrink-0 overflow-hidden text-2xl">
                {isCustomImageUrl ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{avatar}</span>
                )}
              </div>

              {/* 12 Presets Palette */}
              <div className="grid grid-cols-6 gap-1.5 flex-1">
                {PRESET_AVATARS.map((p) => {
                  const isSelected = avatar === p.emoji;
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setAvatar(p.emoji)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition ${
                        isSelected
                          ? 'bg-primary/20 border-2 border-primary scale-110 shadow-sm'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:scale-105'
                      }`}
                      title={p.label}
                    >
                      {p.emoji}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Full Name & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Họ và Tên Học Sinh (*)
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Trần Gia Hân"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Giới Tính
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
              >
                <option value="MALE">👦 Nam</option>
                <option value="FEMALE">👧 Nữ</option>
                <option value="OTHER">✨ Khác</option>
              </select>
            </div>
          </div>

          {/* Parent Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Họ Tên Phụ Huynh / Giám Hộ
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="VD: Trần Quang Hưng"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Số Điện Thoại Phụ Huynh
                </label>
                {parentPhone && (
                  <a
                    href={`https://zalo.me/${parentPhone.replace(/[\s.-]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-blue-500 font-bold hover:underline"
                  >
                    💬 Mở Zalo
                  </a>
                )}
              </div>
              <input
                type="tel"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="0901234567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Pedagogical Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ghi Chú Sư Phạm & Trình Độ Tiếng Anh
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: IELTS Target 6.5, phản xạ Speaking tốt, cần rèn thêm ngữ pháp câu phức..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Initial Points (only in Create mode) */}
          {!isEditing && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Điểm Thi Đua Ban Đầu (Tùy chọn)
              </label>
              <input
                type="number"
                min="0"
                max="200"
                value={initialPoints}
                onChange={(e) => setInitialPoints(parseInt(e.target.value, 10) || 0)}
                className="w-32 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold text-center"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {loading ? 'Đang Lưu...' : isEditing ? 'Cập Nhật Hồ Sơ' : 'Thêm Vào Lớp'}
            </button>
          </div>
        </form>
      </div>
    </AdaptiveModal>
  );
};
