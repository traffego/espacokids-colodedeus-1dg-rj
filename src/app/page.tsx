import { RegistrationForm } from "@/components/RegistrationForm";
import { ColoDeDeusHeader } from "@/components/ColoDeDeusBrand";
import { Heart } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      {/* Topo Oficial com Carimbo Postal e Marca */}
      <ColoDeDeusHeader />



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
