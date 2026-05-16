import { AnalysisCheck } from "./analysis-check.model";
import { AnalysisStatus } from "./analysis-status.model";
import { PageType } from "./page-type.model";

export type RiskLevel =
    | 'low'
    | 'medium'
    | 'high';

export interface AnalysisResult {
    status: AnalysisStatus;
    domain: string;
    // url: string;
    pageType?: PageType;
    checks?: AnalysisCheck[];
    riskLevel?: RiskLevel;
    totalScore?: number;
    analyzedAt?: string;
}