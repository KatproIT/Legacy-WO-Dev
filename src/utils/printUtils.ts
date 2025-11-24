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
    const elementsToHide = document.querySelectorAll('.no-print');
    elementsToHide.forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });

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
          (section as HTMLElement).style.display = 'none';
        }
      });
    }

    if (!hasAdditionalATSData(formData)) {
      const atsSection = document.querySelector('[data-section="additional-ats"]');
      if (atsSection) {
        (atsSection as HTMLElement).style.display = 'none';
      }
    }

    if (!hasLoadBankData(formData)) {
      const loadBankSection = document.querySelector('[data-section="load-bank"]');
      if (loadBankSection) {
        (loadBankSection as HTMLElement).style.display = 'none';
      }
    }

    const collapsedSections = document.querySelectorAll('[data-collapsed="true"]');
    collapsedSections.forEach(section => {
      const content = section.querySelector('[data-collapse-content]');
      if (content) {
        (content as HTMLElement).classList.remove('hidden');
      }
    });

    const formContainer = document.querySelector('.print-container');
    if (!formContainer) {
      throw new Error('Form container not found');
    }

    const canvas = await html2canvas(formContainer as HTMLElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgWidth = 210;
    const pageHeight = 297;
    const headerHeight = 25;
    const footerHeight = 15;
    const contentHeight = pageHeight - headerHeight - footerHeight;

    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = headerHeight;

    await addHeaderToPDF(pdf, headerHeight);

    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      0,
      position,
      imgWidth,
      imgHeight
    );

    heightLeft -= contentHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + headerHeight;
      pdf.addPage();
      await addHeaderToPDF(pdf, headerHeight);
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= contentHeight;
    }

    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      await addFooterToPDF(pdf, pageHeight - footerHeight, i, pageCount);
    }

    pdf.save(options.filename);

    elementsToHide.forEach(el => {
      (el as HTMLElement).style.display = '';
    });

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
          (section as HTMLElement).style.display = '';
        }
      });
    }

    const atsSection = document.querySelector('[data-section="additional-ats"]');
    if (atsSection) {
      (atsSection as HTMLElement).style.display = '';
    }

    const loadBankSection = document.querySelector('[data-section="load-bank"]');
    if (loadBankSection) {
      (loadBankSection as HTMLElement).style.display = '';
    }

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

async function addHeaderToPDF(pdf: jsPDF, height: number) {
  try {
    const headerImg = await loadImage('/image.png');
    const imgWidth = 210;
    const imgHeight = (headerImg.height * imgWidth) / headerImg.width;
    pdf.addImage(headerImg, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, height));
  } catch (error) {
    console.error('Error adding header:', error);
  }
}

async function addFooterToPDF(pdf: jsPDF, yPosition: number, pageNum: number, totalPages: number) {
  try {
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(10, yPosition, 200, yPosition);

    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text(
      `Page ${pageNum} of ${totalPages}`,
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
