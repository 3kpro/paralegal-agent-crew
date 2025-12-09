export function XeloraLogo({ className = "w-16 h-16", showText = false }: { className?: string, showText?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {showText && (
        <span className="font-bold text-xl tracking-tight text-white uppercase">
          XELORA
        </span>
      )}
      <div className={`${className} bg-gradient-to-br from-[#00C7F2] to-[#A17CF9] rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg`}>
        <span className="font-bold text-white text-sm">✦</span>
      </div>
    </div>
  );
}
