import { AnalysisCheck } from "./analysis-check.model";
import { AnalysisStatus } from "./analysis-status.model";
import { PageType } from "./page-type.model";

export type RiskLevel =
    | 'low'
    | 'medium'
    | 'high';

export interface AnalysisResult {
    status: AnalysisStatus;
    pageType: PageType;
    url: string;
    domain: string;
    checks: AnalysisCheck[];
    riskLevel?: RiskLevel;
    totalScore?: number;
    analyzedAt?: string;
}