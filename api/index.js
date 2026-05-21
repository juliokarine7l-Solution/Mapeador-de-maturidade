import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Gemini SDK with User-Agent telemetry headers in httpOptions.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { brandName, responses } = req.body;

    if (!responses || !Array.isArray(responses)) {
      res.status(400).json({ error: "Sua solicitação de análise precisa de respostas estruturadas." });
      return;
    }

    const submissionText = responses
      .map(
        (r) => `
### PILAR: ${r.pilarName || r.pilarId.toUpperCase()}
- ID: ${r.pilarId}
- Pergunta: ${r.questionText}
- Resposta do Usuário: ${r.userAnswer || "Não respondida."}
- Evidência / Provas Fornecidas: ${r.userEvidence || "Sem evidências práticas."}
`
      )
      .join("\n\n");

    const systemInstruction = `
Você é um Consultor Especialista em Estratégia e Maturidade de Negócios B2B aplicando a Metodologia S.T.E.P (Saber, Ter, Executar, Performar) da V4 Company.
Sua missão é realizar um diagnóstico implacavelmente realista das respostas fornecidas por uma empresa chamada "${brandName || "Empresa-Alvo"}".

A metodologia S.T.E.P divide a maturidade em 4 níveis progressivos (e Risco Compartilhado):
1. **Saber (Fundacional)**: Foco em diagnóstico e métricas (CAC, LTV). Sem dados, não há o que executar.
2. **Ter (Emergente)**: Integração entre marketing e vendas para consolidar informações. Dados não podem ser fragmentados.
3. **Executar (Em Crescimento)**: Otimização do funil e expansão para novos canais de mídia, com testes recorrentes. O gargalo é a velocidade.
4. **Performar (Otimizando e Líder)**: Uso de inteligência avançada, métricas plenas e modelos preditivos baseados em LTV por canal.

CRITÉRIO CRÍTICO: DETECTAR INCONSISTÊNCIAS E CONTRADIÇÕES
Você deve atuar de forma rígida baseada em dados reais. Vender ou sugerir execução para o estágio errado é causa primária de "churn" e fracasso.
- Se o usuário tentar "Executar" sem "Saber" ou "Ter" (base de dados fragmentada), APONTE RISCO CRÍTICO. Escalar a desordem causa prejuízos.
- Não aceite respostas vagas ou "achismos".

ESTRUTURA DE AVALIAÇÃO:
1. Avaliação dos 4 Pilares: Saber, Ter, Executar, Performar. Dê nota de 1.0 a 5.0 para cada baseada nas métricas e fatos declarados (e não desejos futuros).
2. Inconsistências: Aponte as inconsistências entre os pilares (ex: deseja focar no LTV mas não centraliza a base no CRM).
3. Riscos e Gargalos: Aponte os bloqueios estruturais que forçam a empresa a não passar de estágio.
4. Plano de Ação Prático: Recomende os próximos passos respeitando a escada metodológica.
5. Resumo Executivo Global: Parecer executivo objetivo sobre a compatibilidade do discurso com a realidade, usando as premissas B2B S.T.E.P.

Importante: Retorne estritamente um JSON que se encaixe perfeitamente no schema de resposta solicitado.
`;

    const modelName = "gemini-3.5-flash";

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `
Analise a seguinte submissão usando o S.T.E.P. da V4 e forneça o parecer estratégico rigoroso:

EMPRESA: ${brandName || "Não informada"}

RESPOSTAS COLETADAS:
${submissionText}
`,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: {
              type: Type.NUMBER,
            },
            pillars: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  diagnosis: { type: Type.STRING },
                },
                required: ["id", "score", "diagnosis"],
              },
            },
            inconsistencies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pillar1: { type: Type.STRING },
                  pillar2: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  criticality: { type: Type.STRING },
                },
                required: ["pillar1", "pillar2", "title", "description", "criticality"],
              },
            },
            risks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pillarId: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ["pillarId", "title", "description"],
              },
            },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pillarId: { type: Type.STRING },
                  task: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  immediateStep: { type: Type.STRING },
                },
                required: ["pillarId", "task", "priority", "immediateStep"],
              },
            },
            strategicExecutiveSummary: {
              type: Type.STRING,
            },
          },
          required: ["overallScore", "pillars", "inconsistencies", "risks", "suggestions", "strategicExecutiveSummary"],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Erro no processamento da IA strategista:", error);
    res.status(500).json({
      error: "Falha na análise da IA estrategista. Verifique suas respostas e tente novamente.",
      details: error.message,
    });
  }
});

app.post("/api/analyze-raw", async (req, res) => {
  try {
    const { brandName, rawText } = req.body;

    if (!rawText) {
      res.status(400).json({ error: "Sua solicitação precisa de respostas." });
      return;
    }

    const systemInstruction = `
Você é um Consultor Especialista em Estratégia e Maturidade de Negócios B2B aplicando a Metodologia S.T.E.P (Saber, Ter, Executar, Performar) da V4 Company.
Sua missão é realizar um diagnóstico implacavelmente realista das respostas brutas enviadas pelo cliente "${brandName || "Empresa-Alvo"}".

A metodologia S.T.E.P divide a maturidade em 4 níveis progressivos (e Risco Compartilhado):
1. **Saber (Fundacional)**: Foco em diagnóstico e métricas (CAC, LTV). Sem dados, não há o que executar.
2. **Ter (Emergente)**: Integração entre marketing e vendas para consolidar informações. Dados não podem ser fragmentados.
3. **Executar (Em Crescimento)**: Otimização do funil e expansão para novos canais de mídia, com testes recorrentes. O gargalo é a velocidade.
4. **Performar (Otimizando e Líder)**: Uso de inteligência avançada, métricas plenas e modelos preditivos baseados em LTV por canal.

CRITÉRIO CRÍTICO: DETECTAR INCONSISTÊNCIAS E CONTRADIÇÕES
Você deve atuar de forma rígida baseada em dados reais. Vender ou sugerir execução para o estágio errado é causa primária de "churn" e fracasso.
- Se o usuário tentar "Executar" sem "Saber" ou "Ter" (base de dados fragmentada), APONTE RISCO CRÍTICO. Escalar a desordem causa prejuízos.
- Não aceite respostas vagas ou "achismos".

ESTRUTURA DE AVALIAÇÃO:
1. Avaliação dos 4 Pilares: Saber, Ter, Executar, Performar. Dê nota de 1.0 a 5.0 para cada baseada nas métricas e fatos declarados (e não desejos futuros).
2. Inconsistências: Aponte as inconsistências entre os pilares (ex: deseja focar no LTV mas não centraliza a base no CRM).
3. Riscos e Gargalos: Aponte os bloqueios estruturais que forçam a empresa a não passar de estágio.
4. Plano de Ação Prático: Recomende os próximos passos respeitando a escada metodológica.
5. Resumo Executivo Global: Parecer executivo objetivo sobre a compatibilidade do discurso com a realidade, usando as premissas B2B S.T.E.P.

Importante: Retorne estritamente um JSON que se encaixe perfeitamente no schema de resposta solicitado.
`;

    const modelName = "gemini-3.5-flash";

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `
Analise o texto a seguir (respostas enviadas pelo cliente) usando o S.T.E.P. da V4 e forneça o parecer estratégico rigoroso:

EMPRESA: ${brandName || "Não informada"}

TEXTO BRUTO DE RESPOSTAS:
${rawText}
`,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER },
            pillars: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  diagnosis: { type: Type.STRING },
                },
                required: ["id", "score", "diagnosis"],
              },
            },
            inconsistencies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pillar1: { type: Type.STRING },
                  pillar2: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  criticality: { type: Type.STRING },
                },
                required: ["pillar1", "pillar2", "title", "description", "criticality"],
              },
            },
            risks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pillarId: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ["pillarId", "title", "description"],
              },
            },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pillarId: { type: Type.STRING },
                  task: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  immediateStep: { type: Type.STRING },
                },
                required: ["pillarId", "task", "priority", "immediateStep"],
              },
            },
            strategicExecutiveSummary: { type: Type.STRING },
          },
          required: ["overallScore", "pillars", "inconsistencies", "risks", "suggestions", "strategicExecutiveSummary"],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Erro no processamento da IA strategista:", error);
    res.status(500).json({
      error: "Falha na análise da IA estrategista (bruta).",
      details: error.message,
    });
  }
});

export default app;
