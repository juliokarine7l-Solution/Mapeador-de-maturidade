import React, { useState } from "react";
import { Send, Check, Copy, Mail, ExternalLink, RefreshCw } from "lucide-react";
import { FullAnalysisResponse } from "../types";
import DiagnosticResult from "./DiagnosticResult";

interface ConsultativeFlowProps {
  onAddHistory: (item: any) => void;
}

export default function ConsultativeFlow({ onAddHistory }: ConsultativeFlowProps) {
  const [brandName, setBrandName] = useState("");
  const [rawText, setRawText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FullAnalysisResponse | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const emailSubject = `Diagnóstico de Maturidade S.T.E.P - ${brandName}`;
  const emailBody = `Olá,

Para que possamos realizar um diagnóstico de maturidade comercial preciso, por favor, responda às perguntas abaixo com o máximo de detalhes e evidências operacionais possíveis.

1. Saber (Fundacional)
Sabe quanto custa adquirir um cliente? Descreva sua atual capacidade de diagnóstico e mensuração de resultados. Cite métricas primárias (CAC, LTV).

2. Ter (Emergente)
Marketing e vendas usam a mesma base de dados? Como estão estruturadas as informações e integração entre as pontas hoje? Cite qual CRM utiliza.

3. Executar (Crescimento)
O funil está mapeado com testes recorrentes? Quais são as alavancas e expansões de mídia que estão sendo exploradas?

4. Performar (Otimização e Liderança)
Sabe o LTV por canal e o custo por ponto de conversão? Qual inteligência avançada de dados ou previsão guiam suas decisões comerciais?

Aguardamos suas respostas respondendo a este e-mail (juliokarine7l@gmail.com).`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(`Assunto: ${emailSubject}\n\n${emailBody}`);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmit = async () => {
    if (!rawText.trim()) {
      setError("Por favor, cole as respostas do cliente antes de gerar o diagnóstico.");
      return;
    }
    
    setError(null);
    setIsLoading(true);

    try {
      const apiResponse = await fetch("/api/analyze-raw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          rawText
        })
      });

      if (!apiResponse.ok) {
        const errText = await apiResponse.text();
        throw new Error(errText || "Falha na resposta do servidor.");
      }

      const parsedResult: FullAnalysisResponse = await apiResponse.json();
      setResult(parsedResult);

      const newAssessment = {
        id: Math.random().toString(36).substring(2, 9),
        brandName: brandName || "Empresa-Alvo",
        createdAt: new Date().toLocaleDateString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit"
        }),
        responses: {}, // No mapped responses for raw texts
        result: parsedResult
      };

      onAddHistory(newAssessment);
      
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Algo saiu errado durante a análise do Gemini.");
    } finally {
      setIsLoading(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-[#1e0505]/50 p-4 rounded-2xl border border-red-950/40">
          <span className="text-xs text-slate-400">
            Visualizando resultado consultivo para: <strong className="text-white font-semibold">{brandName || "Empresa-Alvo"}</strong>
          </span>
          <button 
            onClick={() => setResult(null)}
            className="text-xs text-red-500 hover:text-red-400 font-bold flex items-center gap-1 bg-[#1e0505] border border-red-950/40 py-1.5 px-3 rounded-xl transition hover:border-red-900 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Fazer Novo Diagnóstico
          </button>
        </div>
        
        <DiagnosticResult 
          brandName={brandName || "Empresa-Alvo"}
          result={result}
          onRestart={() => setResult(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Header/Info */}
      <div className="bg-[#180303] border border-red-950/40 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-black text-white tracking-tight mb-2">
          Fluxo de Envio e Diagnóstico Consultivo
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          Use este módulo para gerar um formulário base e enviar ativamente aos seus clientes ou prospects.
          Cole as respostas que receber para que o sistema gere a auditoria implacável S.T.E.P automaticamente.
        </p>

        {/* 2. Client Info & Email Generator */}
        <div className="bg-[#1e0505] border border-red-950/40 rounded-xl p-5 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-mono mb-2">
              Nome do Cliente / Empresa
            </label>
            <input
              type="text"
              className="w-full md:w-1/2 bg-slate-950 border border-red-950/40 text-white rounded-xl py-2.5 px-4 text-sm focus:border-red-600 outline-none transition-all"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Ex: TechCorp"
            />
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopyEmail}
              className="px-4 py-2 bg-red-950/30 hover:bg-red-900/40 text-red-400 border border-red-900/50 rounded-lg text-xs font-bold flex items-center gap-2 transition"
            >
              {copiedEmail ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedEmail ? "E-mail Copiado!" : "Copiar Corpo do E-mail"}
            </button>
            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&authuser=${encodeURIComponent('juliokarine7l@gmail.com')}&to=&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-[#0e0000] hover:bg-[#1a0505] text-slate-300 border border-red-950/40 rounded-lg text-xs font-bold flex items-center gap-2 transition"
            >
              <Mail className="h-4 w-4" />
              Abrir no cliente de E-mail
              <ExternalLink className="h-3 w-3 ml-1 opacity-50" />
            </a>
          </div>
        </div>
      </div>

      {/* 3. Answers Input Area */}
      <div className="bg-[#180303] border border-red-950/40 rounded-2xl p-6 md:p-8">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-mono mb-3">
          Respostas do Cliente
        </label>
        <p className="text-[11px] text-slate-500 mb-3">
          Cole abaixo as respostas brutas recebidas pelo e-mail ou WhatsApp. O sistema processará tudo integralmente.
        </p>
        <textarea
          className="w-full h-64 bg-slate-950 border border-red-950/40 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-700 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all resize-y"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Cole todo o texto recebido aqui..."
        />

        {error && (
          <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-8 py-4 bg-red-700 hover:bg-red-600 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg active:scale-98 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:active:scale-100"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isLoading ? "Auditoria em Andamento..." : "Gerar Diagnóstico Implacável"}
          </button>
        </div>
      </div>
    </div>
  );
}
