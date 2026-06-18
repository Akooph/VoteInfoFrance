import { NavHeader } from '@/components/layout/nav-header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavHeader />
      <main className="vif-app-main">{children}</main>
    </>
  );
}
