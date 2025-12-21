/**
 * Video Service - Trainer OS
 * 
 * Manages client video uploads and coach comments with timecodes.
 * Videos are recorded in-app and uploaded to Firebase Storage.
 * 
 * @module services/videoService
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../lib/firebase';

// ============================================================================
// Types
// ============================================================================

export type VideoStatus = 'uploading' | 'processing' | 'ready' | 'failed';

export interface ClientVideo {
  id: string;
  clientId: string;
  coachId: string;
  sessionId?: string; // Link to workout session
  exerciseId?: string;
  exerciseName?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number; // seconds
  fileSize?: number; // bytes
  status: VideoStatus;
  uploadedAt: string;
  processedAt?: string;
}

export type VideoCommentType = 'comment' | 'correction' | 'praise';

export interface VideoComment {
  id: string;
  videoId: string;
  coachId: string;
  coachName?: string;
  timecode: number; // seconds into video
  comment: string;
  type?: VideoCommentType;
  createdAt: string;
}

export interface VideoWithComments extends ClientVideo {
  comments: VideoComment[];
}

// ============================================================================
// Constants
// ============================================================================

const VIDEOS_COLLECTION = 'clientVideos';
const COMMENTS_COLLECTION = 'videoComments';

// ============================================================================
// Video Upload
// ============================================================================

/**
 * Upload video from blob
 */
export async function uploadVideo(
  clientId: string,
  coachId: string,
  videoBlob: Blob,
  metadata: {
    sessionId?: string;
    exerciseId?: string;
    exerciseName?: string;
    duration: number;
  }
): Promise<string> {
  const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const storagePath = `videos/${clientId}/${videoId}.webm`;
  
  try {
    // Upload to Firebase Storage
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, videoBlob);
    const videoUrl = await getDownloadURL(storageRef);
    
    // Create Firestore document
    const now = new Date().toISOString();
    const videoData: Omit<ClientVideo, 'id'> = {
      clientId,
      coachId,
      sessionId: metadata.sessionId,
      exerciseId: metadata.exerciseId,
      exerciseName: metadata.exerciseName,
      videoUrl,
      duration: metadata.duration,
      fileSize: videoBlob.size,
      status: 'ready',
      uploadedAt: now,
      processedAt: now,
    };
    
    await addDoc(collection(db, VIDEOS_COLLECTION), {
      ...videoData,
      id: videoId,
    });
    
    return videoId;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
}

/**
 * Upload video from MediaRecorder chunks
 */
export async function uploadVideoFromChunks(
  clientId: string,
  coachId: string,
  chunks: Blob[],
  metadata: {
    sessionId?: string;
    exerciseId?: string;
    exerciseName?: string;
    duration: number;
  }
): Promise<string> {
  const blob = new Blob(chunks, { type: 'video/webm' });
  return uploadVideo(clientId, coachId, blob, metadata);
}

// ============================================================================
// Video CRUD
// ============================================================================

/**
 * Get video by ID
 */
export async function getVideoById(videoId: string): Promise<ClientVideo | null> {
  try {
    const videosQuery = query(
      collection(db, VIDEOS_COLLECTION),
      where('id', '==', videoId),
      limit(1)
    );
    
    const snapshot = await getDocs(videosQuery);
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as ClientVideo;
  } catch (error) {
    console.error('Error getting video:', error);
    return null;
  }
}

/**
 * Get all videos for a client
 */
export async function getClientVideos(
  clientId: string,
  limitCount: number = 50
): Promise<ClientVideo[]> {
  try {
    const videosQuery = query(
      collection(db, VIDEOS_COLLECTION),
      where('clientId', '==', clientId),
      orderBy('uploadedAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(videosQuery);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ClientVideo));
  } catch (error) {
    console.error('Error getting client videos:', error);
    return [];
  }
}

/**
 * Get videos for a workout session
 */
export async function getSessionVideos(sessionId: string): Promise<ClientVideo[]> {
  try {
    const videosQuery = query(
      collection(db, VIDEOS_COLLECTION),
      where('sessionId', '==', sessionId),
      orderBy('uploadedAt', 'asc')
    );
    
    const snapshot = await getDocs(videosQuery);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ClientVideo));
  } catch (error) {
    console.error('Error getting session videos:', error);
    return [];
  }
}

/**
 * Subscribe to client videos (real-time)
 */
export function subscribeClientVideos(
  clientId: string,
  callback: (videos: ClientVideo[]) => void
): () => void {
  const videosQuery = query(
    collection(db, VIDEOS_COLLECTION),
    where('clientId', '==', clientId),
    orderBy('uploadedAt', 'desc')
  );
  
  return onSnapshot(videosQuery, (snapshot) => {
    const videos = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ClientVideo));
    callback(videos);
  });
}

/**
 * Delete video
 */
export async function deleteVideo(videoId: string): Promise<void> {
  try {
    const video = await getVideoById(videoId);
    if (!video) return;
    
    // Delete from Storage
    if (video.videoUrl) {
      try {
        const storageRef = ref(storage, video.videoUrl);
        await deleteObject(storageRef);
      } catch (e) {
        console.warn('Could not delete video from storage:', e);
      }
    }
    
    // Delete comments
    const commentsQuery = query(
      collection(db, COMMENTS_COLLECTION),
      where('videoId', '==', videoId)
    );
    const commentsSnapshot = await getDocs(commentsQuery);
    for (const commentDoc of commentsSnapshot.docs) {
      await deleteDoc(commentDoc.ref);
    }
    
    // Delete video document
    const videosQuery = query(
      collection(db, VIDEOS_COLLECTION),
      where('id', '==', videoId),
      limit(1)
    );
    const videosSnapshot = await getDocs(videosQuery);
    if (!videosSnapshot.empty) {
      await deleteDoc(videosSnapshot.docs[0].ref);
    }
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
}

// ============================================================================
// Video Comments
// ============================================================================

/**
 * Add comment to video
 */
export async function addVideoComment(
  videoId: string,
  coachId: string,
  coachName: string,
  timecode: number,
  comment: string
): Promise<string> {
  try {
    const commentData = {
      videoId,
      coachId,
      coachName,
      timecode,
      comment,
      createdAt: new Date().toISOString(),
    };
    
    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), commentData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

/**
 * Get comments for a video
 */
export async function getVideoComments(videoId: string): Promise<VideoComment[]> {
  try {
    const commentsQuery = query(
      collection(db, COMMENTS_COLLECTION),
      where('videoId', '==', videoId),
      orderBy('timecode', 'asc')
    );
    
    const snapshot = await getDocs(commentsQuery);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as VideoComment));
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
}

/**
 * Subscribe to video comments (real-time)
 */
export function subscribeVideoComments(
  videoId: string,
  callback: (comments: VideoComment[]) => void
): () => void {
  const commentsQuery = query(
    collection(db, COMMENTS_COLLECTION),
    where('videoId', '==', videoId),
    orderBy('timecode', 'asc')
  );
  
  return onSnapshot(commentsQuery, (snapshot) => {
    const comments = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as VideoComment));
    callback(comments);
  });
}

/**
 * Update comment
 */
export async function updateVideoComment(
  commentId: string,
  data: { comment?: string; timecode?: number }
): Promise<void> {
  try {
    const docRef = doc(db, COMMENTS_COLLECTION, commentId);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
}

/**
 * Delete comment
 */
export async function deleteVideoComment(commentId: string): Promise<void> {
  try {
    const docRef = doc(db, COMMENTS_COLLECTION, commentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

// ============================================================================
// Video with Comments
// ============================================================================

/**
 * Get video with all its comments
 */
export async function getVideoWithComments(videoId: string): Promise<VideoWithComments | null> {
  const video = await getVideoById(videoId);
  if (!video) return null;
  
  const comments = await getVideoComments(videoId);
  return { ...video, comments };
}

/**
 * Get all client videos with comments (for coach view)
 */
export async function getClientVideosWithComments(
  clientId: string,
  limitCount: number = 30
): Promise<VideoWithComments[]> {
  const videos = await getClientVideos(clientId, limitCount);
  
  const videosWithComments: VideoWithComments[] = [];
  for (const video of videos) {
    const comments = await getVideoComments(video.id);
    videosWithComments.push({ ...video, comments });
  }
  
  return videosWithComments;
}

// ============================================================================
// Recording Helpers
// ============================================================================

/**
 * Format timecode for display (MM:SS)
 */
export function formatTimecode(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parse timecode string to seconds
 */
export function parseTimecode(timecode: string): number {
  const parts = timecode.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}
