'use client';

import { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X, Globe, Link2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
type UrlEntry = {
  _id: string;
  title: string;
  url: string;
  category: string;
  createdAt: string;
};

export default function UrlCategoryManager({ categoryTitle }: { categoryTitle: string }) {
  const [urls, setUrls] = useState<UrlEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ title: '', url: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch logic
  const fetchUrls = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/urls?category=${encodeURIComponent(categoryTitle)}`);
      if (res.ok) {
        const data = await res.json();
        setUrls(data);
      } else {
        setError('Failed to fetch data');
      }
    } catch (e) {
      setError('An error occurred while fetching urls.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, [categoryTitle]);

  // Handlers
  const handleOpenModal = (entry?: UrlEntry) => {
    if (entry) {
      setIsEditing(true);
      setCurrentId(entry._id);
      setFormData({ title: entry.title, url: entry.url });
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setFormData({ title: '', url: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ title: '', url: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const endpoint = isEditing ? `/api/urls/${currentId}` : '/api/urls';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, category: categoryTitle }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Failed to save URL');
      } else {
        handleCloseModal();
        fetchUrls();
      }
    } catch (error) {
      setError('An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this URL? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/urls/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUrls();
      } else {
        alert('Failed to delete URL');
      }
    } catch (err) {
      alert('Error deleting URL');
    }
  };

  const filteredUrls = urls.filter(u => 
    u.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col pt-6 pb-12 px-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-500" />
            {categoryTitle}
          </h1>
          <p className="text-slate-400 mt-1">Manage external links and API routes for {categoryTitle}</p>
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add New URL
        </button>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3 mb-6">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          {error}
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 mb-6 flex flex-wrap gap-4 backdrop-blur-sm">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or URL..."
            className="w-full bg-slate-900/50 border border-slate-700/50 text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
            Loading records...
          </div>
        ) : filteredUrls.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Link2 className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-lg text-white font-medium mb-1">No URLs Found</p>
            <p className="text-center">{searchQuery ? 'Try adjusting your search criteria' : 'Click "Add New URL" to create your first entry in this category.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800/80">
                  <th className="py-4 px-6 text-sm font-semibold text-slate-300">Title</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-300">URL Destination</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-300">Created At</th>
                  <th className="py-4 px-6 text-sm font-semibold text-slate-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredUrls.map((url) => (
                    <motion.tr
                      key={url._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ backgroundColor: 'rgba(51, 65, 85, 0.4)' }}
                      className="border-b border-slate-700/50 group transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-white">{url.title}</td>
                      <td className="py-4 px-6">
                        <a 
                          href={url.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-400 hover:text-blue-300 underline underline-offset-4 line-clamp-1 max-w-[300px]"
                        >
                          {url.url}
                        </a>
                      </td>
                      <td className="py-4 px-6 text-slate-400 text-sm">
                        {new Date(url.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenModal(url)}
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(url._id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={handleCloseModal}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {isEditing ? 'Edit URL Entry' : 'Add New URL'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Title Name</label>
                    <input
                      type="text"
                      className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Server 1 Roll Number Search"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Destination URL</label>
                    <input
                      type="url"
                      className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/api"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full relative bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                    >
                      {isSubmitting ? (
                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                      ) : (
                        isEditing ? 'Save Changes' : 'Create URL'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
