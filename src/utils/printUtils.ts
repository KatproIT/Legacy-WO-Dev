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

    const hasATSData = hasAdditionalATSData(formData);
    const hasLBData = hasLoadBankData(formData);

    if (hasATSData || hasLBData) {
      const atsSection = printContainer.querySelector('[data-section="additional-ats"]');
      const loadBankSection = printContainer.querySelector('[data-section="load-bank"]');

      if (hasATSData && atsSection) {
        const atsHeader = atsSection.querySelector('.section-header.cursor-pointer, h2.cursor-pointer');
        if (atsHeader) {
          const parent = atsHeader.parentElement;
          if (parent) {
            const children = Array.from(parent.children);
            const hasContent = children.some(child =>
              child !== atsHeader &&
              child.querySelector('input, select, textarea, .grid')
            );
            if (!hasContent) {
              (atsHeader as HTMLElement).click();
            }
          }
        }
      }

      if (hasLBData && loadBankSection) {
        const lbHeader = loadBankSection.querySelector('.section-header.cursor-pointer, h2.cursor-pointer');
        if (lbHeader) {
          const parent = lbHeader.parentElement;
          if (parent) {
            const children = Array.from(parent.children);
            const hasContent = children.some(child =>
              child !== lbHeader &&
              child.querySelector('input, select, textarea, .grid')
            );
            if (!hasContent) {
              (lbHeader as HTMLElement).click();
            }
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Extract all form values from the ORIGINAL (expanded) DOM
    const originalSelects = printContainer.querySelectorAll('select');
    const selectValues = Array.from(originalSelects).map(select => {
      const selectedOption = select.options[select.selectedIndex];
      return selectedOption ? selectedOption.text : '';
    });

    const originalInputs = printContainer.querySelectorAll('input[type="text"], input[type="date"], input[type="email"], input[type="tel"], input[type="number"], input[type="time"]');
    const inputValues = Array.from(originalInputs).map(input => (input as HTMLInputElement).value || '');

    const originalCheckboxes = printContainer.querySelectorAll('input[type="checkbox"]');
    const checkboxValues = Array.from(originalCheckboxes).map(checkbox => (checkbox as HTMLInputElement).checked);

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

    // Remove all buttons and interactive elements to make it look like a proper form
    const buttons = clonedContainer.querySelectorAll('button');
    buttons.forEach(btn => btn.remove());

    // Remove navigation and UI controls
    const navElements = clonedContainer.querySelectorAll('nav, .navigation, .nav-bar');
    navElements.forEach(el => el.remove());

    // Remove any action menus, dropdowns, or control panels
    const controlElements = clonedContainer.querySelectorAll('.action-menu, .dropdown-menu, .controls, .toolbar');
    controlElements.forEach(el => el.remove());

    // Fix table layouts after removing no-print columns
    const tables = clonedContainer.querySelectorAll('table');
    tables.forEach(table => {
      (table as HTMLElement).style.tableLayout = 'auto';
      (table as HTMLElement).style.width = '100%';
      (table as HTMLElement).style.borderCollapse = 'collapse';
      (table as HTMLElement).style.marginBottom = '20px';
      (table as HTMLElement).style.marginTop = '10px';
    });

    // Enhanced table cell spacing and page break handling
    const tableCells = clonedContainer.querySelectorAll('td, th');
    tableCells.forEach(cell => {
      (cell as HTMLElement).style.padding = '14px 12px';
      (cell as HTMLElement).style.minHeight = '42px';
      (cell as HTMLElement).style.lineHeight = '1.5';
      (cell as HTMLElement).style.verticalAlign = 'middle';
    });

    // Prevent mid-row page breaks
    const tableRows = clonedContainer.querySelectorAll('tr');
    tableRows.forEach(row => {
      (row as HTMLElement).style.pageBreakInside = 'avoid';
    });

    // Add spacing between major sections
    const sections = clonedContainer.querySelectorAll('[data-section]');
    sections.forEach(section => {
      (section as HTMLElement).style.marginBottom = '25px';
    });

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
      replacement.style.height = '52px';
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
      span.style.fontSize = '16px';
      span.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      replacement.appendChild(span);
      select.parentNode?.replaceChild(replacement, select);
    });

    // Convert all input fields using extracted values
    const inputElements = clonedContainer.querySelectorAll('input[type="text"], input[type="date"], input[type="email"], input[type="tel"], input[type="number"], input[type="time"]');
    inputElements.forEach((input, index) => {
      const inputValue = inputValues[index] || '';
      const isInTable = input.closest('table') !== null;

      // Create a div wrapper using table-cell for perfect centering
      const replacement = document.createElement('div');
      replacement.style.border = isInTable ? 'none' : '1px solid #d1d5db';
      replacement.style.backgroundColor = '#fff';
      replacement.style.height = isInTable ? 'auto' : '52px';
      replacement.style.minHeight = isInTable ? '38px' : '52px';
      replacement.style.boxSizing = 'border-box';
      replacement.style.display = isInTable ? 'block' : 'table';
      replacement.style.width = '100%';
      replacement.style.padding = isInTable ? '11px' : '0';

      // Create inner span with table-cell display for true vertical centering
      const span = document.createElement('span');
      span.textContent = inputValue;
      span.style.display = isInTable ? 'block' : 'table-cell';
      span.style.verticalAlign = 'middle';
      span.style.paddingLeft = isInTable ? '0' : '14px';
      span.style.paddingRight = isInTable ? '0' : '14px';
      span.style.color = '#000';
      span.style.fontSize = isInTable ? '14px' : '16px';
      span.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      span.style.textAlign = 'left';
      span.style.wordWrap = 'break-word';
      span.style.overflowWrap = 'break-word';
      span.style.lineHeight = '1.4';

      replacement.appendChild(span);
      input.parentNode?.replaceChild(replacement, input);
    });

    // Convert checkboxes to visible checked/unchecked symbols
    const checkboxElements = clonedContainer.querySelectorAll('input[type="checkbox"]');
    checkboxElements.forEach((checkbox, index) => {
      const isChecked = checkboxValues[index] || false;

      const replacement = document.createElement('span');
      replacement.textContent = isChecked ? '☑' : '☐';
      replacement.style.fontSize = '20px';
      replacement.style.color = '#000';
      replacement.style.display = 'inline-block';
      replacement.style.width = '22px';
      replacement.style.height = '22px';
      replacement.style.textAlign = 'center';
      replacement.style.lineHeight = '22px';

      checkbox.parentNode?.replaceChild(replacement, checkbox);
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
      replacement.style.fontSize = '15px';
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
      scale: 2, // Higher quality rendering for sharper text and borders
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

    const firstPageHeaderHeight = 30; // Full header with addresses and locations
    const subsequentPageHeaderHeight = 20; // Just logo
    const footerHeight = 10;
    const contentMargin = 10;

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
    const addHeader = (pdf: jsPDF, isFirstPage: boolean = false) => {
      if (!isFirstPage) {
        // Subsequent pages: only logo
        const simpleHeaderHeight = 20;
        pdf.setFillColor(248, 249, 250);
        pdf.rect(0, 0, pageWidth, simpleHeaderHeight, 'F');

        try {
          const logoWidth = 40;
          const logoAspectRatio = logo.naturalWidth / logo.naturalHeight;
          const logoHeight = logoWidth / logoAspectRatio;
          pdf.addImage(logo, 'PNG', contentMargin, 5, logoWidth, logoHeight);
        } catch (e) {
          console.warn('Could not add logo');
        }

        // Bottom separator line
        pdf.setDrawColor(30, 58, 138);
        pdf.setLineWidth(0.8);
        pdf.line(contentMargin, simpleHeaderHeight, pageWidth - contentMargin, simpleHeaderHeight);
        return;
      }

      // First page: Full header with logo, job number, addresses, and branch locations
      pdf.setFillColor(248, 249, 250);
      pdf.rect(0, 0, pageWidth, firstPageHeaderHeight - 2, 'F');

      // Add logo
      try {
        const logoWidth = 40;
        const logoAspectRatio = logo.naturalWidth / logo.naturalHeight;
        const logoHeight = logoWidth / logoAspectRatio;
        pdf.addImage(logo, 'PNG', contentMargin, 4, logoWidth, logoHeight);
      } catch (e) {
        console.warn('Could not add logo');
      }

      // Job number section - single line format
      const jobBoxWidth = 60;
      const jobBoxHeight = 8;
      const jobBoxX = pageWidth - contentMargin - jobBoxWidth;
      const jobBoxY = 4;

      pdf.setFillColor(30, 58, 138);
      pdf.roundedRect(jobBoxX, jobBoxY, jobBoxWidth, jobBoxHeight, 1.5, 1.5, 'F');

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      const jobText = `Job No# ${formData.job_po_number || 'N/A'}`;
      pdf.text(jobText, jobBoxX + jobBoxWidth / 2, jobBoxY + 5.5, { align: 'center' });

      // Professional divider line after logo/job section
      pdf.setDrawColor(30, 58, 138);
      pdf.setLineWidth(0.5);
      pdf.line(contentMargin, 16, pageWidth - contentMargin, 16);

      // Branch locations
      const locationsStartY = 20;
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 58, 138);

      const locations = [
        { name: 'Western WA (HQ)', addr: '8102 Skansie Ave', city: 'Gig Harbor, WA 98332', phone: '(253) 858-0214' },
        { name: 'Inland WA & RMR', addr: '1566 E. Weber Rd', city: 'Ritzville, WA 99169', phone: '(509) 659-4470' },
        { name: 'Salem, OR', addr: '5873 State Street', city: 'Salem, OR', phone: '(541) 525-8140' },
        { name: 'Three Forks, MT', addr: '1600 Bench RD', city: 'PO Box 648', phone: 'Three Forks, MT 59752' },
        { name: 'Nampa, ID', addr: '2024 N Elder St', city: 'Nampa, ID', phone: '(208) 703-2183' }
      ];

      const colWidth = (pageWidth - (contentMargin * 2)) / 5;
      let xPos = contentMargin;

      locations.forEach((loc, index) => {
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 58, 138);
        pdf.text(loc.name, xPos, locationsStartY);

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60, 60, 60);
        pdf.text(loc.addr, xPos, locationsStartY + 3);
        pdf.text(loc.city, xPos, locationsStartY + 6);

        if (index < locations.length - 1) {
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.2);
          pdf.line(xPos + colWidth - 1, locationsStartY - 1, xPos + colWidth - 1, locationsStartY + 7);
        }

        xPos += colWidth;
      });

      // Bottom separator line
      pdf.setDrawColor(30, 58, 138);
      pdf.setLineWidth(0.8);
      pdf.line(contentMargin, 30, pageWidth - contentMargin, 30);
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

      const isFirstPage = pageNumber === 1;
      const currentHeaderHeight = isFirstPage ? firstPageHeaderHeight : subsequentPageHeaderHeight;
      const availableHeight = pageHeight - currentHeaderHeight - footerHeight;

      // Add header and footer
      addHeader(pdf, isFirstPage);
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
          currentHeaderHeight,
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
