"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Link as LinkIcon, Loader2, AlertCircle } from 'lucide-react';

interface UrlEntry {
  _id: string;
  title: string;
  url: string;
  category: string;
}

export default function UrlsManager() {
  const [urls, setUrls] = useState<UrlEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ title: '', url: '', category: 'general' });
  const [formError, setFormError] = useState('');

  const fetchUrls = async () => {
    try {
      const res = await fetch('/api/urls');
      if (res.ok) {
        const data = await res.json();
        setUrls(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      if (isEditing) {
        const res = await fetch(`/api/urls/${isEditing}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setIsEditing(null);
          setFormData({ title: '', url: '', category: 'general' });
          fetchUrls();
        } else {
          const err = await res.json();
          setFormError(err.error || 'Failed to update');
        }
      } else {
        const res = await fetch('/api/urls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setFormData({ title: '', url: '', category: 'general' });
          fetchUrls();
        } else {
          const err = await res.json();
          setFormError(err.error || 'Failed to add');
        }
      }
    } catch (err) {
      setFormError('Network error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this URL?')) return;
    try {
      const res = await fetch(`/api/urls/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUrls();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (entry: UrlEntry) => {
    setIsEditing(entry._id);
    setFormData({ title: entry.title, url: entry.url, category: entry.category });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setFormData({ title: '', url: '', category: 'general' });
    setFormError('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Manage URLs</h2>
        <p className="text-slate-400 mt-1">Add, edit, or delete external URLs to be shown in the app sidebar.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4">
          {isEditing ? 'Edit URL' : 'Add New URL'}
        </h3>
        
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="e.g. Official Site"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-1">URL</label>
            <input
              type="url"
              required
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="https://example.com"
            />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            {isEditing && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors font-medium"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white transition-colors flex items-center gap-2 font-medium"
            >
              {isEditing ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isEditing ? 'Update URL' : 'Save URL'}
            </button>
          </div>
        </form>
      </motion.div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Existing URLs</h3>
          <p className="text-sm text-slate-400">Total: {urls.length}</p>
        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : urls.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <LinkIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No URLs added yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-800/60">
            <AnimatePresence>
              {urls.map((entry) => (
                <motion.li
                  key={entry._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 sm:px-6 hover:bg-slate-800/30 transition-colors flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <LinkIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-white font-medium truncate">{entry.title}</h4>
                      <a href={entry.url} target="_blank" rel="noreferrer" className="text-sm text-slate-400 hover:text-primary transition-colors truncate block">
                        {entry.url}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
