/**
 * Video Upload Service - Production Ready
 * 
 * Handles video uploads to Firebase Storage with:
 * - Resumable uploads with progress tracking
 * - YouTube URL parsing
 * - Proper error handling
 * - Firestore metadata management
 * 
 * @module services/videoUploadService
 */

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  type UploadTask,
  type UploadTaskSnapshot,
} from 'firebase/storage';
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db, storage } from '../lib/firebase';

// ============================================================================
// Types
// ============================================================================

export type VideoType = 'upload' | 'youtube';
export type VideoStatus = 'uploading' | 'processing' | 'ready' | 'error';

export interface VideoMetadata {
  id: string;
  type: VideoType;
  status: VideoStatus;
  
  // URLs
  originalUrl?: string;    // Firebase Storage URL for uploads
  processedUrl?: string;   // Transcoded video URL (after processing)
  previewUrl?: string;     // Thumbnail/preview image
  youtubeId?: string;      // YouTube video ID
  
  // File info
  contentType?: string;
  size?: number;           // bytes
  duration?: number;       // seconds
  filename?: string;
  
  // Context
  entityType?: 'exercise' | 'workout' | 'client';
  entityId?: string;
  
  // Timestamps
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
  createdBy: string;
  
  // Error handling
  errorMessage?: string;
  retryCount?: number;
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  state: 'running' | 'paused' | 'error' | 'success' | 'canceled';
}

export interface UploadResult {
  success: boolean;
  videoId?: string;
  metadata?: VideoMetadata;
  error?: string;
}

export type ProgressCallback = (progress: UploadProgress) => void;

// ============================================================================
// Constants
// ============================================================================

const VIDEOS_COLLECTION = 'videos';
const MAX_FILE_SIZE = 150 * 1024 * 1024; // 150MB
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_EXTENSIONS = ['.mp4', '.webm', '.mov'];

// ============================================================================
// Validation
// ============================================================================

export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const isValidType = ALLOWED_TYPES.includes(file.type) || 
    file.type.startsWith('video/');
  
  // Check extension as fallback
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  const isValidExtension = ALLOWED_EXTENSIONS.includes(extension);
  
  if (!isValidType && !isValidExtension) {
    return { 
      valid: false, 
      error: 'Формат не поддерживается. Используйте MP4, MOV или WEBM.' 
    };
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = Math.round(file.size / 1024 / 1024);
    return { 
      valid: false, 
      error: `Файл слишком большой (${sizeMB}MB). Максимум 150MB.` 
    };
  }
  
  if (file.size === 0) {
    return { valid: false, error: 'Файл пустой.' };
  }
  
  return { valid: true };
}

// ============================================================================
// YouTube Parsing
// ============================================================================

const YOUTUBE_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;

export function parseYouTubeUrl(url: string): { valid: boolean; youtubeId?: string; error?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL не указан' };
  }
  
  const match = url.match(YOUTUBE_REGEX);
  
  if (!match || !match[1]) {
    return { valid: false, error: 'Некорректная ссылка YouTube' };
  }
  
  return { valid: true, youtubeId: match[1] };
}

export function getYouTubeThumbnail(youtubeId: string, quality: 'default' | 'hq' | 'maxres' = 'hq'): string {
  const qualityMap = {
    default: 'default',
    hq: 'hqdefault',
    maxres: 'maxresdefault',
  };
  return `https://img.youtube.com/vi/${youtubeId}/${qualityMap[quality]}.jpg`;
}

export function getYouTubeEmbedUrl(youtubeId: string): string {
  return `https://www.youtube.com/embed/${youtubeId}`;
}

// ============================================================================
// File Upload with Resumable Support
// ============================================================================

export async function uploadVideoFile(
  file: File,
  userId: string,
  options: {
    entityType?: 'exercise' | 'workout' | 'client';
    entityId?: string;
    onProgress?: ProgressCallback;
  } = {}
): Promise<UploadResult> {
  // Validate file
  const validation = validateVideoFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }
  
  // Generate unique ID
  const videoId = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  // Determine extension
  let extension = file.name.split('.').pop()?.toLowerCase() || 'mp4';
  if (!['mp4', 'webm', 'mov'].includes(extension)) {
    extension = 'mp4';
  }
  
  // Storage path
  const storagePath = `videos/${userId}/${videoId}.${extension}`;
  const storageRef = ref(storage, storagePath);
  
  // Create initial metadata in Firestore
  const initialMetadata: Omit<VideoMetadata, 'id'> = {
    type: 'upload',
    status: 'uploading',
    contentType: file.type || `video/${extension}`,
    size: file.size,
    filename: file.name,
    entityType: options.entityType,
    entityId: options.entityId,
    createdAt: serverTimestamp() as Timestamp,
    createdBy: userId,
    retryCount: 0,
  };
  
  await setDoc(doc(db, VIDEOS_COLLECTION, videoId), initialMetadata);
  
  return new Promise((resolve) => {
    // Start resumable upload
    const uploadTask: UploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type || `video/${extension}`,
      customMetadata: {
        originalName: file.name,
        uploadedBy: userId,
        videoId: videoId,
      },
    });
    
    uploadTask.on(
      'state_changed',
      // Progress handler
      (snapshot: UploadTaskSnapshot) => {
        const progress: UploadProgress = {
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          percentage: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
          state: snapshot.state as UploadProgress['state'],
        };
        options.onProgress?.(progress);
      },
      // Error handler
      async (error) => {
        let errorMessage = 'Ошибка загрузки';
        
        switch (error.code) {
          case 'storage/unauthorized':
            errorMessage = 'Нет прав на загрузку';
            break;
          case 'storage/canceled':
            errorMessage = 'Загрузка отменена';
            break;
          case 'storage/retry-limit-exceeded':
            errorMessage = 'Превышен лимит попыток. Проверьте соединение.';
            break;
          case 'storage/quota-exceeded':
            errorMessage = 'Превышена квота хранилища';
            break;
          default:
            errorMessage = 'Ошибка загрузки. Попробуйте снова.';
        }
        
        // Update Firestore with error
        await updateDoc(doc(db, VIDEOS_COLLECTION, videoId), {
          status: 'error',
          errorMessage,
          updatedAt: serverTimestamp(),
        });
        
        resolve({ success: false, videoId, error: errorMessage });
      },
      // Success handler
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Update Firestore with success
          const updatedMetadata: Partial<VideoMetadata> = {
            status: 'processing', // Will be set to 'ready' after server processing
            originalUrl: downloadUrl,
            updatedAt: serverTimestamp() as Timestamp,
          };
          
          await updateDoc(doc(db, VIDEOS_COLLECTION, videoId), updatedMetadata);
          
          // For now, set to ready immediately (server processing would update this)
          // In production, Cloud Run would handle transcoding
          setTimeout(async () => {
            const currentDoc = await getDoc(doc(db, VIDEOS_COLLECTION, videoId));
            if (currentDoc.exists() && currentDoc.data()?.status === 'processing') {
              await updateDoc(doc(db, VIDEOS_COLLECTION, videoId), {
                status: 'ready',
                processedUrl: downloadUrl, // Same as original until server processes
                updatedAt: serverTimestamp(),
              });
            }
          }, 2000);
          
          resolve({
            success: true,
            videoId,
            metadata: {
              id: videoId,
              ...initialMetadata,
              originalUrl: downloadUrl,
              status: 'processing',
            } as VideoMetadata,
          });
        } catch {
          resolve({ success: false, videoId, error: 'Не удалось получить URL файла' });
        }
      }
    );
  });
}

// ============================================================================
// YouTube Video Save
// ============================================================================

export async function saveYouTubeVideo(
  url: string,
  userId: string,
  options: {
    entityType?: 'exercise' | 'workout' | 'client';
    entityId?: string;
  } = {}
): Promise<UploadResult> {
  const parsed = parseYouTubeUrl(url);
  
  if (!parsed.valid || !parsed.youtubeId) {
    return { success: false, error: parsed.error };
  }
  
  const videoId = `yt_${parsed.youtubeId}_${Date.now()}`;
  
  const metadata: Omit<VideoMetadata, 'id'> = {
    type: 'youtube',
    status: 'ready',
    youtubeId: parsed.youtubeId,
    originalUrl: url,
    previewUrl: getYouTubeThumbnail(parsed.youtubeId),
    entityType: options.entityType,
    entityId: options.entityId,
    createdAt: serverTimestamp() as Timestamp,
    createdBy: userId,
  };
  
  await setDoc(doc(db, VIDEOS_COLLECTION, videoId), metadata);
  
  return {
    success: true,
    videoId,
    metadata: { id: videoId, ...metadata } as VideoMetadata,
  };
}

// ============================================================================
// Get Video
// ============================================================================

export async function getVideo(videoId: string): Promise<VideoMetadata | null> {
  const docRef = doc(db, VIDEOS_COLLECTION, videoId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return { id: docSnap.id, ...docSnap.data() } as VideoMetadata;
}

export async function getVideosByEntity(
  entityType: 'exercise' | 'workout' | 'client',
  entityId: string
): Promise<VideoMetadata[]> {
  const q = query(
    collection(db, VIDEOS_COLLECTION),
    where('entityType', '==', entityType),
    where('entityId', '==', entityId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as VideoMetadata));
}

// ============================================================================
// Update Video Status (for server-side processing callback)
// ============================================================================

export async function updateVideoStatus(
  videoId: string,
  status: VideoStatus,
  updates: Partial<VideoMetadata> = {}
): Promise<void> {
  await updateDoc(doc(db, VIDEOS_COLLECTION, videoId), {
    status,
    ...updates,
    updatedAt: serverTimestamp(),
  });
}
