import Link from "next/link";
import { RegistrationForm } from "@/components/RegistrationForm";
import { ColoDeDeusHeader } from "@/components/ColoDeDeusBrand";
import { ShieldCheck, Heart } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      {/* Topo Oficial com Carimbo Postal e Marca */}
      <ColoDeDeusHeader />

      <div className="flex justify-end mb-4">
        <Link
          href="/admin"
          className="text-xs text-[#507765] hover:text-[#1c3028] flex items-center gap-1.5 font-bold bg-[#ede4d3]/70 hover:bg-[#e2d6c1] px-3 py-1.5 rounded-lg border border-[#ded5c2] transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#264639]" />
          Acesso Coordenação
        </Link>
      </div>

      <div className="flex-1">
        <RegistrationForm />
      </div>

      <footer className="mt-14 text-center text-xs text-[#507765] border-t border-[#ded5c2] pt-6 pb-4 space-y-2">
        <p className="font-bold text-[#264639] uppercase tracking-wider text-[11px]">
          20 de Setembro • Colégio Marista São José — Barra da Tijuca
        </p>
        <p className="flex items-center justify-center gap-1 text-[11px]">
          Comunidade Católica Colo de Deus • Missão Rio de Janeiro
          <Heart className="w-3 h-3 text-[#264639] fill-[#264639] inline" />
        </p>
      </footer>
    </main>
  );
}
