import { PageType } from "./page-type.model";
import { RiskLevel } from "./risk-level.model";
import { RiskSignal } from "./risk-signal.model";

export interface AnalysisResult {
    riskLevel: RiskLevel;
    totalScore: number;
    riskSignals: RiskSignal[];
    pageType: PageType;
    message?: string;
    analyzedAt: string;
}