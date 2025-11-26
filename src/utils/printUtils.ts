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

    await new Promise(resolve => setTimeout(resolve, 100));

    const formContainer = document.querySelector('.print-container');
    if (!formContainer) {
      throw new Error('Form container not found');
    }

    // Step 7: Capture the form with html2canvas
    const canvas = await html2canvas(formContainer as HTMLElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      removeContainer: false,
      windowWidth: 1200,
      width: (formContainer as HTMLElement).scrollWidth,
      height: (formContainer as HTMLElement).scrollHeight
    });

    // Step 8: Create PDF with proper page layout
    const pdf = new jsPDF('p', 'mm', 'a4', true);
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm

    // Load header and footer images
    const headerImg = await loadImage('/image copy.png');
    const footerImg = await loadImage('/image copy copy copy.png');

    // Calculate dimensions
    const headerHeight = 25;
    const footerHeight = 35;
    const marginTop = 5;
    const marginBottom = 5;
    const marginLeft = 10;
    const marginRight = 10;

    const contentAreaTop = headerHeight + marginTop;
    const contentAreaBottom = pageHeight - footerHeight - marginBottom;
    const contentAreaHeight = contentAreaBottom - contentAreaTop;
    const contentAreaWidth = pageWidth - marginLeft - marginRight;

    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/jpeg', 0.9);
    const imgWidth = contentAreaWidth;
    const imgHeight = (canvas.height * contentAreaWidth) / canvas.width;

    // Calculate how many pages we need
    let remainingHeight = imgHeight;
    let currentYPosition = 0;
    let pageNumber = 1;

    // Function to add header and footer to current page
    const addHeaderFooter = async (pageNum: number) => {
      // Add header image (logo)
      const headerImgHeight = 15;
      const headerImgWidth = (headerImg.width * headerImgHeight) / headerImg.height;
      pdf.addImage(headerImg, 'PNG', marginLeft, 5, headerImgWidth, headerImgHeight);

      // Add job info to header
      pdf.setFontSize(9);
      pdf.setTextColor(40, 40, 40);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Job No:', pageWidth - 50, 10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formData.job_po_number || 'N/A', pageWidth - 50, 15);

      // Add header line
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(marginLeft, headerHeight, pageWidth - marginRight, headerHeight);

      // Add footer image
      const footerImgHeight = 30;
      const footerImgWidth = pageWidth - marginLeft - marginRight;
      const footerY = contentAreaBottom + marginBottom;
      pdf.addImage(footerImg, 'PNG', marginLeft, footerY, footerImgWidth, footerImgHeight);

      // Add page number
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 3, { align: 'center' });
    };

    // First page
    await addHeaderFooter(pageNumber);

    // Add content for first page
    if (imgHeight <= contentAreaHeight) {
      // Content fits on one page
      pdf.addImage(
        imgData,
        'JPEG',
        marginLeft,
        contentAreaTop,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      );
    } else {
      // Content spans multiple pages
      pdf.addImage(
        imgData,
        'JPEG',
        marginLeft,
        contentAreaTop,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      );

      remainingHeight -= contentAreaHeight;
      currentYPosition = contentAreaHeight;

      // Add subsequent pages
      while (remainingHeight > 0) {
        pdf.addPage();
        pageNumber++;

        await addHeaderFooter(pageNumber);

        const yOffset = contentAreaTop - currentYPosition;

        pdf.addImage(
          imgData,
          'JPEG',
          marginLeft,
          yOffset,
          imgWidth,
          imgHeight,
          undefined,
          'FAST'
        );

        currentYPosition += contentAreaHeight;
        remainingHeight -= contentAreaHeight;
      }
    }

    // Save the PDF
    pdf.save(options.filename);

    // Step 9: Restore everything
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
