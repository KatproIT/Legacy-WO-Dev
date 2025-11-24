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
    // Step 1: Track which sections are collapsed and expand ALL of them
    const sectionHeaders = document.querySelectorAll('.section-header');
    const collapsedHeaders: HTMLElement[] = [];

    // Identify collapsed sections BEFORE clicking
    sectionHeaders.forEach(header => {
      const parent = header.parentElement;
      if (parent) {
        // Check if content is visible
        const contentElements = Array.from(parent.children).filter((child, index) =>
          index > 0 && child instanceof HTMLElement
        );

        const hasVisibleContent = contentElements.some(child => {
          const style = window.getComputedStyle(child as HTMLElement);
          return style.display !== 'none' && (child as HTMLElement).offsetHeight > 0;
        });

        // If no visible content, section is collapsed
        if (!hasVisibleContent) {
          collapsedHeaders.push(header as HTMLElement);
        }
      }
    });

    // Click all collapsed headers to expand them
    collapsedHeaders.forEach(header => {
      header.click();
    });

    // Wait for expansion animations
    await new Promise(resolve => setTimeout(resolve, 400));

    // Step 2: Hide UI elements
    const elementsToHide = document.querySelectorAll('.no-print');
    const hiddenElements: HTMLElement[] = [];
    elementsToHide.forEach(el => {
      hiddenElements.push(el as HTMLElement);
      (el as HTMLElement).style.display = 'none';
    });

    // Step 3: Hide financial data if customer copy
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

    // Step 4: Hide empty Additional ATS section
    let hiddenATSSection: HTMLElement | null = null;
    if (!hasAdditionalATSData(formData)) {
      const atsSection = document.querySelector('[data-section="additional-ats"]');
      if (atsSection) {
        hiddenATSSection = atsSection as HTMLElement;
        hiddenATSSection.style.display = 'none';
      }
    }

    // Step 5: Hide empty Load Bank section
    let hiddenLoadBankSection: HTMLElement | null = null;
    if (!hasLoadBankData(formData)) {
      const loadBankSection = document.querySelector('[data-section="load-bank"]');
      if (loadBankSection) {
        hiddenLoadBankSection = loadBankSection as HTMLElement;
        hiddenLoadBankSection.style.display = 'none';
      }
    }

    // Wait for layout to settle
    await new Promise(resolve => setTimeout(resolve, 100));

    const formContainer = document.querySelector('.print-container');
    if (!formContainer) {
      throw new Error('Form container not found');
    }

    // Step 6: Capture the form with html2canvas
    const canvas = await html2canvas(formContainer as HTMLElement, {
      scale: 1.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      removeContainer: false
    });

    // Step 7: Create PDF with proper margins and spacing
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const headerHeight = 28; // Space for header
    const footerHeight = 18; // Space for footer
    const topMargin = 8; // Extra space between header and content
    const bottomMargin = 8; // Extra space between content and footer
    const leftRightMargin = 12; // Side margins

    const contentAreaHeight = pageHeight - headerHeight - footerHeight - topMargin - bottomMargin;
    const contentAreaWidth = imgWidth - (2 * leftRightMargin);

    const imgHeight = (canvas.height * contentAreaWidth) / canvas.width;
    let heightLeft = imgHeight;

    const pdf = new jsPDF('p', 'mm', 'a4', true);
    let position = headerHeight + topMargin; // Start after header + top margin

    // Add header to first page
    await addCustomHeaderToPDF(pdf, formData, headerHeight);

    // Add first page content with JPEG compression
    const imgData = canvas.toDataURL('image/jpeg', 0.85);
    pdf.addImage(
      imgData,
      'JPEG',
      leftRightMargin,
      position,
      contentAreaWidth,
      imgHeight,
      undefined,
      'FAST'
    );

    heightLeft -= contentAreaHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + headerHeight + topMargin;
      pdf.addPage();

      await addCustomHeaderToPDF(pdf, formData, headerHeight);

      pdf.addImage(
        imgData,
        'JPEG',
        leftRightMargin,
        position,
        contentAreaWidth,
        imgHeight,
        undefined,
        'FAST'
      );
      heightLeft -= contentAreaHeight;
    }

    // Add footer only on the last page
    const pageCount = pdf.getNumberOfPages();
    pdf.setPage(pageCount);
    await addFooterToPDF(pdf, pageHeight - footerHeight, pageCount);

    pdf.save(options.filename);

    // Step 8: Restore everything
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

    // Restore collapsed sections by clicking only the headers that were originally collapsed
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

async function addCustomHeaderToPDF(pdf: jsPDF, formData: FormSubmission, height: number) {
  try {
    // Load the logo
    const logoImg = await loadImage('/image copy.png');

    // Add logo on the left - adjusted size
    const logoHeight = 12;
    const logoWidth = (logoImg.width * logoHeight) / logoImg.height;
    pdf.addImage(logoImg, 'PNG', 10, 6, logoWidth, logoHeight);

    // Add Job No and Date on the right
    pdf.setFontSize(10);
    pdf.setTextColor(40, 40, 40);
    pdf.setFont('helvetica', 'bold');

    const jobNo = formData.job_po_number || 'N/A';
    const date = formData.date || 'N/A';

    // Right-aligned labels and values
    pdf.text('Job No:', 155, 10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(jobNo, 155, 15);

    // Add separator line
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.3);
    pdf.line(10, height - 2, 200, height - 2);

  } catch (error) {
    console.error('Error adding header:', error);
  }
}

async function addFooterToPDF(pdf: jsPDF, yPosition: number, pageNum: number) {
  try {
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.3);
    pdf.line(10, yPosition, 200, yPosition);

    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);

    pdf.text(
      'Legacy Power Systems - An Ontivity Company',
      105,
      yPosition + 6,
      { align: 'center' }
    );

    pdf.text(
      `Page ${pageNum}`,
      105,
      yPosition + 10,
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
