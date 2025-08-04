import React, { useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export const TestFileUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [downloadURL, setDownloadURL] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const storage = getStorage();
      const fileName = `test_${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `uploads/${fileName}`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error('Upload error:', error);
          setError('Ошибка загрузки: ' + error.message);
          setUploading(false);
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            setDownloadURL(url);
            console.log('File available at', url);
          } catch (error) {
            console.error('Error getting download URL:', error);
            setError('Ошибка получения URL');
          }
          setUploading(false);
        }
      );
    } catch (error: any) {
      console.error('Upload error:', error);
      setError('Ошибка: ' + error.message);
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-bold mb-4">Тест загрузки файла</h3>
      
      <input
        type="file"
        onChange={handleFileUpload}
        accept="image/*,video/*"
        disabled={uploading}
        className="mb-4"
      />
      
      {uploading && (
        <div className="text-blue-600 mb-2">
          Загрузка файла...
        </div>
      )}
      
      {error && (
        <div className="text-red-600 mb-2">
          {error}
        </div>
      )}
      
      {downloadURL && (
        <div className="mt-4">
          <p className="text-green-600 mb-2">Файл загружен успешно!</p>
          <a 
            href={downloadURL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all"
          >
            {downloadURL}
          </a>
          
          {downloadURL.includes('image') || downloadURL.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
            <img 
              src={downloadURL} 
              alt="Uploaded" 
              className="mt-2 max-w-xs h-auto rounded"
            />
          ) : downloadURL.match(/\.(mp4|webm|mov)$/i) ? (
            <video 
              src={downloadURL} 
              controls 
              className="mt-2 max-w-xs h-auto rounded"
            />
          ) : null}
        </div>
      )}
    </div>
  );
};
