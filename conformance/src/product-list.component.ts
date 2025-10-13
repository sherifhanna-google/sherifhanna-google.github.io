import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from './services/data.service';
import { Product } from './models/product.model';

type SortKey = 'conformanceDateDesc' | 'conformanceDateAsc' | 'creationDateDesc' | 'creationDateAsc';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
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