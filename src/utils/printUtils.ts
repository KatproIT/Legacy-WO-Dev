import { FormSubmission } from '../types/form';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

    // Store original state
    const originalBodyClass = document.body.className;
    const originalDisplay = (printContainer as HTMLElement).style.display;

    // Apply customer copy class if needed
    if (!options.includeFinancialData) {
      document.body.classList.add('customer-copy');
    }

    // Hide empty sections
    const atsSection = document.querySelector('[data-section="additional-ats"]') as HTMLElement;
    const loadBankSection = document.querySelector('[data-section="load-bank"]') as HTMLElement;
    const originalATSDisplay = atsSection?.style.display;
    const originalLoadBankDisplay = loadBankSection?.style.display;

    if (atsSection && !hasAdditionalATSData(formData)) {
      atsSection.style.display = 'none';
    }

    if (loadBankSection && !hasLoadBankData(formData)) {
      loadBankSection.style.display = 'none';
    }

    // Show all hidden sections temporarily
    const hiddenElements: { element: HTMLElement; originalDisplay: string }[] = [];
    const allHiddenElements = printContainer.querySelectorAll('.hidden');

    allHiddenElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      // Skip if it's a financial section in customer copy mode
      if (!options.includeFinancialData) {
        const section = htmlEl.closest('[data-section]');
        const sectionType = section?.getAttribute('data-section');
        if (sectionType && ['parts-supplies', 'time-on-job', 'additional-charges', 'totals'].includes(sectionType)) {
          return;
        }
      }

      hiddenElements.push({ element: htmlEl, originalDisplay: htmlEl.style.display });
      htmlEl.style.display = 'block';
    });

    // Hide no-print elements
    const noPrintElements = document.querySelectorAll('.no-print');
    noPrintElements.forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });

    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 300));

    // Create canvas from content
    const canvas = await html2canvas(printContainer as HTMLElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
    });

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF('p', 'mm', 'a4');

    // Header and footer dimensions
    const headerHeight = 25;
    const footerHeight = 20;
    const contentHeight = pageHeight - headerHeight - footerHeight;

    let heightLeft = imgHeight;
    let position = 0;
    let pageNumber = 1;

    // Add logo for header
    const logo = new Image();
    logo.src = '/image.png';
    await new Promise((resolve) => {
      logo.onload = resolve;
      logo.onerror = resolve;
    });

    // Function to add header
    const addHeader = (pdf: jsPDF, pageNum: number) => {
      // Add logo
      try {
        pdf.addImage(logo, 'PNG', 10, 5, 40, 15);
      } catch (e) {
        console.warn('Could not add logo to PDF');
      }

      // Add job number
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Job #: ${formData.job_number || 'N/A'}`, 200, 15, { align: 'right' });

      // Add line
      pdf.setLineWidth(0.5);
      pdf.line(10, headerHeight, 200, headerHeight);
    };

    // Function to add footer
    const addFooter = (pdf: jsPDF, pageNum: number, totalPages: number) => {
      const footerY = pageHeight - footerHeight + 5;

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');

      // Contact info
      pdf.text('ORLANDO: 321-236-9400 | ORLANDO@LEGACYPS.COM', 105, footerY, { align: 'center' });
      pdf.text('MIAMI: 305-817-4950 | MIAMI@LEGACYPS.COM', 105, footerY + 4, { align: 'center' });
      pdf.text('WEST PALM BEACH: 561-429-5294 | WPB@LEGACYPS.COM', 105, footerY + 8, { align: 'center' });

      // Page number
      pdf.setFontSize(10);
      pdf.text(`Page ${pageNum}`, 200, pageHeight - 10, { align: 'right' });

      // Add line
      pdf.setLineWidth(0.5);
      pdf.line(10, footerY - 5, 200, footerY - 5);
    };

    // Add first page with header and footer
    addHeader(pdf, pageNumber);

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, headerHeight, imgWidth, imgHeight);

    addFooter(pdf, pageNumber, Math.ceil(imgHeight / contentHeight));

    heightLeft -= contentHeight;
    position = -contentHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      pageNumber++;
      pdf.addPage();
      addHeader(pdf, pageNumber);
      pdf.addImage(imgData, 'PNG', 0, position + headerHeight, imgWidth, imgHeight);
      addFooter(pdf, pageNumber, Math.ceil(imgHeight / contentHeight));

      heightLeft -= contentHeight;
      position -= contentHeight;
    }

    // Save PDF
    pdf.save(options.filename);

    // Restore original state
    hiddenElements.forEach(({ element, originalDisplay }) => {
      element.style.display = originalDisplay;
    });

    noPrintElements.forEach(el => {
      (el as HTMLElement).style.display = '';
    });

    if (atsSection) {
      atsSection.style.display = originalATSDisplay || '';
    }

    if (loadBankSection) {
      loadBankSection.style.display = originalLoadBankDisplay || '';
    }

    document.body.className = originalBodyClass;

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
