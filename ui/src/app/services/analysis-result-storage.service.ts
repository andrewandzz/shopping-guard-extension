import { Injectable } from '@angular/core';
import { AnalysisResult } from '../models/analysis-result.model';

@Injectable({
  providedIn: 'root',
})
export class AnalysisResultStorageService {
  async getAnalysisResult(analysisKey: string): Promise<AnalysisResult | null> {
    if (!this.isChromeStorageAvailable()) {
      return null;
    }

    const items = await chrome.storage.local.get(analysisKey);

    return items[analysisKey] as AnalysisResult ?? null;
  }

  // TODO: check maybe not needed
  async saveAnalysisResult(analysisResult: AnalysisResult, analysisKey: string): Promise<void> {
    if (!this.isChromeStorageAvailable()) {
      return;
    }

    await chrome.storage.local.set({
      [analysisKey]: analysisResult,
    });
  }

  watchAnalysis(analysisKey: string, callback: (analysis: AnalysisResult | null) => void): () => void {
    if (!this.isChromeStorageAvailable()) {
      return () => { };
    }

    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string,
    ) => {
      if (areaName !== 'local') {
        return;
      }

      const change = changes[analysisKey];

      if (!change) {
        return;
      }

      callback((change.newValue as AnalysisResult | undefined) ?? null);
    };

    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }

  // async rerunAnalysis(): Promise<void> {
  //   if (!chrome?.runtime?.sendMessage) {
  //     return;
  //   }

  //   try {
  //     await chrome.runtime.sendMessage({
  //       type: 'RERUN_ANALYSIS', // TODO: add to background.ts
  //     });
  //   } catch {
  //     // Якщо background ще не має такого listener, просто ігноруємо помилку.
  //   }
  // }

  private isChromeStorageAvailable(): boolean {
    return typeof chrome !== 'undefined' && !!chrome.storage?.local;
  }
}