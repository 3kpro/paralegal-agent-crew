import Image from "next/image";

export function TrendPulseLogo({ className = "w-16 h-16", showText = false }: { className?: string, showText?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {showText && (
        <span className="font-bold text-xl tracking-tight text-white">
          TrendPulse
        </span>
      )}
      <div className={`relative ${className}`}>
        <Image 
          src="/logo-tr-final.png" 
          alt="TrendPulse Logo" 
          fill
          className="object-contain"
          priority
          style={{ filter: "hue-rotate(160deg) brightness(1.1)" }}
        />
      </div>
    </div>
  );
}
