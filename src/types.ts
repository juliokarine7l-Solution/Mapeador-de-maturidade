export interface Pillar {
  id: string;
  name: string;
  tagline: string;
  question: string;
  description: string;
  placeholder: string;
  evidencePlaceholder: string;
  iconName: string;
}

export interface PillarFormulation {
  userAnswer: string;
  userEvidence: string;
}

export interface PillarScoreDiagnostic {
  id: string;
  score: number;
  diagnosis: string;
}

export interface InconsistencyReport {
  pillar1: string;
  pillar2: string;
  title: string;
  description: string;
  criticality: "alta" | "media" | "baixa";
}

export interface CorporateRisk {
  pillarId: string;
  title: string;
  description: string;
}

export interface PracticalAction {
  pillarId: string;
  task: string;
  priority: "alta" | "media" | "baixa";
  immediateStep: string;
}

export interface FullAnalysisResponse {
  overallScore: number;
  pillars: PillarScoreDiagnostic[];
  inconsistencies: InconsistencyReport[];
  risks: CorporateRisk[];
  suggestions: PracticalAction[];
  strategicExecutiveSummary: string;
}

export interface SavedAssessment {
  id: string;
  createdAt: string;
  brandName: string;
  responses: {
    [pillarId: string]: PillarFormulation;
  };
  result: FullAnalysisResponse;
}
