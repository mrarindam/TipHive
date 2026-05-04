'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/cropImage';
import { X, Check, RotateCcw } from 'lucide-react';

interface BannerCropperProps {
  image: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

const BannerCropper: React.FC<BannerCropperProps> = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteInternal = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    try {
      if (croppedAreaPixels) {
        const croppedImage = await getCroppedImg(image, croppedAreaPixels);
        if (croppedImage) {
          onCropComplete(croppedImage);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0B0F19] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7931A]/10 text-[#F7931A]">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-outfit text-xl font-black uppercase tracking-tighter text-white">Position your banner</h3>
              <p className="text-xs font-bold text-slate-500">Drag to position • 3:1 Aspect Ratio</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative h-[400px] w-full bg-[#1A2234]">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteInternal}
            onZoomChange={onZoomChange}
            classes={{
                containerClassName: "rounded-b-[2rem]",
            }}
          />
          {/* Desktop 3:1 Crop Guide */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-full border-y border-dashed border-white/40 bg-black/20" style={{ height: '59.25%' }}>
                <div className="absolute top-1 left-4 text-[8px] font-bold uppercase tracking-widest text-white/60">Desktop View Area (3:1)</div>
            </div>
            {/* Safe Area Indicator */}
            <div className="h-full w-[60%] border-x border-dashed border-[#F7931A]/30 bg-[#F7931A]/5">
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest text-[#F7931A]/60">Mobile Safe Area (60%)</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => onZoomChange(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/5 accent-[#F7931A]"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 rounded-2xl border border-white/5 bg-white/5 py-4 text-sm font-bold text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleCrop}
              className="flex-[2] btn-primary flex items-center justify-center gap-2 py-4 text-sm"
            >
              <Check className="h-4 w-4" />
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerCropper;
