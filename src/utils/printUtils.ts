import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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
    // Step 1: Expand all collapsed sections
    const sectionHeaders = document.querySelectorAll('.section-header');
    const collapsedHeaders: HTMLElement[] = [];

    sectionHeaders.forEach(header => {
      const parent = header.parentElement;
      if (parent) {
        const contentElements = Array.from(parent.children).filter((child, index) =>
          index > 0 && child instanceof HTMLElement
        );

        const hasVisibleContent = contentElements.some(child => {
          const style = window.getComputedStyle(child as HTMLElement);
          return style.display !== 'none' && (child as HTMLElement).offsetHeight > 0;
        });

        if (!hasVisibleContent) {
          collapsedHeaders.push(header as HTMLElement);
        }
      }
    });

    collapsedHeaders.forEach(header => {
      header.click();
    });

    await new Promise(resolve => setTimeout(resolve, 400));

    // Step 2: Force show all tab content sections for printing
    const tabSections = document.querySelectorAll('[data-section="additional-ats"], [data-section="load-bank"]');
    const originalTabClasses: Array<{ element: HTMLElement; hadHidden: boolean }> = [];

    tabSections.forEach(section => {
      if (section instanceof HTMLElement) {
        const hadHidden = section.classList.contains('hidden');
        originalTabClasses.push({ element: section, hadHidden });
        section.classList.remove('hidden');
        section.style.display = 'block';
      }
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    // Step 3: Hide UI elements
    const elementsToHide = document.querySelectorAll('.no-print');
    const hiddenElements: HTMLElement[] = [];
    elementsToHide.forEach(el => {
      hiddenElements.push(el as HTMLElement);
      (el as HTMLElement).style.display = 'none';
    });

    // Step 4: Hide financial data if customer copy
    const hiddenFinancialSections: HTMLElement[] = [];
    if (!options.includeFinancialData) {
      const financialSections = [
        '[data-section="parts-supplies"]',
        '[data-section="time-on-job"]',
        '[data-section="additional-charges"]',
        '[data-section="totals"]'
      ];

      financialSections.forEach(selector => {
        const section = document.querySelector(selector);
        if (section) {
          hiddenFinancialSections.push(section as HTMLElement);
          (section as HTMLElement).style.display = 'none';
        }
      });
    }

    // Step 5: Hide empty Additional ATS section
    let hiddenATSSection: HTMLElement | null = null;
    if (!hasAdditionalATSData(formData)) {
      const atsSection = document.querySelector('[data-section="additional-ats"]');
      if (atsSection) {
        hiddenATSSection = atsSection as HTMLElement;
        hiddenATSSection.style.display = 'none';
      }
    }

    // Step 6: Hide empty Load Bank section
    let hiddenLoadBankSection: HTMLElement | null = null;
    if (!hasLoadBankData(formData)) {
      const loadBankSection = document.querySelector('[data-section="load-bank"]');
      if (loadBankSection) {
        hiddenLoadBankSection = loadBankSection as HTMLElement;
        hiddenLoadBankSection.style.display = 'none';
      }
    }

    // Step 7: Fix select/dropdown rendering - convert to text
    const allSelects = document.querySelectorAll('.print-container select');
    const selectReplacements: Array<{ select: HTMLSelectElement; replacement: HTMLElement; parent: Node; nextSibling: Node | null }> = [];

    allSelects.forEach(select => {
      const selectEl = select as HTMLSelectElement;
      const selectedOption = selectEl.options[selectEl.selectedIndex];
      const textValue = selectedOption ? selectedOption.text : selectEl.value || '';

      const replacement = document.createElement('div');
      replacement.className = selectEl.className;
      replacement.style.cssText = window.getComputedStyle(selectEl).cssText;
      replacement.style.appearance = 'none';
      replacement.style.border = '1px solid #d1d5db';
      replacement.style.padding = '0.5rem 0.75rem';
      replacement.style.borderRadius = '0.375rem';
      replacement.style.backgroundColor = '#ffffff';
      replacement.textContent = textValue;

      const parent = selectEl.parentNode;
      const nextSibling = selectEl.nextSibling;

      if (parent) {
        parent.replaceChild(replacement, selectEl);
        selectReplacements.push({ select: selectEl, replacement, parent, nextSibling });
      }
    });

    await new Promise(resolve => setTimeout(resolve, 200));

    const formContainer = document.querySelector('.print-container');
    if (!formContainer) {
      throw new Error('Form container not found');
    }

    // Step 8: Capture with high quality settings
    const canvas = await html2canvas(formContainer as HTMLElement, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      removeContainer: false,
      windowWidth: 1400,
      allowTaint: false,
      foreignObjectRendering: false
    });

    // Step 9: Create PDF with fixed layout
    const pdf = new jsPDF('p', 'mm', 'a4', true);
    const pageWidth = 210;
    const pageHeight = 297;

    // Load images
    const headerImg = await loadImage('/image copy.png');
    const footerImg = await loadImage('/image copy copy copy.png');

    // Define layout constants
    const HEADER_HEIGHT = 22;
    const FOOTER_HEIGHT = 32;
    const MARGIN_TOP = 3;
    const MARGIN_BOTTOM = 3;
    const MARGIN_LEFT = 8;
    const MARGIN_RIGHT = 8;

    const CONTENT_START_Y = HEADER_HEIGHT + MARGIN_TOP;
    const CONTENT_END_Y = pageHeight - FOOTER_HEIGHT - MARGIN_BOTTOM;
    const CONTENT_HEIGHT = CONTENT_END_Y - CONTENT_START_Y;
    const CONTENT_WIDTH = pageWidth - MARGIN_LEFT - MARGIN_RIGHT;

    // Calculate image dimensions
    const imgWidth = CONTENT_WIDTH;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Function to add header and footer
    const addHeaderAndFooter = (pageNum: number) => {
      // Header with logo
      const logoHeight = 14;
      const logoWidth = (headerImg.width * logoHeight) / headerImg.height;
      pdf.addImage(headerImg, 'PNG', MARGIN_LEFT, 4, logoWidth, logoHeight, undefined, 'FAST');

      // Job number on right
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(40, 40, 40);
      pdf.text('Job No:', pageWidth - 45, 9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formData.job_po_number || 'N/A', pageWidth - 45, 14);

      // Header separator line
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(MARGIN_LEFT, HEADER_HEIGHT, pageWidth - MARGIN_RIGHT, HEADER_HEIGHT);

      // Footer with office locations
      const footerImgWidth = CONTENT_WIDTH;
      const footerImgHeight = (footerImg.height * footerImgWidth) / footerImg.width;
      const actualFooterHeight = Math.min(footerImgHeight, FOOTER_HEIGHT);
      const footerY = CONTENT_END_Y + MARGIN_BOTTOM;

      pdf.addImage(footerImg, 'PNG', MARGIN_LEFT, footerY, footerImgWidth, actualFooterHeight, undefined, 'FAST');

      // Page number
      pdf.setFontSize(8);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 2, { align: 'center' });
    };

    // Calculate pages needed
    let yPosition = 0;
    let pageNumber = 1;

    // First page
    addHeaderAndFooter(pageNumber);
    pdf.addImage(imgData, 'JPEG', MARGIN_LEFT, CONTENT_START_Y, imgWidth, imgHeight, undefined, 'FAST');

    yPosition += CONTENT_HEIGHT;

    // Additional pages
    while (yPosition < imgHeight) {
      pdf.addPage();
      pageNumber++;
      addHeaderAndFooter(pageNumber);

      const sourceY = yPosition;
      const yOffset = CONTENT_START_Y - sourceY;

      pdf.addImage(imgData, 'JPEG', MARGIN_LEFT, yOffset, imgWidth, imgHeight, undefined, 'FAST');

      yPosition += CONTENT_HEIGHT;
    }

    // Save PDF
    pdf.save(options.filename);

    // Step 10: Restore select dropdowns
    selectReplacements.forEach(({ select, replacement, parent, nextSibling }) => {
      if (nextSibling) {
        parent.insertBefore(select, nextSibling);
      } else {
        parent.appendChild(select);
      }
      replacement.remove();
    });

    // Restore hidden elements
    hiddenElements.forEach(el => {
      el.style.display = '';
    });

    hiddenFinancialSections.forEach(section => {
      section.style.display = '';
    });

    if (hiddenATSSection) {
      hiddenATSSection.style.display = '';
    }

    if (hiddenLoadBankSection) {
      hiddenLoadBankSection.style.display = '';
    }

    originalTabClasses.forEach(({ element, hadHidden }) => {
      if (hadHidden) {
        element.classList.add('hidden');
      }
      element.style.display = '';
    });

    await new Promise(resolve => setTimeout(resolve, 100));
    collapsedHeaders.forEach(header => {
      header.click();
    });

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
