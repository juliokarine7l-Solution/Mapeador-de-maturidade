import React, { useState } from "react";
import { FullAnalysisResponse, PillarScoreDiagnostic } from "../types";
import { 
  ShieldAlert, 
  Award, 
  ChevronRight, 
  Activity, 
  TrendingUp, 
  Magnet, 
  BarChart3, 
  Zap, 
  AlertTriangle, 
  HelpCircle, 
  ArrowRight,
  Sparkles,
  ClipboardCheck,
  Building,
  Copy,
  Check,
  FileText,
  LayoutGrid,
  Code,
  Mail
} from "lucide-react";

import PresentationPreview from "./PresentationPreview";

interface DiagnosticResultProps {
  brandName: string;
  result: FullAnalysisResponse;
  onRestart: () => void;
}

export default function DiagnosticResult({ brandName, result, onRestart }: DiagnosticResultProps) {
  const [selectedPillarId, setSelectedPillarId] = useState<string | null>(
    result.pillars && result.pillars.length > 0 ? result.pillars[0].id : null
  );
  const [viewMode, setViewMode] = useState<"dashboard" | "report" | "json" | "presentation">("dashboard");
  const [copied, setCopied] = useState(false);

  // Helper to get matching icons for pillars
  const getPillarIcon = (id: string, className = "h-5 w-5") => {
    switch (id) {
      case "saber":
        return <BarChart3 className={className} />;
      case "ter":
        return <Activity className={className} />;
      case "executar":
        return <TrendingUp className={className} />;
      case "performar":
        return <Zap className={className} />;
      default:
        return <Activity className={className} />;
    }
  };

  // Helper to get beautiful names
  const getPillarName = (id: string) => {
    switch (id) {
      case "saber": return "Saber";
      case "ter": return "Ter";
      case "executar": return "Executar";
      case "performar": return "Performar";
      default: return id.toUpperCase();
    }
  };

  const selectedPillarData = result.pillars.find(p => p.id === selectedPillarId);

  // Find the pillar with the minimum score
  const pillarPrioritario = [...result.pillars].sort((a,b) => a.score - b.score)[0];

  const generateMarkdownReport = () => {
    let md = `### 📊 DIAGNÓSTICO POR PILAR\n`;
    md += `| Pilar | Nota (1.0-5.0) | Justificativa Curta |\n`;
    md += `|-------|---------------|---------------------|\n`;
    result.pillars.forEach(p => {
      let shortDesc = p.diagnosis.split('.')[0] + '.';
      md += `| ${getPillarName(p.id)} | ${p.score.toFixed(1)} | ${shortDesc} |\n`;
    });
    
    md += `\n### ⚠️ RISCOS IDENTIFICADOS\n`;
    if (result.risks && result.risks.length > 0) {
      result.risks.forEach(r => {
        md += `- [Gargalo: **${r.title}**] - ${r.description}\n`;
      });
    } else {
      md += `- Sem riscos críticos mapeados atualmente.\n`;
    }
    
    md += `\n### 🚀 SUGESTÕES PRÁTICAS (Foco no Pilar com Menor Nota)\n`;
    md += `**Pilar Prioritário**: ${getPillarName(pillarPrioritario?.id || "Nenhum")}\n`;
    
    const relevantSuggestions = result.suggestions.filter(s => s.pillarId === pillarPrioritario?.id);
    const otherSuggestions = result.suggestions.filter(s => s.pillarId !== pillarPrioritario?.id);
    const combined = [...relevantSuggestions, ...otherSuggestions];
    
    combined.slice(0, 3).forEach((sug, i) => {
      const timing = i === 0 ? "executável em até 48h" : i === 1 ? "executável em até 1 semana" : "executável em até 2 semanas";
      md += `${i + 1}. [${sug.task} – ${timing}]: ${sug.immediateStep}\n`;
    });

    md += `\n### 🎯 PARECER EXECUTIVO GLOBAL\n`;
    md += `${result.strategicExecutiveSummary || "Sem parecer definido."}\n`;
    return md;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Score color calculation helper (refined for Dark Bento theme)
  const getScoreColorClass = (score: number) => {
    if (score >= 4.0) return "text-red-500 bg-red-600/10 border-red-600/30";
    if (score >= 2.5) return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    return "text-rose-405 text-rose-400 bg-rose-500/10 border-rose-500/30";
  };

  const getScoreStrokeColor = (score: number) => {
    if (score >= 4.0) return "#10b981"; // emerald
    if (score >= 2.5) return "#f59e0b"; // amber
    return "#f43f5e"; // rose
  };

  const getCriticalityColor = (crit: "alta" | "media" | "baixa") => {
    if (crit === "alta") return {
      badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      dot: "bg-red-500",
      bg: "bg-rose-950/20 border-rose-900/40"
    };
    if (crit === "media") return {
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      dot: "bg-amber-500",
      bg: "bg-amber-950/20 border-amber-900/40"
    };
    return {
      badge: "bg-red-600/10 text-red-500 border-red-600/20",
      dot: "bg-red-600",
      bg: "bg-indigo-950/20 border-indigo-900/40"
    };
  };

  // Build the circular gauge percentage for SVG
  const scoreOutOfFive = result.overallScore || 1.0;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scoreOutOfFive / 5) * circumference;

  return (
    <div className="space-y-6 animate-fade-in text-slate-200">
      
      {/* View Mode Toggle Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#11151D] border border-red-950/40 rounded-2xl p-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5 justify-center sm:justify-start">
            <Sparkles className="h-4 w-4 text-amber-400" />
            Resultados do Diagnóstico de Maturidade ({brandName || "Empresa-Alvo"})
          </h2>
          <p className="text-[11px] text-slate-400 text-center sm:text-left">
            Alternar entre visualização interativa do painel ou modelo consolidado de relatório B2B.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setViewMode("dashboard")}
            className={`flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              viewMode === "dashboard"
                ? "bg-red-700 text-white shadow"
                : "bg-slate-950 text-slate-400 hover:text-white border border-red-950/40 hover:border-slate-700"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Dashboard Bento
          </button>
          <button
            onClick={() => setViewMode("presentation")}
            className={`flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              viewMode === "presentation"
                ? "bg-red-700 text-white shadow"
                : "bg-slate-950 text-slate-400 hover:text-white border border-red-950/40 hover:border-slate-700"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Apresentação PPTX
          </button>
          <button
            onClick={() => setViewMode("report")}
            className={`flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              viewMode === "report"
                ? "bg-red-700 text-white shadow"
                : "bg-slate-950 text-slate-400 hover:text-white border border-red-950/40 hover:border-slate-700"
            }`}
          >
            <FileText className="h-4 w-4" />
            Relatório Markdown B2B
          </button>
          <button
            onClick={() => setViewMode("json")}
            className={`flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              viewMode === "json"
                ? "bg-red-700 text-white shadow"
                : "bg-slate-950 text-slate-400 hover:text-white border border-red-950/40 hover:border-slate-700"
            }`}
          >
            <Code className="h-4 w-4" />
            Export JSON (Dashboards)
          </button>
        </div>
      </div>

      {viewMode === "presentation" ? (
        <PresentationPreview brandName={brandName} result={result} />
      ) : viewMode === "report" ? (
        <div className="space-y-6 animate-fade-in">
          {/* Markdown Output Area */}
          <div className="bg-[#180303] border border-red-950/40 rounded-3xl p-6.5 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-red-950/40/85 pb-4.5 mb-5">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-red-500" />
                Relatório Estruturado em Formato de Saída Oficial B2B
              </span>
              <div className="flex gap-2">
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&authuser=${encodeURIComponent('juliokarine7l@gmail.com')}&to=&su=${encodeURIComponent(`Diagnóstico de Maturidade S.T.E.P - ${brandName}`)}&body=${encodeURIComponent(generateMarkdownReport())}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 active:translate-y-0.5 transition-all select-none"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Enviar por Gmail</span>
                </a>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/30 hover:border-red-500 active:translate-y-0.5 transition-all select-none"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-red-500 animate-scale-up" />
                      <span className="text-red-500">Copiado com Sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copiar Relatório Completo</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-6 text-sm text-slate-300 leading-relaxed font-sans">
              
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wide border-l-2 border-red-600 pl-2">
                  📊 DIAGNÓSTICO POR PILAR
                </h3>
                <div className="mt-3.5 overflow-x-auto rounded-xl border border-red-950/40">
                  <table className="w-full text-left border-collapse bg-slate-950/40">
                    <thead>
                      <tr className="border-b border-red-950/40 bg-[#1e0505]/60 text-slate-300 text-xs font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Pilar</th>
                        <th className="py-3 px-4 text-center">Nota (1.0-5.0)</th>
                        <th className="py-3 px-4">Justificativa Curta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {result.pillars.map((p) => {
                        const short = p.diagnosis.split(".")[0] + ".";
                        return (
                          <tr key={p.id} className="hover:bg-[#1e0505]/20 transition-all text-xs md:text-sm">
                            <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                              {getPillarIcon(p.id, "h-4 w-4 text-red-500")}
                              {getPillarName(p.id)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-xs ${getScoreColorClass(p.score)}`}>
                                {p.score.toFixed(1)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-300 pr-5 italic pr-6 max-w-sm">
                              "{short}"
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wide border-l-2 border-rose-500 pl-2">
                  ⚠️ RISCOS IDENTIFICADOS
                </h3>
                <ul className="mt-3.5 space-y-2.5">
                  {result.risks && result.risks.length > 0 ? (
                    result.risks.map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-red-950/40">
                        <span className="text-rose-500 shrink-0 font-bold mt-0.5">•</span>
                        <div>
                          <span className="text-rose-450 text-rose-400 font-extrabold block text-xs md:text-sm">
                            Gargalo: {risk.title}
                          </span>
                          <span className="text-slate-300 text-xs md:text-sm font-medium mt-0.5 block leading-relaxed">
                            {risk.description}
                          </span>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400 text-xs md:text-sm italic">
                      Nenhum gargalo identificado. As declarações operacionais mantêm-se coerentes de acordo com o padrão estrito.
                    </li>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wide border-l-2 border-amber-500 pl-2">
                  🚀 SUGESTÕES PRÁTICAS (Foco no Pilar com Menor Nota)
                </h3>
                <div className="mt-3 bg-slate-950/40 p-4 border border-red-950/40 rounded-xl">
                  <p className="text-xs text-slate-400 font-bold mb-3 uppercase tracking-wider">
                    Pilar Prioritário: <span className="text-white bg-red-600/10 px-2 py-1 rounded-md border border-red-600/20 font-mono text-xs">{getPillarName(pillarPrioritario?.id || "Nenhum")}</span>
                  </p>
                  
                  <div className="space-y-4">
                    {(() => {
                      const relevantSuggestions = result.suggestions.filter(s => s.pillarId === pillarPrioritario?.id);
                      const otherSuggestions = result.suggestions.filter(s => s.pillarId !== pillarPrioritario?.id);
                      const combined = [...relevantSuggestions, ...otherSuggestions];
                      
                      return combined.slice(0, 3).map((sug, i) => {
                        const timing = i === 0 ? "executável em até 48h" : i === 1 ? "executável em até 1 semana" : "executável em até 2 semanas";
                        return (
                          <div key={i} className="flex gap-3 items-start">
                            <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <div>
                              <p className="text-white text-xs md:text-sm font-extrabold">
                                {sug.task} <span className="text-amber-400 text-xs font-bold block sm:inline sm:ml-2">({timing})</span>
                              </p>
                              <p className="text-slate-300 text-xs md:text-sm mt-0.5 leading-relaxed">
                                {sug.immediateStep}
                              </p>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wide border-l-2 border-red-600 pl-2">
                  🎯 PARECER EXECUTIVO GLOBAL
                </h3>
                <p className="mt-3.5 text-slate-200 leading-relaxed text-xs md:text-sm bg-slate-950/80 rounded-xl p-4 border border-red-950/40 italic" id="executive-summary-text-rep">
                  "{result.strategicExecutiveSummary || "Sem parecer definido."}"
                </p>
              </div>

            </div>
          </div>

          <div className="bg-[#11151D] border border-red-950/40 rounded-3xl p-6.5">
            <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-3">
              Raw Markdown Preview para Copiar
            </h4>
            <div className="relative">
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-850 overflow-auto max-h-72 font-mono text-slate-300 text-[11px] leading-relaxed whitespace-pre-wrap select-all">
                {generateMarkdownReport()}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 bg-red-700 hover:bg-red-600 active:scale-95 transition-all p-2 rounded-lg text-white font-bold"
                title="Copiar Código Markdown"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button 
            onClick={onRestart}
            className="w-full bg-red-700 py-3.5 rounded-xl text-white font-extrabold text-xs uppercase tracking-widest hover:bg-red-600 transition-all select-none active:scale-98 cursor-pointer"
          >
            Executar Nova Simulação / Corrigir Respostas
          </button>
        </div>
      ) : viewMode === "dashboard" ? (
        <div className="space-y-6 animate-fade-in">
          
          {/* bento view */}
          <div className="grid grid-cols-12 gap-5">
            
            {/* Bento Cell 1: Overall Score Card (Global Maturity) */}
            <div className="col-span-12 md:col-span-4 bg-[#180303] border border-red-950/40 rounded-3xl p-6 flex flex-col justify-between min-h-[220px] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent pointer-events-none" />
              <div className="relative z-10 space-y-3">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Maturidade Global</h3>
                <div className="flex items-end gap-2">
                  <span className="text-6xl font-black text-white tracking-tighter">{scoreOutOfFive.toFixed(1)}</span>
                  <span className="text-red-500 text-sm font-semibold mb-2 tracking-wide">/ 5.0</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal max-w-[220px]">
                  {scoreOutOfFive >= 4.0 
                    ? "Sua corporação possui uma governança de metas, playbooks e unit-economics escaláveis." 
                    : scoreOutOfFive >= 2.5 
                    ? "Sua corporação apresenta faturamento volátil, com gargalos profundos na medição ou atração." 
                    : "Sua corporação opera em regime de alto risco, apostando em escala sem clareza de dados ou playbooks."
                  }
                </p>
              </div>
              <div className="relative z-10 w-full bg-slate-800/80 h-3 rounded-full overflow-hidden mt-4">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${(scoreOutOfFive / 5) * 100}%`,
                    backgroundColor: getScoreStrokeColor(scoreOutOfFive)
                  }}
                />
              </div>
            </div>

            {/* Bento Cell 2: Pillar Quick Rating Indicator */}
            <div className="col-span-12 md:col-span-8 bg-[#180303] border border-red-950/40 rounded-3xl p-6 flex flex-col justify-between min-h-[220px]">
              <div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Notas por Pilar Comercial</h3>
                <div className="space-y-4">
                  {result.pillars.map((pillar) => (
                    <div key={pillar.id} className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                        <span className="text-red-500">{getPillarIcon(pillar.id, "h-4.5 w-4.5")}</span>
                        {getPillarName(pillar.id)}
                      </span>
                      
                      {/* Grid blocks representation */}
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1 animate-pulse-slow">
                          {[1, 2, 3, 4, 5].map((step) => {
                            const isFilled = step <= Math.round(pillar.score);
                            return (
                              <div 
                                key={step} 
                                className={`w-4 h-2 rounded-full transition-all duration-500 ${
                                  isFilled 
                                    ? pillar.score >= 4.0 
                                      ? "bg-red-600" 
                                      : pillar.score >= 2.5 
                                      ? "bg-red-600" 
                                      : "bg-rose-500"
                                    : "bg-slate-800"
                                }`} 
                              />
                            );
                          })}
                        </div>
                        <span className="text-xs font-mono font-bold text-white min-w-[20px] text-right">
                          {pillar.score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[10px] text-slate-500 mt-4 border-t border-red-950/40/80 pt-2.5 flex justify-between">
                <span>Diagnóstico do Consultor Estratégico AI</span>
                <span className="text-red-500">*Gargalos Operacionais de Escala B2B</span>
              </div>
            </div>

            {/* Bento Cell 3: LOGICAL INCONSISTENCIES CARD (Focus of prompt) */}
            <div className="col-span-12 bg-rose-500/5 border border-rose-500/20 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute right-4 top-4 opacity-10">
                <ShieldAlert className="w-24 h-24 text-rose-400" />
              </div>

              <div className="relative z-10 space-y-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase rounded">
                    Identificação de Incoerência Lógica (Auto-Negligência)
                  </span>
                  <span className="text-slate-500 text-xs">•</span>
                  <span className="text-slate-400 text-xs">Aparelhagem Científica B2B</span>
                </div>

                {result.inconsistencies && result.inconsistencies.length > 0 ? (
                  <div className="space-y-4">
                    {result.inconsistencies.map((inc, idx) => {
                      const colors = getCriticalityColor(inc.criticality || "alta");
                      return (
                        <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-red-950/40 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-rose-400 capitalize bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                                {getPillarName(inc.pillar1)}
                              </span>
                              <span className="text-slate-500">↔</span>
                              <span className="text-xs font-bold text-red-500 capitalize bg-red-600/10 px-2 py-0.5 rounded border border-red-600/20">
                                {getPillarName(inc.pillar2)}
                              </span>
                            </div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 border rounded ${colors.badge}`}>
                              Gravidade {inc.criticality ? inc.criticality.toUpperCase() : "ALTA"}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-100 text-sm md:text-base flex items-center gap-2 mt-1">
                            <AlertTriangle className="h-4 w-4 text-amber-500 animate-bounce-slow" />
                            {inc.title}
                          </h4>
                          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                            {inc.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-red-600/5 border border-red-600/10 rounded-xl">
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      "Nenhuma inconsistência lógica primária foi detectada nas respostas declaradas. A corporação demonstrou coerência operacional plena entre processos e métricas acompanhadas."
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bento Cell 4: Operational Risks & Bottlenecks */}
            <div className="col-span-12 md:col-span-6 bg-[#180303] border border-red-950/40 rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Riscos e Gargalos Corporativos</h3>
                  <span className="text-[10px] text-slate-500 font-mono">IMPEDIMENTOS DE ESCALA</span>
                </div>

                <div className="space-y-4">
                  {result.risks && result.risks.length > 0 ? (
                    result.risks.map((risk, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="w-1.5 h-12 bg-rose-500 rounded-full shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-bold font-mono tracking-wider text-slate-500 uppercase bg-slate-950 px-1.5 py-0.5 rounded border border-red-950/40 capitalize">
                              {getPillarName(risk.pillarId)}
                            </span>
                            <h4 className="text-slate-100 font-bold text-sm">{risk.title}</h4>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed mt-1">
                            {risk.description}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-xs">Nenhum risco de segurança operacional pendente no momento.</p>
                  )}
                </div>
              </div>

              <div className="text-[10px] text-slate-600 mt-6 pt-3 border-t border-red-950/40/80 italic">
                *Unidades de faturamento sob constante risco devido a gargalos operacionais não endereçados.
              </div>
            </div>

            {/* Bento Cell 5: Immediate Roadmap & Action Plan (Ações Práticas) */}
            <div className="col-span-12 md:col-span-6 bg-[#180303] border border-red-950/40 rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Iniciativas de Ajuste Imediato</h3>
                  <span className="text-[10px] text-red-500 font-bold">SUGESTÕES ACIONÁVEIS</span>
                </div>

                <div className="space-y-3.5">
                  {result.suggestions && result.suggestions.length > 0 ? (
                    result.suggestions.map((sug, idx) => (
                      <div key={idx} className="bg-slate-950/60 border border-red-950/40/80 rounded-2xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="w-5.5 h-5.5 bg-red-600/10 text-red-500 border border-red-600/20 rounded-full flex items-center justify-center text-[10px] font-black font-mono">
                              0{idx + 1}
                            </span>
                            <h4 className="font-bold text-xs text-white tracking-tight">{sug.task}</h4>
                          </div>
                          <span className={`text-[8px] font-mono px-2 py-0.5 rounded items-center uppercase ${
                            sug.priority === "alta" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-slate-800 text-slate-400"
                          }`}>
                            {sug.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed pl-8">
                          {sug.immediateStep}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-xs">Sua máquina de lucros está no trilhar correto.</p>
                  )}
                </div>
              </div>

              <button 
                onClick={onRestart}
                className="mt-6 w-full bg-red-700 py-3.5 rounded-xl text-white font-extrabold text-xs uppercase tracking-widest hover:bg-red-600 transition-all select-none active:scale-98 cursor-pointer"
              >
                Executar Nova Simulação / Corrigir Respostas
              </button>
            </div>

          </div>

          {/* Bento Cell 6: Executive Summary and Context (Abaixo) */}
          <div className="bg-[#180303] border border-red-950/40 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-widest text-slate-400 flex items-center gap-2">
              <ClipboardCheck className="h-4.5 w-4.5 text-red-500" />
              Parecer Científico de Viabilidade Comercial (Diagnóstico)
            </h3>
            <p className="text-slate-200 leading-relaxed text-xs md:text-sm bg-slate-950/80 rounded-xl p-4 border border-slate-850 italic" id="executive-summary-text">
              "{result.strategicExecutiveSummary}"
            </p>
          </div>
        </div>
      ) : viewMode === "json" ? (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-[#180303] border border-red-950/40 rounded-3xl p-6.5 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-red-950/40 pb-4.5 mb-5">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-2">
                <Code className="h-4.5 w-4.5 text-red-500" />
                Exportação de Dados para Apresentações Executivas (Gamma, Slides)
              </span>
              <button
                onClick={() => {
                  const exportData = {
                    presentationTitle: `Diagnóstico de Maturidade S.T.E.P - ${brandName}`,
                    generatedAt: new Date().toISOString(),
                    ...result
                  };
                  navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/30 hover:border-red-500 active:translate-y-0.5 transition-all select-none"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-red-500 animate-scale-up" />
                    <span className="text-red-500">JSON Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copiar Payload JSON</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-[#0e0000]/80 rounded-xl p-4 border border-red-950/40 overflow-auto max-h-[600px]">
              <pre className="text-[11px] font-mono text-slate-300 leading-relaxed">
                {JSON.stringify({ 
                  presentationTitle: `Diagnóstico de Maturidade S.T.E.P - ${brandName}`, 
                  generatedAt: new Date().toISOString(),
                  ...result 
                }, null, 2)}
              </pre>
            </div>
          </div>
          <button 
            onClick={onRestart}
            className="w-full bg-red-700 py-3.5 rounded-xl text-white font-extrabold text-xs uppercase tracking-widest hover:bg-red-600 transition-all select-none active:scale-98 cursor-pointer"
          >
            Executar Nova Simulação / Corrigir Respostas
          </button>
        </div>
      ) : null}

    </div>
  );
}
