import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini SDK with User-Agent telemetry headers in httpOptions.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Primary Business Strategy & Maturity Diagnostics API
app.post("/api/analyze", async (req, res) => {
  try {
    const { brandName, responses } = req.body;

    if (!responses || !Array.isArray(responses)) {
      res.status(400).json({ error: "Sua solicitação de análise precisa de respostas estruturadas." });
      return;
    }

    // Format the inputs for the model to parse.
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
Sua missão é realizar um diagnóstico implacavelmente realista das respostas fornecidas por uma empresa chamada "\${brandName || "Empresa-Alvo"}".

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
4. Plano de Ação Prático: Recomende os próximos passos respeitando a escada metodológica. (Ex: "Não execute mais tráfego, arrume os dados primeiro").
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
              description: "Média ponderada da maturidade comercial geral de 1.0 a 5.0.",
            },
            pillars: {
              type: Type.ARRAY,
              description: "Lista de diagnósticos para os 4 pilares: saber, ter, executar, performar.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "ID exato do pilar: 'saber', 'ter', 'executar', ou 'performar'" },
                  score: { type: Type.NUMBER, description: "Nota decimal de 1.0 a 5.0" },
                  diagnosis: { type: Type.STRING, description: "Qualitativa profunda comentando as respostas e a solidez das evidências apresentadas." },
                },
                required: ["id", "score", "diagnosis"],
              },
            },
            inconsistencies: {
              type: Type.ARRAY,
              description: "Contradições, falhas lógicas e distorções identificadas entre o que foi alegado e o que é provado.",
              items: {
                type: Type.OBJECT,
                properties: {
                  pillar1: { type: Type.STRING, description: "Pilar em contradição (Ex: potencializar)" },
                  pillar2: { type: Type.STRING, description: "Pilar que expõe a lacuna (Ex: saber)" },
                  title: { type: Type.STRING, description: "Título impactante da inconsistência" },
                  description: { type: Type.STRING, description: "Explicação lógica de como esta contradição fragiliza a saúde do negócio." },
                  criticality: { type: Type.STRING, description: "Grau de urgência: 'alta' | 'media' | 'baixa'" },
                },
                required: ["pillar1", "pillar2", "title", "description", "criticality"],
              },
            },
            risks: {
              type: Type.ARRAY,
              description: "Gargalos e riscos corporativos operacionais evidentes nas respostas.",
              items: {
                type: Type.OBJECT,
                properties: {
                  pillarId: { type: Type.STRING, description: "ID do pilar associado" },
                  title: { type: Type.STRING, description: "Nome do gargalo impeditivo" },
                  description: { type: Type.STRING, description: "Como isso limita o crescimento para o próximo patamar." },
                },
                required: ["pillarId", "title", "description"],
              },
            },
            suggestions: {
              type: Type.ARRAY,
              description: "Passos acionáveis rápidos focando principalmente nos pilares mais vulneráveis.",
              items: {
                type: Type.OBJECT,
                properties: {
                  pillarId: { type: Type.STRING, description: "ID do pilar associado" },
                  task: { type: Type.STRING, description: "Título da iniciativa prática imediata" },
                  priority: { type: Type.STRING, description: "Prioridade: 'alta' | 'media' | 'baixa'" },
                  immediateStep: { type: Type.STRING, description: "Ações concretas e específicas para executar já na próxima segunda-feira." },
                },
                required: ["pillarId", "task", "priority", "immediateStep"],
              },
            },
            strategicExecutiveSummary: {
              type: Type.STRING,
              description: "Parecer executivo global de viabilidade comercial e sobrevivência de mercado. Tom de voz objetivo, clínico e direto.",
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

// Consultative Business Strategy & Maturity Diagnostics API
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
            overallScore: {
              type: Type.NUMBER,
              description: "Média ponderada da maturidade comercial geral de 1.0 a 5.0.",
            },
            pillars: {
              type: Type.ARRAY,
              description: "Lista de diagnósticos para os 4 pilares: saber, ter, executar, performar.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "ID exato do pilar: 'saber', 'ter', 'executar', ou 'performar'" },
                  score: { type: Type.NUMBER, description: "Nota decimal de 1.0 a 5.0" },
                  diagnosis: { type: Type.STRING, description: "Qualitativa profunda comentando as respostas e a solidez das evidências apresentadas." },
                },
                required: ["id", "score", "diagnosis"],
              },
            },
            inconsistencies: {
              type: Type.ARRAY,
              description: "Contradições, falhas lógicas e distorções identificadas entre o que foi alegado e o que é provado.",
              items: {
                type: Type.OBJECT,
                properties: {
                  pillar1: { type: Type.STRING, description: "Pilar em contradição (Ex: executar)" },
                  pillar2: { type: Type.STRING, description: "Pilar que expõe a lacuna (Ex: saber)" },
                  title: { type: Type.STRING, description: "Título impactante da inconsistência" },
                  description: { type: Type.STRING, description: "Explicação lógica de como esta contradição fragiliza a saúde do negócio." },
                  criticality: { type: Type.STRING, description: "Grau de urgência: 'alta' | 'media' | 'baixa'" },
                },
                required: ["pillar1", "pillar2", "title", "description", "criticality"],
              },
            },
            risks: {
              type: Type.ARRAY,
              description: "Gargalos e riscos corporativos operacionais evidentes nas respostas.",
              items: {
                type: Type.OBJECT,
                properties: {
                  pillarId: { type: Type.STRING, description: "ID do pilar associado" },
                  title: { type: Type.STRING, description: "Nome do gargalo impeditivo" },
                  description: { type: Type.STRING, description: "Como isso limita o crescimento para o próximo patamar." },
                },
                required: ["pillarId", "title", "description"],
              },
            },
            suggestions: {
              type: Type.ARRAY,
              description: "Passos acionáveis rápidos focando principalmente nos pilares mais vulneráveis.",
              items: {
                type: Type.OBJECT,
                properties: {
                  pillarId: { type: Type.STRING, description: "ID do pilar associado" },
                  task: { type: Type.STRING, description: "Título da iniciativa prática imediata" },
                  priority: { type: Type.STRING, description: "Prioridade: 'alta' | 'media' | 'baixa'" },
                  immediateStep: { type: Type.STRING, description: "Ações concretas e específicas para executar já na próxima segunda-feira." },
                },
                required: ["pillarId", "task", "priority", "immediateStep"],
              },
            },
            strategicExecutiveSummary: {
              type: Type.STRING,
              description: "Parecer executivo global de viabilidade comercial e sobrevivência de mercado. Tom de voz objetivo, clínico e direto.",
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
      error: "Falha na análise da IA estrategista (bruta).",
      details: error.message,
    });
  }
});

// Configure Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MATURIDADE SERVIDOR] Aberto com sucesso em http://localhost:${PORT}`);
  });
}

startServer();
