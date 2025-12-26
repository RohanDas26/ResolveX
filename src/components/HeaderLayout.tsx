import HeaderNav from "./HeaderNav";

export default function HeaderLayout() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <HeaderNav />
    </header>
  );
}
