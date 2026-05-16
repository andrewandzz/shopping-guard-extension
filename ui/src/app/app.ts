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
  imports: [CommonModule],
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

    //     if (!tab) return;

    const analysisKey = `analysis_${tab.id}`;

    this.analysis = await this.analysisStorage.getAnalysisResult(analysisKey);

    console.log(this.analysis);

    this.isLoading = false;

    this.stopWatchingAnalysis = this.analysisStorage.watchAnalysis(analysisKey,
      (analysis) => {
        this.analysis = analysis;
        this.cdr.detectChanges();
      });

    // this.cdr.detectChanges();

    this.isSiteMarkedAsSafe = await this.siteRulesService.isSiteMarkedAsSafe(this.analysis?.domain!);
    this.isSiteIgnored = await this.siteRulesService.isSiteIgnored(this.analysis?.domain!);

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

  // get riskUi(): RiskUiConfig {
  //   if (!this.analysis) {
  //     return {
  //       title: 'Не проаналізовано',
  //       message: 'Ми ще не перевірили цей сайт. Даних недостатньо для оцінки.',
  //       theme: 'neutral',
  //       icon: 'unknown',
  //     };
  //   }

  //   if (
  //     this.analysis.status === AnalysisStatus.NOT_ANALYZED ||
  //     this.analysis.status === AnalysisStatus.NOT_APPLICABLE
  //   ) {
  //     return {
  //       title: 'Не проаналізовано',
  //       message: 'Ми ще не перевірили цей сайт. Даних недостатньо для оцінки.',
  //       theme: 'neutral',
  //       icon: 'unknown',
  //     };
  //   }

  //   if (this.analysis.status === AnalysisStatus.ERROR) {
  //     return {
  //       title: 'Помилка аналізу',
  //       message:

  //         'Не вдалося виконати перевірку сторінки.',
  //       theme: 'neutral',
  //       icon: 'unknown',
  //     };
  //   }

  //   switch (this.analysis.riskLevel) {
  //     case RiskLevel.HIGH:
  //       return {
  //         title: 'Високий ризик',
  //         message:
  //           'Виявлено кілька підозрілих ознак на цьому сайті.',
  //         theme: 'high',
  //         icon: 'warning',
  //       };

  //     case RiskLevel.MEDIUM:
  //       return {
  //         title: 'Середній ризик',
  //         message:

  //           'Виявлено деякі ознаки, що можуть свідчити про ризики.',
  //         theme: 'medium',
  //         icon: 'warning',
  //       };

  //     case RiskLevel.LOW:
  //       return {
  //         title: 'Низький ризик',
  //         message:
  //           'Сайт виглядає безпечно. Підозрілих ознак не виявлено.',
  //         theme: 'low',
  //         icon: 'check',
  //       };

  //     default:
  //       return {
  //         title: 'Не проаналізовано',
  //         message: 'Даних недостатньо для оцінки.',
  //         theme: 'neutral',
  //         icon: 'unknown',
  //       };
  //   }
  // }

  // get risk(): { label: string, description: string, theme: string, icon: string } {
  //   if (this.analysis?.status !== AnalysisStatus.ANALYZED) {
  //     return {
  //       label: 'Не проаналізовано',
  //       description: 'Ми ще не перевірили цей сайт.',
  //       theme: 'neutral',
  //       icon: 'icons/icon-grey.svg',
  //     }
  //   }

  //   return {
  //     label: RISK_LEVEL_CONFIG[this.analysis?.riskLevel!].label,
  //     description: RISK_LEVEL_CONFIG[this.analysis?.riskLevel!].description,
  //     theme: RISK_LEVEL_CONFIG[this.analysis?.riskLevel!].theme,
  //     icon: RISK_LEVEL_CONFIG[this.analysis?.riskLevel!].icon
  //   }
  // }

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
        return 'Сайт було виключено з аналізу.';
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
    return PAGE_TYPE_CONFIG[this.analysis?.pageType!].label;
  }

  get riskScore(): string {
    if (!this.analysis || this.analysis.totalScore == null) {
      return '—';
    }

    return String(this.analysis.totalScore);
  }

  get riskScoreLabel(): string {
    if (!this.analysis || this.analysis.riskLevel == null) {
      return '';
    }

    return RISK_LEVEL_CONFIG[this.analysis.riskLevel].label;
  }

  // get currentUrlPattern(): string {
  //   if (!this.analysis?.url) {
  //     return '*';
  //   }

  //   try {
  //     const url = new URL(this.analysis.url);
  //     return url.hostname;
  //   } catch {
  //     return this.analysis.url;
  //   }
  // }

  get shouldShowSignals(): boolean {
    return this.failedChecks.length > 0;
  }

  // get detailsText(): string {
  //   if (!this.analysis) {
  //     return 'Результат аналізу відсутній.';
  //   }

  //   const parts: string[] = [];

  //   if (this.analysis.url) {
  //     parts.push(`Сторінка: ${this.analysis.url}`);
  //   }

  //   if (this.analysis.analyzedAt) {
  //     parts.push(`Дата аналізу: ${new Date(this.analysis.analyzedAt).toLocaleString()}`);
  //   }

  //   if (this.analysis.riskSignals.length > 0) {
  //     const signals = this.analysis.riskSignals
  //       .map((signal) => `• ${signal.message} (${signal.score})`)
  //       .join('\n');

  //     parts.push(`Виявлені ознаки:\n${signals}`);
  //   }

  //   return parts.join('\n\n') || 'Детальна інформація відсутня.';
  // }

  get pageTypeDescription(): string {
    return PAGE_TYPE_CONFIG[this.analysis?.pageType!].description;
  }

  get checks(): { label: string, value: string, status: 'passed' | 'failed', message: string }[] {
    if (!this.analysis || !this.analysis.checks) {
      return [];
    }

    return this.analysis.checks.map(check => ({
      label: CHECK_CONFIG[check.id].label,
      value: CHECK_CONFIG[check.id].values[check.status],
      status: check.status,
      message: CHECK_CONFIG[check.id].message
    }));
  }

  get failedChecks(): { label: string, value: string, status: 'passed' | 'failed', message: string }[] {
    return this.checks.filter(check => check.status === 'failed');
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

    // TODO: add about
    console.log('Open about extension');
  }
}