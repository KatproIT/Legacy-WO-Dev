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
    // Hide UI elements
    const elementsToHide = document.querySelectorAll('.no-print');
    const hiddenElements: HTMLElement[] = [];
    elementsToHide.forEach(el => {
      hiddenElements.push(el as HTMLElement);
      (el as HTMLElement).style.display = 'none';
    });

    // Hide financial data if customer copy
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

    // Hide empty Additional ATS section
    let hiddenATSSection: HTMLElement | null = null;
    if (!hasAdditionalATSData(formData)) {
      const atsSection = document.querySelector('[data-section="additional-ats"]');
      if (atsSection) {
        hiddenATSSection = atsSection as HTMLElement;
        hiddenATSSection.style.display = 'none';
      }
    }

    // Hide empty Load Bank section
    let hiddenLoadBankSection: HTMLElement | null = null;
    if (!hasLoadBankData(formData)) {
      const loadBankSection = document.querySelector('[data-section="load-bank"]');
      if (loadBankSection) {
        hiddenLoadBankSection = loadBankSection as HTMLElement;
        hiddenLoadBankSection.style.display = 'none';
      }
    }

    // Store original styles and force expand all sections using CSS
    const styleOverrides: Array<{ element: HTMLElement; originalDisplay: string }> = [];

    // Find all section cards and their content
    const sectionCards = document.querySelectorAll('.section-card');
    sectionCards.forEach(card => {
      // Find all children of section-card that might be hidden
      const children = Array.from(card.children);
      children.forEach((child, index) => {
        // Skip the header (usually first child)
        if (index > 0 && child instanceof HTMLElement) {
          const computedStyle = window.getComputedStyle(child);
          if (computedStyle.display === 'none' || child.classList.contains('hidden')) {
            styleOverrides.push({
              element: child,
              originalDisplay: child.style.display
            });
            child.style.display = 'block';
            child.classList.remove('hidden');
          }
        }
      });
    });

    // Wait for layout to settle
    await new Promise(resolve => setTimeout(resolve, 100));

    const formContainer = document.querySelector('.print-container');
    if (!formContainer) {
      throw new Error('Form container not found');
    }

    // Use lower scale for smaller file size but still good quality
    const canvas = await html2canvas(formContainer as HTMLElement, {
      scale: 1.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      removeContainer: false
    });

    const imgWidth = 210;
    const pageHeight = 297;
    const headerHeight = 30;
    const footerHeight = 15;
    const contentHeight = pageHeight - headerHeight - footerHeight;

    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    const pdf = new jsPDF('p', 'mm', 'a4', true);
    let position = headerHeight;

    // Add header to first page
    await addCustomHeaderToPDF(pdf, formData, headerHeight);

    // Add first page content with JPEG compression for smaller size
    const imgData = canvas.toDataURL('image/jpeg', 0.85);
    pdf.addImage(
      imgData,
      'JPEG',
      0,
      position,
      imgWidth,
      imgHeight,
      undefined,
      'FAST'
    );

    heightLeft -= contentHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + headerHeight;
      pdf.addPage();

      // Add header to each page
      await addCustomHeaderToPDF(pdf, formData, headerHeight);

      pdf.addImage(
        imgData,
        'JPEG',
        0,
        position,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      );
      heightLeft -= contentHeight;
    }

    // Add footer only on the last page
    const pageCount = pdf.getNumberOfPages();
    pdf.setPage(pageCount);
    await addFooterToPDF(pdf, pageHeight - footerHeight, pageCount);

    pdf.save(options.filename);

    // Restore everything
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

    // Restore original display styles
    styleOverrides.forEach(({ element, originalDisplay }) => {
      if (originalDisplay) {
        element.style.display = originalDisplay;
      } else {
        element.style.display = '';
        element.classList.add('hidden');
      }
    });

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

async function addCustomHeaderToPDF(pdf: jsPDF, formData: FormSubmission, height: number) {
  try {
    // Load the new logo
    const logoImg = await loadImage('/image copy copy.png');

    // Add logo on the left
    const logoHeight = 15;
    const logoWidth = (logoImg.width * logoHeight) / logoImg.height;
    pdf.addImage(logoImg, 'PNG', 10, 5, logoWidth, logoHeight);

    // Add Job No and Date on the right
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    pdf.setFont('helvetica', 'bold');

    const jobNo = formData.job_po_number || 'N/A';
    const date = formData.date || 'N/A';

    pdf.text('Job No:', 145, 10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(jobNo, 165, 10);

    pdf.setFont('helvetica', 'bold');
    pdf.text('Date:', 145, 16);
    pdf.setFont('helvetica', 'normal');
    pdf.text(date, 165, 16);

    // Add separator line
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(10, height - 2, 200, height - 2);

  } catch (error) {
    console.error('Error adding header:', error);
  }
}

async function addFooterToPDF(pdf: jsPDF, yPosition: number, pageNum: number) {
  try {
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(10, yPosition, 200, yPosition);

    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text(
      `Page ${pageNum}`,
      105,
      yPosition + 8,
      { align: 'center' }
    );

    pdf.text(
      'Legacy Power Systems - An Ontivity Company',
      105,
      yPosition + 12,
      { align: 'center' }
    );
  } catch (error) {
    console.error('Error adding footer:', error);
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
