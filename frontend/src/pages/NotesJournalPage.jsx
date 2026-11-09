import React, { useState, useEffect, useCallback } from 'react';
import {
  FaBook,
  FaJournalWhills,
  FaCalendarAlt,
  FaStar,
  FaPlus,
  FaSearch,
  FaTrash,
  FaPencilAlt,
  FaCheckCircle,
  FaSave,
  FaTag,
  FaLightbulb,
  FaExclamationTriangle,
  FaBullseye,
} from 'react-icons/fa';
import { journalService } from '../services/journalService';
import { noteService } from '../services/noteService';
import { roadmapService } from '../services/roadmapService';

export default function NotesJournalPage() {
  const [activeTab, setActiveTab] = useState('journal'); // 'journal' | 'notes'

  // Journal State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [journalForm, setJournalForm] = useState({
    what_learned: '',
    what_understood: '',
    what_was_difficult: '',
    solved_independently: '',
    needs_revision: '',
    tomorrow_focus: '',
    daily_rating: 4,
  });
  const [savingJournal, setSavingJournal] = useState(false);
  const [journalSaveSuccess, setJournalSaveSuccess] = useState(false);

  // Notes State
  const [notes, setNotes] = useState([]);
  const [noteTypeFilter, setNoteTypeFilter] = useState('');
  const [noteSearch, setNoteSearch] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteForm, setNoteForm] = useState({
    title: '',
    topic_id: '',
    note_type: 'concept',
    content_markdown: '',
    tags_string: '',
  });
  const [topics, setTopics] = useState([]);

  // Load roadmap topics
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const roadmaps = await roadmapService.getRoadmaps();
        const extracted = [];
        roadmaps.forEach((rm) => {
          (rm.phases || []).forEach((ph) => {
            (ph.subjects || []).forEach((sub) => {
              (sub.topics || []).forEach((top) => {
                extracted.push({
                  id: top.id,
                  title: top.title,
                  subject_title: sub.name,
                });
              });
            });
          });
        });
        setTopics(extracted);
      } catch (err) {
        console.error('Failed to load topics:', err);
      }
    };
    fetchTopics();
  }, []);

  // Fetch Journal for selected date
  const loadJournal = useCallback(async () => {
    try {
      const res = await journalService.getJournalByDate(selectedDate);
      if (res.journal) {
        setJournalForm({
          what_learned: res.journal.what_learned || '',
          what_understood: res.journal.what_understood || '',
          what_was_difficult: res.journal.what_was_difficult || '',
          solved_independently: res.journal.solved_independently || '',
          needs_revision: res.journal.needs_revision || '',
          tomorrow_focus: res.journal.tomorrow_focus || '',
          daily_rating: res.journal.daily_rating || 4,
        });
      } else {
        setJournalForm({
          what_learned: '',
          what_understood: '',
          what_was_difficult: '',
          solved_independently: '',
          needs_revision: '',
          tomorrow_focus: '',
          daily_rating: 4,
        });
      }
    } catch (e) {
      console.error('Failed to load journal:', e);
    }
  }, [selectedDate]);

  // Fetch Study Notes
  const loadNotes = useCallback(async () => {
    try {
      const params = {};
      if (noteTypeFilter) params.note_type = noteTypeFilter;
      if (noteSearch) params.search = noteSearch;
      const res = await noteService.getNotes(params);
      setNotes(res.data || []);
    } catch (e) {
      console.error('Failed to load study notes:', e);
    }
  }, [noteTypeFilter, noteSearch]);

  useEffect(() => {
    if (activeTab === 'journal') {
      loadJournal();
    } else {
      loadNotes();
    }
  }, [activeTab, loadJournal, loadNotes]);

  // Save Journal
  const handleSaveJournal = async (e) => {
    e.preventDefault();
    setSavingJournal(true);
    setJournalSaveSuccess(false);
    try {
      await journalService.saveJournal({
        journal_date: selectedDate,
        ...journalForm,
      });
      setJournalSaveSuccess(true);
      setTimeout(() => setJournalSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save daily journal.');
    } finally {
      setSavingJournal(false);
    }
  };

  // Notes Modal Helpers
  const handleOpenCreateNote = () => {
    setEditingNote(null);
    setNoteForm({
      title: '',
      topic_id: '',
      note_type: 'concept',
      content_markdown: '',
      tags_string: '',
    });
    setShowNoteModal(true);
  };

  const handleOpenEditNote = (note) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title,
      topic_id: note.topic_id ? String(note.topic_id) : '',
      note_type: note.note_type,
      content_markdown: note.content_markdown,
      tags_string: Array.isArray(note.tags) ? note.tags.join(', ') : '',
    });
    setShowNoteModal(true);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = noteForm.tags_string
        ? noteForm.tags_string
            .split(',')
            .map((t) => t.trim().replace(/^#/, ''))
            .filter(Boolean)
        : [];

      const payload = {
        title: noteForm.title,
        topic_id: noteForm.topic_id ? parseInt(noteForm.topic_id) : null,
        note_type: noteForm.note_type,
        content_markdown: noteForm.content_markdown,
        tags: tagsArray,
      };

      if (editingNote) {
        await noteService.updateNote(editingNote.id, payload);
      } else {
        await noteService.createNote(payload);
      }

      setShowNoteModal(false);
      loadNotes();
    } catch (err) {
      alert('Failed to save study note.');
    }
  };

  const handleDeleteNote = async (id, title) => {
    if (!window.confirm(`Delete note "${title}"?`)) return;
    try {
      await noteService.deleteNote(id);
      loadNotes();
    } catch (err) {
      alert('Failed to delete note.');
    }
  };

  return (
    <div className="container-fluid py-4 px-md-4">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary px-2 py-1 small fw-semibold">Phase 9</span>
            <span className="theme-text-sub small fw-medium">Reflective Engineering Journal</span>
          </div>
          <h2 className="theme-text-main fw-bold mb-1">Learning Journal & Study Notes</h2>
          <p className="theme-text-sub small mb-0">
            Feynman active-recall notes and the 6 core daily engineering reflection questions.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="btn-group shadow-sm" role="group">
          <button
            type="button"
            className={`btn px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 ${
              activeTab === 'journal' ? 'btn-primary' : 'btn-outline-secondary'
            }`}
            onClick={() => setActiveTab('journal')}
          >
            <FaJournalWhills /> Daily Reflection Journal
          </button>
          <button
            type="button"
            className={`btn px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 ${
              activeTab === 'notes' ? 'btn-primary' : 'btn-outline-secondary'
            }`}
            onClick={() => setActiveTab('notes')}
          >
            <FaBook /> Feynman Study Notes
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: DAILY LEARNING JOURNAL */}
      {activeTab === 'journal' && (
        <div className="row g-4">
          <div className="col-12 col-lg-8 mx-auto">
            <div className="card border-0 shadow-sm" style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px' }}>
              <div className="card-body p-4 p-md-5">
                {/* Date Bar & Rating */}
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <FaCalendarAlt className="text-primary" />
                    <span className="theme-text-main fw-bold">Journal Date:</span>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      style={{ width: '150px' }}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <span className="small theme-text-sub fw-semibold">Day Rating:</span>
                    <div className="d-flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          size={18}
                          className="cursor-pointer"
                          style={{
                            cursor: 'pointer',
                            color: star <= journalForm.daily_rating ? '#f59e0b' : '#64748b',
                          }}
                          onClick={() => setJournalForm({ ...journalForm, daily_rating: star })}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {journalSaveSuccess && (
                  <div className="alert alert-success d-flex align-items-center gap-2 py-2 small mb-4">
                    <FaCheckCircle /> Daily reflection saved to your engineering record.
                  </div>
                )}

                <form onSubmit={handleSaveJournal} className="d-flex flex-column gap-4">
                  {/* Q1: What learned */}
                  <div>
                    <label className="form-label fw-bold theme-text-main mb-1 d-flex align-items-center gap-2">
                      <span className="badge bg-primary rounded-circle">1</span> What did you study or build today?
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="e.g. Mastered event bubbling and event delegation; built a dynamic order row table with action handlers."
                      value={journalForm.what_learned}
                      onChange={(e) => setJournalForm({ ...journalForm, what_learned: e.target.value })}
                    />
                  </div>

                  {/* Q2: Deep understanding check */}
                  <div>
                    <label className="form-label fw-bold theme-text-main mb-1 d-flex align-items-center gap-2">
                      <span className="badge bg-primary rounded-circle">2</span> Did you understand concepts deeply or just watch tutorials?
                    </label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="e.g. Deeply understood how the DOM event propagation tree bubbles up; verified why e.target is different from e.currentTarget."
                      value={journalForm.what_understood}
                      onChange={(e) => setJournalForm({ ...journalForm, what_understood: e.target.value })}
                    />
                  </div>

                  {/* Q3: What was difficult */}
                  <div>
                    <label className="form-label fw-bold theme-text-main mb-1 d-flex align-items-center gap-2">
                      <span className="badge bg-primary rounded-circle">3</span> What was difficult or challenging?
                    </label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="e.g. Clicking a child <span> inside a button failed to read dataset attributes until I used e.target.closest('button')."
                      value={journalForm.what_was_difficult}
                      onChange={(e) => setJournalForm({ ...journalForm, what_was_difficult: e.target.value })}
                    />
                  </div>

                  {/* Q4: Solved independently */}
                  <div>
                    <label className="form-label fw-bold theme-text-main mb-1 d-flex align-items-center gap-2">
                      <span className="badge bg-primary rounded-circle">4</span> Did you solve problems independently today?
                    </label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="e.g. Solved LeetCode #3 completely solo with two pointers in 35m without checking editorial."
                      value={journalForm.solved_independently}
                      onChange={(e) => setJournalForm({ ...journalForm, solved_independently: e.target.value })}
                    />
                  </div>

                  {/* Q5: Needs revision */}
                  <div>
                    <label className="form-label fw-bold theme-text-main mb-1 d-flex align-items-center gap-2">
                      <span className="badge bg-primary rounded-circle">5</span> Which topics need revision or continued practice?
                    </label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="e.g. Practice event delegation with stopImmediatePropagation() on deeply nested components."
                      value={journalForm.needs_revision}
                      onChange={(e) => setJournalForm({ ...journalForm, needs_revision: e.target.value })}
                    />
                  </div>

                  {/* Q6: Tomorrow's focus */}
                  <div>
                    <label className="form-label fw-bold theme-text-main mb-1 d-flex align-items-center gap-2">
                      <span className="badge bg-primary rounded-circle">6</span> What is your highest-priority focus for tomorrow?
                    </label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="e.g. Start Phase 4 Async JavaScript: Promises, microtasks, event loop, and fetch API."
                      value={journalForm.tomorrow_focus}
                      onChange={(e) => setJournalForm({ ...journalForm, tomorrow_focus: e.target.value })}
                    />
                  </div>

                  <div className="pt-3 border-top text-end">
                    <button
                      type="submit"
                      disabled={savingJournal}
                      className="btn btn-primary px-5 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow"
                    >
                      <FaSave /> {savingJournal ? 'Saving...' : 'Save Daily Journal'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: FEYNMAN STUDY NOTES */}
      {activeTab === 'notes' && (
        <div>
          {/* Notes Control Bar */}
          <div className="card border-0 mb-4 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
            <div className="card-body p-3">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3">
                {/* Search */}
                <div className="position-relative flex-grow-1" style={{ maxWidth: '380px' }}>
                  <FaSearch className="position-absolute top-50 translate-middle-y text-muted ms-3" size={12} />
                  <input
                    type="text"
                    className="form-control form-control-sm ps-5"
                    placeholder="Search notes by title or content..."
                    value={noteSearch}
                    onChange={(e) => setNoteSearch(e.target.value)}
                  />
                </div>

                {/* Filter & Action */}
                <div className="d-flex align-items-center gap-2">
                  <select
                    className="form-select form-select-sm"
                    value={noteTypeFilter}
                    onChange={(e) => setNoteTypeFilter(e.target.value)}
                    style={{ width: '160px' }}
                  >
                    <option value="">All Note Types</option>
                    <option value="concept">Concepts</option>
                    <option value="snippet">Snippets</option>
                    <option value="mistake_log">Mistake Logs</option>
                    <option value="interview_qa">Interview Q&A</option>
                    <option value="deep_dive">Deep Dives</option>
                  </select>

                  <button
                    className="btn btn-primary btn-sm fw-semibold d-inline-flex align-items-center gap-2 px-3 flex-shrink-0"
                    onClick={handleOpenCreateNote}
                  >
                    <FaPlus size={11} /> Create Study Note
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Grid */}
          {notes.length === 0 ? (
            <div className="card border-0 p-5 text-center shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
              <FaBook size={32} className="text-muted mb-2 mx-auto" />
              <h5 className="theme-text-main fw-bold">No Study Notes Yet</h5>
              <p className="theme-text-sub small mb-3">
                Capture complex concepts in simple Markdown notes using the Feynman technique.
              </p>
              <div>
                <button className="btn btn-primary btn-sm px-4 fw-semibold" onClick={handleOpenCreateNote}>
                  + Write Your First Note
                </button>
              </div>
            </div>
          ) : (
            <div className="row g-3">
              {notes.map((note) => (
                <div key={note.id} className="col-12 col-md-6 col-xl-4">
                  <div
                    className="card h-100 shadow-sm border"
                    style={{ backgroundColor: 'var(--card-bg)', borderRadius: '14px' }}
                  >
                    <div className="card-body p-3 p-md-4 d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="badge bg-primary-subtle text-primary text-uppercase small">
                            {note.note_type.replace('_', ' ')}
                          </span>
                          <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <h6 className="theme-text-main fw-bold mb-2 fs-5">{note.title}</h6>

                        {note.topic && (
                          <div className="mb-2">
                            <span className="badge bg-secondary-subtle text-secondary small">
                              {note.topic.title}
                            </span>
                          </div>
                        )}

                        <div
                          className="theme-text-sub small mb-3 p-3 rounded"
                          style={{
                            backgroundColor: 'var(--hover-bg)',
                            maxHeight: '140px',
                            overflowY: 'auto',
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.5,
                          }}
                        >
                          {note.content_markdown}
                        </div>

                        {Array.isArray(note.tags) && note.tags.length > 0 && (
                          <div className="d-flex flex-wrap gap-1 mb-3">
                            {note.tags.map((tg, idx) => (
                              <span key={idx} className="badge bg-dark border border-secondary text-light small">
                                #{tg}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-top d-flex justify-content-end gap-2" style={{ borderColor: 'var(--border-color)' }}>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleOpenEditNote(note)}
                          title="Edit Note"
                        >
                          <FaPencilAlt size={11} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteNote(note.id, note.title)}
                          title="Delete Note"
                        >
                          <FaTrash size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Note Modal */}
      {showNoteModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content card border-0 shadow-lg" style={{ backgroundColor: 'var(--card-bg)' }}>
              <div className="modal-header border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
                <h5 className="modal-title fw-bold theme-text-main">
                  {editingNote ? 'Edit Study Note' : 'Create Feynman Study Note'}
                </h5>
                <button
                  type="button"
                  className="btn btn-sm btn-link theme-text-sub p-0"
                  onClick={() => setShowNoteModal(false)}
                >
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleSaveNote}>
                <div className="modal-body p-4 d-flex flex-column gap-3">
                  <div>
                    <label className="form-label small fw-semibold theme-text-sub">Note Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Memory Leak Prevention in Event Delegation"
                      value={noteForm.title}
                      onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold theme-text-sub">Note Type</label>
                      <select
                        className="form-select"
                        value={noteForm.note_type}
                        onChange={(e) => setNoteForm({ ...noteForm, note_type: e.target.value })}
                      >
                        <option value="concept">Concept (Feynman Explanation)</option>
                        <option value="snippet">Code Snippet & Pattern</option>
                        <option value="mistake_log">Mistake & Pitfall Log</option>
                        <option value="interview_qa">Interview Q&A</option>
                        <option value="deep_dive">Deep Dive Architecture</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold theme-text-sub">Link to Roadmap Topic (Optional)</label>
                      <select
                        className="form-select"
                        value={noteForm.topic_id}
                        onChange={(e) => setNoteForm({ ...noteForm, topic_id: e.target.value })}
                      >
                        <option value="">-- General Knowledge Note --</option>
                        {topics.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.subject_title ? `[${t.subject_title}] ` : ''}{t.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="form-label small fw-semibold theme-text-sub">Tags (Comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="javascript, dom, performance, memory"
                      value={noteForm.tags_string}
                      onChange={(e) => setNoteForm({ ...noteForm, tags_string: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label small fw-semibold theme-text-sub">
                      Note Content (Markdown supported) *
                    </label>
                    <textarea
                      className="form-control font-monospace"
                      rows="8"
                      placeholder="Write your explanation in clear, simple terms as if teaching someone else..."
                      value={noteForm.content_markdown}
                      onChange={(e) => setNoteForm({ ...noteForm, content_markdown: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-top py-3 px-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowNoteModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm fw-semibold px-4">
                    {editingNote ? 'Update Note' : 'Save Note'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

