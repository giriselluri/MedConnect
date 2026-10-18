import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/context';
import { Navbar } from '@/components/navbar';

export const metadata: Metadata = {
  title: 'MedConnect AI — Healthcare & Life Sciences Professional Network',
  description:
    'The premier LinkedIn-inspired professional networking and clinical evidence platform for doctors, researchers, medical students, and life sciences leaders.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
        <AppProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          {/* Subtle footer */}
          <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 mt-12">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                MedConnect AI Platform • Peer Healthcare Network
              </div>
              <div>
                All clinical case studies are illustrative educational examples. Not for direct diagnosis or treatment.
              </div>
            </div>
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
