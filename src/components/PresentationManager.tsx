import React, { useState } from "react";
import { SavedAssessment, FullAnalysisResponse } from "../types";
import { FileText, Sparkles, ChevronRight, LayoutTemplate } from "lucide-react";
import PresentationPreview from "./PresentationPreview";

interface PresentationManagerProps {
  history: SavedAssessment[];
  currentResult: FullAnalysisResponse | null;
  currentBrandName: string;
}

export default function PresentationManager({ history, currentResult, currentBrandName }: PresentationManagerProps) {
  const [selectedAssessment, setSelectedAssessment] = useState<SavedAssessment | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Consider currentResult if it exists
  const hasCurrentResult = currentResult !== null;
  
  const handleSelect = (assessment: SavedAssessment) => {
    setSelectedAssessment(assessment);
    setShowPreview(true);
  };

  const handleUseCurrent = () => {
    setShowPreview(true);
  };

  if (showPreview) {
    const targetBrand = selectedAssessment ? selectedAssessment.brandName : currentBrandName;
    const targetResult = selectedAssessment ? selectedAssessment.result : currentResult;

    if (!targetResult) return null;

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => setShowPreview(false)}
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center transition"
          >
            ← Voltar para Lista
          </button>
        </div>
        <PresentationPreview 
          brandName={targetBrand} 
          result={targetResult} 
        />
      </div>
    );
  }

  const hasAnyData = history.length > 0 || hasCurrentResult;

  if (!hasAnyData) {
    return (
      <div className="bg-[#180303] border border-red-950/40 rounded-3xl p-12 text-center flex flex-col items-center justify-center animate-fade-in">
        <LayoutTemplate className="h-16 w-16 text-slate-700 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Nenhum diagnóstico encontrado</h2>
        <p className="text-sm text-slate-400 max-w-md">
          Para criar uma apresentação executiva, você precisa primeiro gerar um diagnóstico na aba "Preenchimento Interno" ou "Envio Consultivo".
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-[#180303] border border-red-950/40 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-5">
          <Sparkles className="w-48 h-48 text-red-600" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">
            Central de Apresentações Executivas
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Selecione um cliente para gerar automaticamente uma apresentação de impacto. 
            O design é adaptado à identidade corporativa.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hasCurrentResult && (
          <div 
            onClick={handleUseCurrent}
            className="bg-red-900/10 border border-red-600/30 rounded-2xl p-6 cursor-pointer hover:bg-red-900/20 transition group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-red-600/20 rounded-xl">
                <Sparkles className="h-6 w-6 text-red-500" />
              </div>
              <span className="text-[10px] uppercase font-bold text-red-400 bg-red-950/40 px-2 py-1 rounded">Sessão Atual</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition">{currentBrandName}</h3>
            <p className="text-xs text-slate-400">Diagnóstico não salvo ou recém-criado</p>
            
            <div className="mt-6 flex justify-end">
              <span className="text-xs font-bold text-red-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Criar Apresentação <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        )}

        {history.map((item) => (
          <div 
            key={item.id}
            onClick={() => handleSelect(item)}
            className="bg-[#1e0505]/40 border border-red-950/40 rounded-2xl p-6 cursor-pointer hover:bg-[#1e0505] hover:border-slate-700 transition group"
          >
             <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-900 rounded-xl border border-red-950/40">
                <FileText className="h-6 w-6 text-slate-400" />
              </div>
              <span className="text-[10px] font-mono text-slate-500">{item.createdAt}</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition">{item.brandName || "Empresa Sem Nome"}</h3>
            <p className="text-xs text-slate-400">Score: {item.result.overallScore.toFixed(1)}/5.0</p>
            
            <div className="mt-6 flex justify-end">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform group-hover:text-red-500">
                Criar Apresentação <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
