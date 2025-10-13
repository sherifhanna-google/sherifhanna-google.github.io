import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrustListService } from './services/trust-list.service';
import { Certificate } from './models/certificate.model';

@Component({
  selector: 'app-trust-list',
  templateUrl: './trust-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class TrustListComponent {
  private trustListService = inject(TrustListService);

  certificates = this.trustListService.certificates;
  selectedOrganization = signal('');
  searchTerm = signal('');
  selectedCertificate = signal<Certificate | null>(null);

  organizations = computed(() => {
    const orgs = this.certificates().map(c => c.organization);
    // Fix: Explicitly type sort callback parameters to resolve 'unknown' type error.
    return [...new Set(orgs)].sort((a: string, b: string) => a.localeCompare(b));
  });

  filteredCertificates = computed(() => {
    const org = this.selectedOrganization();
    const term = this.searchTerm().toLowerCase();

    let filtered = this.certificates();

    if (org) {
      filtered = filtered.filter(cert => cert.organization === org);
    }

    if (term) {
      filtered = filtered.filter(cert => 
        cert.commonName.toLowerCase().includes(term) ||
        cert.subject.toLowerCase().includes(term)
      );
    }

    return filtered;
  });
  
  onOrganizationChange(org: string): void {
    this.selectedOrganization.set(org);
  }

  onSearchTermChange(term: string): void {
    this.searchTerm.set(term);
  }

  selectCertificate(certificate: Certificate): void {
    this.selectedCertificate.set(certificate);
  }

  closeModal(): void {
    this.selectedCertificate.set(null);
  }

  copyPem(pem: string): void {
    navigator.clipboard.writeText(pem).catch(err => console.error('Failed to copy PEM:', err));
  }
}