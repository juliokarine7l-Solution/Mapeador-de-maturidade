import React, { useState, useEffect } from "react";
import { 
  Magnet, 
  TrendingUp, 
  BarChart3, 
  Zap, 
  ShieldAlert, 
  AlertTriangle, 
  Award, 
  Sparkles, 
  Building, 
  CheckCircle2, 
  HelpCircle, 
  Send, 
  RefreshCw,
  Layers,
  Info,
  ChevronRight,
  ChevronDown,
  Trash2,
  FileText,
  Activity
} from "lucide-react";
import { PILLARS_DATA } from "./pillarsData";
import { PREFILL_SCENARIOS } from "./prefillScenarios";
import { FullAnalysisResponse, PillarFormulation, SavedAssessment } from "./types";
import DiagnosticResult from "./components/DiagnosticResult";

import ConsultativeFlow from "./components/ConsultativeFlow";
import PresentationManager from "./components/PresentationManager";

export default function App() {
  const [activeTab, setActiveTab] = useState<"internal" | "consultative" | "presentation">("internal");
  const [brandName, setBrandName] = useState<string>("Acme Inc.");

  const [activeScenarioIdx, setActiveScenarioIdx] = useState<number | null>(0); // Default to first scenario for preview ease
  const [responses, setResponses] = useState<{ [pillarId: string]: PillarFormulation }>({
    saber: { userAnswer: "", userEvidence: "" },
    ter: { userAnswer: "", userEvidence: "" },
    executar: { userAnswer: "", userEvidence: "" },
    performar: { userAnswer: "", userEvidence: "" },
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FullAnalysisResponse | null>(null);
  const [history, setHistory] = useState<SavedAssessment[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  // On mount, load default prefill and any saved history
  useEffect(() => {
    // Load prefill scenario index 0 by default so the user sees excellent data instantly
    const defaultScenario = PREFILL_SCENARIOS[0];
    if (defaultScenario) {
      setBrandName(defaultScenario.brandName);
      const initialResponses: { [pillarId: string]: PillarFormulation } = {};
      PILLARS_DATA.forEach(p => {
        initialResponses[p.id] = {
          userAnswer: defaultScenario.responses[p.id]?.userAnswer || "",
          userEvidence: defaultScenario.responses[p.id]?.userEvidence || ""
        };
      });
      setResponses(initialResponses);
    }

    try {
      const stored = localStorage.getItem("strategy_assessments");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }, []);

  // Update responses when selecting a preset scenario
  const handleSelectScenario = (idx: number) => {
    setActiveScenarioIdx(idx);
    const scenario = PREFILL_SCENARIOS[idx];
    if (scenario) {
      setBrandName(scenario.brandName);
      const updated: { [pillarId: string]: PillarFormulation } = {};
      PILLARS_DATA.forEach(p => {
        updated[p.id] = {
          userAnswer: scenario.responses[p.id]?.userAnswer || "",
          userEvidence: scenario.responses[p.id]?.userEvidence || ""
        };
      });
      setResponses(updated);
      setError(null);
    }
  };

  // Live validator for inconsistencies on the client side
  useEffect(() => {
    const warnings: string[] = [];
    const perform = responses.performar?.userAnswer?.toLowerCase() || "";
    const gatherData = responses.saber?.userAnswer?.toLowerCase() || "";

    const claimsScale = perform.includes("escala") || perform.includes("automação") || perform.includes("liderança") || perform.includes("inteligência") || perform.length > 50;
    const lacksMetrics = gatherData.includes("não monitoramos") || gatherData.includes("empírico") || gatherData.includes("não temos métricas") || gatherData.includes("confiamos na intuição") || gatherData.length < 20;

    if (claimsScale && lacksMetrics) {
      warnings.push("Crítico: Alertamos sobre Risco de Churn. A empresa projeta ações de 'Performar' (Pilar 04) sem domínio fundacional de dados (Pilar 01: Saber).");
    }

    const executa = responses.executar?.userAnswer?.toLowerCase() || "";
    const lacksTer = (responses.ter?.userAnswer?.toLowerCase() || "").includes("não temos crm") || (responses.ter?.userAnswer?.toLowerCase() || "").includes("fragmentado");

    if (executa.includes("escala") && lacksTer) {
      warnings.push("Atenção: Sobrecarga em Infraestrutura Quebrada. Crescimento (Executar) forçado sobre bases de dados fragmentadas (Ter) aumenta a perda de eficiência.");
    }

    setValidationWarnings(warnings);
  }, [responses]);

  // Handle individual response changes
  const handleAnswerChange = (pillarId: string, value: string) => {
    setActiveScenarioIdx(null); // break scenario link on manual edit
    setResponses(prev => ({
      ...prev,
      [pillarId]: {
        ...prev[pillarId],
        userAnswer: value
      }
    }));
  };

  const handleEvidenceChange = (pillarId: string, value: string) => {
    setActiveScenarioIdx(null); // break scenario link on manual edit
    setResponses(prev => ({
      ...prev,
      [pillarId]: {
        ...prev[pillarId],
        userEvidence: value
      }
    }));
  };

  // Quick helper to evaluate if a pillar has been filled out
  const getPillarCompletionStatus = (pillarId: string) => {
    const r = responses[pillarId];
    if (!r) return "empty";
    if (r.userAnswer.length > 10 && r.userEvidence.length > 5) return "done";
    if (r.userAnswer.length > 0 || r.userEvidence.length > 0) return "partial";
    return "empty";
  };

  // Main submission orchestrator
  const handleSubmitDiagnostic = async () => {
    setError(null);
    setIsLoading(true);

    const formattedResponses = PILLARS_DATA.map(p => ({
      pilarId: p.id,
      pilarName: p.name,
      questionText: p.question,
      userAnswer: responses[p.id]?.userAnswer || "",
      userEvidence: responses[p.id]?.userEvidence || ""
    }));

    // Fun simulated high-tech logger steps
    const steps = [
      "Sincronizando Respostas e Evidências...",
      "Processando Textos de Evidências...",
      "Cruzando declarações entre Saber e Potencializar...",
      "Análise de inconsistências lógicas em execução...",
      "Consultando base de Inteligência B2B pelo Gemini...",
      "Refinando notas de 1 a 5 e gerando roadmap prático..."
    ];

    let currentStepIdx = 0;
    setLoadingStep(steps[currentStepIdx]);

    const interval = setInterval(() => {
      if (currentStepIdx < steps.length - 1) {
        currentStepIdx++;
        setLoadingStep(steps[currentStepIdx]);
      }
    }, 1300);

    try {
      const apiResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          responses: formattedResponses
        })
      });

      clearInterval(interval);

      if (!apiResponse.ok) {
        const errText = await apiResponse.text();
        throw new Error(errText || "Falha na resposta do servidor.");
      }

      const parsedResult: FullAnalysisResponse = await apiResponse.json();
      
      // Save result and persist in state + history
      setResult(parsedResult);

      const newAssessment: SavedAssessment = {
        id: Math.random().toString(36).substring(2, 9),
        brandName,
        createdAt: new Date().toLocaleDateString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit"
        }),
        responses,
        result: parsedResult
      };

      const updatedHistory = [newAssessment, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem("strategy_assessments", JSON.stringify(updatedHistory));

    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Algo saiu errado durante a análise do Gemini. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to remove evaluation result
  const handleRestart = () => {
    setResult(null);
    setError(null);
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem("strategy_assessments", JSON.stringify(updated));
  };

  const handleLoadHistoryAssessment = (item: SavedAssessment) => {
    setBrandName(item.brandName);
    setResponses(item.responses);
    setResult(item.result);
    setError(null);
    // Scroll to results top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Render matching icons for inputs
  const getPillarIconElement = (id: string, className = "h-5 w-5") => {
    switch (id) {
      case "saber": return <BarChart3 className={className} />;
      case "ter": return <Activity className={className} />;
      case "executar": return <TrendingUp className={className} />;
      case "performar": return <Zap className={className} />;
      default: return <Activity className={className} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0000] text-slate-200 font-sans antialiased selection:bg-red-600/30 selection:text-white p-4 md:p-8">
      
      {/* Container Wrapper with responsive desktop containment */}
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Upper Brand Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-red-950/40 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">
                V4 COMPANY <span className="text-red-500">/ MODELO S.T.E.P</span>
              </h1>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">
                Saber • Ter • Executar • Performar
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3.5 py-1 bg-[#1e0505] border border-red-950/40 rounded-full text-[11px] font-mono text-slate-400 tracking-wide">
              Auditoria de Maturidade
            </div>
            <div className="px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full text-[11px] font-semibold text-red-500">
              Anti-Churn Ativo
            </div>
          </div>
        </header>

        {/* LOADING INDICATOR STATE */}
        {isLoading && (
          <div className="min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-[#180303] border border-red-950/40 rounded-3xl relative overflow-hidden animate-pulse">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />
            
            <div className="relative z-10 max-w-lg space-y-6">
              {/* Spinner */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-red-600/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                <Layers className="h-8 w-8 text-red-500 animate-bounce" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white tracking-tight">Análise Estratégica em Curso</h3>
                <p className="text-red-500 font-mono text-sm uppercase tracking-widest bg-red-600/5 px-4 py-1.5 rounded-full border border-red-600/10 inline-block">
                  {loadingStep}
                </p>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
                Nosso consultor artificial está varrendo suas respostas base para filtrar autoenganos e calcular a consistência de escala baseando-se em evidências comprovadas.
              </p>
            </div>
          </div>
        )}

        {/* STRATEGIST DIAGNOSTIC VIEW */}
        {!isLoading && result && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#1e0505]/50 p-4 rounded-2xl border border-red-950/40">
              <span className="text-xs text-slate-400">
                Visualizando resultado para: <strong className="text-white font-semibold">{brandName}</strong>
              </span>
              <button 
                onClick={handleRestart}
                className="text-xs text-red-500 hover:text-indigo-300 font-bold flex items-center gap-1 bg-[#1e0505] border border-red-950/40 py-1.5 px-3 rounded-xl transition hover:border-slate-700 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Voltar ao Diagnóstico
              </button>
            </div>
            
            <DiagnosticResult 
              brandName={brandName}
              result={result}
              onRestart={handleRestart}
            />
          </div>
        )}

        {/* INPUT FORM VIEW */}
        {!isLoading && !result && (
          <div className="space-y-6">
            
            {/* TAB SWITCHER */}
            <div className="flex border-b border-red-950/40 relative overflow-x-auto whitespace-nowrap custom-scrollbar">
              <button
                onClick={() => setActiveTab("internal")}
                className={`py-4 px-6 text-sm font-bold transition-all relative ${
                  activeTab === "internal" ? "text-red-500" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Preenchimento Interno (Dashboard)
                {activeTab === "internal" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full shadow-[0_-2px_10px_rgba(220,38,38,0.5)]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("consultative")}
                className={`py-4 px-6 text-sm font-bold transition-all relative flex items-center gap-2 ${
                  activeTab === "consultative" ? "text-red-500" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Envio Consultivo STEP
                <span className="bg-red-600/20 text-red-500 text-[10px] px-2 py-0.5 rounded-full border border-red-600/30">NOVO</span>
                {activeTab === "consultative" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full shadow-[0_-2px_10px_rgba(220,38,38,0.5)]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("presentation")}
                className={`py-4 px-6 text-sm font-bold transition-all relative flex items-center gap-2 ${
                  activeTab === "presentation" ? "text-red-500" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Apresentação Executiva
                {activeTab === "presentation" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full shadow-[0_-2px_10px_rgba(220,38,38,0.5)]" />
                )}
              </button>
            </div>

            {activeTab === "presentation" ? (
              <PresentationManager 
                history={history} 
                currentResult={result} 
                currentBrandName={brandName} 
              />
            ) : activeTab === "consultative" ? (
              <ConsultativeFlow 
                onAddHistory={(item) => {
                  const updatedHistory = [item, ...history].slice(0, 10);
                  setHistory(updatedHistory);
                  localStorage.setItem("strategy_assessments", JSON.stringify(updatedHistory));
                }}
              />
            ) : (
              <div className="space-y-6 animate-fade-in">
                {/* Top Info Alert Box */}
                <div className="bg-[#180303] border border-red-950/40 rounded-2xl p-6 relative overflow-hidden">

              <div className="absolute -right-4 -top-4 opacity-5">
                <Activity className="w-48 h-48 text-red-600" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row gap-5 items-start justify-between">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-widest">
                    <Sparkles className="h-4 w-4" />
                    Bento Inteligente de Maturidade Comercial
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Avalie a Solidez Real da sua Máquina de Receita
                  </h2>
                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                    Este sistema avalia a maturidade de infraestrutura e operação de vendas sob os 4 estágios do método S.T.E.P (<strong>Saber, Ter, Executar, Performar</strong>).
                    Descreva sua realidade e cite <strong>evidências e métricas</strong> para habilitar uma auditoria imune ao "achismo".
                  </p>
                </div>
                
                {/* Visual quick summary tag */}
                <div className="p-4 bg-[#1e0505] rounded-xl border border-red-950/40 w-full md:w-auto md:min-w-[200px] text-center space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Estilo de Operação</span>
                  <span className="text-white text-sm font-bold block">100% Livre de Achismos</span>
                  <span className="text-[10px] text-red-500 block font-semibold mt-1">✓ Medicina de Negócios 3.0</span>
                </div>
              </div>
            </div>

            {/* PRE-COMPLETED SCENARIOS SELECTOR - BENTO TILE */}
            <div className="bg-[#180303] border border-red-950/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-red-950/40 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-red-600/10 border border-red-600/20 text-red-500 rounded-lg">
                    <Layers className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Cenários de Teste Pré-preenchidos</h3>
                    <p className="text-[10px] text-slate-500">Selecione um caso prático rápido para auditar os vereditos da IA.</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500">3 MODELOS DETECTADOS</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {PREFILL_SCENARIOS.map((scenario, idx) => {
                  const isActive = activeScenarioIdx === idx;
                  const getBadgeColor = (type: string) => {
                    if (type === "inconsistencia") return "bg-rose-500/10 text-rose-400 border-rose-500/20";
                    if (type === "alinhamento") return "bg-red-600/10 text-red-500 border-red-600/20";
                    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
                  };

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectScenario(idx)}
                      className={`text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2.5 h-full ${
                        isActive 
                          ? "border-red-600 bg-red-600/5 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
                          : "border-red-950/40/85 bg-[#1e0505]/45 hover:bg-[#1e0505] hover:border-slate-700"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded ${getBadgeColor(scenario.badge)}`}>
                            {scenario.badgeText}
                          </span>
                          {isActive && <span className="text-[10px] text-red-500 font-bold">● Ativo</span>}
                        </div>
                        <h4 className="text-xs font-bold text-white tracking-tight">{scenario.name}</h4>
                        <p className="text-[11px] text-slate-400 leading-normal line-clamp-3">
                          {scenario.description}
                        </p>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 pt-1.5 border-t border-red-950/40/60 mt-auto">
                        Empresa: {scenario.brandName}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* REAL-TIME LOGIC CONTROLLER / REAL-TIME DETECTION BANNER */}
            {validationWarnings.length > 0 && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex gap-3 items-start animate-fade-in">
                <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-widest font-mono">
                    Auditoria Crítica Prévia Ativa
                  </h4>
                  <div className="space-y-1">
                    {validationWarnings.map((warn, i) => (
                      <p key={i} className="text-xs text-amber-200/90 leading-relaxed">
                        {warn}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MAIN BENTO GRID FOR INPUTS */}
            <div className="bg-[#180303] border border-red-950/40 rounded-3xl p-6 md:p-8 space-y-6">
              
              {/* Brand metadata setting pane */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-red-950/40/80 pb-6">
                <div className="space-y-1.5 w-full md:w-auto">
                  <label htmlFor="company-name-input" className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-mono">
                    Identificação Corporativa / Nome do Caso
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 h-4.5 w-4.5" />
                    <input
                      id="company-name-input"
                      type="text"
                      className="bg-[#1e0505] border border-red-950/40 text-white rounded-xl py-2 px-10 text-sm focus:border-red-600 transition-all outline-none font-bold placeholder-slate-600 w-full md:w-80"
                      value={brandName}
                      onChange={(e) => {
                        setActiveScenarioIdx(null);
                        setBrandName(e.target.value);
                      }}
                      placeholder="Ex: Minha Empresa Inc."
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-500 pt-2 md:pt-0">
                  <span className="bg-[#1e0505] px-3 py-1 rounded-lg border border-red-950/40">
                    Saber: {getPillarCompletionStatus("saber") === "done" ? "Completo ✓" : "Pendente"}
                  </span>
                  <span className="bg-[#1e0505] px-3 py-1 rounded-lg border border-red-950/40">
                    Ter: {getPillarCompletionStatus("ter") === "done" ? "Completo ✓" : "Pendente"}
                  </span>
                  <span className="bg-[#1e0505] px-3 py-1 rounded-lg border border-red-950/40">
                    Executar: {getPillarCompletionStatus("executar") === "done" ? "Completo ✓" : "Pendente"}
                  </span>
                  <span className="bg-[#1e0505] px-3 py-1 rounded-lg border border-red-950/40">
                    Performar: {getPillarCompletionStatus("performar") === "done" ? "Completo ✓" : "Pendente"}
                  </span>
                </div>
              </div>

              {/* Responsive 4 Pillars Form Bento grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {PILLARS_DATA.map((pillar, pIdx) => {
                  const currentAnswer = responses[pillar.id]?.userAnswer || "";
                  const currentEvidence = responses[pillar.id]?.userEvidence || "";
                  const status = getPillarCompletionStatus(pillar.id);
                  
                  return (
                    <div 
                      key={pillar.id} 
                      className={`p-5 md:p-6 rounded-2xl border transition-all duration-300 bg-[#1e0505]/30 ${
                        status === "done" 
                          ? "border-red-600/20 shadow-[0_4px_20px_rgba(16,185,129,0.03)]" 
                          : status === "partial" 
                          ? "border-red-600/20 shadow-[0_4px_20px_rgba(99,102,241,0.03)]" 
                          : "border-red-950/40/80"
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-red-950/40/70 pb-3 mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="bg-[#1e0505] text-slate-400 p-2 rounded-xl border border-red-950/40">
                            {getPillarIconElement(pillar.id, "h-5 w-5 text-red-500")}
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                              PILLAR 0{pIdx + 1}
                            </span>
                            <h3 className="font-extrabold text-base text-white leading-tight">
                              {pillar.name}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 italic hidden sm:inline">
                            {pillar.tagline}
                          </span>
                          <span className={`h-2.5 w-2.5 rounded-full ${
                            status === "done" ? "bg-red-600 animate-pulse" : status === "partial" ? "bg-red-500" : "bg-slate-700"
                          }`} />
                        </div>
                      </div>

                      {/* Descriptive open content prompt */}
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label htmlFor={`answer-field-${pillar.id}`} className="text-xs font-semibold text-slate-300 block leading-relaxed">
                            {pillar.question}
                          </label>
                          <p className="text-[11px] text-slate-500 leading-normal">
                            {pillar.description}
                          </p>
                          <textarea
                            id={`answer-field-${pillar.id}`}
                            className="w-full h-24 bg-slate-950 border border-red-950/40 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all leading-relaxed resize-none font-sans"
                            value={currentAnswer}
                            onChange={(e) => handleAnswerChange(pillar.id, e.target.value)}
                            placeholder={pillar.placeholder}
                          />
                        </div>

                        {/* Evidências Field */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between items-center">
                            <label htmlFor={`evidence-field-${pillar.id}`} className="text-xs font-extrabold text-red-500 uppercase tracking-wider block font-mono">
                              Evidências Operacionais e Métricas
                            </label>
                            <span className="text-[9px] text-red-600 hover:text-red-500 font-bold hidden sm:inline">
                              *Medicina 3.0 Exigida
                            </span>
                          </div>
                          <input
                            id={`evidence-field-${pillar.id}`}
                            type="text"
                            className="w-full bg-slate-950 border border-red-950/40 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:border-red-600 outline-none transition-all font-sans"
                            value={currentEvidence}
                            onChange={(e) => handleEvidenceChange(pillar.id, e.target.value)}
                            placeholder={pillar.evidencePlaceholder}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action error log details if any */}
              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs leading-relaxed">
                  <strong>Ocorreu um erro no pipeline:</strong> {error}
                </div>
              )}

              {/* Primary button dispatcher trigger */}
              <div className="pt-4 border-t border-red-950/40 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <span className="text-xs text-slate-400 block font-medium">
                    Pronto para receber o parecer do comitê de maturidade?
                  </span>
                  <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">
                    Utilizaremos o motor <strong>Gemini 3.5 Flash</strong> regulado com temperatura zero para máxima fidelidade.
                  </span>
                </div>

                <button
                  onClick={handleSubmitDiagnostic}
                  className="w-full sm:w-auto px-8 py-4 bg-red-700 hover:bg-red-600 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg hover:shadow-red-700/20 active:scale-98 relative overflow-hidden group flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  Gerar Diagnóstico Implacável
                </button>
              </div>

            </div>
          </div>
        )}

        {/* HISTORICAL RECENT ASSESSMENTS LIST */}
            {history.length > 0 && (
              <div className="bg-[#180303] border border-red-950/40 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  Histórico de Diagnósticos Recentes ({history.length})
                </h3>
                <div className="divide-y divide-slate-800/60">
                  {history.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => handleLoadHistoryAssessment(item)}
                      className="py-3 flex justify-between items-center hover:bg-[#1e0505]/40 px-2 rounded-lg cursor-pointer transition text-xs"
                    >
                      <div className="space-y-1">
                        <span className="font-extrabold text-slate-200 block">{item.brandName || "Empresa"}</span>
                        <div className="flex gap-2 text-[10px] text-slate-500 font-mono">
                          <span>Criado: {item.createdAt}</span>
                          <span>•</span>
                          <span>Nota: {item.result?.overallScore?.toFixed(1) || "N/A"}/5.0</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-red-500 font-semibold group-hover:underline">Visualizar</span>
                        <button
                          onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                          className="p-1 px-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-rose-400 transition cursor-pointer"
                          title="Remover histórico"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
