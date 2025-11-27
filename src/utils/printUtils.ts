import { FormSubmission } from '../types/form';

export function hasAdditionalATSData(formData: FormSubmission): boolean {
  const additionalATS = formData.additional_ats || [];
  return additionalATS.length > 0;
}

export function hasLoadBankData(formData: FormSubmission): boolean {
  const entries = formData.load_bank_entries || [];
  if (entries.length > 0) return true;

  const loadBankFields = [
    'load_bank_customer',
    'load_bank_site_name',
    'load_bank_site_address',
    'load_bank_date',
    'load_bank_performed_by',
    'load_bank_witness',
    'load_bank_generator_make',
    'load_bank_generator_model',
    'load_bank_generator_serial',
    'load_bank_generator_kw',
    'load_bank_set_voltage',
    'load_bank_rated_amps',
    'load_bank_engine_make',
    'load_bank_engine_model',
    'load_bank_engine_serial',
    'load_bank_notes'
  ];

  return loadBankFields.some(field => {
    const value = (formData as any)[field];
    return value && value.toString().trim() !== '';
  });
}

export async function generatePDF(
  formData: FormSubmission,
  options: {
    includeFinancialData: boolean;
    filename: string;
  }
) {
  try {
    const printContainer = document.querySelector('.print-container');
    if (!printContainer) {
      throw new Error('Print container not found');
    }

    // Store original body class
    const originalBodyClass = document.body.className;

    // Add customer-copy class if financial data should be excluded
    if (!options.includeFinancialData) {
      document.body.classList.add('customer-copy');
    }

    // Mark empty sections to hide them during print
    const atsSection = document.querySelector('[data-section="additional-ats"]');
    const loadBankSection = document.querySelector('[data-section="load-bank"]');

    if (atsSection && !hasAdditionalATSData(formData)) {
      atsSection.classList.add('empty-section');
    }

    if (loadBankSection && !hasLoadBankData(formData)) {
      loadBankSection.classList.add('empty-section');
    }

    // Create print header
    const printHeader = document.createElement('div');
    printHeader.className = 'print-header';
    printHeader.innerHTML = `
      <img src="/image.png" alt="Legacy Logo" />
      <div class="print-header-title">
        Job #: ${formData.job_number || 'N/A'}
      </div>
    `;

    // Create print footer
    const printFooter = document.createElement('div');
    printFooter.className = 'print-footer';
    printFooter.innerHTML = `
      <div class="print-footer-content">
        <div>ORLANDO: 321-236-9400 | ORLANDO@LEGACYPS.COM</div>
        <div>MIAMI: 305-817-4950 | MIAMI@LEGACYPS.COM</div>
        <div>WEST PALM BEACH: 561-429-5294 | WPB@LEGACYPS.COM</div>
      </div>
      <div class="print-footer-page">
        Page <span class="pageNumber"></span>
      </div>
    `;

    // Insert header and footer
    document.body.insertBefore(printHeader, document.body.firstChild);
    document.body.appendChild(printFooter);

    // Expand all sections for printing
    const sectionHeaders = document.querySelectorAll('.section-header');
    const collapsedStates: { element: Element; nextSibling: Element | null }[] = [];

    sectionHeaders.forEach(header => {
      const nextElement = header.nextElementSibling;
      if (nextElement && nextElement.classList.contains('hidden')) {
        nextElement.classList.remove('hidden');
        collapsedStates.push({ element: nextElement, nextSibling: nextElement });
      }
    });

    // Show all tabs content
    const tabPanels = document.querySelectorAll('[role="tabpanel"]');
    const hiddenPanels: Element[] = [];

    tabPanels.forEach(panel => {
      if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        panel.classList.add('print-all-tabs');
        hiddenPanels.push(panel);
      }
    });

    // Wait for images to load
    await new Promise(resolve => setTimeout(resolve, 300));

    // Trigger native browser print dialog
    window.print();

    // Cleanup after print dialog closes
    setTimeout(() => {
      // Remove header and footer
      printHeader.remove();
      printFooter.remove();

      // Remove empty-section markers
      if (atsSection) {
        atsSection.classList.remove('empty-section');
      }
      if (loadBankSection) {
        loadBankSection.classList.remove('empty-section');
      }

      // Restore collapsed sections
      collapsedStates.forEach(({ element }) => {
        element.classList.add('hidden');
      });

      // Restore hidden tabs
      hiddenPanels.forEach(panel => {
        panel.classList.add('hidden');
        panel.classList.remove('print-all-tabs');
      });

      // Restore body class
      document.body.className = originalBodyClass;
    }, 500);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
