import { AnalysisCheck } from "./analysis-check.model";
import { AnalysisStatus } from "./analysis-status.model";
import { PageType } from "./page-type.model";
import { RiskLevel } from "./risk-level.model";
import { RiskSignal } from "./risk-signal.model";

export interface AnalysisResult {
    status: AnalysisStatus;

    pageType: PageType;

    riskLevel?: RiskLevel;
    totalScore?: number;
    riskSignals: RiskSignal[];

    message?: string;
    analyzedAt?: string;

    url?: string;
    title?: string;

    domain?: string;
    detailsMessage?: string;
    pageTypeDescription?: string;
    checks?: AnalysisCheck[];
}