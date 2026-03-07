export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#F8FBF8] overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-[600px] w-[600px] rounded-full bg-[#006C35]/[0.07] blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-[#C9A84C]/[0.06] blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[#00A352]/[0.05] blur-[100px]" />
        <div className="absolute top-[10%] right-[15%] h-[200px] w-[200px] rounded-full bg-[#C9A84C]/[0.04] blur-[80px]" />
        <div className="absolute bottom-[10%] left-[10%] h-[250px] w-[250px] rounded-full bg-[#006C35]/[0.04] blur-[90px]" />
      </div>
      {children}
    </div>
  );
}
