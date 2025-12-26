
import Header from '@/components/header';
import StarTrail from '@/components/star-trail';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col min-h-screen">
      <StarTrail />
      <div className="p-4">
        <div className="relative w-full bg-transparent rounded-md border-0">
          <Header />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
