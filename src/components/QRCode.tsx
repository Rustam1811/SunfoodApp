import React from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
}

const QRCode: React.FC<QRCodeProps> = ({ value, size = 120 }) => {
  // Простая генерация QR-кода с использованием API
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=000000&color=ffffff`;
  
  return (
    <div className="flex flex-col items-center space-y-2">
      <img 
        src={qrUrl} 
        alt={`QR Code: ${value}`}
        className="rounded-lg"
        style={{ width: size, height: size }}
      />
      <div className="text-xs text-zinc-400 font-mono">{value}</div>
    </div>
  );
};

export default QRCode;
