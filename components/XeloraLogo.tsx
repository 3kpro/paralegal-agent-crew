import Image from 'next/image';

export function XeloraLogo({ className = "w-16 h-16", showText = false }: { className?: string, showText?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={className}>
        <Image
          src="/media/LOGO/images/LogoFinal_v2.png"
          alt="XELORA"
          width={256}
          height={256}
          className="w-full h-full object-contain"
          priority
        />
      </div>
      {showText && (
        <span className="font-bold text-xl tracking-tight text-white uppercase">
          XELORA
        </span>
      )}
    </div>
  );
}
