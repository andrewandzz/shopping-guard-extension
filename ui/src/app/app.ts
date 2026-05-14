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
import { PageType } from './models/page-type.model';
import { RiskLevel } from './models/risk-level.model';

import { AnalysisResultStorageService } from './services/analysis-result-storage.service';
import { SettingsService } from './services/settings.service';
import { SiteRulesService } from './services/site-rules.service';
import { DomSanitizer } from '@angular/platform-browser';

type RiskTheme = 'high' | 'medium' | 'low' | 'neutral';

interface RiskUiConfig {
  title: string;
  message: string;
  theme: RiskTheme;
  icon: 'warning' | 'check' | 'unknown';
}

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

  settings: Settings = {
    showDetailsAutomatically: false,
  };

  // private stopWatchingAnalysis?: () => void;

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
    this.isLoading = false;

    // this.stopWatchingAnalysis = this.analysisStorage.watchAnalysis((analysis) => {
    //   this.analysis = analysis;
    //   this.cdr.detectChanges();
    // });

    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    //   this.stopWatchingAnalysis?.();
  }

  get logoSrc(): string {
    switch (this.riskUi.theme) {
      case 'high':
        this.sanitizer.bypassSecurityTrustResourceUrl('icons/icon-red.svg');
        return 'icons/icon-red.svg';

      case 'medium':
        this.sanitizer.bypassSecurityTrustResourceUrl('icons/icon-amber.svg');
        return 'icons/icon-amber.svg';

      case 'low':
        this.sanitizer.bypassSecurityTrustResourceUrl('icons/icon-green.svg');
        return 'icons/icon-green.svg';

      case 'neutral':
      default:
        this.sanitizer.bypassSecurityTrustResourceUrl('icons/icon-grey.svg');
        return 'icons/icon-grey.svg';
    }
  }

  get riskUi(): RiskUiConfig {
    if (!this.analysis) {
      return {
        title: 'Не проаналізовано',
        message: 'Ми ще не перевірили цей сайт. Даних недостатньо для оцінки.',
        theme: 'neutral',
        icon: 'unknown',
      };
    }

    if (
      this.analysis.status === AnalysisStatus.NOT_ANALYZED ||
      this.analysis.status === AnalysisStatus.NOT_APPLICABLE
    ) {
      return {
        title: 'Не проаналізовано',
        message:
          this.analysis.message ??
          'Ми ще не перевірили цей сайт. Даних недостатньо для оцінки.',
        theme: 'neutral',
        icon: 'unknown',
      };
    }

    if (this.analysis.status === AnalysisStatus.ERROR) {
      return {
        title: 'Помилка аналізу',
        message:
          this.analysis.message ??
          'Не вдалося виконати перевірку сторінки.',
        theme: 'neutral',
        icon: 'unknown',
      };
    }

    switch (this.analysis.riskLevel) {
      case RiskLevel.HIGH:
        return {
          title: 'Високий ризик',
          message:
            this.analysis.message ??
            'Виявлено кілька підозрілих ознак на цьому сайті.',
          theme: 'high',
          icon: 'warning',
        };

      case RiskLevel.MEDIUM:
        return {
          title: 'Середній ризик',
          message:
            this.analysis.message ??
            'Виявлено деякі ознаки, що можуть свідчити про ризики.',
          theme: 'medium',
          icon: 'warning',
        };

      case RiskLevel.LOW:
        return {
          title: 'Низький ризик',
          message:
            this.analysis.message ??
            'Сайт виглядає безпечно. Підозрілих ознак не виявлено.',
          theme: 'low',
          icon: 'check',
        };

      default:
        return {
          title: 'Не проаналізовано',
          message: 'Даних недостатньо для оцінки.',
          theme: 'neutral',
          icon: 'unknown',
        };
    }
  }

  get riskSignals(): string[] {
    return this.analysis?.riskSignals?.map((signal) => signal.message) ?? [];
  }

  get pageTypeLabel(): string {
    switch (this.analysis?.pageType) {
      case PageType.NOT_PRODUCT_PAGE:
        return 'not product page';

      case PageType.NORMAL_SHOP_PAGE:
        return 'category page';

      case PageType.UNKNOWN_PRODUCT_PAGE:
        return 'landing page';

      default:
        return 'unknown page';
    }
  }

  get riskScoreLabel(): string {
    if (
      !this.analysis ||
      this.analysis.totalScore === undefined ||
      this.analysis.totalScore === null
    ) {
      return '—';
    }

    return String(this.analysis.totalScore);
  }

  get currentUrlPattern(): string {
    if (!this.analysis?.url) {
      return '*';
    }

    try {
      const url = new URL(this.analysis.url);
      return url.hostname;
    } catch {
      return this.analysis.url;
    }
  }

  get shouldShowSignals(): boolean {
    return this.riskSignals.length > 0;
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

  get defaultPageTypeDescription(): string {
    switch (this.analysis?.pageType) {
      case PageType.NOT_PRODUCT_PAGE:
        return 'Сторінка не містить достатніх ознак продажу товару.';

      case PageType.NORMAL_SHOP_PAGE:
        return 'Сторінка схожа на звичайний магазин або каталог товарів.';

      case PageType.UNKNOWN_PRODUCT_PAGE:
        return 'Односторінковий сайт без додаткових розділів.';

      default:
        return 'Тип сторінки не визначено.';
    }
  }

  get riskScoreDescription(): string {
    if (!this.analysis || this.analysis.totalScore === undefined) {
      return 'Оцінку ризику не сформовано.';
    }

    switch (this.analysis.riskLevel) {
      case RiskLevel.HIGH:
        return 'Високий ризик (шкала 0–10)';

      case RiskLevel.MEDIUM:
        return 'Середній ризик (шкала 0–10)';

      case RiskLevel.LOW:
        return 'Низький ризик (шкала 0–10)';

      default:
        return 'Оцінка ризику за шкалою 0–10';
    }
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
    this.isLoading = true;
    this.cdr.detectChanges();

    await this.analysisStorage.rerunAnalysis();

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

  async markSiteAsSafe(): Promise<void> {
    this.closeMenu();

    await this.siteRulesService.addRule(
      this.currentUrlPattern,
      'mark_as_safe',
    );
  }

  async ignoreSite(): Promise<void> {
    this.closeMenu();

    await this.siteRulesService.addRule(
      this.currentUrlPattern,
      'ignore',
    );
  }

  reportFalsePositive(): void {
    this.closeMenu();

    // Пізніше тут можна відкрити окрему форму або сторінку feedback.
    console.log('Report false positive');
  }

  openAbout(): void {
    this.closeMenu();

    // Пізніше тут можна показати about screen.
    console.log('Open about extension');
  }
}