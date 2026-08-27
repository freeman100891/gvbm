'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { ExcelImportRow } from '@/types';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Download,
  Trash2,
  Edit3,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';

interface StudentImportWizardProps {
  classId: string;
  className: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StudentImportWizard: React.FC<StudentImportWizardProps> = ({
  classId,
  className,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ExcelImportRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const validatePhone = (phone?: string): boolean => {
    if (!phone) return true; // optional
    const clean = phone.replace(/[\s.-]/g, '');
    return /^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(clean);
  };

  const capitalizeWords = (str: string): string => {
    return str
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    setFile(uploaded);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.SheetNames[0];
        const rawJson: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { header: 1 });

        if (rawJson.length <= 1) {
          alert('File Excel không có dữ liệu học sinh!');
          return;
        }

        // Header is row 0, data starts row 1
        const parsedRows: ExcelImportRow[] = [];

        for (let i = 1; i < rawJson.length; i++) {
          const row = rawJson[i];
          if (!row || row.length === 0 || !row[0]) continue;

          const rawFullName = String(row[0] || '').trim();
          const rawParentName = row[1] ? String(row[1]).trim() : '';
          const rawParentPhone = row[2] ? String(row[2]).trim() : '';
          const rawNotes = row[3] ? String(row[3]).trim() : '';

          const errors: { field: string; message: string }[] = [];

          if (!rawFullName || rawFullName.length < 2) {
            errors.push({ field: 'fullName', message: 'Tên học sinh không hợp lệ hoặc quá ngắn' });
          }

          if (rawParentPhone && !validatePhone(rawParentPhone)) {
            errors.push({ field: 'parentPhone', message: 'Số điện thoại phụ huynh chưa đúng định dạng VN' });
          }

          parsedRows.push({
            index: i,
            fullName: rawFullName ? capitalizeWords(rawFullName) : '',
            parentName: rawParentName ? capitalizeWords(rawParentName) : undefined,
            parentPhone: rawParentPhone || undefined,
            notes: rawNotes || undefined,
            isValid: errors.length === 0,
            errors,
          });
        }

        setRows(parsedRows);
        setStep(2);
      } catch (err) {
        console.error('Error parsing Excel:', err);
        alert('Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng tệp!');
      }
    };

    reader.readAsBinaryString(uploaded);
  };

  const handleCellChange = (
    index: number,
    field: 'fullName' | 'parentName' | 'parentPhone' | 'notes',
    value: string
  ) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.index !== index) return r;

        const updated = { ...r, [field]: value };
        const errors: { field: string; message: string }[] = [];

        if (!updated.fullName || updated.fullName.trim().length < 2) {
          errors.push({ field: 'fullName', message: 'Tên học sinh không hợp lệ' });
        }

        if (updated.parentPhone && !validatePhone(updated.parentPhone)) {
          errors.push({ field: 'parentPhone', message: 'Số điện thoại chưa đúng định dạng' });
        }

        return {
          ...updated,
          isValid: errors.length === 0,
          errors,
        };
      })
    );
  };

  const handleDeleteRow = (index: number) => {
    setRows((prev) => prev.filter((r) => r.index !== index));
  };

  const handleDownloadTemplate = async () => {
    window.open(`/api/classes/${classId}/export-excel?type=template`, '_blank');
  };

  const handleFinalSubmit = async () => {
    const invalidCount = rows.filter((r) => !r.isValid).length;
    if (invalidCount > 0) {
      alert(`Còn ${invalidCount} dòng dữ liệu chưa hợp lệ. Vui lòng sửa lại trước khi lưu!`);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = rows.map((r) => ({
        fullName: capitalizeWords(r.fullName),
        parentName: r.parentName ? capitalizeWords(r.parentName) : null,
        parentPhone: r.parentPhone || null,
        notes: r.notes || null,
      }));

      const res = await fetch(`/api/classes/${classId}/import-excel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: payload }),
      });

      if (res.ok) {
        setStep(3);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1800);
      } else {
        const data = await res.json();
        alert(data.error || 'Có lỗi xảy ra khi nạp học sinh vào hệ thống!');
      }
    } catch (err) {
      console.error('Import failed:', err);
      alert('Không thể kết nối đến máy chủ để lưu dữ liệu!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validRowsCount = rows.filter((r) => r.isValid).length;
  const invalidRowsCount = rows.length - validRowsCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Excel Import Wizard 3 Bước
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nạp danh sách học sinh vào lớp {className}
              </p>
            </div>
          </div>

          {/* Stepper Indicators */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold">
            <span
              className={`px-3 py-1 rounded-full ${
                step >= 1
                  ? 'bg-primary text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
              }`}
            >
              1. Tải Tệp
            </span>
            <span className="text-slate-300">➔</span>
            <span
              className={`px-3 py-1 rounded-full ${
                step >= 2
                  ? 'bg-primary text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
              }`}
            >
              2. Đối Soát Lỗi
            </span>
            <span className="text-slate-300">➔</span>
            <span
              className={`px-3 py-1 rounded-full ${
                step >= 3
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
              }`}
            >
              3. Hoàn Tất
            </span>
          </div>
        </div>

        {/* Wizard Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-6 text-center py-8">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary rounded-3xl p-10 cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/50 transition flex flex-col items-center justify-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition transform">
                  <Upload className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  Kéo thả file Excel (.xlsx, .xls) vào đây
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                  Hệ thống tự động đọc cột Họ Tên, Tên Phụ Huynh, Số Điện Thoại và Ghi Chú
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Download className="w-4 h-4 text-primary" />
                  Tải File Mẫu Chuẩn (.xlsx)
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {/* Stats Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-xs font-semibold">
                <div className="flex items-center gap-4">
                  <span className="text-slate-700 dark:text-slate-200">
                    Tổng số: <strong>{rows.length}</strong> học sinh
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Hợp lệ: <strong>{validRowsCount}</strong>
                  </span>
                  {invalidRowsCount > 0 && (
                    <span className="flex items-center gap-1 text-rose-500">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Cần chỉnh sửa: <strong>{invalidRowsCount}</strong>
                    </span>
                  )}
                </div>

                <p className="text-slate-500 italic text-[11px]">
                  💡 Bạn có thể nhấp chuột trực tiếp vào ô để sửa lỗi
                </p>
              </div>

              {/* Data Review Table */}
              <div className="overflow-x-auto max-h-[50vh] border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 sticky top-0">
                    <tr>
                      <th className="p-3 w-12 text-center">STT</th>
                      <th className="p-3 min-w-[180px]">Họ và Tên (*)</th>
                      <th className="p-3 min-w-[160px]">Phụ Huynh</th>
                      <th className="p-3 min-w-[140px]">Số Điện Thoại</th>
                      <th className="p-3 min-w-[160px]">Ghi Chú</th>
                      <th className="p-3 w-16 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {rows.map((r, i) => (
                      <tr
                        key={r.index}
                        className={`${
                          !r.isValid
                            ? 'bg-rose-50/70 dark:bg-rose-950/20'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="p-3 text-center text-slate-400 font-bold">
                          {i + 1}
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={r.fullName}
                            onChange={(e) =>
                              handleCellChange(r.index, 'fullName', e.target.value)
                            }
                            className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                              r.errors.some((e) => e.field === 'fullName')
                                ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                                : 'border-slate-200 dark:border-slate-700'
                            }`}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={r.parentName || ''}
                            onChange={(e) =>
                              handleCellChange(r.index, 'parentName', e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={r.parentPhone || ''}
                            onChange={(e) =>
                              handleCellChange(r.index, 'parentPhone', e.target.value)
                            }
                            className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                              r.errors.some((e) => e.field === 'parentPhone')
                                ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                                : 'border-slate-200 dark:border-slate-700'
                            }`}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={r.notes || ''}
                            onChange={(e) =>
                              handleCellChange(r.index, 'notes', e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(r.index)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto animate-bounce">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Nạp Dữ Liệu Thành Công!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Đã thêm {validRowsCount} học sinh vào lớp {className}. Hệ thống đang cập nhật danh sách...
              </p>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {step === 2 ? (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Chọn Lại Tệp
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting || invalidRowsCount > 0 || rows.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Đang Nạp Dữ Liệu...' : `Xác Nhận Nạp ${validRowsCount} Học Sinh`}
                <CheckCircle className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
