import Navbar from '@/components/Navbar';
import AddPostModal from '@/components/AddPostModal';
import '@/app/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0b0c10] min-h-screen text-white antialiased">
        <Navbar />
        <main>{children}</main>
        <AddPostModal />
      </body>
    </html>
  );
}