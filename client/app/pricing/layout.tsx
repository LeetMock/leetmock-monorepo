import AppHeader from "../landing-v1/_components/AppHeader";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="!scroll-smooth">
      <AppHeader />
      <main>{children}</main>
    </div>
  );
}
