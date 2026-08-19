import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '../context/AppContext';
import { AuthProvider } from '../components/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'ANISKILL — God-Level Anime Syllabus Tracker & Accountability Platform',
  description: 'Turn your syllabus completion into an epic anime-inspired training journey. Syllabus Tracker + Accountability System + Streak System + Rivalry System.',
  keywords: 'ANISKILL, anime syllabus tracker, Naruto study timer, study streak app, ninja productivity',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#07080B] text-slate-100 min-h-screen">
        <AuthProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
