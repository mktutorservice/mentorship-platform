import './globals.css';
import '@livekit/components-styles';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Mentorship Platform',
  description: 'Connect with mentors and mentees',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}