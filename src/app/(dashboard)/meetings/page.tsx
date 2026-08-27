'use client';

import React, { useState, useEffect } from 'react';
import {
  MeetingNoteItem,
  MeetingCategory,
  ActionItemChecklist,
} from '@/types';
import {
  NotebookTabs,
  Plus,
  Search,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Circle,
  Trash2,
  Edit3,
  Sparkles,
  Filter,
  Check,
} from 'lucide-react';

export default function MeetingsPage() {
  const [notes, setNotes] = useState<MeetingNoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal form states
  const [showModal, setShowModal] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MeetingCategory>('DEPARTMENT');
  const [meetingDate, setMeetingDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [location, setLocation] = useState('');
  const [attendees, setAttendees] = useState('');
  const [content, setContent] = useState('');
  const [actionItems, setActionItems] = useState<ActionItemChecklist[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');

  const fetchNotes = async () => {
    try {
      const url =
        selectedCategory !== 'ALL'
          ? `/api/meetings?category=${selectedCategory}`
          : '/api/meetings';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      console.error('Failed to load meeting notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [selectedCategory]);

  const handleOpenCreate = () => {
    setEditingNoteId(null);
    setTitle('');
    setCategory('DEPARTMENT');
    setMeetingDate(new Date().toISOString().split('T')[0]);
    setLocation('');
    setAttendees('');
    setContent('');
    setActionItems([]);
    setShowModal(true);
  };

  const handleOpenEdit = (note: MeetingNoteItem) => {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setCategory(note.category);
    setMeetingDate(
      new Date(note.meetingDate).toISOString().split('T')[0]
    );
    setLocation(note.location || '');
    setAttendees(note.attendees || '');
    setContent(note.content);

    try {
      const parsed = note.actionItems ? JSON.parse(note.actionItems) : [];
      setActionItems(Array.isArray(parsed) ? parsed : []);
    } catch {
      setActionItems([]);
    }

    setShowModal(true);
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    const item: ActionItemChecklist = {
      id: Date.now().toString(),
      task: newTaskText.trim(),
      assignee: newTaskAssignee.trim() || undefined,
      deadline: newTaskDeadline || undefined,
      completed: false,
    };
    setActionItems([...actionItems, item]);
    setNewTaskText('');
    setNewTaskAssignee('');
    setNewTaskDeadline('');
  };

  const handleToggleTask = (taskId: string) => {
    setActionItems(
      actionItems.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setActionItems(actionItems.filter((t) => t.id !== taskId));
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      const payload = {
        title,
        category,
        meetingDate,
        location,
        attendees,
        content,
        actionItems: JSON.stringify(actionItems),
      };

      if (editingNoteId) {
        await fetch(`/api/meetings/${editingNoteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/meetings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      setShowModal(false);
      fetchNotes();
    } catch (err) {
      console.error('Save meeting note failed:', err);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa biên bản cuộc họp này?')) return;
    try {
      await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
      fetchNotes();
    } catch (err) {
      console.error('Delete meeting note failed:', err);
    }
  };

  const filteredNotes = notes.filter((n) => {
    return (
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.location && n.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const getCategoryBadge = (cat: MeetingCategory) => {
    switch (cat) {
      case 'DEPARTMENT':
        return {
          label: 'Họp Tổ Chuyên Môn Tiếng Anh',
          color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        };
      case 'PARENTS':
        return {
          label: 'Họp Phụ Huynh',
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        };
      case 'COUNCIL':
        return {
          label: 'Hội Đồng Sư Phạm',
          color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        };
      default:
        return {
          label: 'Khác',
          color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <NotebookTabs className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Sổ Tay Biên Bản Cuộc Họp
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quản lý biên bản họp tổ tiếng Anh, họp phụ huynh, kế hoạch hành động và thời hạn
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs text-white bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tạo Biên Bản Mới
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: 'Tất Cả' },
            { id: 'DEPARTMENT', label: 'Tổ Tiếng Anh' },
            { id: 'PARENTS', label: 'Phụ Huynh' },
            { id: 'COUNCIL', label: 'Hội Đồng' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm biên bản, địa điểm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Meeting Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
          <NotebookTabs className="w-12 h-12 mx-auto mb-3 text-slate-500 opacity-60" />
          <p className="font-bold text-base text-slate-700 dark:text-slate-300">
            Không tìm thấy biên bản họp nào
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Nhấn "Tạo Biên Bản Mới" để ghi chép nội dung cuộc họp
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNotes.map((note) => {
            const badge = getCategoryBadge(note.category);
            let parsedTasks: ActionItemChecklist[] = [];
            try {
              if (note.actionItems) parsedTasks = JSON.parse(note.actionItems);
            } catch {}

            return (
              <div
                key={note.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${badge.color}`}
                    >
                      {badge.label}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(note)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-2">
                    {note.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {new Date(note.meetingDate).toLocaleDateString('vi-VN')}
                    </span>
                    {note.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {note.location}
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line line-clamp-4 mb-4">
                    {note.content}
                  </div>

                  {/* Action Items preview */}
                  {parsedTasks.length > 0 && (
                    <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Đầu việc ({parsedTasks.filter((t) => t.completed).length}/
                        {parsedTasks.length}):
                      </p>
                      {parsedTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span
                            className={`truncate ${
                              task.completed ? 'line-through opacity-60' : ''
                            }`}
                          >
                            {task.task}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note Creator / Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {editingNoteId ? 'Chỉnh Sửa Biên Bản Cuộc Họp' : 'Tạo Biên Bản Cuộc Họp Mới'}
            </h3>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tiêu Đề Cuộc Họp (*)
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Họp tổ chuyên môn tháng 10..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Danh Mục Cuộc Họp
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MeetingCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="DEPARTMENT">Họp Tổ Chuyên Môn Tiếng Anh</option>
                    <option value="PARENTS">Họp Phụ Huynh</option>
                    <option value="COUNCIL">Hội Đồng Sư Phạm</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ngày Họp
                  </label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Địa Điểm
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="VD: Phòng Hội Đồng / Google Meet"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Thành Phần Tham Dự
                  </label>
                  <input
                    type="text"
                    value={attendees}
                    onChange={(e) => setAttendees(e.target.value)}
                    placeholder="VD: GV tiếng Anh khối 10, BGH..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nội Dung Chi Tiết Cuộc Họp (*)
                </label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Ghi chép các ý kiến thảo luận, chỉ đạo và phân công..."
                  className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Action Items Section */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Đầu Việc Cần Làm (Action Items & Deadlines)
                </p>

                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Tên công việc..."
                    className="flex-1 min-w-[150px] px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    placeholder="Người phụ trách"
                    className="w-28 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddTask}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary/90"
                  >
                    + Thêm
                  </button>
                </div>

                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {actionItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <div
                        onClick={() => handleToggleTask(item.id)}
                        className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span
                          className={`truncate ${
                            item.completed ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {item.task}
                          {item.assignee && (
                            <span className="text-[11px] text-blue-500 ml-1">
                              ({item.assignee})
                            </span>
                          )}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteTask(item.id)}
                        className="text-slate-400 hover:text-rose-500 ml-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition"
                >
                  Lưu Biên Bản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
