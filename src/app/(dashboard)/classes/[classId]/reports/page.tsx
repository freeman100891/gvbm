'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  StudentWithStats,
  ClassItem,
  EvaluationItem,
} from '@/types';
import { EvaluationEditor } from '@/components/reports/evaluation-editor';
import { ExcelExportButtons } from '@/components/excel/excel-export-buttons';
import {
  FileSpreadsheet,
  ArrowLeft,
  FileText,
  Download,
  BookOpen,
} from 'lucide-react';

export default function ReportsPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = use(params);

  const [classData, setClassData] = useState<ClassItem | null>(null);
  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClassAndEvaluations = async () => {
    try {
      const res = await fetch(`/api/classes/${classId}`);
      if (res.ok) {
        const data = await res.json();
        setClassData(data);
        setStudents(data.students || []);

        const evalRes = await fetch(`/api/classes/${classId}/evaluations`);
        if (evalRes.ok) {
          const evalData = await evalRes.json();
          setEvaluations(evalData);
        }
      }
    } catch (err) {
      console.error('Failed to load reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassAndEvaluations();
  }, [classId]);

  const handleSaveEvaluation = async (evalData: Partial<EvaluationItem>) => {
    const res = await fetch(`/api/classes/${classId}/evaluations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evalData),
    });

    if (!res.ok) {
      throw new Error('Failed to save evaluation');
    }

    await fetchClassAndEvaluations();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="p-8 text-center text-slate-400">
        Không tìm thấy thông tin lớp học.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <Link
          href={`/classes/${classId}`}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold text-blue-500 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              Reports & Documents Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Đánh Giá Kỹ Năng & Xuất Báo Cáo
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Lớp: {classData.name} | Nhập nhận xét tiếng Anh và xuất phiếu PDF gửi phụ huynh / tải bảng tính ExcelJS
          </p>
        </div>
      </div>

      {/* Section 1: Excel Exports Suite */}
      <div className="space-y-3">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          Xuất Bảng Tính Excel Chuyên Nghiệp (ExcelJS)
        </h3>
        <ExcelExportButtons classId={classId} className={classData.name} />
      </div>

      {/* Section 2: Student English Evaluation & PDF Generator */}
      <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Nhận Xét Kỹ Năng Tiếng Anh & Xuất Phiếu PDF Chuẩn Gửi Phụ Huynh
          </h3>
        </div>

        <EvaluationEditor
          students={students}
          classData={classData}
          initialEvaluations={evaluations}
          onSaveEvaluation={handleSaveEvaluation}
        />
      </div>
    </div>
  );
}
