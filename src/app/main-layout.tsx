import StarTrail from '@/components/star-trail';
import HeaderLayout from '@/components/HeaderLayout';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col min-h-screen">
      <StarTrail />
      <HeaderLayout />
      <main className="container flex-1">{children}</main>
    </div>
  );
}
