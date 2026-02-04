// Risk level classifications
export type RiskLevel = 'Low' | 'Moderate' | 'Elevated' | 'High' | 'Severe';

// Trend directions
export type Trend = 'increasing' | 'stable' | 'decreasing';

// Domain identifiers
export type DomainId = 'rule-of-law' | 'operating-economic' | 'societal-institutional';

// Rubric scoring tiers
export interface Rubric {
  '1-2': string;
  '3-4': string;
  '5-6': string;
  '7-8': string;
  '9-10': string;
}

// Category metadata (static)
export interface Category {
  id: string;
  name: string;
  domain: DomainId;
  domainName: string;
  description: string;
  rubric: Rubric;
}

// Categories data file structure
export interface CategoriesData {
  categories: Category[];
}

// Individual category score
export interface CategoryScore {
  score: number;
  trend: Trend;
  keyFindings: string[];
  sources?: string[];
  lastUpdated: string;
}

// Domain scores mapping
export interface DomainScores {
  'rule-of-law': number;
  'operating-economic': number;
  'societal-institutional': number;
}

// Current assessment data structure
export interface CurrentAssessment {
  assessmentDate: string;
  assessmentPeriod: string;
  scores: Record<string, CategoryScore>;
  domainScores: DomainScores;
  overallScore: number;
  riskLevel: RiskLevel;
}

// Historical data point for a single category
export interface HistoricalDataPoint {
  date: string;
  score: number;
  riskLevel: RiskLevel;
}

// Historical snapshot (stored per date)
export interface HistoricalSnapshot {
  date: string;
  scores: Record<string, number>;
  domainScores: DomainScores;
  overallScore: number;
  riskLevel: RiskLevel;
}

// Chart data point for Recharts
export interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

// Domain display info
export interface DomainInfo {
  id: DomainId;
  name: string;
  categories: string[];
}

// State-level risk data
export interface StateRiskData {
  stateCode: string;
  stateName: string;
  overallRisk: number;
  trend: Trend;
  categories: Record<string, number>;
  keyFactors: string[];
}

// States data file structure
export interface StatesData {
  states: StateRiskData[];
}

// Historical category change with rationale
export interface CategoryChange {
  category: string;
  from: number;
  to: number;
  rationale: string;
}

// Historical period change data
export interface HistoricalPeriodChange {
  period: string;
  date: string;
  overallScore: number;
  overallChange: number | null;
  summary: string;
  keyDevelopments: string[];
  categoryChanges: CategoryChange[];
}

// Historical changes data file structure
export interface HistoricalChangesData {
  changes: HistoricalPeriodChange[];
}

// Scenario modeling types
export type Likelihood = 'low' | 'moderate' | 'high';

export interface ScenarioImpact {
  category: string;
  delta: number;
  reason: string;
}

export interface ScenarioEvent {
  id: string;
  label: string;
  category: string;
  domain: DomainId;
  likelihood: Likelihood;
  impacts: ScenarioImpact[];
}

export interface ScenariosData {
  events: ScenarioEvent[];
  likelihoodDescriptions: Record<Likelihood, string>;
}

// Economic indicators types
export interface IndicatorSensitivity {
  weight: number;
  description: string;
}

export interface RiskThreshold {
  max: number;
  impact: string;
  color: string;
}

export interface IndicatorCurrentData {
  value: number;
  asOf: string;
  source: string;
  context: string;
  priorYearValue: number;
  priorYearDate: string;
  yearOverYearChange: number;
}

export interface ScoreDefinition {
  name: string;
  definition: string;
  interpretation: string;
}

export interface EconomicIndicator {
  id: string;
  name: string;
  category: 'market' | 'economic';
  unit: string;
  description: string;
  currentData: IndicatorCurrentData;
  sensitivity: Record<string, IndicatorSensitivity>;
  riskThresholds: {
    low: RiskThreshold;
    moderate: RiskThreshold;
    high: RiskThreshold;
    severe: RiskThreshold;
  };
}

export interface EconomicIndicatorsData {
  lastUpdated: string;
  scoreDefinitions: {
    marketImpactScore: ScoreDefinition;
    economicImpactScore: ScoreDefinition;
  };
  indicators: EconomicIndicator[];
  categoryDescriptions: Record<string, string>;
}

// Actions & Pushback types

export type ActionType = 'executive-order' | 'presidential-memo' | 'agency-rule' | 'policy-directive' | 'proclamation' | 'signing-statement';

export type ActionStatus = 'implemented' | 'partially-implemented' | 'blocked' | 'reversed' | 'pending-litigation' | 'under-review';

export type CaseStatus = 'filed' | 'preliminary-injunction' | 'injunction-granted' | 'injunction-denied' | 'ruling-against' | 'ruling-for' | 'appealed' | 'settled' | 'dismissed';

export type PushbackType = 'federal-lawsuit' | 'state-lawsuit' | 'congressional-action' | 'state-legislation' | 'agency-resistance' | 'judicial-ruling' | 'public-protest';

export type ActionCategory = 'immigration' | 'environment' | 'civil-rights' | 'government-reform' | 'economic-policy' | 'judiciary' | 'healthcare' | 'education' | 'foreign-policy' | 'media-press';

export interface Action {
  id: string;
  title: string;
  type: ActionType;
  category: ActionCategory;
  status: ActionStatus;
  description: string;
  dateIssued: string;
  agencies: string[];
  pushbackIds: string[];
  relatedRiskCategories: string[];
  sources: string[];
}

export interface Pushback {
  id: string;
  title: string;
  type: PushbackType;
  caseStatus: CaseStatus;
  description: string;
  dateFiled: string;
  court?: string;
  plaintiffs: string[];
  actionIds: string[];
  outcome?: string;
  sources: string[];
}

export interface ActionCategorySummary {
  category: ActionCategory;
  totalActions: number;
  blocked: number;
  implemented: number;
  pendingLitigation: number;
  legalChallenges: number;
}

export interface ActionsPushbackSummary {
  totalActions: number;
  totalLegalChallenges: number;
  blockedOrReversed: number;
  implementationRate: number;
  categorySummaries: ActionCategorySummary[];
}

export interface ActionsPushbackData {
  lastUpdated: string;
  summary: ActionsPushbackSummary;
  actions: Action[];
  pushback: Pushback[];
}

export interface WeekTimelineEntry {
  weekOf: string;
  weekLabel: string;
  actions: {
    id: string;
    title: string;
    type: ActionType;
    category: ActionCategory;
    status: ActionStatus;
  }[];
  pushback: {
    id: string;
    title: string;
    type: PushbackType;
    caseStatus: CaseStatus;
    relatedActionId: string;
  }[];
  summary: string;
}

export interface ActionsTimelineData {
  lastUpdated: string;
  weeks: WeekTimelineEntry[];
}
