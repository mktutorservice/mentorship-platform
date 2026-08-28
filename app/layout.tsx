import './globals.css';
import Navbar from './components/Navbar'; // Keep only one import!

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