"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase, type Responsible, type Child } from "@/lib/supabase";
import { formatCurrency, formatPhone } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Baby,
  Utensils,
  Phone,
  ArrowLeft,
  AlertTriangle,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ResponsibleWithChildren extends Responsible {
  children: Child[];
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  const [loading, setLoading] = useState(false);
  const [responsibles, setResponsibles] = useState<ResponsibleWithChildren[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid" | "food_restriction">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reportCopied, setReportCopied] = useState(false);

  // Verificar sessão no servidor
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/check");
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const { data: respData, error: respError } = await supabase
        .from("responsibles")
        .select("*")
        .order("created_at", { ascending: false });

      if (respError) throw respError;

      const { data: childrenData, error: childrenError } = await supabase
        .from("children")
        .select("*");

      if (childrenError) throw childrenError;

      const merged: ResponsibleWithChildren[] = (respData || []).map((resp) => ({
        ...resp,
        children: (childrenData || []).filter((c) => c.responsible_id === resp.id),
      }));

      setResponsibles(merged);
    } catch (err: any) {
      console.error("Erro ao buscar registros:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRegistrations();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmittingAuth(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput.trim() }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        setPasswordInput("");
      } else {
        const data = await res.json().catch(() => ({}));
        setAuthError(data.error || "Senha incorreta. Tente novamente.");
      }
    } catch {
      setAuthError("Erro de conexão com o servidor.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    setIsAuthenticated(false);
    setPasswordInput("");
  };

  const togglePaymentStatus = async (responsible: ResponsibleWithChildren) => {
    const newStatus = responsible.payment_status === "paid" ? "pending" : "paid";
    setUpdatingId(responsible.id!);

    try {
      const { error } = await supabase
        .from("responsibles")
        .update({
          payment_status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", responsible.id);

      if (error) throw error;

      setResponsibles((prev) =>
        prev.map((r) => (r.id === responsible.id ? { ...r, payment_status: newStatus } : r))
      );
    } catch (err: any) {
      console.error("Erro ao atualizar status:", err);
      alert("Erro ao alterar status: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredList = useMemo(() => {
    return responsibles.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phone.includes(searchTerm) ||
        r.children.some((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (statusFilter === "pending") return r.payment_status === "pending";
      if (statusFilter === "paid") return r.payment_status === "paid";
      if (statusFilter === "food_restriction") {
        return r.children.some((c) => c.has_food_restriction);
      }

      return true;
    });
  }, [responsibles, searchTerm, statusFilter]);

  const metrics = useMemo(() => {
    const totalChildren = responsibles.reduce((acc, r) => acc + (r.children?.length || 0), 0);
    const totalResponsibles = responsibles.length;
    const paidRegistrations = responsibles.filter((r) => r.payment_status === "paid");
    const totalReceived = paidRegistrations.reduce((acc, r) => acc + Number(r.total_amount || 0), 0);
    const totalExpected = responsibles.reduce((acc, r) => acc + Number(r.total_amount || 0), 0);
    const totalPending = totalExpected - totalReceived;
    const foodRestrictionsCount = responsibles.reduce(
      (acc, r) => acc + (r.children?.filter((c) => c.has_food_restriction).length || 0),
      0
    );

    return {
      totalChildren,
      totalResponsibles,
      totalReceived,
      totalExpected,
      totalPending,
      foodRestrictionsCount,
      paidCount: paidRegistrations.length,
    };
  }, [responsibles]);

  const copySummaryReport = () => {
    let report = `📋 *RELATÓRIO GERAL - ESPAÇO KIDS (1DG - 20/SET)*\n`;
    report += `📅 Atualizado em: ${new Date().toLocaleString("pt-BR")}\n`;
    report += `👧 Total de Crianças: ${metrics.totalChildren}\n`;
    report += `👨‍👩‍👧‍👦 Total de Responsáveis: ${metrics.totalResponsibles}\n`;
    report += `💰 Total Recebido: ${formatCurrency(metrics.totalReceived)} (${metrics.paidCount} confirmados)\n`;
    report += `⏳ Pendente: ${formatCurrency(metrics.totalPending)}\n`;
    report += `⚠️ Restrições Alimentares: ${metrics.foodRestrictionsCount} criança(s)\n\n`;

    report += `--- *LISTA DE INSCRIÇÕES* ---\n`;
    responsibles.forEach((r, idx) => {
      const statusIcon = r.payment_status === "paid" ? "✅ PAGO" : "⏳ PENDENTE";
      report += `${idx + 1}. *${r.name}* (${r.phone}) - ${statusIcon}\n`;
      r.children.forEach((c) => {
        report += `   • ${c.name}, ${c.age} anos`;
        if (c.has_food_restriction) {
          report += ` ⚠️ Restrição: ${c.food_restriction_details}`;
        }
        report += `\n`;
      });
    });

    navigator.clipboard.writeText(report);
    setReportCopied(true);
    setTimeout(() => setReportCopied(false), 3000);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4eee3]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#264639]" />
      </div>
    );
  }

  // TELA DE LOGIN DO ADMIN
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-[#f4eee3]">
        <Card className="max-w-md w-full border-[#ded5c2] shadow-md bg-[#fcf9f2]">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-xl bg-[#264639] text-[#f4eee3] flex items-center justify-center mb-1 shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl text-[#1c3028]">Coordenação • Espaço Kids</CardTitle>
            <CardDescription className="text-[#507765]">
              Um Dia de Glória • Colo de Deus RJ (20 de Setembro)
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {authError && (
                <div className="bg-[#f8e7e5] border border-[#deb0aa] text-[#8f2d22] text-xs p-3 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Digite a senha de administrador"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" disabled={isSubmittingAuth} className="w-full font-bold">
                {isSubmittingAuth ? "Entrando..." : "Entrar no Painel"}
              </Button>
              <Link
                href="/"
                className="text-xs text-[#507765] hover:text-[#1c3028] flex items-center justify-center gap-1 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar para o formulário
              </Link>
            </CardFooter>
          </form>
        </Card>
      </main>
    );
  }

  // DASHBOARD PRINCIPAL DO ADMIN
  return (
    <div className="min-h-screen bg-[#f4eee3] flex flex-col">
      {/* Top Navbar */}
      <header className="bg-[#fcf9f2] border-b border-[#ded5c2] sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-[#507765] hover:text-[#1c3028] text-xs flex items-center gap-1 border border-[#ded5c2] bg-[#f4eee3] px-2.5 py-1.5 rounded-lg transition-colors font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Formulário</span>
            </Link>
            <div className="h-4 w-px bg-[#ded5c2]" />
            <div>
              <h1 className="text-base font-black text-[#1c3028] leading-none flex items-center gap-1.5 uppercase tracking-tight">
                <ShieldCheck className="w-4 h-4 text-[#264639]" />
                Painel Espaço Kids
              </h1>
              <p className="text-[11px] text-[#507765] font-semibold mt-0.5">
                Um Dia de Glória • Colo de Deus RJ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRegistrations}
              disabled={loading}
              className="gap-1.5 text-xs text-[#1c3028] font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={copySummaryReport}
              className="gap-1.5 text-xs text-[#1c3028] font-bold border-[#ded5c2]"
            >
              {reportCopied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1f583e]" />
                  <span className="hidden sm:inline">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copiar Relatório</span>
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-xs text-[#8f2d22] hover:text-[#722219] hover:bg-[#f8e7e5] font-bold"
            >
              <LogOut className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        {/* CARDS DE MÉTRICAS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between text-[#507765] mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Crianças</span>
                <Baby className="w-4 h-4 text-[#264639]" />
              </div>
              <div className="text-2xl font-black text-[#1c3028]">
                {metrics.totalChildren}
              </div>
              <p className="text-xs text-[#507765] mt-1">
                em {metrics.totalResponsibles} famílias inscritas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between text-[#507765] mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Recebido</span>
                <CheckCircle2 className="w-4 h-4 text-[#1f583e]" />
              </div>
              <div className="text-2xl font-black text-[#1f583e]">
                {formatCurrency(metrics.totalReceived)}
              </div>
              <p className="text-xs text-[#507765] mt-1">
                {metrics.paidCount} de {metrics.totalResponsibles} pagamentos conferidos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between text-[#507765] mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Pendente</span>
                <Clock className="w-4 h-4 text-[#7a5711]" />
              </div>
              <div className="text-2xl font-black text-[#7a5711]">
                {formatCurrency(metrics.totalPending)}
              </div>
              <p className="text-xs text-[#507765] mt-1">
                Previsto total: {formatCurrency(metrics.totalExpected)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between text-[#507765] mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Restrições</span>
                <Utensils className="w-4 h-4 text-[#7a5711]" />
              </div>
              <div className="text-2xl font-black text-[#1c3028]">
                {metrics.foodRestrictionsCount}
              </div>
              <p className="text-xs text-[#507765] mt-1">
                crianças com atenção alimentar
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FILTROS E BUSCA */}
        <Card className="shadow-2xs">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#8a9890] absolute left-3 top-3 pointer-events-none" />
              <Input
                type="text"
                placeholder="Buscar por pai, filho ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 text-xs"
              />
            </div>

            {/* Abas de Filtros */}
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
                className="text-xs h-8 font-bold"
              >
                Todos ({responsibles.length})
              </Button>
              <Button
                variant={statusFilter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("pending")}
                className="text-xs h-8 gap-1 font-bold"
              >
                <Clock className="w-3.5 h-3.5 text-[#7a5711]" />
                Pendentes ({responsibles.filter((r) => r.payment_status === "pending").length})
              </Button>
              <Button
                variant={statusFilter === "paid" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("paid")}
                className="text-xs h-8 gap-1 font-bold"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1f583e]" />
                Pagos ({metrics.paidCount})
              </Button>
              <Button
                variant={statusFilter === "food_restriction" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("food_restriction")}
                className="text-xs h-8 gap-1 font-bold"
              >
                <Utensils className="w-3.5 h-3.5 text-[#7a5711]" />
                Restrições ({metrics.foodRestrictionsCount})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* TABELA DE FAMÍLIAS E CRIANÇAS */}
        <Card className="overflow-hidden shadow-xs">
          <CardHeader className="bg-[#ede4d3]/60 border-b border-[#ded5c2] py-3.5 px-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#1c3028]">
                Inscrições ({filteredList.length})
              </CardTitle>
              <CardDescription className="text-xs text-[#507765]">
                Clique no botão de status para alternar entre Pendente e Pago.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredList.length === 0 ? (
              <div className="p-12 text-center text-[#507765] text-sm space-y-2">
                <Baby className="w-10 h-10 text-[#ded5c2] mx-auto" />
                <p className="font-bold text-[#1c3028]">Nenhuma inscrição encontrada.</p>
                <p className="text-xs text-[#507765]">
                  {searchTerm
                    ? "Tente buscar com outro termo."
                    : "Os novos cadastros aparecerão aqui automaticamente."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#ded5c2]">
                {filteredList.map((resp) => {
                  const isPaid = resp.payment_status === "paid";
                  const isExpanded = expandedId === resp.id;
                  const isUpdating = updatingId === resp.id;
                  const hasRestrictions = resp.children?.some((c) => c.has_food_restriction);

                  return (
                    <div
                      key={resp.id}
                      className={`p-4 sm:p-5 transition-colors ${
                        isPaid ? "bg-[#fcf9f2]" : "bg-[#fbf2dd]/30"
                      } hover:bg-[#ede4d3]/40`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Info do Responsável */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-[#1c3028] text-base">
                              {resp.name}
                            </span>
                            <Badge variant="outline" className="text-[11px] font-bold">
                              {resp.children?.length || 0} {(resp.children?.length || 0) === 1 ? "criança" : "crianças"}
                            </Badge>
                            {hasRestrictions && (
                              <Badge variant="warning" className="text-[11px] gap-1 font-bold">
                                <Utensils className="w-3 h-3" />
                                Restrição Alimentar
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-[#507765]">
                            <a
                              href={`https://wa.me/55${resp.phone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#1f583e] hover:text-[#184530] font-bold flex items-center gap-1 hover:underline"
                            >
                              <Phone className="w-3 h-3 text-[#1f583e]" />
                              {resp.phone}
                            </a>
                            <span>•</span>
                            <span>
                              {resp.created_at
                                ? new Date(resp.created_at).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "Hoje"}
                            </span>
                          </div>

                          {resp.notes && (
                            <p className="text-xs text-[#507765] italic bg-[#ede4d3]/50 px-2 py-1 rounded inline-block">
                              Obs: {resp.notes}
                            </p>
                          )}
                        </div>

                        {/* Pagamento e Ação de Clique para Alternar */}
                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-[#507765] block">
                              Taxa
                            </span>
                            <span className="text-base font-black text-[#1c3028]">
                              {formatCurrency(Number(resp.total_amount || 0))}
                            </span>
                          </div>

                          {/* BOTÃO INTERATIVO: 1 CLIQUE PARA ALTERAR STATUS */}
                          <button
                            type="button"
                            onClick={() => togglePaymentStatus(resp)}
                            disabled={isUpdating}
                            title="Clique para alternar o status de pagamento"
                            className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer border ${
                              isPaid
                                ? "bg-[#1f583e] hover:bg-[#184530] text-[#f4eee3] border-[#184530]"
                                : "bg-[#fbf2dd] hover:bg-[#f6e6be] text-[#7a5711] border-[#e9d6a8]"
                            } ${isUpdating ? "opacity-50 pointer-events-none" : ""}`}
                          >
                            {isPaid ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#f4eee3]" />
                                Pago
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-[#7a5711]" />
                                Pendente
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(isExpanded ? null : resp.id!)
                            }
                            className="p-1.5 rounded-lg border border-[#ded5c2] text-[#507765] hover:bg-[#ede4d3] cursor-pointer"
                            title="Ver detalhes das crianças"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* DETALHES DAS CRIANÇAS */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-[#ded5c2] space-y-3 bg-[#ede4d3]/40 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 sm:p-5 rounded-b-xl animate-in fade-in">
                          <span className="text-xs font-black text-[#264639] uppercase tracking-wider block">
                            Crianças nesta inscrição:
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {resp.children?.map((child, cIdx) => (
                              <div
                                key={child.id || cIdx}
                                className="bg-[#fcf9f2] border border-[#ded5c2] rounded-lg p-3 space-y-1.5 shadow-2xs"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <Baby className="w-4 h-4 text-[#264639]" />
                                    <span className="font-bold text-sm text-[#1c3028]">
                                      {child.name}
                                    </span>
                                  </div>
                                  <Badge variant="secondary" className="text-xs font-bold">
                                    {child.age} anos • {child.gender || "criança"}
                                  </Badge>
                                </div>

                                <div className="text-xs text-[#1c3028]/80 space-y-1 pt-1">
                                  <div className="flex items-center gap-1">
                                    <span className="font-semibold text-[#507765]">Desfraldada:</span>
                                    <span>{child.is_potty_trained ? "Sim ✅" : "Não ❌"}</span>
                                  </div>

                                  {child.has_food_restriction ? (
                                    <div className="p-2 bg-[#fbf2dd] border border-[#e9d6a8] rounded text-[#7a5711] font-bold">
                                      ⚠️ Restrição alimentar: {child.food_restriction_details}
                                    </div>
                                  ) : (
                                    <div className="text-[#507765]">
                                      Sem restrições alimentares.
                                    </div>
                                  )}

                                  {child.observations && (
                                    <div className="text-[#507765] italic">
                                      Observações: {child.observations}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
