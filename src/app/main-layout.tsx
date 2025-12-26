import Header from '@/components/header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-full w-full flex-col">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
