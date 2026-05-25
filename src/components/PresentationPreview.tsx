import React, { useState } from "react";
import { FullAnalysisResponse, PresentationData, SlideContent } from "../types";
import { ChevronLeft, ChevronRight, Download, FileText, Check, Edit2, Save, X, Code } from "lucide-react";
import pptxgen from "pptxgenjs";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface PresentationPreviewProps {
  brandName: string;
  result: FullAnalysisResponse;
}

export default function PresentationPreview({ brandName, result }: PresentationPreviewProps) {
  // Pseudo-random helper to generate stable gradients based on brandName
  const getDynamicStyles = (brand: string) => {
    let hash = 0;
    for (let i = 0; i < brand.length; i++) {
        hash = brand.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 40) % 360;
    
    return {
      background: `linear-gradient(135deg, hsl(${hue1}, 40%, 12%) 0%, hsl(${hue2}, 50%, 6%) 100%)`,
      primaryTheme: `hsl(${hue1}, 80%, 50%)`,
      accentTheme: `hsl(${hue2}, 70%, 60%)`,
      hexCode: `#${Math.floor(Math.abs(Math.sin(hash)) * 16777215).toString(16).padStart(6, '0')}` // Fallback hex for PPTX
    };
  };

  const theme = getDynamicStyles(brandName);

  // Map diagnostic data into slides
  const createInitialSlides = (): SlideContent[] => {
    const slides: SlideContent[] = [];

    // 1. Capa
    slides.push({
      id: "slide-1",
      type: "cover",
      title: "Diagnóstico de Maturidade Comercial S.T.E.P.",
      subtitle: brandName,
      visualNotes: "Logotipo da empresa e design corporativo limpo"
    });

    // 2. Resumo Executivo
    slides.push({
      id: "slide-2",
      type: "executive_summary",
      title: "Resumo Executivo",
      editableContent: result.strategicExecutiveSummary || "Sem parecer definido."
    });

    // 3. Diagnóstico Geral
    slides.push({
      id: "slide-3",
      type: "general_diagnostic",
      title: "Maturidade Global",
      metrics: [
        { label: "Maturidade (1-5)", value: result.overallScore.toFixed(1) }
      ],
      editableContent: result.overallScore >= 4.0 
        ? "Governança de metas e playbooks escaláveis." 
        : result.overallScore >= 2.5 
        ? "Faturamento volátil com gargalos de medição." 
        : "Operação em regime de alto risco."
    });

    // 4 to 7. Diagnóstico por pilar
    result.pillars.forEach((p, index) => {
      slides.push({
        id: "slide-" + (4 + index),
        type: "pillar_diagnostic",
        title: "Pilar: " + p.id.toUpperCase(),
        metrics: [{ label: "Nota do Pilar", value: p.score.toFixed(1) }],
        editableContent: p.diagnosis
      });
    });

    // 8. Dores e Gargalos
    if (result.risks && result.risks.length > 0) {
      slides.push({
        id: "slide-risks",
        type: "key_pains",
        title: "Principais Riscos Corporativos",
        keyPoints: result.risks.map(r => r.title + ": " + r.description)
      });
    }

    // 9. Inconsistências
    if (result.inconsistencies && result.inconsistencies.length > 0) {
      slides.push({
        id: "slide-inco",
        type: "inconsistencies",
        title: "Incoerências Lógicas Detectadas",
        keyPoints: result.inconsistencies.map(inc => "[" + inc.criticality.toUpperCase() + "] " + inc.title + ": " + inc.description)
      });
    }

    // 10. Recomendações e Plano de Ação
    if (result.suggestions && result.suggestions.length > 0) {
      slides.push({
        id: "slide-actions",
        type: "action_plan",
        title: "Plano de Ação e Sugestões Práticas",
        recommendations: result.suggestions.map(s => "[" + s.priority.toUpperCase() + "] " + s.task + ": " + s.immediateStep)
      });
    }

    // 11. Conclusão / Próximos Passos
    slides.push({
      id: "slide-end",
      type: "next_steps",
      title: "Próximos Passos",
      keyPoints: [
        "Aprovação do plano de ação.",
        "Alinhamento com diretoria e líderes de marketing/vendas.",
        "Kick-off de implementação dos ajustes imediatos."
      ]
    });

    return slides;
  };

  const [presentation, setPresentation] = useState<PresentationData>({
    title: "Diagnóstico S.T.E.P - " + brandName,
    subtitle: "Apresentação Executiva",
    audience: "Diretoria e C-Level",
    brandStyle: "B2B Corporativo Premium",
    slideCount: 0,
    slides: createInitialSlides()
  });

  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const currentSlide = presentation.slides[currentSlideIdx];

  const handleNext = () => {
    if (currentSlideIdx < presentation.slides.length - 1) setCurrentSlideIdx(prev => prev + 1);
  };
  const handlePrev = () => {
    if (currentSlideIdx > 0) setCurrentSlideIdx(prev => prev - 1);
  };

  const openEditor = () => {
    setEditContent(currentSlide.editableContent || currentSlide.keyPoints?.join("\n") || currentSlide.recommendations?.join("\n") || "");
    setIsEditing(true);
  };

  const saveEditor = () => {
    const updatedSlides = [...presentation.slides];
    const target = updatedSlides[currentSlideIdx];

    if (target.type === "executive_summary" || target.type === "general_diagnostic" || target.type === "pillar_diagnostic") {
      target.editableContent = editContent;
    } else if (target.type === "action_plan") {
      target.recommendations = editContent.split("\n").filter(l => l.trim() !== "");
    } else {
      target.keyPoints = editContent.split("\n").filter(l => l.trim() !== "");
    }

    setPresentation({ ...presentation, slides: updatedSlides });
    setIsEditing(false);
  };

  const exportPPTX = async () => {
    setIsExporting(true);
    try {
      const ppt = new pptxgen();
      ppt.layout = "LAYOUT_16x9";
      ppt.defineSlideMaster({
        title: "MASTER_B2B",
        background: { color: "11151D" },
        objects: [
          { line: { x: 0, y: 0.5, w: "100%", h: 0, line: { color: theme.hexCode.replace("#", ""), width: 2 } } }
        ]
      });

      presentation.slides.forEach(slide => {
        let slidePpt = ppt.addSlide({ masterName: "MASTER_B2B" });
        
        slidePpt.addText(slide.title, { x: 0.5, y: 0.8, w: "90%", h: 0.5, fontSize: 24, bold: true, color: "FFFFFF" });

        if (slide.subtitle) {
          slidePpt.addText(slide.subtitle, { x: 0.5, y: 1.5, w: "90%", h: 0.5, fontSize: 18, color: "94A3B8" });
        }

        let yPos = 2.0;

        if (slide.metrics) {
          slide.metrics.forEach(m => {
             slidePpt.addText(m.label + ": " + m.value, { x: 0.5, y: yPos, w: "20%", h: 0.5, fontSize: 16, color: theme.hexCode.replace("#", ""), bold: true });
             yPos += 0.8;
          });
        }

        if (slide.editableContent) {
          slidePpt.addText(slide.editableContent, { x: 0.5, y: yPos, w: "90%", h: 3, fontSize: 14, color: "E2E8F0", align: "justify" });
        } else if (slide.keyPoints) {
          const bullets = slide.keyPoints.map(k => ({ text: k, options: { bullet: true, color: "E2E8F0", fontSize: 14 } }));
          slidePpt.addText(bullets, { x: 0.5, y: yPos, w: "90%", h: 3 });
        } else if (slide.recommendations) {
          const bullets = slide.recommendations.map(k => ({ text: k, options: { bullet: true, color: "E2E8F0", fontSize: 14 } }));
          slidePpt.addText(bullets, { x: 0.5, y: yPos, w: "90%", h: 3 });
        }
      });

      await ppt.writeFile({ fileName: "Apresentacao_STEP_" + brandName + ".pptx" });
    } catch (err) {
      console.error(err);
    }
    setIsExporting(false);
  };

  const exportPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById("slide-preview-container");
      if (element) {
        const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#11151D" });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save("Slide_Atual_STEP_" + brandName + ".pdf");
      }
    } catch (err) {
      console.error(err);
    }
    setIsExporting(false);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(presentation, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#180303] border border-red-950/40 rounded-2xl p-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Apresentação Executiva Gerada
          </h2>
          <p className="text-xs text-slate-400">
            {presentation.slides.length} slides gerados focados na metodologia S.T.E.P
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <button onClick={exportPPTX} disabled={isExporting} className="px-4 py-2 bg-[#0e0000] border border-red-950/40 hover:bg-[#1a0505] text-white rounded-lg text-xs font-bold transition flex items-center gap-2 disabled:opacity-50">
            <FileText className="h-4 w-4" /> PPTX
          </button>
          <button onClick={exportPDF} disabled={isExporting} className="px-4 py-2 bg-[#0e0000] border border-red-950/40 hover:bg-[#1a0505] text-white rounded-lg text-xs font-bold transition flex items-center gap-2 disabled:opacity-50">
            <Download className="h-4 w-4" /> PDF Slide Atual
          </button>
          <button onClick={copyJson} className="px-4 py-2 bg-red-600/10 border border-red-600/30 hover:bg-red-600/20 text-red-500 rounded-lg text-xs font-bold transition flex items-center gap-2">
            {copiedJson ? <Check className="h-4 w-4" /> : <Code className="h-4 w-4" />} JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar thumbnails */}
        <div className="md:col-span-3 space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar hidden md:block">
          {presentation.slides.map((s, idx) => (
            <div 
              key={s.id} 
              onClick={() => setCurrentSlideIdx(idx)}
              className={"p-3 rounded-xl border transition-all cursor-pointer " + (currentSlideIdx === idx ? "bg-red-600/10 border-red-500 text-white" : "bg-slate-950 border-red-950/40 text-slate-400 hover:bg-slate-900")}
            >
              <p className="text-[10px] font-bold uppercase opacity-70 mb-1">Slide {idx + 1}</p>
              <p className="text-xs font-semibold truncate">{s.title}</p>
            </div>
          ))}
        </div>

        {/* Main Slide Viewer */}
        <div className="md:col-span-9 bg-[#11151D] border border-red-950/40 rounded-3xl p-4 flex flex-col relative min-h-[500px]">
          
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Preview • Slide {currentSlideIdx + 1} de {presentation.slides.length}
            </span>
            <button onClick={openEditor} className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded flex items-center gap-2 transition">
              <Edit2 className="h-3 w-3" /> Editar
            </button>
          </div>

          <div 
            id="slide-preview-container" 
            className="flex-1 border border-slate-800 rounded-2xl p-8 flex flex-col justify-center relative overflow-hidden aspect-[16/9] w-full max-w-[800px] mx-auto"
            style={{ background: theme.background }}
          >
             {/* Slide Top Border decoration */}
             <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: theme.primaryTheme }} />
             
             {/* Abstract background graphics */}
             <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full blur-[100px] opacity-20 pointer-events-none" style={{ backgroundColor: theme.accentTheme }} />
             
             <div className="relative z-10 w-full h-full flex flex-col justify-center">
               {currentSlide.type === "cover" ? (
                  <div className="text-center space-y-6">
                    <div 
                      className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border mb-4"
                      style={{ borderColor: theme.primaryTheme, color: theme.accentTheme, backgroundColor: `${theme.primaryTheme}20` }}
                    >
                      Apresentação Executiva
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">{currentSlide.title}</h1>
                    <h2 className="text-xl md:text-3xl font-semibold" style={{ color: theme.primaryTheme }}>{currentSlide.subtitle}</h2>
                  </div>
               ) : (
                  <div className="h-full flex flex-col w-full">
                    <h1 className="text-2xl md:text-3xl font-black text-white mb-6 border-b pb-4" style={{ borderColor: `${theme.primaryTheme}50` }}>{currentSlide.title}</h1>
                    
                    {currentSlide.metrics && currentSlide.metrics.length > 0 && (
                       <div className="mb-6 flex gap-4 w-full">
                          {currentSlide.metrics.map((m, i) => (
                             <div 
                               key={i} 
                               className="border rounded-xl p-4 flex-1 shadow-lg"
                               style={{ borderColor: `${theme.primaryTheme}40`, backgroundColor: `${theme.primaryTheme}10` }}
                             >
                               <div className="text-xs font-bold uppercase" style={{ color: theme.accentTheme }}>{m.label}</div>
                               <div className="text-3xl md:text-4xl font-black text-white mt-1">{m.value}</div>
                             </div>
                          ))}
                       </div>
                    )}

                    <div className="text-slate-200 xl:text-lg leading-relaxed flex-1 overflow-auto w-full custom-scrollbar pr-4">
                      {currentSlide.editableContent && (
                        <p className="whitespace-pre-wrap font-medium">{currentSlide.editableContent}</p>
                      )}
                      {currentSlide.keyPoints && (
                        <ul className="space-y-4">
                          {currentSlide.keyPoints.map((k, i) => (
                             <li key={i} className="flex gap-4 items-start">
                               <span className="font-bold text-xl leading-none mt-1" style={{ color: theme.primaryTheme }}>•</span>
                               <span>{k}</span>
                             </li>
                          ))}
                        </ul>
                      )}
                      {currentSlide.recommendations && (
                        <ul className="space-y-4">
                          {currentSlide.recommendations.map((k, i) => (
                             <li key={i} className="flex gap-4 items-start">
                               <span className="font-bold text-xl leading-none mt-1" style={{ color: theme.accentTheme }}>→</span>
                               <span>{k}</span>
                             </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
               )}
             </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-4">
            <button onClick={handlePrev} disabled={currentSlideIdx === 0} className="px-4 py-2 bg-slate-900 text-slate-300 rounded flex gap-2 disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" /> Anterior
            </button>
            <button onClick={handleNext} disabled={currentSlideIdx === presentation.slides.length - 1} className="px-4 py-2 bg-red-700 text-white font-bold rounded flex gap-2 disabled:opacity-30">
              Próximo <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#180303] border border-red-950/40 rounded-2xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-red-950/40">
              <h3 className="text-white font-bold">Editar Slide: {currentSlide.title}</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-xs text-slate-400 mb-2">Para listas, digite um item por linha.</p>
            <textarea 
              className="w-full h-64 bg-[#0f111a] border border-slate-800 rounded-xl p-4 text-sm text-slate-200 outline-none focus:border-red-600 transition"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsEditing(false)} className="px-5 py-2 text-slate-300 text-sm font-bold hover:text-white">Cancelar</button>
              <button onClick={saveEditor} className="px-5 py-2 bg-red-700 text-white text-sm font-bold rounded-lg flex items-center gap-2">
                <Save className="h-4 w-4" /> Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
