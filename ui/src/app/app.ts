import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AnalysisResult } from './models/analysis-result.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  constructor(private cdr: ChangeDetectorRef) { }

  analysis: AnalysisResult | null = null;

  async ngOnInit(): Promise<void> {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab) return;

    const key = `analysis_${tab.id}`;
    const items = await chrome.storage.local.get(key);

    this.analysis = items[key] as AnalysisResult;

    this.cdr.detectChanges();
  }
}
