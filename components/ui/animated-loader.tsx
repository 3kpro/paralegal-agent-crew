import React from 'react';

interface AnimatedLoaderProps {
  message?: string;
}

const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({ message }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-12 relative">
      <div className="relative w-24 h-24 rotate-45 z-10 mb-8">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 left-0 w-7 h-7 m-0.5 animate-square bg-gradient-to-br from-tron-cyan to-tron-magenta"
            style={{
              // eslint-disable-next-line react/forbid-dom-props
              animationDelay: `${-1.4285714286 * i}s`
            }}
          />
        ))}
      </div>

      {message && message.length > 0 && (
        <p className="text-tron-text text-lg font-medium animate-pulse">
          {message}
        </p>
      )}

      <style>{`
        @keyframes square-animation {
          0% {
            left: 0;
            top: 0;
          }
          10.5% {
            left: 0;
            top: 0;
          }
          12.5% {
            left: 32px;
            top: 0;
          }
          23% {
            left: 32px;
            top: 0;
          }
          25% {
            left: 64px;
            top: 0;
          }
          35.5% {
            left: 64px;
            top: 0;
          }
          37.5% {
            left: 64px;
            top: 32px;
          }
          48% {
            left: 64px;
            top: 32px;
          }
          50% {
            left: 32px;
            top: 32px;
          }
          60.5% {
            left: 32px;
            top: 32px;
          }
          62.5% {
            left: 32px;
            top: 64px;
          }
          73% {
            left: 32px;
            top: 64px;
          }
          75% {
            left: 0;
            top: 64px;
          }
          85.5% {
            left: 0;
            top: 64px;
          }
          87.5% {
            left: 0;
            top: 32px;
          }
          98% {
            left: 0;
            top: 32px;
          }
          100% {
            left: 0;
            top: 0;
          }
        }
        
        .animate-square {
          animation: square-animation 10s ease-in-out infinite both;
        }
      `}</style>
    </div>
  );
};

export default AnimatedLoader;
