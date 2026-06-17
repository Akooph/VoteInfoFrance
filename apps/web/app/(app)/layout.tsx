import { NavHeader } from '@/components/layout/nav-header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavHeader />
      <main>{children}</main>
    </>
  );
}
