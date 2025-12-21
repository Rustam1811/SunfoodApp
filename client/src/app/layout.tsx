import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sunfood Client',
  description: 'Gesture-first client experience.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
