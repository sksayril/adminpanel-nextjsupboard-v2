import mongoose from 'mongoose';

const AdSettingsSchema = new mongoose.Schema({
  nativeAdId: { type: String, default: '' },
  isNativeActive: { type: Boolean, default: false },
  
  bannerAdId: { type: String, default: '' },
  isBannerActive: { type: Boolean, default: true },
  
  interstitialAdId: { type: String, default: '' },
  isInterstitialActive: { type: Boolean, default: true },
  interstitialTapCount: { type: Number, default: 3 },
  
  videoAdId: { type: String, default: '' },
  isVideoActive: { type: Boolean, default: false },
  
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.AdSettings || mongoose.model('AdSettings', AdSettingsSchema);
