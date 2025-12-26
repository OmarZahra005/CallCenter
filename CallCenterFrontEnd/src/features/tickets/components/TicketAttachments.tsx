import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Paperclip,
  Upload,
  Download,
  Trash2,
  File,
  FileText,
  FileImage,
  FileAudio,
  FileVideo,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  X,
  Loader2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Button } from '../../../components/ui';
import apiClient from '../../../api/client';

interface TicketAttachment {
  id: string;
  ticketId: string;
  uploadedBy?: string;
  uploadedByAgentName?: string;
  filename: string;
  fileUrl: string;
  fileSizeBytes: number;
  mimeType: string;
  createdAt: string;
}

interface TicketAttachmentsProps {
  ticketId: string;
  readOnly?: boolean;
  maxFiles?: number;
  maxFileSizeMb?: number;
  onAttachmentChange?: () => void;
}

// File type icons and colors
const getFileIcon = (mimeType: string, filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  // Images
  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'].includes(ext)) {
    return { icon: FileImage, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30' };
  }

  // PDFs and documents
  if (mimeType === 'application/pdf' || ext === 'pdf') {
    return { icon: FileText, color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/30' };
  }

  // Word documents
  if (mimeType.includes('word') || ['doc', 'docx'].includes(ext)) {
    return { icon: FileText, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' };
  }

  // Spreadsheets
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || ['xls', 'xlsx', 'csv'].includes(ext)) {
    return { icon: FileSpreadsheet, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' };
  }

  // Audio
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) {
    return { icon: FileAudio, color: 'text-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-900/30' };
  }

  // Video
  if (mimeType.startsWith('video/') || ['mp4', 'webm', 'mov', 'avi'].includes(ext)) {
    return { icon: FileVideo, color: 'text-pink-500', bgColor: 'bg-pink-100 dark:bg-pink-900/30' };
  }

  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return { icon: FileArchive, color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' };
  }

  // Code files
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'py', 'java', 'cs'].includes(ext)) {
    return { icon: FileCode, color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/30' };
  }

  // Default
  return { icon: File, color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-900/30' };
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// Format date
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const TicketAttachments = ({
  ticketId,
  readOnly = false,
  maxFiles = 10,
  maxFileSizeMb = 10,
  onAttachmentChange,
}: TicketAttachmentsProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch attachments
  const { data: attachments = [], isLoading, error: _error } = useQuery<TicketAttachment[]>({
    queryKey: ['ticket-attachments', ticketId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/tickets/${ticketId}/attachments`);
        return Array.isArray(response.data) ? response.data : [];
      } catch (err) {
        console.warn('Attachments endpoint not available:', err);
        return [];
      }
    },
    enabled: !!ticketId,
    retry: false,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(`/tickets/${ticketId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-attachments', ticketId] });
      onAttachmentChange?.();
    },
    onError: (error: any, file: File) => {
      const message = error.response?.data?.message || `Failed to upload ${file.name}`;
      setUploadErrors((prev) => [...prev, message]);
    },
    onSettled: (_, __, file: File) => {
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[file.name];
        return newProgress;
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      await apiClient.delete(`/tickets/${ticketId}/attachments/${attachmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-attachments', ticketId] });
      onAttachmentChange?.();
    },
  });

  // Validate file
  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSizeMb * 1024 * 1024) {
      return `File "${file.name}" exceeds ${maxFileSizeMb}MB limit`;
    }
    if (attachments.length >= maxFiles) {
      return `Maximum ${maxFiles} attachments allowed`;
    }
    return null;
  };

  // Handle file selection
  const handleFiles = useCallback((files: FileList | File[]) => {
    setUploadErrors([]);
    const fileArray = Array.from(files);

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        setUploadErrors((prev) => [...prev, error]);
      } else {
        uploadMutation.mutate(file);
      }
    });
  }, [attachments.length, maxFiles, maxFileSizeMb, uploadMutation]);

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (readOnly) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download attachment
  const handleDownload = (attachment: TicketAttachment) => {
    window.open(attachment.fileUrl, '_blank');
  };

  // Preview attachment (for images)
  const handlePreview = (attachment: TicketAttachment) => {
    window.open(attachment.fileUrl, '_blank');
  };

  // Check if file is previewable
  const isPreviewable = (mimeType: string): boolean => {
    return mimeType.startsWith('image/') || mimeType === 'application/pdf';
  };

  const isUploading = Object.keys(uploadProgress).length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="w-5 h-5 text-gray-500" />
          <h4 className="font-medium text-gray-900 dark:text-white">
            Attachments
            {attachments.length > 0 && (
              <span className="ml-2 text-sm text-gray-500">({attachments.length})</span>
            )}
          </h4>
        </div>
        {!readOnly && attachments.length < maxFiles && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-1" />
            Upload
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
        accept="*/*"
      />

      {/* Drop zone (when no attachments or dragging) */}
      {!readOnly && (attachments.length === 0 || isDragging) && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`} />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isDragging ? (
              'Drop files here...'
            ) : (
              <>
                Drag and drop files here, or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  browse
                </button>
              </>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Max {maxFileSizeMb}MB per file, up to {maxFiles} files
          </p>
        </div>
      )}

      {/* Upload errors */}
      <AnimatePresence>
        {uploadErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {uploadErrors.map((error, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
                <button
                  onClick={() => setUploadErrors((prev) => prev.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload progress */}
      <AnimatePresence>
        {Object.entries(uploadProgress).map(([filename, progress]) => (
          <motion.div
            key={filename}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
          >
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-blue-700 dark:text-blue-400 truncate">{filename}</p>
              <div className="w-full h-1.5 bg-blue-200 dark:bg-blue-800 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <span className="text-sm text-blue-600 dark:text-blue-400">{progress}%</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      )}

      {/* Attachments list */}
      {!isLoading && attachments.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence>
            {attachments.map((attachment, index) => {
              const fileInfo = getFileIcon(attachment.mimeType, attachment.filename);
              const FileIcon = fileInfo.icon;

              return (
                <motion.div
                  key={attachment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 group hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {/* File icon */}
                  <div className={`w-10 h-10 rounded-lg ${fileInfo.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <FileIcon className={`w-5 h-5 ${fileInfo.color}`} />
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {attachment.filename}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatFileSize(attachment.fileSizeBytes)}</span>
                      <span>•</span>
                      <span>{formatDate(attachment.createdAt)}</span>
                      {attachment.uploadedByAgentName && (
                        <>
                          <span>•</span>
                          <span>by {attachment.uploadedByAgentName}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isPreviewable(attachment.mimeType) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(attachment)}
                        className="h-8 w-8 p-0"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(attachment)}
                      className="h-8 w-8 p-0"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(attachment.id)}
                        disabled={deleteMutation.isPending}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete"
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Empty state (when not in drop zone mode) */}
      {!isLoading && attachments.length === 0 && readOnly && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No attachments</p>
        </div>
      )}

      {/* Drag overlay for existing attachments */}
      {!readOnly && attachments.length > 0 && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative ${isDragging ? '' : 'hidden'}`}
        >
          {isDragging && (
            <div className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20 border-2 border-dashed border-primary-500 rounded-lg flex items-center justify-center z-10">
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-primary-500" />
                <p className="text-sm text-primary-600 dark:text-primary-400">Drop files here...</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketAttachments;
