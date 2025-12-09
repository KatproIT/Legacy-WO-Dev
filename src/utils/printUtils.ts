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

    // Extract all form values from the ORIGINAL (expanded) DOM
    const originalSelects = printContainer.querySelectorAll('select');
    const selectValues = Array.from(originalSelects).map(select => {
      const selectedOption = select.options[select.selectedIndex];
      return selectedOption ? selectedOption.text : '';
    });

    const originalInputs = printContainer.querySelectorAll('input[type="text"], input[type="date"], input[type="email"], input[type="tel"], input[type="number"], input[type="time"]');
    const inputValues = Array.from(originalInputs).map(input => (input as HTMLInputElement).value || '');

    const originalTextareas = printContainer.querySelectorAll('textarea');
    const textareaValues = Array.from(originalTextareas).map(textarea => (textarea as HTMLTextAreaElement).value || '');

    // NOW clone the container with all sections expanded
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

    // Convert all select dropdowns using extracted values
    const selectElements = clonedContainer.querySelectorAll('select');
    selectElements.forEach((select, index) => {
      const selectedText = selectValues[index] || '';

      // Create a div wrapper using table-cell for perfect centering
      const replacement = document.createElement('div');
      replacement.style.border = '1px solid #d1d5db';
      replacement.style.backgroundColor = '#fff';
      replacement.style.height = '50px';
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
      span.style.fontSize = '15px';
      span.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      replacement.appendChild(span);
      select.parentNode?.replaceChild(replacement, select);
    });

    // Convert all input fields using extracted values
    const inputElements = clonedContainer.querySelectorAll('input[type="text"], input[type="date"], input[type="email"], input[type="tel"], input[type="number"], input[type="time"]');
    inputElements.forEach((input, index) => {
      const inputValue = inputValues[index] || '';

      // Create a div wrapper using table-cell for perfect centering
      const replacement = document.createElement('div');
      replacement.style.border = '1px solid #d1d5db';
      replacement.style.backgroundColor = '#fff';
      replacement.style.height = '50px';
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
      span.style.fontSize = '15px';
      span.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      replacement.appendChild(span);
      input.parentNode?.replaceChild(replacement, input);
    });

    // Convert textareas using extracted values
    const textareaElements = clonedContainer.querySelectorAll('textarea');
    textareaElements.forEach((textarea, index) => {
      const textareaValue = textareaValues[index] || '';

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

    const headerHeight = 45; // Increased to accommodate locations
    const footerHeight = 10; // Reduced, only for page number
    const contentMargin = 10;
    const availableHeight = pageHeight - headerHeight - footerHeight;

    // Load logo and footer image
    const logo = new Image();
    logo.src = '/image.png';
    const footerImage = new Image();
    footerImage.src = '/image copy copy copy copy.png';

    await Promise.all([
      new Promise((resolve) => {
        logo.onload = resolve;
        logo.onerror = resolve;
        setTimeout(resolve, 1000);
      }),
      new Promise((resolve) => {
        footerImage.onload = resolve;
        footerImage.onerror = resolve;
        setTimeout(resolve, 1000);
      })
    ]);

    // Convert canvas to base64 with JPEG compression for smaller size
    const imgData = canvas.toDataURL('image/jpeg', 0.85); // JPEG with 85% quality instead of PNG

    // Calculate content dimensions
    const imgWidth = pageWidth - (contentMargin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let currentY = 0;
    let pageNumber = 1;

    // Function to add header
    const addHeader = (pdf: jsPDF) => {
      // Dark blue top bar
      pdf.setFillColor(25, 42, 86);
      pdf.rect(0, 0, pageWidth, 18, 'F');

      // Add logo on dark background
      try {
        const logoWidth = 32;
        const logoAspectRatio = logo.naturalWidth / logo.naturalHeight;
        const logoHeight = logoWidth / logoAspectRatio;
        pdf.addImage(logo, 'PNG', contentMargin + 2, 4, logoWidth, logoHeight);
      } catch (e) {
        console.warn('Could not add logo');
      }

      // Job number in top bar
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(180, 180, 180);
      const jobLabelX = pageWidth - contentMargin - 42;
      pdf.text('Job Number:', jobLabelX, 9, { align: 'left' });

      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text(formData.job_po_number || 'N/A', jobLabelX, 15, { align: 'left' });

      // White background for locations section
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 18, pageWidth, 25, 'F');

      // Locations header
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(25, 42, 86);
      pdf.text('SERVICE LOCATIONS', contentMargin, 23);

      // Thin separator under header
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.3);
      pdf.line(contentMargin, 24.5, pageWidth - contentMargin, 24.5);

      // Location boxes in a grid
      const locations = [
        { name: 'Western WA (HQ)', addr: '8102 Skansie Ave', city: 'Gig Harbor, WA 98332', phone: '(253) 858-0214' },
        { name: 'Inland WA & RMR', addr: '1566 E. Weber Rd', city: 'Ritzville, WA 99169', phone: '(509) 659-4470' },
        { name: 'Salem, OR', addr: '5873 State Street', city: 'Salem, OR', phone: '(541) 525-8140' },
        { name: 'Three Forks, MT', addr: '1600 Bench RD', city: 'PO Box 648, Three Forks, MT 59752', phone: '' },
        { name: 'Nampa, ID', addr: '2024 N Elder St', city: 'Nampa, ID', phone: '(208) 703-2183' }
      ];

      const boxStartY = 27;
      const boxWidth = (pageWidth - (contentMargin * 2) - 8) / 5;
      const boxSpacing = 2;
      let xPos = contentMargin;

      locations.forEach((loc, index) => {
        // Light box background
        pdf.setFillColor(250, 250, 252);
        pdf.roundedRect(xPos, boxStartY, boxWidth, 13, 0.8, 0.8, 'FD');
        pdf.setDrawColor(230, 230, 235);
        pdf.setLineWidth(0.2);

        // Location name with small icon-like square
        pdf.setFillColor(25, 42, 86);
        pdf.rect(xPos + 1, boxStartY + 1.5, 1, 1, 'F');

        pdf.setFontSize(5.8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(25, 42, 86);
        pdf.text(loc.name, xPos + 3, boxStartY + 2.5);

        // Address in smaller font
        pdf.setFontSize(5.2);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(70, 70, 70);
        pdf.text(loc.addr, xPos + 1.5, boxStartY + 5.5);
        pdf.text(loc.city, xPos + 1.5, boxStartY + 8);

        // Phone number
        if (loc.phone) {
          pdf.setFontSize(5.5);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(0, 0, 0);
          pdf.text(loc.phone, xPos + 1.5, boxStartY + 11);
        }

        xPos += boxWidth + boxSpacing;
      });

      // Bottom accent line
      pdf.setDrawColor(25, 42, 86);
      pdf.setLineWidth(1.2);
      pdf.line(0, headerHeight - 2, pageWidth, headerHeight - 2);
    };

    // Function to add footer
    const addFooter = (pdf: jsPDF, pageNum: number) => {
      const footerY = pageHeight - footerHeight;

      // Black separator line
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.line(contentMargin, footerY, pageWidth - contentMargin, footerY);

      // Page number at bottom right
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Page ${pageNum}`, pageWidth - contentMargin, pageHeight - 4, { align: 'right' });
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
