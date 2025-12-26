import HeaderLayout from '@/components/HeaderLayout';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col min-h-screen">
      <HeaderLayout />
      <main className="flex-1">{children}</main>
    </div>
  );
}
