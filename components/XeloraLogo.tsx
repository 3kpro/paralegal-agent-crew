import Image from "next/image";

export function XeloraLogo({ className = "w-16 h-16", showText = false }: { className?: string, showText?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {showText && (
        <span className="font-bold text-xl tracking-tight text-white uppercase">
          XELORA
        </span>
      )}
      <div className={`relative ${className}`}>
        <Image
          src="/xelora-logo.png"
          alt="XELORA Logo"
          width={64}
          height={64}
          className="w-full h-full object-contain"
          priority
          style={{
            filter: "brightness(0) saturate(100%) invert(59%) sepia(89%) saturate(1270%) hue-rotate(181deg) brightness(100%) contrast(101%)",
          }}
        />
      </div>
    </div>
  );
}
