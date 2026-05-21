import { Pillar } from "./types";

export const PILLARS_DATA: Pillar[] = [
  {
    id: "saber",
    name: "Saber",
    tagline: "Fundacional: Diagnóstico & Métricas",
    question: "Sabe quanto custa adquirir um cliente? Descreva sua atual capacidade de diagnóstico e mensuração de resultados no marketing e vendas.",
    description: "Sem dados, não há o que executar. Foque em métricas primárias (CAC, LTV) e na clareza do custo de aquisição do cliente.",
    placeholder: "Ex: Medimos o investimento total dividido pelas vendas realizadas no final do mês. Ainda não temos clareza do custo por canal específico...",
    evidencePlaceholder: "Evidência / Métricas: Cite quais métricas de resultado são atualmente acompanhadas, se houver.",
    iconName: "BarChart3"
  },
  {
    id: "ter",
    name: "Ter",
    tagline: "Emergente: Integração & Consolidação",
    question: "Marketing e vendas usam a mesma base de dados? Como estão estruturadas as informações e integração entre as pontas hoje?",
    description: "Para sair da fragmentação de dados, é preciso consolidar a infraestrutura e garantir alinhamento entre as vendas e os esforços de marketing.",
    placeholder: "Ex: Temos um CRM para os vendedores, mas o time de marketing não acompanha as etapas de conversão e perda em tempo real...",
    evidencePlaceholder: "Evidência / CRM & Base de Dados: Descreva qual CRM utiliza (se houver) e se marketing e vendas têm o mesmo SLA e acompanhamento de funil.",
    iconName: "Activity"
  },
  {
    id: "executar",
    name: "Executar",
    tagline: "Crescimento: Otimização & Expansão de Canais",
    question: "O funil está mapeado com testes recorrentes? Quais são as alavancas e expansões de mídia que estão sendo exploradas para destrancar a velocidade?",
    description: "O gargalo nesta etapa é a velocidade e a otimização de furos no funil. Como estão expandindo novos canais ou estruturando playbooks para ganho orgânico e pago?",
    placeholder: "Ex: Validamos uma oferta principal no Meta, agora estamos testando prospecção fria e organizando um modelo de Inside Sales para escalar as ligações...",
    evidencePlaceholder: "Evidência / Playbook & Teste: Cite quais canais de mídia operam hoje, testes em andamento ou melhorias nas taxas do funil.",
    iconName: "TrendingUp"
  },
  {
    id: "performar",
    name: "Performar",
    tagline: "Otimização: Modelos Preditivos & Risco Compartilhado",
    question: "Sabe o LTV por canal e o custo por ponto de conversão? Qual inteligência avançada de dados ou previsão guiam suas decisões comerciais?",
    description: "Neste estágio, as métricas financeiras estão plenas. Dados viram ativos proprietários capazes de guiar modelos preditivos.",
    placeholder: "Ex: Todas as decisões comerciais cruzam dados de CAC unitário por canal versus LTV estimado de cada safra no Data Studio...",
    evidencePlaceholder: "Evidência / BI & Modelagem: Comprove o monitoramento integrado de CAC x LTV profundo, modelagem estatística aplicada, ou ferramentas de Business Intelligence da Cia.",
    iconName: "Zap"
  }
];
