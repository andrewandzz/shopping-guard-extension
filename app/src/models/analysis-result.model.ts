import { AnalysisCheck } from "./analysis-check.model";
import { AnalysisStatus } from "./analysis-status.model";
import { PageType } from "./page-type.model";
import { RiskLevel } from "./risk-level.model";

export interface AnalysisResult {
    status: AnalysisStatus;
    // url: string;
    domain: string;
    pageType?: PageType;
    checks?: AnalysisCheck[];
    riskLevel?: RiskLevel;
    totalScore?: number;
    analyzedAt?: string;
}