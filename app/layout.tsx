import Navbar from '@/components/Navbar';
import AddPostModal from '@/components/AddPostModal';
import { ThemeProvider } from 'next-themes';
import '@/app/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 dark:bg-[#0b0c10] dark:text-white min-h-screen antialiased transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Navbar />
          <main>{children}</main>
          <AddPostModal />
        </ThemeProvider>
      </body>
    </html>
  );
}