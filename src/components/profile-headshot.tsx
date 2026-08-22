import { useState, useEffect, useRef } from "react";
import { Camera, Upload, RotateCcw, Check } from "lucide-react";
import defaultHeadshot from "@/assets/headshot.jpg";

interface ProfileHeadshotProps {
  name: string;
}

const STORAGE_KEY = "portfolio_user_headshot";

export function ProfileHeadshot({ name }: ProfileHeadshotProps) {
  const [imageSrc, setImageSrc] = useState<string>(defaultHeadshot);
  const [isCustom, setIsCustom] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setImageSrc(saved);
        setIsCustom(true);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setImageSrc(result);
        setIsCustom(true);
        try {
          localStorage.setItem(STORAGE_KEY, result);
        } catch {
          // If localStorage limit exceeded, still keeps in memory
        }
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3500);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageSrc(defaultHeadshot);
    setIsCustom(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="relative group">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />

      <div
        id="profile-headshot-container"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative aspect-square overflow-hidden rounded-2xl border bg-surface cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-primary ring-2 ring-primary/40 scale-[0.99]"
            : "border-border hover:border-primary/50"
        }`}
        title="Click or drag & drop to upload your exact photo"
      >
        <img
          src={imageSrc}
          alt={name}
          className="size-full object-cover object-[center_18%] transition-transform duration-300 group-hover:scale-[1.02]"
          loading="eager"
        />

        {/* Hover overlay with upload prompt */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white p-4 text-center">
          <Camera className="size-7 mb-2 text-white" />
          <p className="text-xs font-semibold text-white">Click or Drop Photo</p>
          <p className="text-[11px] text-white/80 mt-0.5">Upload exact picture</p>
        </div>

        {/* Quick action button pill on bottom-right */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 rounded-lg bg-background/90 backdrop-blur-md px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm border border-border transition-all hover:bg-background hover:scale-105"
        >
          <Upload className="size-3.5 text-primary" />
          <span>Upload</span>
        </button>

        {/* Reset button if custom image is loaded */}
        {isCustom && (
          <button
            type="button"
            onClick={handleReset}
            title="Reset to default"
            className="absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-lg bg-background/90 backdrop-blur-md text-muted-foreground shadow-sm border border-border transition-all hover:text-foreground hover:bg-background"
          >
            <RotateCcw className="size-3.5" />
          </button>
        )}
      </div>

      {/* Success notification */}
      {showSuccessToast && (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white shadow-md animate-fade-in z-20">
          <Check className="size-3.5" />
          <span>Photo updated successfully!</span>
        </div>
      )}
    </div>
  );
}
