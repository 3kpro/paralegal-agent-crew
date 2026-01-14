"use client";

import { useState, useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Upload, FileText, X, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isAnalyzing?: boolean;
}

export default function FileUpload({ onFileSelect, isAnalyzing = false }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    setError(null);

    // Handle rejections
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors[0].code === 'file-too-large') {
        setError('File must be smaller than 10MB');
        toast.error('File too large');
      } else if (rejection.errors[0].code === 'file-invalid-type') {
        setError('Only PDF, DOCX, and TXT files are allowed');
        toast.error('Invalid file type');
      } else {
        setError(rejection.errors[0].message);
        toast.error('File upload failed');
      }
      return;
    }

    // Handle accepted file
    if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        onFileSelect(selectedFile);
        toast.success(`File uploaded: ${selectedFile.name}`);
    }
  }, [onFileSelect]);

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setError(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    disabled: isAnalyzing
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-8 transition-colors cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
          ${error ? 'border-red-300 bg-red-50' : ''}
          ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className={`p-4 rounded-full ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
            {isAnalyzing ? (
                 <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            ) : file ? (
                <FileText className="w-8 h-8 text-blue-600" />
            ) : (
                <Upload className="w-8 h-8 text-gray-500" />
            )}
          </div>

          <div className="space-y-1">
            {file ? (
                <div className="flex flex-col items-center">
                    <p className="text-lg font-semibold text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    {isAnalyzing ? (
                       <p className="text-sm font-medium text-blue-600 mt-2">Analyzing contract...</p>
                    ) : (
                        <button
                            onClick={removeFile}
                            className="mt-2 text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                            <X className="w-4 h-4" /> Remove file
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <p className="text-lg font-semibold text-gray-900">
                        {isDragActive ? "Drop the file here" : "Click to upload or drag & drop"}
                    </p>
                    <p className="text-sm text-gray-500">
                        PDF, DOCX, or TXT (Max 10MB)
                    </p>
                </>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-full text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
