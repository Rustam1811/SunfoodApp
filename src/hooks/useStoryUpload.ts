import { useCallback, useRef, useState } from 'react';
import { storage, ref, uploadBytes, getDownloadURL } from '../lib/firebase';

export interface StoryUploadResult {
  url: string; path: string; contentType: string;
}
export interface UseStoryUploadState {
  uploading: boolean;
  progress: number; // 0..100 (best effort; uploadBytes has no incremental progress so stays 0/100)
  error: string | null;
}

// New: lightweight progress event shape to support optional callbacks
export type UploadProgress = { state: 'running'|'success'|'error'|'canceled'; percent: number };

function extFromName(name: string, fallback: string) {
  const m = name.match(/\.([a-zA-Z0-9]+)$/); return m ? m[1].toLowerCase() : fallback;
}

// Optional callbacks config
type UseStoryUploadOptions = {
  onProgress?: (p: UploadProgress) => void;
};

export function useStoryUpload(options?: UseStoryUploadOptions) {
  const [state, setState] = useState<UseStoryUploadState>({ uploading:false, progress:0, error:null });
  const abortRef = useRef<() => void>(()=>{}); // placeholder (uploadBytes not abortable)

  const upload = useCallback(async (file: File, kind: 'image'|'video'): Promise<StoryUploadResult> => {
    setState({ uploading:true, progress:0, error:null });
    options?.onProgress?.({ state: 'running', percent: 0 });
    try {
      const ts = Date.now();
      const rand = Math.random().toString(36).slice(2,10);
      const ext = extFromName(file.name, kind==='image' ? 'png':'mp4');
      const path = `stories/${kind}/${ts}-${rand}.${ext}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file, { contentType: file.type || (kind==='image'?'image/png':'video/mp4') });
      const url = await getDownloadURL(storageRef);
      setState({ uploading:false, progress:100, error:null });
      options?.onProgress?.({ state: 'success', percent: 100 });
      return { url, path, contentType: file.type };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'upload_failed';
      setState({ uploading:false, progress:0, error: msg });
      options?.onProgress?.({ state: 'error', percent: 0 });
      throw e;
    }
  }, [options]);

  const cancel = useCallback(() => {
    // No true cancel support with uploadBytes; emit canceled state for UI
    setState(prev => ({ ...prev, uploading: false }));
    options?.onProgress?.({ state: 'canceled', percent: state.progress || 0 });
    abortRef.current?.();
  }, [options, state.progress]);

  return { upload, state, cancel };
}

export default useStoryUpload;
