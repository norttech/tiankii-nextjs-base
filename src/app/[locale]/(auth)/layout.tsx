export default function AuthLayout({ children }: LayoutProps<"/[locale]">) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">{children}</div>
  );
}
