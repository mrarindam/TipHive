'use client';

import { motion } from 'framer-motion';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';

interface FileUploadProgressProps {
  progress: number;
  fileName?: string;
  status: 'uploading' | 'success' | 'error';
}

export default function FileUploadProgress({ progress, fileName, status }: FileUploadProgressProps) {
  return (
    <div className="w-full max-w-md bg-[#111827] border border-white/10 rounded-[2rem] p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
          status === 'success' ? 'bg-green-500/10 text-green-500' :
          status === 'error' ? 'bg-red-500/10 text-red-500' :
          'bg-[#F7931A]/10 text-[#F7931A]'
        }`}>
          {status === 'uploading' && <UploadCloud className="animate-bounce" size={24} />}
          {status === 'success' && <CheckCircle2 size={24} />}
          {status === 'error' && <AlertCircle size={24} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-black uppercase tracking-widest text-[10px] mb-1">
            {status === 'uploading' ? 'Uploading Media...' : status === 'success' ? 'Upload Complete' : 'Upload Failed'}
          </p>
          <p className="text-slate-500 text-xs truncate font-medium">{fileName || 'Processing file...'}</p>
        </div>
        <div className="text-right">
          <span className="text-white font-black text-lg font-outfit">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="relative h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={`absolute top-0 left-0 h-full rounded-full ${
            status === 'success' ? 'bg-green-500' :
            status === 'error' ? 'bg-red-500' :
            'bg-gradient-to-r from-[#F7931A] to-[#8A2BE2]'
          } shadow-[0_0_15px_rgba(247,147,26,0.5)]`}
        />
      </div>
      
      {status === 'uploading' && (
        <p className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-4 animate-pulse">
          Optimizing your content for on-chain storage
        </p>
      )}
    </div>
  );
}
