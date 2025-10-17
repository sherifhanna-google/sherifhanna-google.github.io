import { ChangeDetectionStrategy, Component, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT, CommonModule } from '@angular/common';
import { ProductListComponent } from './product-list.component';
import { TrustListComponent } from './trust-list.component';
import { TsaTrustListComponent } from './tsa-trust-list.component';

@Component({
  selector: 'app-root',
  template: `
<main class="container mx-auto p-4 md:p-8 relative">
  <header class="text-center mb-8">
    <div class="flex justify-center items-center gap-x-4 mb-2">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="35 50 130 200" class="h-10 md:h-12 text-slate-800 dark:text-slate-100" fill="currentColor" role="img" aria-labelledby="c2pa-logo-title">
        <title id="c2pa-logo-title">C2PA Logo</title>
        <circle cx="128.58" cy="102.15" r="6"/>
        <path d="M99.68,112.05a14,14,0,1,1,14-14A14,14,0,0,1,99.68,112.05Zm0-19.9a5.91,5.91,0,0,0-5.9,5.9,5.9,5.9,0,1,0,5.9-5.9Z"/>
        <path d="M99.68,246.85a61.37,61.37,0,0,1-61.3-61.3v-58a3.92,3.92,0,0,1,2.1-3.5,4,4,0,0,1,4.1.2c14,9.1,34,14.4,55,14.4,20.3,0,40.9-5.4,55.1-14.4a4.06,4.06,0,0,1,6.2,3.4v58A61.33,61.33,0,0,1,99.68,246.85Zm-53.3-112.2v51a53.2,53.2,0,0,0,106.4,0v-51c-14.9,7.7-33.9,12.1-53.2,12.1C80.08,146.65,61.08,142.35,46.38,134.65Z"/>
        <path d="M99.68,128.45c-20.4,0-39.9-4.6-54.9-13.1a12.09,12.09,0,0,1-6.2-11.6,61.34,61.34,0,0,1,122.2,0h0a12.09,12.09,0,0,1-6.2,11.6C139.48,123.75,120,128.45,99.68,128.45Zm0-72.5a53.74,53.74,0,0,0-53.1,48.5,4.17,4.17,0,0,0,2.1,3.9c13.9,7.8,32,12,51,12s37.1-4.3,51-12a4.17,4.17,0,0,0,2.1-3.9h0A53.74,53.74,0,0,0,99.68,56Z"/>
        <path d="M89.68,101.85h-.3c-15.5-1.2-30.1-5.1-42.1-11.3a4,4,0,0,1,3.7-7.1c11.1,5.7,24.6,9.3,39,10.4a4,4,0,0,1,3.7,4.3A4,4,0,0,1,89.68,101.85Z"/>
        <path d="M99.68,187.65c-22.5,0-44.1-5.7-59.3-15.6a4,4,0,1,1,4.4-6.8c14,9.1,34,14.3,54.9,14.3s41-5.2,54.9-14.3a4,4,0,0,1,4.4,6.8C143.68,182,122.08,187.65,99.68,187.65Z"/>
        <path d="M99.68,205.75c-22.4,0-43.9-5.7-59.2-15.5a4,4,0,1,1,4.4-6.8c14,9,33.9,14.2,54.8,14.2s40.8-5.2,54.8-14.2a4,4,0,0,1,4.4,6.8C143.58,200.15,122,205.75,99.68,205.75Z"/>
      </svg>
      <h1 class="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100">
        C2PA Conformance Explorer
      </h1>
    </div>
    <p class="text-slate-600 dark:text-slate-400 text-lg">Browse official C2PA conforming products, C2PA trust list, and C2PA TSA trust list certificates.</p>
  </header>

  <!-- Dark Mode Toggle -->
  <div class="absolute top-0 right-4 md:top-8 md:right-8">
    <button 
      (click)="toggleDarkMode()" 
      type="button" 
      class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-slate-500"
      [class.bg-slate-600]="isDarkMode()" 
      [class.bg-slate-300]="!isDarkMode()"
      role="switch" 
      [attr.aria-checked]="isDarkMode()">
      <span class="sr-only">Toggle dark mode</span>
      <span class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
        [class.translate-x-5]="isDarkMode()" 
        [class.translate-x-0]="!isDarkMode()">
        <span class="absolute inset-0 h-full w-full flex items-center justify-center transition-opacity" [class.opacity-0]="isDarkMode()" [class.ease-out]="isDarkMode()" [class.duration-100]="isDarkMode()" [class.opacity-100]="!isDarkMode()" [class.ease-in]="!isDarkMode()" [class.duration-200]="!isDarkMode()" aria-hidden="true">
          <svg class="h-3 w-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
        </span>
        <span class="absolute inset-0 h-full w-full flex items-center justify-center transition-opacity" [class.opacity-100]="isDarkMode()" [class.ease-in]="isDarkMode()" [class.duration-200]="isDarkMode()" [class.opacity-0]="!isDarkMode()" [class.ease-out]="!isDarkMode()" [class.duration-100]="!isDarkMode()" aria-hidden="true">
          <svg class="h-3 w-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.455 2.164A.75.75 0 018 2.5v1.25a.75.75 0 01-1.5 0V2.5a.75.75 0 01.545-.721 8.001 8.001 0 00-4.04 1.422.75.75 0 01-.832-1.2A9.5 9.5 0 018 1c1.04 0 2.043.163 3 .469a.75.75 0 01-.832 1.2 8.001 8.001 0 00-4.04-1.422zM12 7.5a.75.75 0 01.75.75v1.25a.75.75 0 01-1.5 0V8.25A.75.75 0 0112 7.5zM7.5 12a.75.75 0 01.75.75v1.25a.75.75 0 01-1.5 0V12.75A.75.75 0 017.5 12zM12.75 11.25a.75.75 0 01.75.75v1.25a.75.75 0 01-1.5 0V12a.75.75 0 01.75-.75zM16.5 8.25a.75.75 0 01.75.75v1.25a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zM10 5.25a.75.75 0 01.75.75v1.25a.75.75 0 01-1.5 0V6a.75.75 0 01.75-.75zM3.5 8.25a.75.75 0 01.75.75v1.25a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75z" clip-rule="evenodd"></path></svg>
        </span>
      </span>
    </button>
  </div>

  <!-- Tabs Navigation -->
  <div class="mb-8 border-b border-gray-200 dark:border-slate-700">
    <nav class="-mb-px flex space-x-8" aria-label="Tabs">
      <button 
        (click)="selectTab('products')"
        [class.border-slate-500]="activeTab() === 'products'"
        [class.text-slate-600]="activeTab() === 'products'"
        [class.dark:border-slate-400]="activeTab() === 'products'"
        [class.dark:text-slate-300]="activeTab() === 'products'"
        [class.border-transparent]="activeTab() !== 'products'"
        [class.text-slate-500]="activeTab() !== 'products'"
        [class.hover:text-slate-700]="activeTab() !== 'products'"
        [class.hover:border-gray-300]="activeTab() !== 'products'"
        [class.dark:text-slate-400]="activeTab() !== 'products'"
        [class.dark:hover:text-slate-200]="activeTab() !== 'products'"
        [class.dark:hover:border-slate-600]="activeTab() !== 'products'"
        class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
        aria-current="page">
        Conforming Product List
      </button>

      <button 
        (click)="selectTab('trust')"
        [class.border-slate-500]="activeTab() === 'trust'"
        [class.text-slate-600]="activeTab() === 'trust'"
        [class.dark:border-slate-400]="activeTab() === 'trust'"
        [class.dark:text-slate-300]="activeTab() === 'trust'"
        [class.border-transparent]="activeTab() !== 'trust'"
        [class.text-slate-500]="activeTab() !== 'trust'"
        [class.hover:text-slate-700]="activeTab() !== 'trust'"
        [class.hover:border-gray-300]="activeTab() !== 'trust'"
        [class.dark:text-slate-400]="activeTab() !== 'trust'"
        [class.dark:hover:text-slate-200]="activeTab() !== 'trust'"
        [class.dark:hover:border-slate-600]="activeTab() !== 'trust'"
        class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
        aria-current="page">
        C2PA Trust List
      </button>

      <button 
        (click)="selectTab('tsaTrust')"
        [class.border-slate-500]="activeTab() === 'tsaTrust'"
        [class.text-slate-600]="activeTab() === 'tsaTrust'"
        [class.dark:border-slate-400]="activeTab() === 'tsaTrust'"
        [class.dark:text-slate-300]="activeTab() === 'tsaTrust'"
        [class.border-transparent]="activeTab() !== 'tsaTrust'"
        [class.text-slate-500]="activeTab() !== 'tsaTrust'"
        [class.hover:text-slate-700]="activeTab() !== 'tsaTrust'"
        [class.hover:border-gray-300]="activeTab() !== 'tsaTrust'"
        [class.dark:text-slate-400]="activeTab() !== 'tsaTrust'"
        [class.dark:hover:text-slate-200]="activeTab() !== 'tsaTrust'"
        [class.dark:hover:border-slate-600]="activeTab() !== 'tsaTrust'"
        class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
        aria-current="page">
        C2PA TSA Trust List
      </button>
    </nav>
  </div>

  <!-- Tab Content -->
  @if (activeTab() === 'products') {
    <app-product-list></app-product-list>
  }
  @if (activeTab() === 'trust') {
    <app-trust-list></app-trust-list>
  }
  @if (activeTab() === 'tsaTrust') {
    <app-tsa-trust-list></app-tsa-trust-list>
  }

</main>
`,
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
