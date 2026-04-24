export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full">
      <main className="container px-4 sm:px-6 pt-8 sm:pt-12 md:pt-16 pb-16 sm:pb-24 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
