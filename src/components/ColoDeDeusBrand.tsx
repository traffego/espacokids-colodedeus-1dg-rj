import React from "react";
import Image from "next/image";

export function CopacabanaWave({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full overflow-hidden leading-none ${className}`}>
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="w-full h-10 sm:h-14 fill-[#264639]"
      >
        <path d="M0,0 C150,90 350,-40 500,50 C650,140 850,10 1000,70 C1100,110 1150,40 1200,60 L1200,120 L0,120 Z" />
        <path
          d="M0,20 C180,100 320,-20 480,60 C640,140 820,20 980,80 C1080,120 1160,50 1200,70 L1200,120 L0,120 Z"
          fill="#335b4b"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}

// Carimbo postal vintage estilo "RIO DE JANEIRO"
export function RioPostalStamp({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center border-2 border-dashed border-[#264639]/70 rounded-full p-2 text-[#264639] select-none rotate-[-6deg] hover:rotate-0 transition-transform ${className}`}
    >
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-[#264639]/80 flex flex-col items-center justify-center text-center p-1 relative">
        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[#264639]">
          RIO DE JANEIRO
        </span>
        <div className="my-0.5 border-t border-b border-[#264639]/60 w-14 py-0.5 flex items-center justify-center">
          <span className="text-[10px] sm:text-xs font-bold tracking-tight text-[#264639]">
            20 SET
          </span>
        </div>
        <span className="text-[7px] sm:text-[8px] font-semibold tracking-wider text-[#264639]/80 uppercase">
          1DG • KIDS
        </span>
      </div>
    </div>
  );
}

// Logo oficial Colo de Deus e identificação do evento
export function ColoDeDeusHeader() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-b border-[#ded5c2] mb-6">
      <div className="flex items-center gap-3">
        {/* Logo Oficial Colo de Deus em verde musgo */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-colodedeus-dark.png"
              alt="Colo de Deus"
              width={190}
              height={36}
              priority
              className="h-8 sm:h-9 w-auto object-contain"
            />
            <span className="text-[10px] bg-[#264639] text-[#f4eee3] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
              MISSÃO RJ
            </span>
          </div>
          <p className="text-xs text-[#507765] font-semibold tracking-wide uppercase">
            Um Dia de Glória • 20 de Setembro
          </p>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-3">
        <div className="text-right">
          <span className="text-[11px] font-bold text-[#264639] uppercase tracking-wider block">
            Colégio Marista São José
          </span>
          <span className="text-[10px] text-[#507765]">Barra da Tijuca • RJ</span>
        </div>
        <RioPostalStamp className="hidden sm:inline-flex" />
      </div>
    </div>
  );
}
