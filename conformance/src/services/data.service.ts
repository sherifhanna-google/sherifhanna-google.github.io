import { Injectable, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, shareReplay } from 'rxjs/operators';
import { Product, RawProduct, ContainerFormats } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private http = inject(HttpClient);
  private readonly JSON_URL = 'https://raw.githubusercontent.com/c2pa-org/conformance-public/refs/heads/main/conforming-products/conforming-products-list.json';

  private rawProducts$ = this.http.get<RawProduct[]>(this.JSON_URL).pipe(
    map(data => Array.isArray(data) ? data : []),
    shareReplay(1) // Cache the raw data to avoid re-fetching
  );

  rawProducts = toSignal(this.rawProducts$, { initialValue: [] as RawProduct[] });

  products = computed(() => {
    return this.rawProducts().map((p: RawProduct): Product => {
      const allFormats = new Set<string>();
      const allMediaTypes = new Set<string>();
      const formatsByMediaType: { [key: string]: string[] } = {};

      const processContainer = (container?: ContainerFormats) => {
        if (!container) return;
        for (const mediaType of Object.keys(container)) {
          const key = mediaType as keyof ContainerFormats;
          const formatArray = container[key];
          
          if (Array.isArray(formatArray) && formatArray.length > 0) {
            allMediaTypes.add(mediaType);
            
            if (!formatsByMediaType[mediaType]) {
              formatsByMediaType[mediaType] = [];
            }
            const mediaTypeFormats = new Set<string>(formatsByMediaType[mediaType]);

            formatArray.forEach(format => {
              allFormats.add(format);
              mediaTypeFormats.add(format);
            });
            
            formatsByMediaType[mediaType] = Array.from(mediaTypeFormats);
          }
        }
      };

      processContainer(p.containers.generate);
      processContainer(p.containers.validate);
      
      // Sort the formats within each media type
      for (const mediaType in formatsByMediaType) {
        formatsByMediaType[mediaType].sort();
      }

      // Determine assurance level
      let assuranceLevel = 'N/A';
      if (p.product.assurance?.maxAssuranceLevel) {
        assuranceLevel = `Level ${p.product.assurance.maxAssuranceLevel}`;
      }

      const productTypeMap: Record<string, string> = {
        'generatorProduct': 'Generator',
        'validatorProduct': 'Validator'
      };
      const friendlyProductType = productTypeMap[p.product.productType] ?? p.product.productType;
      
      return {
        recordId: p.recordId,
        vendorName: p.applicant,
        productName: p.product.DN.CN,
        organizationalUnit: p.product.DN.OU || '',
        productVersion: p.product.minVersion || 'N/A',
        productType: friendlyProductType,
        assuranceLevel: assuranceLevel,
        supportedFileFormats: Array.from(allFormats).sort(),
        formatsByMediaType: formatsByMediaType,
        supportedMediaTypes: Array.from(allMediaTypes).sort(),
        creationDate: p.dates.creation,
        conformanceDate: p.dates.conformance,
      };
    });
  });
}