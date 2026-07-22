import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Square, Video, Zap, ZapOff, Image as ImageIcon, Check, X, Circle, Camera as CameraIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CaptureMediaProps {
  onCapture: (mediaUrl: string, type: 'image' | 'video') => void;
  onClose: () => void;
}

export function CaptureMedia({ onCapture, onClose }: CaptureMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mode, setMode] = useState<'image' | 'video'>('image');
  const [capturedMedia, setCapturedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [flash, setFlash] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [facingMode, mode]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
  }, [isRecording]);

  const startCamera = async () => {
    stopCamera();
    setError(null);
    try {
      const constraints = {
        video: { 
          facingMode,
          aspectRatio: { ideal: 9/16 }
        },
        audio: mode === 'video'
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please enable camera access in your browser settings and refresh.');
      } else {
        setError('Could not access camera. Please make sure it is not being used by another app.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(videoRef.current, 0, 0);
      const url = canvas.toDataURL('image/jpeg');
      setCapturedMedia({ url, type: 'image' });
      stopCamera();
    }
  };

  const startRecording = () => {
    if (!stream) return;
    chunks.current = [];
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.current.push(e.data);
      }
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks.current, { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      setCapturedMedia({ url, type: 'video' });
      stopCamera();
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleFacingMode = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDone = () => {
    if (capturedMedia) {
      onCapture(capturedMedia.url, capturedMedia.type);
    }
  };

  const handleRetake = () => {
    setCapturedMedia(null);
    startCamera();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="absolute top-0 inset-x-0 p-6 flex items-center justify-between z-50">
        <button 
          onClick={onClose}
          className="p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        
        {capturedMedia ? (
          <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Preview</span>
          </div>
        ) : (
          <div className="flex bg-black/20 backdrop-blur-md p-1 rounded-full border border-white/10">
            <button 
              onClick={() => setMode('image')}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'image' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
            >
              Photo
            </button>
            <button 
              onClick={() => setMode('video')}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'video' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
            >
              Video
            </button>
          </div>
        )}

        <button 
          onClick={() => setFlash(!flash)}
          className={`p-2 rounded-full backdrop-blur-md transition-colors ${flash ? 'bg-yellow-400 text-black' : 'bg-black/20 text-white'}`}
        >
          {flash ? <Zap className="h-5 w-5" /> : <ZapOff className="h-5 w-5" />}
        </button>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative flex items-center justify-center bg-slate-900">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 text-center"
            >
              <div className="h-20 w-20 rounded-3xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 mx-auto">
                <CameraIcon className="h-10 w-10" />
              </div>
              <h3 className="text-white font-black text-xl mb-3 tracking-tight">Camera Access Required</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
                {error}
              </p>
              <button 
                onClick={startCamera}
                className="mt-8 px-6 py-3 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-100 transition-all"
              >
                Try Again
              </button>
            </motion.div>
          ) : capturedMedia ? (
            <motion.div 
              key="preview"
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              {capturedMedia.type === 'image' ? (
                <img src={capturedMedia.url} className="w-full h-full object-cover" alt="" />
              ) : (
                <video src={capturedMedia.url} className="w-full h-full object-cover" autoPlay loop muted playsInline />
              )}
              {flash && <div className="absolute inset-0 bg-white opacity-20 pointer-events-none" />}
            </motion.div>
          ) : (
            <motion.div 
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full"
            >
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />
              {isRecording && (
                <div className="absolute top-24 inset-x-0 flex justify-center pointer-events-none">
                  <div className="bg-rose-500 text-white px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg animate-pulse">
                    <div className="h-2 w-2 rounded-full bg-white" />
                    <span className="text-xs font-black tracking-widest uppercase">{formatTime(recordingTime)}</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      {!error && (
        <div className="absolute bottom-0 inset-x-0 p-10 flex items-center justify-between z-50 pb-16 bg-gradient-to-t from-black/80 to-transparent">
          {capturedMedia ? (
          <>
            <button 
              onClick={handleRetake}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="h-14 w-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:bg-white/20 transition-all">
                <RefreshCw className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Retake</span>
            </button>

            <button 
              onClick={handleDone}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center text-white shadow-2xl shadow-secondary/40 group-hover:scale-110 transition-all">
                <Check className="h-10 w-10 stroke-[3px]" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-white">Share Story</span>
            </button>

            <div className="w-14" /> {/* Spacer */}
          </>
        ) : (
          <>
            <button 
              onClick={toggleFacingMode}
              className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all"
            >
              <RefreshCw className="h-5 w-5" />
            </button>

            <div className="relative flex items-center justify-center">
              {mode === 'image' ? (
                <button 
                  onClick={takePhoto}
                  className="h-20 w-20 rounded-full border-4 border-white p-1 group"
                >
                  <div className="h-full w-full rounded-full bg-white group-active:scale-90 transition-transform shadow-xl" />
                </button>
              ) : (
                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`h-20 w-20 rounded-full border-4 p-1 transition-all ${isRecording ? 'border-rose-500' : 'border-white'}`}
                >
                  <div className={`h-full w-full rounded-full transition-all flex items-center justify-center ${isRecording ? 'bg-rose-500 rounded-lg scale-50' : 'bg-white'}`}>
                    {isRecording && <Square className="h-6 w-6 text-white fill-white" />}
                  </div>
                </button>
              )}
            </div>

            <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 opacity-50">
              <ImageIcon className="h-5 w-5" />
            </div>
          </>
        )}
        </div>
      )}
    </motion.div>
  );
}
