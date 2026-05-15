import { AnalysisCheck } from "./analysis-check.model";
import { AnalysisStatus } from "./analysis-status.model";
import { PageType } from "./page-type.model";
import { RiskLevel } from "./risk-level.model";

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