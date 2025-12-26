
import Header from '@/components/header';
import StarTrail from '@/components/star-trail';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col min-h-screen">
      <StarTrail />
      <div className="p-4">
        <div className="relative w-full bg-background/80 backdrop-blur-sm rounded-md border border-border">
          <Header />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
