'use client';

import { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, Image as ImageIcon, X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Banner = {
  _id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  createdAt: string;
};

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', linkUrl: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/banners');
      if (res.ok) {
        const data = await res.json();
        setBanners(data);
      }
    } catch (e) {
      setError('An error occurred fetching banners.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ title: '', linkUrl: '' });
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  // Resize Image to Exactly 1280x720 natively!
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;

    img.onload = () => {
      // Create canvas at exact required size
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw and scale the image onto the canvas
      ctx.drawImage(img, 0, 0, 1280, 720);

      // Convert back to file
      canvas.toBlob((blob) => {
        if (blob) {
          const resizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          setSelectedFile(resizedFile);
          setPreviewUrl(URL.createObjectURL(resizedFile));
        }
      }, 'image/jpeg', 0.9);
      URL.revokeObjectURL(url);
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }
    if (banners.length >= 3) {
      setError("Maximum limit of 3 banners reached. Please delete one first.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('linkUrl', formData.linkUrl);
    submitData.append('image', selectedFile);

    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        body: submitData,
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.error || 'Failed to upload banner');
      } else {
        handleCloseModal();
        fetchBanners();
      }
    } catch (err) {
      setError('An error occurred during upload.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to completely delete "${title}" configuration and its file from AWS S3?`)) return;
    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBanners();
      } else {
        alert('Failed to delete banner');
      }
    } catch (err) {
      alert('Error deleting banner');
    }
  };

  return (
    <div className="w-full h-full flex flex-col pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-blue-500" />
            App Banners
          </h1>
          <p className="text-slate-400 mt-1">Manage top banners displayed on the mobile app (Max 3, auto-resized 1280x720)</p>
        </div>
        
        <button
          onClick={() => {
            if (banners.length >= 3) {
               alert("Maximum 3 banners reached! Please delete a banner to upload a new one.");
               return;
            }
            setIsModalOpen(true);
          }}
          disabled={banners.length >= 3}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Add Banner ({banners.length}/3)
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center text-slate-400 py-20">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
          Loading banners...
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-12 flex flex-col items-center text-center backdrop-blur-sm">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-xl text-white font-medium mb-2">No Banners Found</p>
          <p className="text-slate-400 max-w-sm">You haven&apos;t uploaded any banners yet. Click the button above to add your first 16:9 banner for the app.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {banners.map((banner) => (
              <motion.div
                key={banner._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden group hover:border-blue-500/50 transition-all flex flex-col shadow-xl"
              >
                {/* 16:9 Aspect Ratio Container for the Image Preview */}
                <div className="aspect-video w-full relative bg-slate-900 border-b border-slate-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={banner.imageUrl} alt={banner.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                  
                  {/* Floating Delete Button */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDelete(banner._id, banner.title)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-lg transition-colors"
                      title="Delete S3 Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-5 flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-white truncate" title={banner.title}>{banner.title}</h3>
                  {banner.linkUrl ? (
                    <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm hover:underline truncate">
                      {banner.linkUrl}
                    </a>
                  ) : (
                    <p className="text-slate-500 text-sm italic">No click link provided</p>
                  )}
                  <p className="text-xs text-slate-400 mt-2">
                    S3 Upload &bull; {new Date(banner.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative"
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
                <h2 className="text-2xl font-bold text-white mb-6">Upload New Banner</h2>
                
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3 mb-5">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Banner Title</label>
                    <input
                      type="text"
                      className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Special Offer or New Notification"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Target Click URL (Optional)</label>
                    <input
                      type="url"
                      className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. https://play.google.com/store/apps/details?..."
                      value={formData.linkUrl}
                      onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    />
                    <p className="text-xs text-slate-500">The webpage or app link opened when a user clicks the banner.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Image file</label>
                    
                    <div 
                      className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-colors cursor-pointer group ${previewUrl ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700 hover:border-slate-500 bg-slate-800/50'}`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                      
                      {previewUrl ? (
                         <div className="w-full aspect-video relative rounded-lg overflow-hidden bg-black/50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={previewUrl} className="w-full h-full object-contain" alt="Preview" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-white font-medium text-sm">Click to change image</p>
                            </div>
                         </div>
                      ) : (
                         <div className="text-center py-6">
                            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                            <p className="text-slate-300 font-medium">Click to select image</p>
                            <p className="text-slate-500 text-xs mt-1">Automatically resized to 1280x720 before upload</p>
                         </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || !selectedFile}
                      className="w-full relative bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Uploading to AWS S3...
                        </div>
                      ) : (
                        'Upload & Save Banner'
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
