import { PillarFormulation } from "./types";

interface Scenario {
  name: string;
  badge: "inconsistencia" | "alinhamento" | "desequilibrada";
  badgeText: string;
  brandName: string;
  description: string;
  responses: {
    [pillarId: string]: PillarFormulation;
  };
}

export const PREFILL_SCENARIOS: Scenario[] = [
  {
    name: "Empreendedor Empírico (Risco de Escala)",
    badge: "inconsistencia",
    badgeText: "Conflito de Maturidade",
    brandName: "Acme Tech",
    description: "Empresa que tenta executar táticas avançadas ou escalar investimentos sem o básico fundacional (sem clareza do CAC ou alinhamento comercial).",
    responses: {
      saber: {
        userAnswer: "Não usamos planilhas ou relatórios consolidados para medir conversões de ponta a ponta. Nosso foco total é vender. Monitoramos apenas a conta corrente no fim do mês para saber se empatamos ou lucramos.",
        userEvidence: "Sem relatórios, sem dados de CAC ou LTV documentados. Controle feito pelo fluxo de caixa."
      },
      ter: {
        userAnswer: "Temos um sistema ERP para faturar, mas a equipe de marketing trabalha baseada em formulários do Elementor, e as vendas ficam com os consultores via WhatsApp sem registro em CRM.",
        userEvidence: "Falta de CRM integrado. Dados fragmentados em caixas de email e anotações pessoais."
      },
      executar: {
        userAnswer: "Estamos investindo R$ 40 mil/mês em Meta Ads com foco em escala, testando diversas campanhas agressivas e querendo dobrar a equipe de vendas de imediato para triplicar o volume bruto.",
        userEvidence: "Gastos altos na plataforma de anúncios apontando apenas para links de WhatsApp genéricos."
      },
      performar: {
        userAnswer: "Aguardamos usar inteligência artificial para segmentar os melhores clientes e vender modelos preditivos assim que conseguirmos tempo corporativo, mas a atual urgência por caixa dita as regras.",
        userEvidence: "Aspirações desconectadas da realidade técnica da infraestrutura de vendas atual."
      }
    }
  },
  {
    name: "Operação Rumo à Liderança B2B",
    badge: "alinhamento",
    badgeText: "Sólido & Escalonável",
    brandName: "Vortex Solutions",
    description: "Corporação altamente fluida através do framework S.T.E.P: base sólida, integração plena, funil testado e inteligência preditiva acionável.",
    responses: {
      saber: {
        userAnswer: "Temos rastreabilidade completa. Acompanhamos semanalmente métricas de performance centralizadas como custo por lead, lead para oportunidade, CAC e LTV.",
        userEvidence: "CAC de R$ 90,00, ciclo de vendas de 24 dias, dados compilados em um dashboard Data Studio alimentado ativamente."
      },
      ter: {
        userAnswer: "Usamos o HubSpot CRM plenamente. Qualquer Lead do Meta ou Google cai automaticamente nele, o SDR qualifica por critérios objetivos no SLA definido com o time de Growth, avançando pipeline.",
        userEvidence: "SLA documentado; time de marketing possui visibilidade de todas as vendas e cancelamentos da plataforma HubSpot."
      },
      executar: {
        userAnswer: "Garantimos otimização semanal das taxas do funil focado onde há atrito. Realizamos testes ativos contínuos alterando ofertas de pouso e validando um novo canal (LinkedIn B2B) enquanto a base via Google PMax gera a tração estabilizada.",
        userEvidence: "Registro sistemático das variações de landing page e aumento de 15% nas conversões da etapa MQL para SQL neste mês."
      },
      performar: {
        userAnswer: "Já temos consolidação suficiente para adotar modelos avançados de risco compartilhado nos canais validados. Os dados nos mostram safras de clientes ideais e impulsionamos agressivamente via LTV preditivo.",
        userEvidence: "Relatório gerencial atestante de curva de retenção preditiva ativando campanhas baseadas no LTV estimado na coorte trimestral."
      }
    }
  },
  {
    name: "Crescimento Preso (Sem Execução)",
    badge: "desequilibrada",
    badgeText: "Imobilidade por Medo",
    brandName: "Alpha Soluções",
    description: "Empresa possui clareza e integração de dados, mas paralisa os investimentos por medo ou falta de táticas ativas no mercado.",
    responses: {
      saber: {
        userAnswer: "Até calculamos nosso custo hipotético. Nosso LTV de clientes antigos que vêm por indicação é gigante, a maioria fica por 5 anos retendo receita com sucesso excelente.",
        userEvidence: "Tabela em excel comprovando alto lifetime value e recorrência de pagamentos."
      },
      ter: {
        userAnswer: "Implantamos e atualizamos diariamente a RD Station conectada ao Pipedrive. Vemos perfeitamente todo Lead que entra e a velocidade na etapa.",
        userEvidence: "Apresenta dashboard consolidado em tempo real com métricas plenas."
      },
      executar: {
        userAnswer: "Temos receio de gastar dinheiro. Apoiamos-nos totalmente em boca a boca e orgânico passivo. Não rodamos testes a/b, não usamos mídia paga forte, aguardando 'o mercado melhorar'.",
        userEvidence: "Orçamento de R$ 0,00 alocado em testes, canais paralisados."
      },
      performar: {
        userAnswer: "Não consideramos expansões no LTV com clientes na base. A falta de novos fluxos de atração impede tração financeira para avanços.",
        userEvidence: "Métricas presas, modelo reativo de dependência."
      }
    }
  }
];
