import './globals.css';
import Navbar from '@/components/Navbar';
import AddPostModal from '@/components/AddPostModal';
import { ThemeProvider } from 'next-themes';

export const metadata = {
  title: 'Mentorship Platform',
  description: 'Connect with mentors and students',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[#0b0c10]">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Navbar />
          <main>{children}</main>
          <AddPostModal />
        </ThemeProvider>
      </body>
    </html>
  );
}