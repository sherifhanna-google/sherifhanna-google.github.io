import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from './services/data.service';
import { Product } from './models/product.model';

type SortKey = 'conformanceDateDesc' | 'conformanceDateAsc' | 'creationDateDesc' | 'creationDateAsc';

@Component({
  selector: 'app-product-list',
  template: `<!-- Details Modal -->
@if (selectedProduct()) {
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" (click)="closeModal()">
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
        <h3 class="text-2xl font-bold text-slate-800 dark:text-slate-100">{{ selectedProduct()?.vendorName }}</h3>
        <p class="text-slate-600 dark:text-slate-300 font-medium text-lg">{{ selectedProduct()?.productName }}</p>
        @if (selectedProduct()?.organizationalUnit) {
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ selectedProduct()?.organizationalUnit }}</p>
        }
        <button (click)="closeModal()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <div class="p-6 space-y-4">
        <div>
          <h4 class="font-semibold text-slate-700 dark:text-slate-200 mb-2">Product Information</h4>
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <dt class="font-medium text-slate-500 dark:text-slate-400">Min. Version</dt>
            <dd class="text-slate-800 dark:text-slate-200">{{ selectedProduct()?.productVersion }}</dd>
            <dt class="font-medium text-slate-500 dark:text-slate-400">Product Type</dt>
            <dd class="text-slate-800 dark:text-slate-200">{{ selectedProduct()?.productType }}</dd>
            <dt class="font-medium text-slate-500 dark:text-slate-400">Assurance Level</dt>
            <dd class="text-slate-800 dark:text-slate-200">{{ selectedProduct()?.assuranceLevel }}</dd>
            <dt class="font-medium text-slate-500 dark:text-slate-400">Conformance Date</dt>
            <dd class="text-slate-800 dark:text-slate-200">{{ selectedProduct()?.conformanceDate | date:'fullDate' }}</dd>
            <dt class="font-medium text-slate-500 dark:text-slate-400">Creation Date</dt>
            <dd class="text-slate-800 dark:text-slate-200">{{ selectedProduct()?.creationDate | date:'fullDate' }}</dd>
            <dt class="font-medium text-slate-500 dark:text-slate-400">Record ID</dt>
            <dd class="text-slate-800 dark:text-slate-200 font-mono break-words">{{ selectedProduct()?.recordId }}</dd>
          </dl>
        </div>
        <div>
          <h4 class="font-semibold text-slate-700 dark:text-slate-200 mb-2">Supported Media Types & Formats</h4>
          <div class="space-y-3">
          @for (mediaType of (selectedProduct()?.supportedMediaTypes || []); track mediaType) {
            <div>
                <p class="font-medium text-slate-600 dark:text-slate-300 capitalize">{{mediaType}}</p>
                <div class="flex flex-wrap gap-2 mt-1">
                    @for(format of selectedProduct()?.formatsByMediaType[mediaType]; track format) {
                    <span class="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono font-medium px-2 py-1 rounded-full">{{ format }}</span>
                    }
                </div>
            </div>
          }
          </div>
        </div>
      </div>
      <div class="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-right rounded-b-lg sticky bottom-0">
        <button (click)="closeModal()" class="bg-slate-500 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors duration-200">
          Close
        </button>
      </div>
    </div>
  </div>
}
<div class="space-y-6">
  <!-- Filters Section -->
  <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Filter by Vendor -->
      <div>
        <label for="vendor" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Vendor</label>
        <select 
          id="vendor" 
          [ngModel]="selectedVendor()" 
          (ngModelChange)="onVendorChange($event)"
          class="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-300 focus:ring-opacity-50 text-sm py-2 px-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200">
          <option value="">All Vendors</option>
          @for (vendor of vendors(); track vendor) {
            <option [value]="vendor">{{ vendor }}</option>
          }
        </select>
      </div>
      <!-- Search Input -->
      <div>
        <label for="product-search" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Search</label>
        <input 
          type="text"
          id="product-search"
          placeholder="Product, vendor, or Record ID..."
          [ngModel]="searchTerm()"
          (ngModelChange)="onSearchTermChange($event)"
          class="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-300 focus:ring-opacity-50 text-sm py-2 px-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
        />
      </div>
      <!-- Filter by Product Type -->
      <div>
        <label for="product-type" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Product Type</label>
        <select 
          id="product-type" 
          [ngModel]="selectedProductType()" 
          (ngModelChange)="onProductTypeChange($event)"
          class="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-300 focus:ring-opacity-50 text-sm py-2 px-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200">
          <option value="">All Types</option>
          @for (type of productTypes(); track type) {
            <option [value]="type">{{ type }}</option>
          }
        </select>
      </div>
      <!-- Filter by Assurance Level -->
      <div>
        <label for="assurance-level" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Assurance Level</label>
        <select 
          id="assurance-level" 
          [ngModel]="selectedAssuranceLevel()" 
          (ngModelChange)="onAssuranceLevelChange($event)"
          class="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-300 focus:ring-opacity-50 text-sm py-2 px-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200">
          <option value="">All Levels</option>
          @for (level of assuranceLevels(); track level) {
            <option [value]="level">{{ level }}</option>
          }
        </select>
      </div>
    </div>
    <!-- Reset Button -->
    <div class="mt-4 flex justify-end">
        <button 
          (click)="resetFilters()"
          class="w-full sm:w-auto bg-slate-500 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors duration-200 text-sm disabled:bg-slate-300 dark:disabled:bg-slate-700 dark:disabled:text-slate-400 disabled:cursor-not-allowed"
          [disabled]="!isAnyFilterActive()">
          Reset Filters
        </button>
    </div>
    <!-- Media Type Filters -->
    <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Media Types (select all that apply)</label>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            @for (mediaType of mediaTypesForDisplay; track mediaType.key) {
            <div class="flex items-center">
                <input 
                type="checkbox" 
                [id]="'media-type-' + mediaType.key" 
                [checked]="selectedMediaTypes().has(mediaType.key)"
                (change)="onMediaTypeChange(mediaType.key, $event)"
                class="h-4 w-4 rounded border-gray-300 dark:border-slate-500 text-slate-600 dark:bg-slate-700 dark:checked:bg-slate-600 focus:ring-slate-500">
                <label [for]="'media-type-' + mediaType.key" class="ml-2 text-sm text-slate-600 dark:text-slate-400">{{ mediaType.label }}</label>
            </div>
            }
        </div>
    </div>

    <!-- Contextual File Format Filters -->
    @if (selectedMediaTypes().size > 0) {
      <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">File Formats (shows formats that match <span class="font-bold">any</span> selected type)</label>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            @for (format of availableFileFormats(); track format) {
            <div class="flex items-center">
                <input 
                type="checkbox" 
                [id]="'format-' + format"
                [checked]="selectedFormats().has(format)"
                (change)="onFormatChange(format, $event)"
                class="h-4 w-4 rounded border-gray-300 dark:border-slate-500 text-slate-600 dark:bg-slate-700 dark:checked:bg-slate-600 focus:ring-slate-500">
                <label [for]="'format-' + format" class="ml-2 text-sm text-slate-600 dark:text-slate-400 font-mono">{{ format }}</label>
            </div>
            }
        </div>
      </div>
    }

  </div>

  <!-- Results Count & Sorting -->
  <div class="flex justify-between items-center my-4">
    <div class="text-sm text-slate-600 dark:text-slate-400">
      Showing <span class="font-semibold text-slate-700 dark:text-slate-200">{{ filteredProducts().length }}</span> of <span class="font-semibold text-slate-700 dark:text-slate-200">{{ products().length }}</span> products.
    </div>
    <div class="flex items-center">
        <label for="sort-order" class="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2 whitespace-nowrap">Sort results by</label>
        <select 
            id="sort-order"
            [ngModel]="sortOrder()"
            (ngModelChange)="onSortOrderChange($event)"
            class="block rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-300 focus:ring-opacity-50 text-sm py-2 px-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200">
            <option value="conformanceDateDesc">Conformance Date (Newest)</option>
            <option value="conformanceDateAsc">Conformance Date (Oldest)</option>
            <option value="creationDateDesc">Application Date (Newest)</option>
            <option value="creationDateAsc">Application Date (Oldest)</option>
        </select>
    </div>
  </div>


  <!-- Results Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    @for (product of filteredProducts(); track product.recordId) {
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-shadow duration-200">
        <div class="flex-grow">
          <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">{{ product.productName }}</h2>
          <p class="text-slate-600 dark:text-slate-300 font-medium">{{ product.vendorName }}</p>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ product.organizationalUnit }}</p>
        </div>
        <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="font-semibold text-slate-600 dark:text-slate-300">Product Type:</span>
            <span class="text-slate-700 dark:text-slate-200">{{ product.productType }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-semibold text-slate-600 dark:text-slate-300">Assurance:</span>
            <span class="text-slate-700 dark:text-slate-200">{{ product.assuranceLevel }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-semibold text-slate-600 dark:text-slate-300">Conformance:</span>
            <span class="text-slate-700 dark:text-slate-200">{{ product.conformanceDate | date:'longDate' }}</span>
          </div>
        </div>
        <div class="mt-4">
          <button (click)="selectProduct(product)" class="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-md transition-colors duration-200">
            View Details
          </button>
        </div>
      </div>
    } @empty {
      <div class="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <p class="text-slate-500 dark:text-slate-400">No products match the selected filters.</p>
      </div>
    }
  </div>

  <!-- Data Source Link -->
  <div class="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
    Retrieved from the
    <a 
      href="https://github.com/c2pa-org/conformance-public/blob/main/conforming-products/conforming-products-list.json" 
      target="_blank" 
      rel="noopener noreferrer" 
      class="font-medium underline hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
      C2PA <code class="font-mono">conformance-public</code> repository
    </a>.
  </div>
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ProductListComponent {
  private dataService = inject(DataService);

  // Raw data signals
  products = this.dataService.products;

  // Filter signals
  selectedVendor = signal('');
  selectedProductType = signal('');
  selectedAssuranceLevel = signal('');
  searchTerm = signal('');
  sortOrder = signal<SortKey>('conformanceDateDesc');
  selectedMediaTypes = signal<Set<string>>(new Set());
  selectedFormats = signal<Set<string>>(new Set());

  // Modal signal
  selectedProduct = signal<Product | null>(null);

  // This effect clears the file format selections when no media types are selected.
  private clearFormatsEffect = effect(() => {
    if (this.selectedMediaTypes().size === 0) {
      this.selectedFormats.set(new Set());
    }
  });

  // A list of all possible media types for the filter UI.
  public readonly mediaTypesForDisplay = [
    { key: 'image', label: 'Image' },
    { key: 'video', label: 'Video' },
    { key: 'audio', label: 'Audio' },
    { key: 'documents', label: 'Documents' },
    { key: 'fonts', label: 'Fonts' },
    { key: 'mlModel', label: 'ML Model' },
  ];

  // Derived (computed) signals for UI elements and filtering
  vendors = computed(() => {
    const vendorNames = this.products().map(p => p.vendorName);
    // Fix: Explicitly type sort callback parameters to resolve 'unknown' type error.
    return [...new Set(vendorNames)].sort((a: string, b: string) => a.localeCompare(b));
  });

  productTypes = computed(() => {
    const types = this.products().map(p => p.productType);
    return [...new Set(types)].sort();
  });

  assuranceLevels = computed(() => {
    const levels = this.products().map(p => p.assuranceLevel);
    // Fix: Explicitly type sort callback parameters to resolve 'unknown' type error.
    return [...new Set(levels)].sort((a: string, b: string) => a.localeCompare(b, undefined, { numeric: true }));
  });
  
  // This computed signal dynamically generates the list of available file formats
  // based on the currently selected media types, ensuring only relevant formats are shown.
  availableFileFormats = computed(() => {
    const selectedMedia = this.selectedMediaTypes();
    if (selectedMedia.size === 0) {
      return [];
    }
    const formats = new Set<string>();
    this.products().forEach(product => {
      for (const mediaType of selectedMedia) {
        if (product.formatsByMediaType[mediaType]) {
          product.formatsByMediaType[mediaType].forEach(format => formats.add(format));
        }
      }
    });
    return Array.from(formats).sort();
  });

  filteredProducts = computed(() => {
    const vendor = this.selectedVendor();
    const type = this.selectedProductType();
    const level = this.selectedAssuranceLevel();
    const mediaTypes = this.selectedMediaTypes();
    const formats = this.selectedFormats();
    const sort = this.sortOrder();
    const term = this.searchTerm().toLowerCase();

    const filtered = this.products().filter(p => {
      const vendorMatch = vendor === '' || p.vendorName === vendor;
      const productTypeMatch = type === '' || p.productType === type;
      const assuranceLevelMatch = level === '' || p.assuranceLevel === level;
      
      const mediaTypesMatch = mediaTypes.size === 0 || p.supportedMediaTypes.some(mt => mediaTypes.has(mt));
      
      const formatsMatch = formats.size === 0 || p.supportedFileFormats.some(f => formats.has(f));

      const searchTermMatch = term === '' ||
        p.productName.toLowerCase().includes(term) ||
        p.vendorName.toLowerCase().includes(term) ||
        p.organizationalUnit.toLowerCase().includes(term) ||
        p.recordId.toLowerCase().includes(term);

      return vendorMatch && productTypeMatch && assuranceLevelMatch && mediaTypesMatch && formatsMatch && searchTermMatch;
    });

    // Sort the filtered results
    return filtered.sort((a, b) => {
      switch (sort) {
        case 'conformanceDateDesc':
          return new Date(b.conformanceDate).getTime() - new Date(a.conformanceDate).getTime();
        case 'conformanceDateAsc':
          return new Date(a.conformanceDate).getTime() - new Date(b.conformanceDate).getTime();
        case 'creationDateDesc':
          return new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime();
        case 'creationDateAsc':
          return new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime();
        default:
            return 0;
      }
    });
  });

  isAnyFilterActive = computed(() => {
    return this.selectedVendor() !== '' || 
           this.selectedProductType() !== '' || 
           this.selectedAssuranceLevel() !== '' || 
           this.selectedMediaTypes().size > 0 ||
           this.selectedFormats().size > 0 ||
           this.searchTerm() !== '';
  });

  // Event handlers
  onVendorChange(value: string): void {
    this.selectedVendor.set(value);
  }

  onProductTypeChange(value: string): void {
    this.selectedProductType.set(value);
  }

  onAssuranceLevelChange(value: string): void {
    this.selectedAssuranceLevel.set(value);
  }

  onSearchTermChange(value: string): void {
    this.searchTerm.set(value);
  }

  onSortOrderChange(value: SortKey): void {
    this.sortOrder.set(value);
  }

  onMediaTypeChange(mediaType: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.selectedMediaTypes.update(currentSet => {
      const newSet = new Set(currentSet);
      if (isChecked) {
        newSet.add(mediaType);
      } else {
        newSet.delete(mediaType);
      }
      return newSet;
    });
  }

  onFormatChange(format: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.selectedFormats.update(currentSet => {
        const newSet = new Set(currentSet);
        if (isChecked) {
            newSet.add(format);
        } else {
            newSet.delete(format);
        }
        return newSet;
    });
  }

  resetFilters(): void {
    this.selectedVendor.set('');
    this.selectedProductType.set('');
    this.selectedAssuranceLevel.set('');
    this.searchTerm.set('');
    this.sortOrder.set('conformanceDateDesc');
    this.selectedMediaTypes.set(new Set());
    this.selectedFormats.set(new Set());
  }

  // Modal logic
  selectProduct(product: Product): void {
    this.selectedProduct.set(product);
  }

  closeModal(): void {
    this.selectedProduct.set(null);
  }
}
