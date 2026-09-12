"use client";

import React, { useState } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPhone } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { CopacabanaWave, RioPostalStamp } from "@/components/ColoDeDeusBrand";
import {
  Baby,
  Plus,
  Trash2,
  CheckCircle2,
  Copy,
  AlertCircle,
  HeartHandshake,
  ExternalLink,
  ShieldCheck,
  Utensils,
  Sparkles,
  Phone,
  User,
  Calendar,
  MapPin,
} from "lucide-react";

interface ChildFormState {
  name: string;
  age: number;
  gender: string;
  is_potty_trained: boolean;
  has_food_restriction: boolean;
  food_restriction_details: string;
  observations: string;
}

const PRICE_PER_CHILD = 20.0;
const PIX_KEY = process.env.NEXT_PUBLIC_PIX_KEY || "colodeusrj@gmail.com";
const JUCIARA_WHATSAPP = process.env.NEXT_PUBLIC_JUCIARA_PHONE || "5521993588010";

export function RegistrationForm() {
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentNotes, setParentNotes] = useState("");

  const [childrenList, setChildrenList] = useState<ChildFormState[]>([
    {
      name: "",
      age: 3,
      gender: "menino",
      is_potty_trained: true,
      has_food_restriction: false,
      food_restriction_details: "",
      observations: "",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pixCopied, setPixCopied] = useState(false);

  // Success state
  const [completedRegistration, setCompletedRegistration] = useState<{
    id: string;
    parentName: string;
    parentPhone: string;
    children: ChildFormState[];
    totalAmount: number;
  } | null>(null);

  const addChild = () => {
    setChildrenList((prev) => [
      ...prev,
      {
        name: "",
        age: 3,
        gender: "menino",
        is_potty_trained: true,
        has_food_restriction: false,
        food_restriction_details: "",
        observations: "",
      },
    ]);
  };

  const removeChild = (index: number) => {
    if (childrenList.length === 1) return;
    setChildrenList((prev) => prev.filter((_, i) => i !== index));
  };

  const updateChild = (index: number, field: keyof ChildFormState, value: any) => {
    setChildrenList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const totalAmount = childrenList.length * PRICE_PER_CHILD;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length <= 11) {
      setParentPhone(formatPhone(raw));
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!parentName.trim()) {
      setErrorMessage("Por favor, preencha o nome do responsável.");
      return;
    }

    const cleanPhone = parentPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMessage("Por favor, informe um telefone/WhatsApp válido com DDD.");
      return;
    }

    for (let i = 0; i < childrenList.length; i++) {
      const child = childrenList[i];
      if (!child.name.trim()) {
        setErrorMessage(`Por favor, preencha o nome da ${i + 1}ª criança.`);
        return;
      }
      if (child.age < 3 || child.age > 10) {
        setErrorMessage(
          `A criança ${child.name} tem ${child.age} anos. O Espaço Kids atende apenas crianças de 03 a 10 anos.`
        );
        return;
      }
      if (!child.is_potty_trained) {
        setErrorMessage(
          `Regra do evento: Todas as crianças a partir de 3 anos devem estar desfraldadas para participar do Espaço Kids.`
        );
        return;
      }
      if (child.has_food_restriction && !child.food_restriction_details.trim()) {
        setErrorMessage(
          `Você marcou que ${child.name} possui restrição alimentar. Por favor, descreva qual é a restrição.`
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const { data: respData, error: respError } = await supabase
        .from("responsibles")
        .insert({
          name: parentName.trim(),
          phone: parentPhone.trim(),
          notes: parentNotes.trim() || null,
          total_amount: totalAmount,
          payment_status: "pending",
        })
        .select()
        .single();

      if (respError || !respData) {
        throw new Error(respError?.message || "Erro ao salvar responsável");
      }

      const childrenPayload = childrenList.map((c) => ({
        responsible_id: respData.id,
        name: c.name.trim(),
        age: Number(c.age),
        gender: c.gender,
        is_potty_trained: Boolean(c.is_potty_trained),
        has_food_restriction: Boolean(c.has_food_restriction),
        food_restriction_details: c.has_food_restriction
          ? c.food_restriction_details.trim()
          : null,
        observations: c.observations.trim() || null,
      }));

      const { error: childError } = await supabase
        .from("children")
        .insert(childrenPayload);

      if (childError) {
        throw new Error(childError.message || "Erro ao cadastrar crianças");
      }

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#264639", "#467360", "#d4af37", "#f4eee3"],
      });

      setCompletedRegistration({
        id: respData.id,
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
        children: [...childrenList],
        totalAmount,
      });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || "Ocorreu um erro ao enviar o formulário. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppMessage = () => {
    if (!completedRegistration) return "";
    const childrenNames = completedRegistration.children
      .map((c) => `${c.name} (${c.age} anos)`)
      .join(", ");

    const text = `Olá Juciara! 🙏✨\n\nAcabei de realizar o cadastro no *Espaço Kids - Um Dia de Glória (20/Set)*:\n*Responsável:* ${completedRegistration.parentName}\n*Filho(s):* ${childrenNames}\n*Valor:* ${formatCurrency(completedRegistration.totalAmount)}\n\nSegue em anexo o comprovante do Pix para a Missão RJ (${PIX_KEY}). Obrigado! 💙`;
    return encodeURIComponent(text);
  };

  // TELA DE SUCESSO & PAGAMENTO PIX
  if (completedRegistration) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
        <Card className="border-[#264639]/30 bg-[#fcf9f2] shadow-md overflow-hidden relative">
          <div className="bg-[#264639] px-6 py-6 text-[#f4eee3] text-center relative overflow-hidden">
            <div className="absolute top-2 right-4 opacity-20">
              <RioPostalStamp />
            </div>
            <div className="flex justify-center mb-3">
              <Image
                src="/logo-colodedeus.png"
                alt="Colo de Deus"
                width={140}
                height={26}
                className="h-6 w-auto object-contain opacity-90"
              />
            </div>
            <div className="mx-auto w-12 h-12 bg-white/15 backdrop-blur rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="w-7 h-7 text-[#f4eee3]" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight">
              Inscrição Registrada!
            </h2>
            <p className="text-[#d2dfd8] text-xs sm:text-sm mt-1">
              Conclua o pagamento via Pix para garantir a vaga dos pequenos.
            </p>
          </div>

          <CopacabanaWave />

          <CardContent className="p-6 space-y-6">
            {/* Resumo */}
            <div className="bg-[#f5efe4] border border-[#ded5c2] rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-[#ded5c2] pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#507765]">
                  Responsável
                </span>
                <span className="text-sm font-bold text-[#1c3028]">
                  {completedRegistration.parentName}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#507765] block">
                  Crianças Inscritas ({completedRegistration.children.length})
                </span>
                <div className="space-y-1.5 pt-1">
                  {completedRegistration.children.map((child, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm bg-white p-2.5 rounded-lg border border-[#ded5c2]"
                    >
                      <div className="flex items-center gap-2">
                        <Baby className="w-4 h-4 text-[#264639]" />
                        <span className="font-bold text-[#1c3028]">{child.name}</span>
                        <span className="text-xs text-[#507765]">({child.age} anos)</span>
                      </div>
                      {child.has_food_restriction && (
                        <Badge variant="warning" className="text-[10px]">
                          Restrição: {child.food_restriction_details}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#ded5c2]">
                <span className="text-sm font-bold text-[#1c3028]">Total da Taxa Alimentar</span>
                <span className="text-2xl font-black text-[#264639]">
                  {formatCurrency(completedRegistration.totalAmount)}
                </span>
              </div>
            </div>

            {/* Caixa do Pix estilo recibo postal */}
            <div className="border-2 border-dashed border-[#264639]/40 bg-[#e7f0eb]/60 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#264639] text-[#f4eee3] flex items-center justify-center font-black text-sm">
                    PIX
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1c3028] text-sm sm:text-base">
                      Pix da Missão RJ (Colo de Deus)
                    </h3>
                    <p className="text-xs text-[#507765]">
                      Alimentação e estrutura do Espaço Kids
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase font-bold text-[#264639]">
                  Manual
                </Badge>
              </div>

              <div className="bg-white border border-[#ded5c2] rounded-lg p-3 flex items-center justify-between gap-2 shadow-inner">
                <div className="font-mono text-sm text-[#1c3028] font-bold truncate select-all">
                  {PIX_KEY}
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCopyPix}
                  className="shrink-0 gap-1.5"
                >
                  {pixCopied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar Chave
                    </>
                  )}
                </Button>
              </div>

              <div className="text-xs text-[#1c3028]/80 space-y-1 bg-white/60 p-3 rounded-lg border border-[#ded5c2]">
                <p className="font-bold text-[#1c3028]">
                  Passo a passo para validação:
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Faça o Pix de <strong>{formatCurrency(completedRegistration.totalAmount)}</strong> para a chave acima.</li>
                  <li>Salve o comprovante da transação bancária.</li>
                  <li>Clique no botão verde abaixo para enviar o comprovante diretamente à Juciara.</li>
                </ol>
              </div>
            </div>

            {/* Ação WhatsApp */}
            <div className="space-y-3 pt-1">
              <a
                href={`https://wa.me/${JUCIARA_WHATSAPP}?text=${getWhatsAppMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#1f583e] hover:bg-[#184530] text-[#f4eee3] font-bold py-3.5 px-4 rounded-xl shadow-md transition-colors text-center text-sm cursor-pointer"
              >
                <HeartHandshake className="w-5 h-5" />
                <span>Enviar Comprovante para Juciara no WhatsApp</span>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </a>

              <p className="text-center text-xs text-[#507765]">
                O status no sistema será atualizado pela equipe assim que o comprovante for conferido.
              </p>
            </div>
          </CardContent>

          <CardFooter className="bg-[#f5efe4] border-t border-[#ded5c2] p-4 flex justify-between items-center">
            <button
              onClick={() => {
                setCompletedRegistration(null);
                setChildrenList([
                  {
                    name: "",
                    age: 3,
                    gender: "menino",
                    is_potty_trained: true,
                    has_food_restriction: false,
                    food_restriction_details: "",
                    observations: "",
                  },
                ]);
                setParentName("");
                setParentPhone("");
                setParentNotes("");
              }}
              className="text-xs text-[#264639] hover:underline font-bold cursor-pointer"
            >
              Fazer nova inscrição
            </button>
            <span className="text-[11px] text-[#507765] font-semibold">
              20 de Setembro • Marista Barra
            </span>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // FORMULÁRIO DE INSCRIÇÃO
  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {/* Banner Oficial / Cartaz Visual */}
      <div className="rounded-2xl bg-[#264639] text-[#f4eee3] shadow-md border border-[#1a3328] overflow-hidden relative">
        <div className="p-5 sm:p-7 space-y-3.5 relative z-10">
          <div className="flex items-center">
            <Image
              src="/logo-colodedeus.png"
              alt="Colo de Deus"
              width={140}
              height={26}
              className="h-5 sm:h-6 w-auto object-contain opacity-90"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#e9decb] block">
              * UM DIA DE GLÓRIA *
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#f4eee3] uppercase">
              Espaço Kids
            </h1>
            <p className="text-xs sm:text-sm text-[#f4eee3] leading-relaxed font-medium pt-0.5">
              Vamos cuidar dos nossos pequenos com muito carinho para que eles também possam viver um dia de muita alegria e a experiência do 1DG🔥
            </p>
          </div>

          {/* Avisos em destaque */}
          <div className="bg-black/25 backdrop-blur-sm border border-white/20 rounded-xl p-3.5 space-y-2 text-xs sm:text-sm">
            <p className="font-bold text-[#f4eee3] flex items-center gap-1.5">
              <span>📲</span> Após o pagamento, envie o comprovante para a Juciara.
            </p>
            <p className="font-bold text-amber-300 flex items-center gap-1.5">
              <span>⚠️</span> As vagas são destinadas exclusivamente aos filhos dos membros.
            </p>
          </div>

          {/* Cards destacados com alto contraste */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-[#fcf9f2] text-[#1c3028] rounded-xl p-3.5 border-2 border-[#ded5c2] shadow-sm">
              <span className="font-black block text-[#507765] uppercase text-[10px] tracking-wider">
                Faixa Etária
              </span>
              <span className="text-[#1c3028] font-black text-sm sm:text-base">
                De 03 a 10 anos
              </span>
            </div>

            <div className="bg-[#fcf9f2] text-[#1c3028] rounded-xl p-3.5 border-2 border-[#ded5c2] shadow-sm">
              <span className="font-black block text-[#507765] uppercase text-[10px] tracking-wider">
                Requisito
              </span>
              <span className="text-[#1c3028] font-black text-sm sm:text-base">
                Criança desfraldada
              </span>
            </div>

            <div className="bg-[#fcf9f2] text-[#1c3028] rounded-xl p-3.5 border-2 border-[#ded5c2] shadow-sm">
              <span className="font-black block text-[#507765] uppercase text-[10px] tracking-wider">
                Investimento
              </span>
              <span className="text-[#264639] font-black text-sm sm:text-base flex items-center gap-1">
                R$ 20 c/ alimentação 🍎
              </span>
            </div>
          </div>
        </div>

        {/* Ondas Copacabana na base do banner */}
        <CopacabanaWave />
      </div>

      {errorMessage && (
        <div className="bg-[#f8e7e5] border border-[#deb0aa] text-[#8f2d22] px-4 py-3 rounded-xl text-sm flex items-start gap-3 shadow-xs animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-[#8f2d22] shrink-0 mt-0.5" />
          <div className="font-medium">{errorMessage}</div>
        </div>
      )}

      {/* DADOS DO RESPONSÁVEL */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#264639]" />
            <CardTitle>Dados do Responsável</CardTitle>
          </div>
          <CardDescription>
            Pai, mãe ou responsável presente no Um Dia de Glória.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="parent-name" required>
              Nome Completo do Responsável
            </Label>
            <Input
              id="parent-name"
              type="text"
              placeholder="Ex: Ana Clara Silva"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent-phone" required>
              WhatsApp de Contato
            </Label>
            <div className="relative">
              <Input
                id="parent-phone"
                type="tel"
                placeholder="(21) 99999-9999"
                value={parentPhone}
                onChange={handlePhoneChange}
                required
              />
              <Phone className="w-4 h-4 text-[#8a9890] absolute right-3 top-3 pointer-events-none" />
            </div>
            <p className="text-[11px] text-[#507765]">
              Contato que a equipe usará durante o evento em caso de necessidade.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent-notes">Observações da Família (Opcional)</Label>
            <Input
              id="parent-notes"
              type="text"
              placeholder="Ex: Célula Barra, ficaremos no bloco central"
              value={parentNotes}
              onChange={(e) => setParentNotes(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* DADOS DOS FILHOS */}
      <div className="space-y-4">
        <div className="px-1">
          <h2 className="text-base sm:text-lg font-bold text-[#1c3028] flex items-center gap-2">
            <Baby className="w-5 h-5 text-[#264639]" />
            Crianças a Cadastrar
          </h2>
          <p className="text-xs text-[#507765]">
            Preencha os dados de cada criança abaixo.
          </p>
        </div>

        {childrenList.map((child, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div className="bg-[#ede4d3]/70 px-6 py-3 border-b border-[#ded5c2] flex items-center justify-between">
              <span className="font-bold text-sm text-[#1c3028] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#264639] text-[#f4eee3] flex items-center justify-center text-xs">
                  {index + 1}
                </span>
                {index + 1}ª Criança
              </span>

              {childrenList.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeChild(index)}
                  className="text-xs text-[#8f2d22] hover:text-[#722219] flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remover
                </button>
              )}
            </div>

            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`child-name-${index}`} required>
                  Nome da Criança
                </Label>
                <Input
                  id={`child-name-${index}`}
                  type="text"
                  placeholder="Nome e sobrenome"
                  value={child.name}
                  onChange={(e) => updateChild(index, "name", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`child-age-${index}`} required>
                    Idade (03 a 10 anos)
                  </Label>
                  <select
                    id={`child-age-${index}`}
                    value={child.age}
                    onChange={(e) => updateChild(index, "age", Number(e.target.value))}
                    className="flex h-10 w-full rounded-lg border border-[#ded5c2] bg-white px-3 py-2 text-sm text-[#1c3028] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#264639]"
                  >
                    {[3, 4, 5, 6, 7, 8, 9, 10].map((age) => (
                      <option key={age} value={age}>
                        {age} anos
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`child-gender-${index}`}>Sexo</Label>
                  <select
                    id={`child-gender-${index}`}
                    value={child.gender}
                    onChange={(e) => updateChild(index, "gender", e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-[#ded5c2] bg-white px-3 py-2 text-sm text-[#1c3028] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#264639]"
                  >
                    <option value="menino">Menino</option>
                    <option value="menina">Menina</option>
                    <option value="outro">Não informar</option>
                  </select>
                </div>
              </div>

              {/* Regra de Desfralde */}
              <div className="p-3.5 bg-[#ede4d3]/50 border border-[#ded5c2] rounded-lg flex items-start gap-3">
                <input
                  type="checkbox"
                  id={`child-potty-${index}`}
                  checked={child.is_potty_trained}
                  onChange={(e) =>
                    updateChild(index, "is_potty_trained", e.target.checked)
                  }
                  className="w-4 h-4 mt-0.5 rounded border-[#ded5c2] text-[#264639] focus:ring-[#264639] cursor-pointer"
                />
                <div className="text-xs">
                  <label
                    htmlFor={`child-potty-${index}`}
                    className="font-bold text-[#1c3028] cursor-pointer block"
                  >
                    A criança está desfraldada?
                  </label>
                  <p className="text-[#507765] mt-0.5">
                    Item obrigatório para a segurança e dinâmica das crianças no evento.
                  </p>
                </div>
              </div>

              {/* Restrição Alimentar */}
              <div className="space-y-3 pt-1 border-t border-[#ded5c2]">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor={`child-restriction-${index}`}
                    className="flex items-center gap-1.5 cursor-pointer text-[#1c3028]"
                  >
                    <Utensils className="w-4 h-4 text-[#7a5711]" />
                    Possui restrição alimentar ou alergia?
                  </Label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateChild(index, "has_food_restriction", false)
                      }
                      className={`text-xs px-3 py-1 rounded-md border font-bold cursor-pointer transition-colors ${
                        !child.has_food_restriction
                          ? "bg-[#264639] text-[#f4eee3] border-[#264639]"
                          : "bg-white text-[#1c3028] border-[#ded5c2]"
                      }`}
                    >
                      Não
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateChild(index, "has_food_restriction", true)
                      }
                      className={`text-xs px-3 py-1 rounded-md border font-bold cursor-pointer transition-colors ${
                        child.has_food_restriction
                          ? "bg-[#7a5711] text-white border-[#7a5711]"
                          : "bg-white text-[#1c3028] border-[#ded5c2]"
                      }`}
                    >
                      Sim
                    </button>
                  </div>
                </div>

                {child.has_food_restriction && (
                  <div className="space-y-2 animate-in fade-in">
                    <Label
                      htmlFor={`child-restriction-desc-${index}`}
                      required
                      className="text-xs text-[#7a5711] font-bold"
                    >
                      Descreva a restrição (ex: glúten, lactose, corantes, frutos do mar):
                    </Label>
                    <Input
                      id={`child-restriction-desc-${index}`}
                      type="text"
                      placeholder="Especificar para a equipe de alimentação..."
                      value={child.food_restriction_details}
                      onChange={(e) =>
                        updateChild(index, "food_restriction_details", e.target.value)
                      }
                      required
                      className="border-[#e9d6a8] bg-[#fdfcf9] focus-visible:ring-[#7a5711]"
                    />
                  </div>
                )}
              </div>

              {/* Observações da Criança */}
              <div className="space-y-2 pt-1 border-t border-[#ded5c2]">
                <Label htmlFor={`child-obs-${index}`} className="text-xs text-[#507765]">
                  Cuidados ou especificidades adicionais (Opcional)
                </Label>
                <Input
                  id={`child-obs-${index}`}
                  type="text"
                  placeholder="Ex: Horário de medicamento, particularidades de rotina"
                  value={child.observations}
                  onChange={(e) => updateChild(index, "observations", e.target.value)}
                  className="text-xs"
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Botão de adicionar criança posicionado abaixo do formulário */}
        <div className="pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={addChild}
            className="w-full py-3 h-12 border-dashed border-2 border-[#264639]/40 bg-[#fcf9f2] hover:bg-[#ede4d3] text-[#1c3028] font-bold gap-2 text-sm shadow-2xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 text-[#264639]" />
            Adicionar Outro Filho
          </Button>
        </div>
      </div>

      {/* CARD DE INVESTIMENTO & SUBMIT */}
      <Card className="border-[#1a3328] bg-[#264639] text-[#f4eee3] shadow-md">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-white/15">
            <div>
              <span className="text-xs text-[#d2dfd8] uppercase tracking-wider block font-semibold">
                Resumo da Inscrição
              </span>
              <span className="text-sm font-bold text-white">
                {childrenList.length} {childrenList.length === 1 ? "criança" : "crianças"} (R$ 20,00 cada, com alimentação)
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#d2dfd8] block">Total</span>
              <span className="text-3xl font-black text-white">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#d2dfd8]">
            <ShieldCheck className="w-4 h-4 text-[#e9decb] shrink-0" />
            <span>
              Pagamento manual via Pix após o cadastro. Vagas exclusivas para membros.
            </span>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#f4eee3] hover:bg-white text-[#1c3028] font-black h-12 text-sm sm:text-base px-2 sm:px-6 shadow-md cursor-pointer transition-colors whitespace-nowrap"
          >
            {isSubmitting
              ? "Cadastrando..."
              : `Cadastrar e Pagar Pix (${formatCurrency(totalAmount)})`}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
