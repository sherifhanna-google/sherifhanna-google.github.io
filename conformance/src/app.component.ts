import { ChangeDetectionStrategy, Component, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT, CommonModule } from '@angular/common';
import { ProductListComponent } from './product-list.component';
import { TrustListComponent } from './trust-list.component';
import { TsaTrustListComponent } from './tsa-trust-list.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductListComponent, TrustListComponent, TsaTrustListComponent, CommonModule],
})
export class AppComponent {
  activeTab = signal<'products' | 'trust' | 'tsaTrust'>('products');

  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  
  // Initialize dark mode based on user's system preference
  isDarkMode = signal<boolean>(this.getInitialDarkMode());

  constructor() {
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        const root = this.document.documentElement;
        if (this.isDarkMode()) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    });
  }

  private getInitialDarkMode(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    }
    return false;
  }

  selectTab(tab: 'products' | 'trust' | 'tsaTrust'): void {
    this.activeTab.set(tab);
  }

  toggleDarkMode(): void {
    this.isDarkMode.update(value => !value);
  }
}