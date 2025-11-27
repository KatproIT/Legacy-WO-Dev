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

    // Expand ALL collapsible sections before capturing
    const collapsibleHeaders = printContainer.querySelectorAll('.section-header.cursor-pointer');

    collapsibleHeaders.forEach((header) => {
      const parent = header.parentElement;
      if (parent) {
        // Look for the content div which should be a sibling of the header
        // If there are only 1 or 2 children in parent, section is likely collapsed
        const children = Array.from(parent.children);
        const hasContent = children.some(child =>
          child !== header &&
          child.querySelector('input, select, textarea, .grid')
        );

        // If no form content found, section is collapsed - click to expand
        if (!hasContent) {
          (header as HTMLElement).click();
        }
      }
    });

    // Wait for sections to expand and content to render fully
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Clone the container to avoid messing with the actual DOM
    const clonedContainer = printContainer.cloneNode(true) as HTMLElement;
    clonedContainer.style.position = 'absolute';
    clonedContainer.style.left = '-9999px';
    clonedContainer.style.top = '0';
    clonedContainer.style.width = '1200px';
    clonedContainer.style.backgroundColor = '#ffffff';
    document.body.appendChild(clonedContainer);

    // Remove all no-print elements from clone
    const noPrintElements = clonedContainer.querySelectorAll('.no-print');
    noPrintElements.forEach(el => el.remove());

    // Show ALL hidden elements in the clone
    const hiddenElements = clonedContainer.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.classList.remove('hidden');
      htmlEl.style.display = 'block';
      htmlEl.style.visibility = 'visible';
      htmlEl.style.opacity = '1';
    });

    // Convert all select dropdowns to show their selected text values
    const selectElements = clonedContainer.querySelectorAll('select');
    selectElements.forEach((select) => {
      const selectedOption = select.options[select.selectedIndex];
      const selectedText = selectedOption ? selectedOption.text : '';

      // Create a div wrapper using table-cell for perfect centering
      const replacement = document.createElement('div');
      replacement.style.border = '1px solid #d1d5db';
      replacement.style.backgroundColor = '#fff';
      replacement.style.height = '48px';
      replacement.style.boxSizing = 'border-box';
      replacement.style.display = 'table';
      replacement.style.width = '100%';

      // Create inner span with table-cell display for true vertical centering
      const span = document.createElement('span');
      span.textContent = selectedText;
      span.style.display = 'table-cell';
      span.style.verticalAlign = 'middle';
      span.style.paddingLeft = '14px';
      span.style.paddingRight = '14px';
      span.style.color = '#000';
      span.style.fontSize = '14px';
      span.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      replacement.appendChild(span);
      select.parentNode?.replaceChild(replacement, select);
    });

    // Convert all input fields to divs for perfect text centering
    const inputElements = clonedContainer.querySelectorAll('input[type="text"], input[type="date"], input[type="email"], input[type="tel"], input[type="number"], input[type="time"]');
    inputElements.forEach((input) => {
      const inputValue = (input as HTMLInputElement).value || '';

      // Create a div wrapper using table-cell for perfect centering
      const replacement = document.createElement('div');
      replacement.style.border = '1px solid #d1d5db';
      replacement.style.backgroundColor = '#fff';
      replacement.style.height = '48px';
      replacement.style.boxSizing = 'border-box';
      replacement.style.display = 'table';
      replacement.style.width = '100%';

      // Create inner span with table-cell display for true vertical centering
      const span = document.createElement('span');
      span.textContent = inputValue;
      span.style.display = 'table-cell';
      span.style.verticalAlign = 'middle';
      span.style.paddingLeft = '14px';
      span.style.paddingRight = '14px';
      span.style.color = '#000';
      span.style.fontSize = '14px';
      span.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      replacement.appendChild(span);
      input.parentNode?.replaceChild(replacement, input);
    });

    // Convert textareas to divs
    const textareaElements = clonedContainer.querySelectorAll('textarea');
    textareaElements.forEach((textarea) => {
      const textareaValue = (textarea as HTMLTextAreaElement).value || '';

      // Create a div that looks like the textarea
      const replacement = document.createElement('div');
      replacement.textContent = textareaValue;
      replacement.style.padding = '14px';
      replacement.style.border = '1px solid #d1d5db';
      replacement.style.backgroundColor = '#fff';
      replacement.style.color = '#000';
      replacement.style.fontSize = '14px';
      replacement.style.lineHeight = '1.5';
      replacement.style.minHeight = '80px';
      replacement.style.boxSizing = 'border-box';
      replacement.style.display = 'block';
      replacement.style.whiteSpace = 'pre-wrap';
      replacement.style.wordWrap = 'break-word';
      replacement.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      textarea.parentNode?.replaceChild(replacement, textarea);
    });

    // Hide financial sections for customer copy
    if (!options.includeFinancialData) {
      const financialSections = [
        '[data-section="parts-supplies"]',
        '[data-section="time-on-job"]',
        '[data-section="additional-charges"]',
        '[data-section="totals"]'
      ];

      financialSections.forEach(selector => {
        const section = clonedContainer.querySelector(selector);
        if (section) {
          (section as HTMLElement).remove();
        }
      });
    }

    // Hide empty sections
    const atsSection = clonedContainer.querySelector('[data-section="additional-ats"]');
    const loadBankSection = clonedContainer.querySelector('[data-section="load-bank"]');

    if (atsSection && !hasAdditionalATSData(formData)) {
      atsSection.remove();
    }

    if (loadBankSection && !hasLoadBankData(formData)) {
      loadBankSection.remove();
    }

    // Wait for any images or fonts to load
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create canvas with optimized settings
    const canvas = await html2canvas(clonedContainer, {
      scale: 1.5, // Reduced from 2 for smaller file size
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
      imageTimeout: 0,
      removeContainer: false,
    });

    // Remove cloned container
    document.body.removeChild(clonedContainer);

    // PDF setup
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm

    const headerHeight = 25;
    const footerHeight = 20;
    const contentMargin = 10;
    const availableHeight = pageHeight - headerHeight - footerHeight;

    // Load logo
    const logo = new Image();
    logo.src = '/image.png';
    await new Promise((resolve) => {
      logo.onload = resolve;
      logo.onerror = resolve;
      setTimeout(resolve, 1000); // Timeout after 1 second
    });

    // Convert canvas to base64 with JPEG compression for smaller size
    const imgData = canvas.toDataURL('image/jpeg', 0.85); // JPEG with 85% quality instead of PNG

    // Calculate content dimensions
    const imgWidth = pageWidth - (contentMargin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let currentY = 0;
    let pageNumber = 1;

    // Function to add header
    const addHeader = (pdf: jsPDF) => {
      // Add logo
      try {
        pdf.addImage(logo, 'PNG', contentMargin, 5, 40, 15);
      } catch (e) {
        console.warn('Could not add logo');
      }

      // Add job number
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Job #: ${formData.job_number || 'N/A'}`, pageWidth - contentMargin, 15, { align: 'right' });

      // Separator line
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(contentMargin, headerHeight - 2, pageWidth - contentMargin, headerHeight - 2);
    };

    // Function to add footer
    const addFooter = (pdf: jsPDF, pageNum: number) => {
      const footerY = pageHeight - footerHeight + 5;

      // Separator line
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(contentMargin, footerY - 3, pageWidth - contentMargin, footerY - 3);

      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);

      // Contact info
      pdf.text('ORLANDO: 321-236-9400 | ORLANDO@LEGACYPS.COM', pageWidth / 2, footerY + 2, { align: 'center' });
      pdf.text('MIAMI: 305-817-4950 | MIAMI@LEGACYPS.COM', pageWidth / 2, footerY + 6, { align: 'center' });
      pdf.text('WEST PALM BEACH: 561-429-5294 | WPB@LEGACYPS.COM', pageWidth / 2, footerY + 10, { align: 'center' });

      // Page number
      pdf.setFontSize(9);
      pdf.text(`Page ${pageNum}`, pageWidth - contentMargin, pageHeight - 8, { align: 'right' });
    };

    // Add pages
    while (currentY < imgHeight) {
      if (pageNumber > 1) {
        pdf.addPage();
      }

      // Add header and footer
      addHeader(pdf);
      addFooter(pdf, pageNumber);

      // Calculate how much content fits on this page
      const remainingHeight = imgHeight - currentY;
      const heightToAdd = Math.min(remainingHeight, availableHeight);

      // Add content slice
      const sourceY = (currentY / imgHeight) * canvas.height;
      const sourceHeight = (heightToAdd / imgHeight) * canvas.height;

      // Create a temporary canvas for this page slice
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = sourceHeight;
      const tempCtx = tempCanvas.getContext('2d');

      if (tempCtx) {
        tempCtx.drawImage(
          canvas,
          0, sourceY,
          canvas.width, sourceHeight,
          0, 0,
          canvas.width, sourceHeight
        );

        const sliceData = tempCanvas.toDataURL('image/jpeg', 0.85);
        const sliceHeight = (sourceHeight * imgWidth) / canvas.width;

        pdf.addImage(
          sliceData,
          'JPEG',
          contentMargin,
          headerHeight,
          imgWidth,
          sliceHeight
        );
      }

      currentY += heightToAdd;
      pageNumber++;
    }

    // Save PDF
    pdf.save(options.filename);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
