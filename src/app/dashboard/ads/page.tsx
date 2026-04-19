'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    bannerAdId: '',
    isBannerActive: false,
    interstitialAdId: '',
    isInterstitialActive: false,
    interstitialTapCount: 3,
    nativeAdId: '',
    isNativeActive: false,
    videoAdId: '',
    isVideoActive: false,
  });

  useEffect(() => {
    fetchAdsConfig();
  }, []);

  const fetchAdsConfig = async () => {
    try {
      const res = await fetch('/api/ads');
      if (res.ok) {
        const data = await res.json();
        setFormData({
          bannerAdId: data.bannerAdId || '',
          isBannerActive: data.isBannerActive || false,
          interstitialAdId: data.interstitialAdId || '',
          isInterstitialActive: data.isInterstitialActive || false,
          interstitialTapCount: data.interstitialTapCount || 3,
          nativeAdId: data.nativeAdId || '',
          isNativeActive: data.isNativeActive || false,
          videoAdId: data.videoAdId || '',
          isVideoActive: data.isVideoActive || false,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Ad configurations saved successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save configuration.' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'An error occurred during save.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const renderAdCard = (
    title: string, 
    idField: keyof typeof formData, 
    activeField: keyof typeof formData, 
    placeholder: string
  ) => {
    return (
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-lg shadow-slate-900/20 backdrop-blur-sm transition-colors hover:border-slate-600">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${formData[activeField] ? 'text-green-400' : 'text-slate-500'}`}>
              {formData[activeField] ? 'Active' : 'Inactive'}
            </span>
            <button
              onClick={() => setFormData({ ...formData, [activeField]: !formData[activeField] })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData[activeField] ? 'bg-green-500' : 'bg-slate-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData[activeField] ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Ad Unit ID</label>
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder={placeholder}
            value={String(formData[idField as keyof typeof formData])}
            onChange={(e) => setFormData({ ...formData, [idField]: e.target.value })}
          />
        </div>

        {/* Special Case for Interstitial Tap Count */}
        {title === 'Interstitial Ads' && (
          <div className="space-y-2 mt-4">
            <label className="text-sm font-medium text-slate-400 flex justify-between">
              <span>Show Ad Every "X" Taps</span>
              <span className="text-blue-400">{formData.interstitialTapCount} Taps</span>
            </label>
            <input
              type="range"
              min="1"
              max="20"
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              value={formData.interstitialTapCount}
              onChange={(e) => setFormData({ ...formData, interstitialTapCount: parseInt(e.target.value) })}
            />
            <p className="text-xs text-slate-500">How many user clicks required before the ad triggers.</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
     return (
       <div className="w-full h-full flex items-center justify-center pt-20">
         <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
       </div>
     );
  }

  return (
    <div className="w-full h-full flex flex-col pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-blue-500" />
            Google Ads Control
          </h1>
          <p className="text-slate-400 mt-1">Manage all your native, banner, interstitial, and video ad units globally.</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70"
        >
          {saving ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
               <Save className="w-5 h-5" />
               Save Configuration
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`flex items-center gap-3 p-4 rounded-xl mb-6 shadow-lg ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderAdCard('Banner Ads', 'bannerAdId', 'isBannerActive', 'ca-app-pub-XXXXX/XXXXX')}
        {renderAdCard('Native Ads', 'nativeAdId', 'isNativeActive', 'ca-app-pub-XXXXX/XXXXX')}
        {renderAdCard('Interstitial Ads', 'interstitialAdId', 'isInterstitialActive', 'ca-app-pub-XXXXX/XXXXX')}
        {renderAdCard('Video / Reward Ads', 'videoAdId', 'isVideoActive', 'ca-app-pub-XXXXX/XXXXX')}
      </div>
    </div>
  );
}
