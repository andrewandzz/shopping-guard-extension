import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';

import { AnalysisResult } from './models/analysis-result.model';
import { AnalysisStatus } from './models/analysis-status.model';
import { Settings } from './models/settings.model';
// import { PageType } from './models/page-type.model';
// import { RiskLevel } from './models/risk-level.model';

import { AnalysisResultStorageService } from './services/analysis-result-storage.service';
import { SettingsService } from './services/settings.service';
import { SiteRulesService } from './services/site-rules.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CHECK_CONFIG, ICON_CONFIG, PAGE_TYPE_CONFIG, RISK_LEVEL_CONFIG } from './config/config';
import { MatIconModule } from '@angular/material/icon';

// type RiskTheme = 'high' | 'medium' | 'low' | 'neutral';

// interface RiskUiConfig {
//   title: string;
//   message: string;
//   theme: RiskTheme;
//   icon: 'warning' | 'check' | 'unknown';
// }

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  analysis: AnalysisResult | null = null;

  isLoading = true;
  isMenuOpen = false;
  isDetailsOpen = false;
  isSiteMarkedAsSafe = false;
  isSiteIgnored = false;
  isAboutOpen = false;

  settings: Settings = {
    showDetailsAutomatically: false,
  };

  private stopWatchingAnalysis?: () => void;

  constructor(
    private readonly analysisStorage: AnalysisResultStorageService,
    private readonly settingsService: SettingsService,
    private readonly siteRulesService: SiteRulesService,
    private readonly cdr: ChangeDetectorRef,
    private readonly sanitizer: DomSanitizer
  ) { }

  async ngOnInit(): Promise<void> {
    this.settings = await this.settingsService.getSettings();
    this.isDetailsOpen = this.settings.showDetailsAutomatically;

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.id) {
      this.analysis = this.createNotAnalyzedResult(tab);
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    const analysisKey = `analysis_${tab.id}`;
    const storedAnalysis = await this.analysisStorage.getAnalysisResult(analysisKey);

    this.analysis = storedAnalysis ?? this.createNotAnalyzedResult(tab);
    this.isLoading = false;

    this.stopWatchingAnalysis = this.analysisStorage.watchAnalysis(analysisKey, (analysis) => {
      this.analysis = analysis ?? this.createNotAnalyzedResult(tab);
      this.cdr.detectChanges();
    });

    if (this.analysis.domain !== null) {
      this.isSiteMarkedAsSafe = await this.siteRulesService.isSiteMarkedAsSafe(this.analysis.domain);
      this.isSiteIgnored = await this.siteRulesService.isSiteIgnored(this.analysis.domain);
    }

    this.cdr.detectChanges();

    Object.values(ICON_CONFIG).forEach(iconSrc => this.sanitizer.bypassSecurityTrustResourceUrl(iconSrc));
  }

  ngOnDestroy(): void {
    this.stopWatchingAnalysis?.();
  }

  get popupTheme(): string {
    if (this.isSiteIgnored) {
      return 'neutral';
    }

    if (this.isSiteMarkedAsSafe) {
      return 'safe';
    }

    if (this.analysis?.status === AnalysisStatus.ANALYZED) {
      switch (this.analysis?.riskLevel) {
        case 'high':
          return 'danger';
        case 'medium':
          return 'warning';
        case 'low':
          return 'safe';
      }
    }

    return 'neutral';
  }

  get logoSrc(): string {
    if (this.isSiteIgnored) {
      return ICON_CONFIG['neutral'];
    }

    if (this.isSiteMarkedAsSafe) {
      return ICON_CONFIG['safe'];
    }

    if (this.analysis?.status === AnalysisStatus.ANALYZED) {
      switch (this.analysis?.riskLevel) {
        case 'high':
          return ICON_CONFIG['danger'];
        case 'medium':
          return ICON_CONFIG['warning'];
        case 'low':
          return ICON_CONFIG['safe'];
      }
    }

    return ICON_CONFIG['neutral'];
  }

  get riskIcon(): string {
    switch (this.popupTheme) {
      case 'danger':
        return 'close';
      case 'warning':
        return 'exclamation';
      case 'safe':
        return 'check';
      case 'neutral':
        return 'check_indeterminate_small';
      default:
        return '';
    }
  }

  get riskLabel(): string {
    if (this.isSiteIgnored) {
      return 'Не проаналізовано';
    }

    if (this.isSiteMarkedAsSafe) {
      return 'Безпечно';
    }

    switch (this.analysis?.status) {
      case AnalysisStatus.NOT_ANALYZED:
      case AnalysisStatus.NOT_APPLICABLE:
        return 'Не проаналізовано';
      case AnalysisStatus.ANALYZING:
        return 'Аналізуємо';
      case AnalysisStatus.ERROR:
        return 'Помилка';
      case AnalysisStatus.ANALYZED:
        return RISK_LEVEL_CONFIG[this.analysis?.riskLevel!].label;
      default:
        return '-';
    }
  }

  get riskDescription(): string {
    if (this.isSiteIgnored) {
      return 'Сайт було виключено з аналізу.';
    }

    if (this.isSiteMarkedAsSafe) {
      return 'Сайт було позначено як безпечний.';
    }

    switch (this.analysis?.status) {
      case AnalysisStatus.NOT_ANALYZED:
        return 'Сайт не було проаналізовано.';
      case AnalysisStatus.ANALYZING:
        return 'Сторінка аналізується...';
      case AnalysisStatus.NOT_APPLICABLE:
        return `Сторінка не підлягає аналізу, оскільки це ${PAGE_TYPE_CONFIG[this.analysis?.pageType!].label}.`;
      case AnalysisStatus.ERROR:
        return 'Сталася помилка під час аналізу.'
      case AnalysisStatus.ANALYZED:
        return RISK_LEVEL_CONFIG[this.analysis?.riskLevel!].description;
      default:
        return '-';
    }
  }

  get pageTypeLabel(): string {
    if (!this.analysis?.pageType) {
      return 'Не визначено';
    }

    return PAGE_TYPE_CONFIG[this.analysis.pageType].label;
  }

  get riskScore(): string {
    if (this.analysis?.status !== AnalysisStatus.ANALYZED) {
      return '—';
    }

    if (this.analysis.totalScore == null) {
      return '—';
    }

    return String(this.analysis.totalScore);
  }

  get riskScoreLabel(): string {
    if (this.analysis?.status !== AnalysisStatus.ANALYZED || !this.analysis.riskLevel) {
      return 'Оцінка ризику відсутня';
    }

    return RISK_LEVEL_CONFIG[this.analysis.riskLevel].label;
  }

  get shouldShowSignals(): boolean {
    return this.failedChecks.length > 0;
  }

  get pageTypeDescription(): string {
    if (!this.analysis?.pageType) {
      return 'Тип сторінки не визначено, оскільки аналіз не виконувався.';
    }

    return PAGE_TYPE_CONFIG[this.analysis.pageType].description;
  }

  get checks(): { icon: string, label: string, value: string, status: 'passed' | 'failed', message: string }[] {
    if (!this.analysis || !this.analysis.checks) {
      return [];
    }

    return this.analysis.checks.map(check => ({
      icon: CHECK_CONFIG[check.id].icon,
      label: CHECK_CONFIG[check.id].label,
      value: CHECK_CONFIG[check.id].values[check.status],
      status: check.status,
      message: CHECK_CONFIG[check.id].message
    }));
  }

  get failedChecks(): { label: string, value: string, status: 'passed' | 'failed', message: string }[] {
    return this.checks.filter(check => check.status === 'failed');
  }

  get canUseSiteRules(): boolean {
    return !!this.analysis?.domain &&
      this.analysis.domain !== null &&
      this.analysis.domain !== 'chrome' &&
      this.analysis.domain !== 'about';
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  toggleDetails(): void {
    this.isDetailsOpen = !this.isDetailsOpen;
  }

  async rerunAnalysis(): Promise<void> {
    this.closeMenu();

    if (this.isSiteIgnored) {
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    // await this.analysisStorage.rerunAnalysis();

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.runtime.sendMessage(
      { action: "RUN_ANALYSIS", tabId: tab.id, tabUrl: tab.url });

    this.isLoading = false;
    this.cdr.detectChanges();
  }

  async toggleShowDetailsAutomatically(): Promise<void> {
    this.settings = {
      ...this.settings,
      showDetailsAutomatically: !this.settings.showDetailsAutomatically,
    };

    this.isDetailsOpen = this.settings.showDetailsAutomatically;

    await this.settingsService.saveSettings(this.settings);

    this.cdr.detectChanges();
  }

  async toggleMarkSiteAsSafe(): Promise<void> {
    if (!(await this.siteRulesService.isSiteMarkedAsSafe(this.analysis?.domain!))) {
      await this.siteRulesService.markSiteAsSafe(this.analysis?.domain!);

      if (!this.isSiteIgnored) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.runtime.sendMessage(
          { action: "UPDATE_EXTENSION_STATUS", tabId: tab.id, extensionStatus: 'safe' });
      }
    } else {
      await this.siteRulesService.unmarkSiteAsSafe(this.analysis?.domain!);

      // TODO: send message to update icon to original

      if (!this.isSiteIgnored) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        let status;

        if (this.analysis?.status === AnalysisStatus.ANALYZED) {
          switch (this.analysis?.riskLevel) {
            case 'high':
              status = 'danger';
              break;
            case 'medium':
              status = 'warning';
              break;
            case 'low':
              status = 'safe';
              break;
          }
        } else {
          status = 'neutral';
        }

        chrome.runtime.sendMessage(
          { action: "UPDATE_EXTENSION_STATUS", tabId: tab.id, extensionStatus: status });
      }
    }

    this.isSiteMarkedAsSafe = !this.isSiteMarkedAsSafe;

    this.cdr.detectChanges();
  }

  async toggleIgnoreSite(): Promise<void> {
    if (!(await this.siteRulesService.isSiteIgnored(this.analysis?.domain!))) {
      await this.siteRulesService.ignoreSite(this.analysis?.domain!);

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      chrome.runtime.sendMessage(
        { action: "UPDATE_EXTENSION_STATUS", tabId: tab.id, extensionStatus: 'neutral' });
    } else {
      await this.siteRulesService.unignoreSite(this.analysis?.domain!);

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      let status;

      if (this.isSiteMarkedAsSafe) {
        status = 'safe';
      } else if (this.analysis?.status === AnalysisStatus.ANALYZED) {
        switch (this.analysis?.riskLevel) {
          case 'high':
            status = 'danger';
            break;
          case 'medium':
            status = 'warning';
            break;
          case 'low':
            status = 'safe';
            break;
        }
      } else {
        status = 'neutral';
      }

      chrome.runtime.sendMessage(
        { action: "UPDATE_EXTENSION_STATUS", tabId: tab.id, extensionStatus: status });
    }

    this.isSiteIgnored = !this.isSiteIgnored;

    this.cdr.detectChanges();
  }

  reportFalsePositive(): void {
    this.closeMenu();

    // TODO: add report
    console.log('Report false positive');
  }

  openAbout(): void {
    this.closeMenu();
    this.isAboutOpen = true;
    this.cdr.detectChanges();
  }

  closeAbout(): void {
    this.isAboutOpen = false;
    this.cdr.detectChanges();
  }

  private createNotAnalyzedResult(tab?: chrome.tabs.Tab): AnalysisResult {
    return {
      status: AnalysisStatus.NOT_ANALYZED,
      domain: this.getDomainFromTab(tab) ?? 'Недоступно',
      checks: [],
      totalScore: 0,
    };
  }

  private getDomainFromTab(tab?: chrome.tabs.Tab): string | null {
    if (!tab?.url) {
      return null;
    }

    try {
      const url = new URL(tab.url);

      if (url.protocol === 'http:' || url.protocol === 'https:') {
        return url.hostname;
      }

      return url.protocol.replace(':', '');
    } catch {
      return null;
    }
  }
}