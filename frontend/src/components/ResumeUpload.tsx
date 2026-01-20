import React, { useCallback, useState } from 'react';
import { Upload, FileText, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResumeUploadProps {
  onUpload: (file: File) => void;
  isUploading?: boolean;
  uploadedFile?: File | null;
}

export function ResumeUpload({ onUpload, isUploading = false, uploadedFile }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.type.includes('document'))) {
      onUpload(file);
    }
  }, [onUpload]);
  
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  }, [onUpload]);

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 text-center',
        isDragging && 'border-primary bg-primary/5 scale-[1.02]',
        uploadedFile && !isUploading && 'border-success bg-success/5',
        !isDragging && !uploadedFile && 'border-border hover:border-primary/50 hover:bg-muted/50',
        isUploading && 'border-primary bg-primary/5'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isUploading}
      />
      
      <div className="flex flex-col items-center gap-4">
        {isUploading ? (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Analyzing your resume...</p>
              <p className="text-sm text-muted-foreground mt-1">This may take a moment</p>
            </div>
          </>
        ) : uploadedFile ? (
          <>
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <Check className="w-8 h-8 text-success" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{uploadedFile.name}</p>
              <p className="text-sm text-muted-foreground mt-1">Resume uploaded successfully</p>
            </div>
          </>
        ) : (
          <>
            <div className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center transition-colors',
              isDragging ? 'bg-primary/20' : 'bg-muted'
            )}>
              {isDragging ? (
                <FileText className="w-8 h-8 text-primary" />
              ) : (
                <Upload className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {isDragging ? 'Drop your resume here' : 'Upload your resume'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Supports PDF, DOC, DOCX
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
