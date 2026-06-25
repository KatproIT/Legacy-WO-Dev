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

    const collapsibleHeaders = printContainer.querySelectorAll('.section-header.cursor-pointer, h2.cursor-pointer');

    collapsibleHeaders.forEach((header) => {
      const parent = header.parentElement;
      if (parent) {
        const children = Array.from(parent.children);
        const hasContent = children.some(child =>
          child !== header &&
          child.querySelector('input, select, textarea, .grid, table')
        );
        if (!hasContent) {
          (header as HTMLElement).click();
        }
      }
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Extract all form values from the ORIGINAL (expanded) DOM
    const originalSelects = printContainer.querySelectorAll('select');
    const selectValues = Array.from(originalSelects).map(select => {
      const selectedOption = select.options[select.selectedIndex];
      return selectedOption ? selectedOption.text : '';
    });

    const originalInputs = printContainer.querySelectorAll('input[type="text"], input[type="date"], input[type="month"], input[type="email"], input[type="tel"], input[type="number"], input[type="time"]');
    const inputValues = Array.from(originalInputs).map(input => {
      const el = input as HTMLInputElement;
      if (el.type === 'month' && el.value) {
        const [year, month] = el.value.split('-');
        return `${month}/${year}`;
      }
      return el.value || '';
    });

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
    clonedContainer.style.fontFamily = '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif';
    clonedContainer.style.paddingTop = '0';
    document.body.appendChild(clonedContainer);

    // Handle Load Bank table DEL column removal BEFORE other no-print elements
    const loadBankTables = clonedContainer.querySelectorAll('table[data-table-type="load-bank"]');
    loadBankTables.forEach(table => {
      const thead = table.querySelector('thead');
      if (thead) {
        const firstRow = thead.querySelector('tr:first-child');
        if (firstRow) {
          const cells = firstRow.querySelectorAll('th');
          cells.forEach(th => {
            const headerText = th.textContent?.trim();
            if (headerText === 'DEL') {
              th.remove();
            }
          });
        }
      }

      const bodyRows = table.querySelectorAll('tbody tr');
      bodyRows.forEach(row => {
        const lastCell = row.querySelector('td:last-child');
        if (lastCell && lastCell.querySelector('button')) {
          lastCell.remove();
        }
      });
    });

    // Remove all other no-print elements from clone
    const noPrintElements = clonedContainer.querySelectorAll('.no-print');
    noPrintElements.forEach(el => el.remove());

    // Remove top margin from first visible child to eliminate gap after header
    const firstChild = clonedContainer.firstElementChild as HTMLElement;
    if (firstChild) {
      firstChild.style.marginTop = '0';
    }
    const allChildren = clonedContainer.querySelectorAll(':scope > *');
    allChildren.forEach(child => {
      (child as HTMLElement).style.marginTop = '0';
    });

    const buttons = clonedContainer.querySelectorAll('button');
    buttons.forEach(btn => btn.remove());

    const navElements = clonedContainer.querySelectorAll('nav, .navigation, .nav-bar');
    navElements.forEach(el => el.remove());

    const controlElements = clonedContainer.querySelectorAll('.action-menu, .dropdown-menu, .controls, .toolbar');
    controlElements.forEach(el => el.remove());

    // Enhanced table styling for professional invoice look
    const tables = clonedContainer.querySelectorAll('table');
    tables.forEach(table => {
      const isLoadBankTable = table.getAttribute('data-table-type') === 'load-bank';

      (table as HTMLElement).style.tableLayout = 'auto';
      (table as HTMLElement).style.width = '100%';
      (table as HTMLElement).style.borderCollapse = 'collapse';
      (table as HTMLElement).style.marginBottom = '10px';
      (table as HTMLElement).style.marginTop = '4px';
      (table as HTMLElement).style.fontFamily = '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif';

      if (isLoadBankTable) {
        (table as HTMLElement).style.border = '1.5px solid #1e293b';
        (table as HTMLElement).style.fontSize = '10px';
        (table as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
      } else {
        (table as HTMLElement).style.border = '1px solid #cbd5e1';
        (table as HTMLElement).style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
      }
    });

    // Compact table cell styling
    const tableCells = clonedContainer.querySelectorAll('td, th');
    tableCells.forEach(cell => {
      const table = cell.closest('table');
      const isLoadBankTable = table?.getAttribute('data-table-type') === 'load-bank';

      if (isLoadBankTable) {
        (cell as HTMLElement).style.border = '1px solid #475569';
        (cell as HTMLElement).style.padding = '6px 4px';
        (cell as HTMLElement).style.minHeight = '28px';
        (cell as HTMLElement).style.lineHeight = '1.4';
        (cell as HTMLElement).style.verticalAlign = 'middle';
        (cell as HTMLElement).style.textAlign = 'center';
        (cell as HTMLElement).style.fontSize = '10px';
        (cell as HTMLElement).style.fontWeight = cell.tagName === 'TH' ? '600' : '500';
        (cell as HTMLElement).style.color = '#0f172a';
        (cell as HTMLElement).style.display = '';
        (cell as HTMLElement).style.fontFamily = '"Inter", sans-serif';

        if (cell.tagName === 'TH') {
          (cell as HTMLElement).style.backgroundColor = '#e2e8f0';
          (cell as HTMLElement).style.fontWeight = '600';
          (cell as HTMLElement).style.letterSpacing = '0.02em';
        }
      } else {
        (cell as HTMLElement).style.padding = '7px 6px';
        (cell as HTMLElement).style.minHeight = '24px';
        (cell as HTMLElement).style.lineHeight = '1.3';
        (cell as HTMLElement).style.verticalAlign = 'middle';
        (cell as HTMLElement).style.fontSize = '10px';
        (cell as HTMLElement).style.fontWeight = cell.tagName === 'TH' ? '600' : '400';
        (cell as HTMLElement).style.color = '#1e293b';
        (cell as HTMLElement).style.fontFamily = '"Inter", sans-serif';

        if (cell.tagName === 'TH') {
          (cell as HTMLElement).style.backgroundColor = '#f1f5f9';
          (cell as HTMLElement).style.borderBottom = '1.5px solid #cbd5e1';
          (cell as HTMLElement).style.letterSpacing = '0.02em';
        }
      }
    });

    // FIXED: Restructure Load Bank table headers
    clonedContainer.querySelectorAll('table[data-table-type="load-bank"]').forEach(table => {
      (table as HTMLElement).style.cssText = `
        display: table !important;
        width: 100% !important;
        border-collapse: collapse !important;
        border-spacing: 0 !important;
        border: 1.5px solid #1e293b !important;
        background-color: #fff !important;
        table-layout: fixed !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08) !important;
      `;

      const thead = table.querySelector('thead');
      if (thead) {
        thead.innerHTML = '';

        const firstRow = document.createElement('tr');
        firstRow.style.cssText = `
          display: table-row !important;
          height: 32px !important;
        `;

        const secondRow = document.createElement('tr');
        secondRow.style.cssText = `
          display: table-row !important;
          height: 32px !important;
        `;

        const structure = [
          { main: 'TIME', sub: '', width: '5%', colspan: 1, type: 'single' },
          { main: 'KW', sub: '', width: '4%', colspan: 1, type: 'single' },
          { main: 'HZ', sub: '', width: '4%', colspan: 1, type: 'single' },
          { main: 'VOLTS', sub: 'A/B', width: '6.5%', colspan: 3, type: 'group-start' },
          { main: '', sub: 'B/C', width: '6.5%', colspan: 0, type: 'group-sub' },
          { main: '', sub: 'C/A', width: '6.5%', colspan: 0, type: 'group-sub' },
          { main: 'AMPS', sub: 'A', width: '4.3%', colspan: 3, type: 'group-start' },
          { main: '', sub: 'B', width: '4.3%', colspan: 0, type: 'group-sub' },
          { main: '', sub: 'C', width: '4.3%', colspan: 0, type: 'group-sub' },
          { main: 'OIL PSI', sub: '', width: '6%', colspan: 1, type: 'single' },
          { main: 'H2O °F', sub: '', width: '6%', colspan: 1, type: 'single' },
          { main: 'BATT V', sub: '', width: '6%', colspan: 1, type: 'single' }
        ];

        structure.forEach((col) => {
          if (col.type === 'single') {
            const th1 = document.createElement('th');
            th1.textContent = col.main;
            th1.setAttribute('rowspan', '2');
            th1.style.cssText = `
              display: table-cell !important;
              visibility: visible !important;
              color: #0f172a !important;
              font-size: 10px !important;
              font-weight: 600 !important;
              border: 1px solid #475569 !important;
              padding: 6px 4px !important;
              text-align: center !important;
              vertical-align: middle !important;
              background-color: #cbd5e1 !important;
              line-height: 1.3 !important;
              white-space: nowrap !important;
              width: ${col.width} !important;
              font-family: "Inter", sans-serif !important;
              letter-spacing: 0.02em !important;
            `;
            firstRow.appendChild(th1);
          } else if (col.type === 'group-start') {
            const th1 = document.createElement('th');
            th1.textContent = col.main;
            th1.setAttribute('colspan', col.colspan.toString());
            th1.style.cssText = `
              display: table-cell !important;
              visibility: visible !important;
              color: #0f172a !important;
              font-size: 10px !important;
              font-weight: 600 !important;
              border: 1px solid #475569 !important;
              padding: 6px 4px !important;
              text-align: center !important;
              vertical-align: middle !important;
              background-color: #cbd5e1 !important;
              line-height: 1.3 !important;
              white-space: nowrap !important;
              font-family: "Inter", sans-serif !important;
              letter-spacing: 0.02em !important;
            `;
            firstRow.appendChild(th1);
          }

          if (col.type === 'group-start' || col.type === 'group-sub') {
            const th2 = document.createElement('th');
            th2.textContent = col.sub;
            th2.style.cssText = `
              display: table-cell !important;
              visibility: visible !important;
              color: #0f172a !important;
              font-size: 9px !important;
              font-weight: 600 !important;
              border: 1px solid #475569 !important;
              padding: 6px 4px !important;
              text-align: center !important;
              vertical-align: middle !important;
              background-color: #e2e8f0 !important;
              line-height: 1.3 !important;
              white-space: nowrap !important;
              width: ${col.width} !important;
              font-family: "Inter", sans-serif !important;
            `;
            secondRow.appendChild(th2);
          }
        });

        thead.appendChild(firstRow);
        thead.appendChild(secondRow);

        (thead as HTMLElement).style.cssText = `
          display: table-header-group !important;
          visibility: visible !important;
          opacity: 1 !important;
        `;
      }

      const tbody = table.querySelector('tbody');
      if (tbody) {
        (tbody as HTMLElement).style.display = 'table-row-group';
        (tbody as HTMLElement).style.visibility = 'visible';
        (tbody as HTMLElement).style.opacity = '1';

        const bodyRows = tbody.querySelectorAll('tr');
        bodyRows.forEach(row => {
          (row as HTMLElement).style.display = 'table-row';
          const bodyCells = row.querySelectorAll('td');
          
          const widths = ['6%', '5.5%', '5.5%', '6.5%', '6.5%', '6.5%', '5.5%', '5.5%', '5.5%', '7.5%', '7.5%', '7.5%'];
          bodyCells.forEach((cell, index) => {
            (cell as HTMLElement).style.display = 'table-cell';
            if (widths[index]) {
              (cell as HTMLElement).style.width = widths[index];
            }
          });
        });
      }
    });

    const tableRows = clonedContainer.querySelectorAll('tr');
    tableRows.forEach(row => {
      (row as HTMLElement).style.pageBreakInside = 'avoid';
    });

    // Compact section spacing
    const sections = clonedContainer.querySelectorAll('[data-section]');
    sections.forEach(section => {
      (section as HTMLElement).style.marginBottom = '12px';
      (section as HTMLElement).style.paddingBottom = '4px';
    });

    const hiddenElements = clonedContainer.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.classList.remove('hidden');
      htmlEl.style.display = 'block';
      htmlEl.style.visibility = 'visible';
      htmlEl.style.opacity = '1';
    });

    // Reduce label sizes and spacing
    const labels = clonedContainer.querySelectorAll('label, .form-label');
    labels.forEach(label => {
      (label as HTMLElement).style.fontSize = '9px';
      (label as HTMLElement).style.marginBottom = '6px';
      (label as HTMLElement).style.lineHeight = '1.4';
      (label as HTMLElement).style.display = 'block';
    });

    // Reduce grid gap spacing
    const grids = clonedContainer.querySelectorAll('.grid');
    grids.forEach(grid => {
      (grid as HTMLElement).style.gap = '8px';
    });

    // Reduce section header sizes
    const sectionHeaders = clonedContainer.querySelectorAll('.section-header, h2, h3');
    sectionHeaders.forEach(header => {
      (header as HTMLElement).style.fontSize = '12px';
      (header as HTMLElement).style.padding = '6px 10px';
      (header as HTMLElement).style.marginBottom = '4px';
    });

    // Reduce padding on inner containers
    const paddedContainers = clonedContainer.querySelectorAll('.p-4, .p-6');
    paddedContainers.forEach(container => {
      (container as HTMLElement).style.padding = '8px';
    });

    // Reduce space-y gaps
    const spacedContainers = clonedContainer.querySelectorAll('.space-y-4, .space-y-6, .space-y-3');
    spacedContainers.forEach(container => {
      (container as HTMLElement).style.setProperty('--tw-space-y-reverse', '0');
      const children = Array.from((container as HTMLElement).children);
      children.forEach((child, idx) => {
        if (idx > 0) (child as HTMLElement).style.marginTop = '6px';
      });
    });

    // Compact select styling
    const selectElements = clonedContainer.querySelectorAll('select');
    selectElements.forEach((select, index) => {
      const selectedText = selectValues[index] || '';

      const replacement = document.createElement('div');
      replacement.style.border = '1px solid #cbd5e1';
      replacement.style.backgroundColor = '#ffffff';
      replacement.style.height = '28px';
      replacement.style.boxSizing = 'border-box';
      replacement.style.display = 'table';
      replacement.style.width = '100%';
      replacement.style.borderRadius = '3px';

      const span = document.createElement('span');
      span.textContent = selectedText;
      span.style.display = 'table-cell';
      span.style.verticalAlign = 'middle';
      span.style.paddingLeft = '8px';
      span.style.paddingRight = '8px';
      span.style.color = '#1e293b';
      span.style.fontSize = '11px';
      span.style.fontWeight = '500';
      span.style.fontFamily = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      span.style.letterSpacing = '0.01em';

      replacement.appendChild(span);
      select.parentNode?.replaceChild(replacement, select);
    });

    // Compact input styling
    const inputElements = clonedContainer.querySelectorAll('input[type="text"], input[type="date"], input[type="month"], input[type="email"], input[type="tel"], input[type="number"], input[type="time"]');
    inputElements.forEach((input, index) => {
      if (input.closest('thead')) {
        return;
      }

      const inputValue = inputValues[index] || '';
      const isInTable = input.closest('table') !== null;
      const table = input.closest('table');
      const isLoadBankTable = table?.getAttribute('data-table-type') === 'load-bank';

      const replacement = document.createElement('div');
      replacement.style.border = isInTable ? 'none' : '1px solid #cbd5e1';
      replacement.style.backgroundColor = '#ffffff';
      replacement.style.height = isInTable ? 'auto' : '28px';
      replacement.style.minHeight = isInTable ? (isLoadBankTable ? '28px' : '22px') : '28px';
      replacement.style.boxSizing = 'border-box';
      replacement.style.display = isInTable ? 'block' : 'table';
      replacement.style.width = '100%';
      replacement.style.padding = isInTable ? (isLoadBankTable ? '6px 4px' : '4px 6px') : '0';
      replacement.style.borderRadius = isInTable ? '0' : '3px';

      const span = document.createElement('span');
      span.textContent = inputValue;
      span.style.display = isInTable ? 'block' : 'table-cell';
      span.style.verticalAlign = 'middle';
      span.style.paddingLeft = isInTable ? '0' : '8px';
      span.style.paddingRight = isInTable ? '0' : '8px';
      span.style.color = '#1e293b';
      span.style.fontSize = isInTable ? (isLoadBankTable ? '10px' : '10px') : '11px';
      span.style.fontWeight = isInTable ? '400' : '500';
      span.style.fontFamily = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      span.style.textAlign = isLoadBankTable ? 'center' : 'left';
      span.style.wordWrap = 'break-word';
      span.style.overflowWrap = 'break-word';
      span.style.lineHeight = '1.3';
      span.style.letterSpacing = '0.01em';

      replacement.appendChild(span);
      input.parentNode?.replaceChild(replacement, input);
    });

    // Compact checkbox styling
    const checkboxElements = clonedContainer.querySelectorAll('input[type="checkbox"]');
    checkboxElements.forEach((checkbox, index) => {
      const isChecked = checkboxValues[index] || false;

      const replacement = document.createElement('span');
      replacement.textContent = isChecked ? '☑' : '☐';
      replacement.style.fontSize = '14px';
      replacement.style.color = isChecked ? '#1e40af' : '#64748b';
      replacement.style.display = 'inline-block';
      replacement.style.width = '16px';
      replacement.style.height = '16px';
      replacement.style.textAlign = 'center';
      replacement.style.lineHeight = '16px';
      replacement.style.fontWeight = '600';

      checkbox.parentNode?.replaceChild(replacement, checkbox);
    });

    // Compact textarea styling
    const textareaElements = clonedContainer.querySelectorAll('textarea');
    textareaElements.forEach((textarea, index) => {
      const textareaValue = textareaValues[index] || '';

      const replacement = document.createElement('div');
      replacement.textContent = textareaValue;
      replacement.style.padding = '8px';
      replacement.style.border = '1px solid #cbd5e1';
      replacement.style.backgroundColor = '#ffffff';
      replacement.style.color = '#1e293b';
      replacement.style.fontSize = '10px';
      replacement.style.fontWeight = '400';
      replacement.style.lineHeight = '1.4';
      replacement.style.minHeight = '40px';
      replacement.style.boxSizing = 'border-box';
      replacement.style.display = 'block';
      replacement.style.whiteSpace = 'pre-wrap';
      replacement.style.wordWrap = 'break-word';
      replacement.style.fontFamily = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      replacement.style.borderRadius = '3px';
      replacement.style.letterSpacing = '0.01em';

      textarea.parentNode?.replaceChild(replacement, textarea);
    });

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

    const atsSection = clonedContainer.querySelector('[data-section="additional-ats"]');
    const loadBankSection = clonedContainer.querySelector('[data-section="load-bank"]');

    if (atsSection && !hasAdditionalATSData(formData)) {
      atsSection.remove();
    }

    if (loadBankSection && !hasLoadBankData(formData)) {
      loadBankSection.remove();
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Measure section positions before rendering to canvas
    const containerRect = clonedContainer.getBoundingClientRect();
    const sectionElements = clonedContainer.querySelectorAll('[data-print-section]');
    const sectionMeasurements: { top: number; height: number; isDynamic: boolean; name: string }[] = [];
    sectionElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      sectionMeasurements.push({
        top: rect.top - containerRect.top,
        height: rect.height,
        isDynamic: el.hasAttribute('data-print-dynamic'),
        name: el.getAttribute('data-print-section') || ''
      });
    });

    const canvas = await html2canvas(clonedContainer, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
      imageTimeout: 0,
      removeContainer: false,
    });

    const containerWidth = clonedContainer.offsetWidth;
    document.body.removeChild(clonedContainer);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;

    const firstPageHeaderHeight = 30;
    const subsequentPageHeaderHeight = 20;
    const footerHeight = 10;
    const contentMargin = 10;

    const logo = new Image();
    logo.src = '/image copy.png';
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

    const imgWidth = pageWidth - (contentMargin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let currentY = 0;
    let pageNumber = 1;

    const addHeader = (pdf: jsPDF, isFirstPage: boolean = false) => {
      if (!isFirstPage) {
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

        pdf.setDrawColor(30, 58, 138);
        pdf.setLineWidth(0.8);
        pdf.line(contentMargin, simpleHeaderHeight, pageWidth - contentMargin, simpleHeaderHeight);
        return;
      }

      pdf.setFillColor(248, 249, 250);
      pdf.rect(0, 0, pageWidth, firstPageHeaderHeight - 2, 'F');

      try {
        const logoWidth = 40;
        const logoAspectRatio = logo.naturalWidth / logo.naturalHeight;
        const logoHeight = logoWidth / logoAspectRatio;
        pdf.addImage(logo, 'PNG', contentMargin, 4, logoWidth, logoHeight);
      } catch (e) {
        console.warn('Could not add logo');
      }

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

      pdf.setDrawColor(30, 58, 138);
      pdf.setLineWidth(0.5);
      pdf.line(contentMargin, 16, pageWidth - contentMargin, 16);

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

    // Add pages with section-aware page breaking
    // Convert section measurements from pixels to mm (same scale as imgHeight)
    const pxToMm = imgWidth / containerWidth;
    const sectionBreakpoints = sectionMeasurements.map(s => ({
      topMm: s.top * pxToMm,
      heightMm: s.height * pxToMm,
      bottomMm: (s.top + s.height) * pxToMm,
      isDynamic: s.isDynamic,
      name: s.name
    }));

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

      // Calculate the natural slice end
      let sliceEnd = currentY + availableHeight;

      // If there's still content after this slice, check if we're cutting a static section
      if (sliceEnd < imgHeight) {
        // Find the best break point by checking which static sections would be cut
        let bestBreakPoint = sliceEnd;

        // Check all static sections - find the one being cut that gives us the best break
        for (let i = sectionBreakpoints.length - 1; i >= 0; i--) {
          const section = sectionBreakpoints[i];
          if (section.isDynamic) continue;

          const sectionStart = section.topMm;
          const sectionEnd = section.bottomMm;

          // Section is being cut if it starts before slice end AND ends after slice end
          if (sectionStart < sliceEnd && sectionEnd > sliceEnd && sectionStart > currentY) {
            const spaceWasted = sliceEnd - sectionStart;
            const maxWaste = availableHeight * 0.35;

            if (spaceWasted < maxWaste) {
              bestBreakPoint = sectionStart;
            }
          }
        }

        sliceEnd = bestBreakPoint;
      }

      // Safety: ensure we always advance at least a small amount to prevent infinite loop
      const heightToAdd = Math.max(sliceEnd - currentY, availableHeight * 0.2);
      const clampedHeight = Math.min(heightToAdd, imgHeight - currentY);

      // Add content slice
      const sourceY = (currentY / imgHeight) * canvas.height;
      const sourceHeight = (clampedHeight / imgHeight) * canvas.height;

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

      currentY += clampedHeight;
      pageNumber++;
    }

    // Save PDF
    pdf.save(options.filename);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

export async function generateLoadBankPDF(
  formData: FormSubmission,
  options: {
    filename: string;
  }
) {
  try {
    const printContainer = document.querySelector('.print-container');
    if (!printContainer) {
      throw new Error('Print container not found');
    }

    const loadBankWrapper = printContainer.querySelector('[data-section="load-bank"]');
    if (!loadBankWrapper) {
      throw new Error('Load Bank section not found');
    }

    // Make load bank section visible temporarily if hidden
    const wasHidden = loadBankWrapper.classList.contains('hidden');
    if (wasHidden) {
      (loadBankWrapper as HTMLElement).classList.remove('hidden');
      (loadBankWrapper as HTMLElement).style.display = 'block';
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Extract values from Load Bank section
    const originalSelects = loadBankWrapper.querySelectorAll('select');
    const selectValues = Array.from(originalSelects).map(select => {
      const selectedOption = (select as HTMLSelectElement).options[(select as HTMLSelectElement).selectedIndex];
      return selectedOption ? selectedOption.text : '';
    });

    const originalInputs = loadBankWrapper.querySelectorAll('input[type="text"], input[type="date"], input[type="month"], input[type="email"], input[type="tel"], input[type="number"], input[type="time"]');
    const inputValues = Array.from(originalInputs).map(input => {
      const el = input as HTMLInputElement;
      if (el.type === 'month' && el.value) {
        const [year, month] = el.value.split('-');
        return `${month}/${year}`;
      }
      return el.value || '';
    });

    const originalCheckboxes = loadBankWrapper.querySelectorAll('input[type="checkbox"]');
    const checkboxValues = Array.from(originalCheckboxes).map(checkbox => (checkbox as HTMLInputElement).checked);

    const originalTextareas = loadBankWrapper.querySelectorAll('textarea');
    const textareaValues = Array.from(originalTextareas).map(textarea => (textarea as HTMLTextAreaElement).value || '');

    // Clone the load bank section
    const clonedContainer = loadBankWrapper.cloneNode(true) as HTMLElement;
    clonedContainer.style.position = 'absolute';
    clonedContainer.style.left = '-9999px';
    clonedContainer.style.top = '0';
    clonedContainer.style.width = '1200px';
    clonedContainer.style.backgroundColor = '#ffffff';
    clonedContainer.style.fontFamily = '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif';
    clonedContainer.style.padding = '10px';
    clonedContainer.style.paddingTop = '0';
    clonedContainer.classList.remove('hidden');
    clonedContainer.style.display = 'block';
    clonedContainer.style.visibility = 'visible';
    clonedContainer.style.opacity = '1';
    document.body.appendChild(clonedContainer);

    // Restore original hidden state
    if (wasHidden) {
      (loadBankWrapper as HTMLElement).classList.add('hidden');
      (loadBankWrapper as HTMLElement).style.display = '';
    }

    // Handle Load Bank table DEL column removal
    const loadBankTables = clonedContainer.querySelectorAll('table[data-table-type="load-bank"]');
    loadBankTables.forEach(table => {
      const thead = table.querySelector('thead');
      if (thead) {
        const firstRow = thead.querySelector('tr:first-child');
        if (firstRow) {
          const cells = firstRow.querySelectorAll('th');
          cells.forEach(th => {
            if (th.textContent?.trim() === 'DEL') th.remove();
          });
        }
      }
      const bodyRows = table.querySelectorAll('tbody tr');
      bodyRows.forEach(row => {
        const lastCell = row.querySelector('td:last-child');
        if (lastCell && lastCell.querySelector('button')) lastCell.remove();
      });
    });

    // Remove no-print elements and buttons
    clonedContainer.querySelectorAll('.no-print').forEach(el => el.remove());
    clonedContainer.querySelectorAll('button').forEach(btn => btn.remove());

    // Remove top margin from first visible child to eliminate gap after header
    const lbFirstChild = clonedContainer.firstElementChild as HTMLElement;
    if (lbFirstChild) {
      lbFirstChild.style.marginTop = '0';
    }

    // Unhide hidden elements within the section
    clonedContainer.querySelectorAll('.hidden').forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.classList.remove('hidden');
      htmlEl.style.display = 'block';
      htmlEl.style.visibility = 'visible';
      htmlEl.style.opacity = '1';
    });

    // Reduce label sizes and spacing
    clonedContainer.querySelectorAll('label, .form-label').forEach(label => {
      (label as HTMLElement).style.fontSize = '9px';
      (label as HTMLElement).style.marginBottom = '6px';
      (label as HTMLElement).style.lineHeight = '1.4';
      (label as HTMLElement).style.display = 'block';
    });

    // Reduce grid gap spacing
    clonedContainer.querySelectorAll('.grid').forEach(grid => {
      (grid as HTMLElement).style.gap = '8px';
    });

    // Reduce section header sizes
    clonedContainer.querySelectorAll('.section-header, h2, h3').forEach(header => {
      (header as HTMLElement).style.fontSize = '12px';
      (header as HTMLElement).style.padding = '6px 10px';
      (header as HTMLElement).style.marginBottom = '4px';
    });

    // Reduce padding on inner containers
    clonedContainer.querySelectorAll('.p-4, .p-6').forEach(container => {
      (container as HTMLElement).style.padding = '8px';
    });

    // Reduce space-y gaps
    clonedContainer.querySelectorAll('.space-y-4, .space-y-6, .space-y-3').forEach(container => {
      const children = Array.from((container as HTMLElement).children);
      children.forEach((child, idx) => {
        if (idx > 0) (child as HTMLElement).style.marginTop = '6px';
      });
    });

    // Style tables
    const tables = clonedContainer.querySelectorAll('table');
    tables.forEach(table => {
      const isLoadBankTable = table.getAttribute('data-table-type') === 'load-bank';
      (table as HTMLElement).style.tableLayout = 'auto';
      (table as HTMLElement).style.width = '100%';
      (table as HTMLElement).style.borderCollapse = 'collapse';
      (table as HTMLElement).style.marginBottom = '10px';
      (table as HTMLElement).style.marginTop = '4px';
      (table as HTMLElement).style.fontFamily = '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif';
      if (isLoadBankTable) {
        (table as HTMLElement).style.border = '1.5px solid #1e293b';
        (table as HTMLElement).style.fontSize = '10px';
        (table as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
      } else {
        (table as HTMLElement).style.border = '1px solid #cbd5e1';
        (table as HTMLElement).style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
      }
    });

    // Style table cells
    const tableCells = clonedContainer.querySelectorAll('td, th');
    tableCells.forEach(cell => {
      const table = cell.closest('table');
      const isLoadBankTable = table?.getAttribute('data-table-type') === 'load-bank';
      if (isLoadBankTable) {
        (cell as HTMLElement).style.border = '1px solid #475569';
        (cell as HTMLElement).style.padding = '6px 4px';
        (cell as HTMLElement).style.minHeight = '28px';
        (cell as HTMLElement).style.lineHeight = '1.4';
        (cell as HTMLElement).style.verticalAlign = 'middle';
        (cell as HTMLElement).style.textAlign = 'center';
        (cell as HTMLElement).style.fontSize = '10px';
        (cell as HTMLElement).style.fontWeight = cell.tagName === 'TH' ? '600' : '500';
        (cell as HTMLElement).style.color = '#0f172a';
        (cell as HTMLElement).style.fontFamily = '"Inter", sans-serif';
        if (cell.tagName === 'TH') {
          (cell as HTMLElement).style.backgroundColor = '#e2e8f0';
          (cell as HTMLElement).style.letterSpacing = '0.02em';
        }
      } else {
        (cell as HTMLElement).style.padding = '7px 6px';
        (cell as HTMLElement).style.minHeight = '24px';
        (cell as HTMLElement).style.lineHeight = '1.3';
        (cell as HTMLElement).style.verticalAlign = 'middle';
        (cell as HTMLElement).style.fontSize = '10px';
        (cell as HTMLElement).style.fontWeight = cell.tagName === 'TH' ? '600' : '400';
        (cell as HTMLElement).style.color = '#1e293b';
        (cell as HTMLElement).style.fontFamily = '"Inter", sans-serif';
        if (cell.tagName === 'TH') {
          (cell as HTMLElement).style.backgroundColor = '#f1f5f9';
          (cell as HTMLElement).style.borderBottom = '1.5px solid #cbd5e1';
          (cell as HTMLElement).style.letterSpacing = '0.02em';
        }
      }
    });

    // Rebuild Load Bank table headers for PDF
    clonedContainer.querySelectorAll('table[data-table-type="load-bank"]').forEach(table => {
      (table as HTMLElement).style.cssText = `
        display: table !important;
        width: 100% !important;
        border-collapse: collapse !important;
        border-spacing: 0 !important;
        border: 1.5px solid #1e293b !important;
        background-color: #fff !important;
        table-layout: fixed !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08) !important;
      `;

      const thead = table.querySelector('thead');
      if (thead) {
        thead.innerHTML = '';
        const firstRow = document.createElement('tr');
        firstRow.style.cssText = `display: table-row !important; height: 32px !important;`;
        const secondRow = document.createElement('tr');
        secondRow.style.cssText = `display: table-row !important; height: 32px !important;`;

        const structure = [
          { main: 'TIME', sub: '', width: '5%', colspan: 1, type: 'single' },
          { main: 'KW', sub: '', width: '4%', colspan: 1, type: 'single' },
          { main: 'HZ', sub: '', width: '4%', colspan: 1, type: 'single' },
          { main: 'VOLTS', sub: 'A/B', width: '6.5%', colspan: 3, type: 'group-start' },
          { main: '', sub: 'B/C', width: '6.5%', colspan: 0, type: 'group-sub' },
          { main: '', sub: 'C/A', width: '6.5%', colspan: 0, type: 'group-sub' },
          { main: 'AMPS', sub: 'A', width: '4.3%', colspan: 3, type: 'group-start' },
          { main: '', sub: 'B', width: '4.3%', colspan: 0, type: 'group-sub' },
          { main: '', sub: 'C', width: '4.3%', colspan: 0, type: 'group-sub' },
          { main: 'OIL PSI', sub: '', width: '6%', colspan: 1, type: 'single' },
          { main: 'H2O °F', sub: '', width: '6%', colspan: 1, type: 'single' },
          { main: 'BATT V', sub: '', width: '6%', colspan: 1, type: 'single' }
        ];

        structure.forEach((col) => {
          if (col.type === 'single') {
            const th1 = document.createElement('th');
            th1.textContent = col.main;
            th1.setAttribute('rowspan', '2');
            th1.style.cssText = `
              display: table-cell !important; visibility: visible !important; color: #0f172a !important;
              font-size: 10px !important; font-weight: 600 !important; border: 1px solid #475569 !important;
              padding: 6px 4px !important; text-align: center !important; vertical-align: middle !important;
              background-color: #cbd5e1 !important; line-height: 1.3 !important; white-space: nowrap !important;
              width: ${col.width} !important; font-family: "Inter", sans-serif !important; letter-spacing: 0.02em !important;
            `;
            firstRow.appendChild(th1);
          } else if (col.type === 'group-start') {
            const th1 = document.createElement('th');
            th1.textContent = col.main;
            th1.setAttribute('colspan', col.colspan.toString());
            th1.style.cssText = `
              display: table-cell !important; visibility: visible !important; color: #0f172a !important;
              font-size: 10px !important; font-weight: 600 !important; border: 1px solid #475569 !important;
              padding: 6px 4px !important; text-align: center !important; vertical-align: middle !important;
              background-color: #cbd5e1 !important; line-height: 1.3 !important; white-space: nowrap !important;
              font-family: "Inter", sans-serif !important; letter-spacing: 0.02em !important;
            `;
            firstRow.appendChild(th1);
          }
          if (col.type === 'group-start' || col.type === 'group-sub') {
            const th2 = document.createElement('th');
            th2.textContent = col.sub;
            th2.style.cssText = `
              display: table-cell !important; visibility: visible !important; color: #0f172a !important;
              font-size: 9px !important; font-weight: 600 !important; border: 1px solid #475569 !important;
              padding: 6px 4px !important; text-align: center !important; vertical-align: middle !important;
              background-color: #e2e8f0 !important; line-height: 1.3 !important; white-space: nowrap !important;
              width: ${col.width} !important; font-family: "Inter", sans-serif !important;
            `;
            secondRow.appendChild(th2);
          }
        });

        thead.appendChild(firstRow);
        thead.appendChild(secondRow);
        (thead as HTMLElement).style.cssText = `display: table-header-group !important; visibility: visible !important; opacity: 1 !important;`;
      }

      const tbody = table.querySelector('tbody');
      if (tbody) {
        (tbody as HTMLElement).style.display = 'table-row-group';
        (tbody as HTMLElement).style.visibility = 'visible';
        (tbody as HTMLElement).style.opacity = '1';
        const bodyRows = tbody.querySelectorAll('tr');
        const widths = ['5%', '4%', '4%', '5%', '5%', '5%', '5%', '5%', '5%', '4.3%', '4.3%', '4.3%', '6%', '6%', '6%'];
        bodyRows.forEach(row => {
          (row as HTMLElement).style.display = 'table-row';
          const bodyCells = row.querySelectorAll('td');
          bodyCells.forEach((cell, index) => {
            (cell as HTMLElement).style.display = 'table-cell';
            if (widths[index]) (cell as HTMLElement).style.width = widths[index];
          });
        });
      }
    });

    // Replace selects with styled divs
    const selectElements = clonedContainer.querySelectorAll('select');
    selectElements.forEach((select, index) => {
      const selectedText = selectValues[index] || '';
      const replacement = document.createElement('div');
      replacement.style.border = '1px solid #cbd5e1';
      replacement.style.backgroundColor = '#ffffff';
      replacement.style.height = '28px';
      replacement.style.boxSizing = 'border-box';
      replacement.style.display = 'table';
      replacement.style.width = '100%';
      replacement.style.borderRadius = '3px';
      const span = document.createElement('span');
      span.textContent = selectedText;
      span.style.display = 'table-cell';
      span.style.verticalAlign = 'middle';
      span.style.paddingLeft = '8px';
      span.style.paddingRight = '8px';
      span.style.color = '#1e293b';
      span.style.fontSize = '11px';
      span.style.fontWeight = '500';
      span.style.fontFamily = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      replacement.appendChild(span);
      select.parentNode?.replaceChild(replacement, select);
    });

    // Replace inputs with styled divs
    const inputElements = clonedContainer.querySelectorAll('input[type="text"], input[type="date"], input[type="month"], input[type="email"], input[type="tel"], input[type="number"], input[type="time"]');
    inputElements.forEach((input, index) => {
      if (input.closest('thead')) return;
      const inputValue = inputValues[index] || '';
      const isInTable = input.closest('table') !== null;
      const table = input.closest('table');
      const isLoadBankTable = table?.getAttribute('data-table-type') === 'load-bank';

      const replacement = document.createElement('div');
      replacement.style.border = isInTable ? 'none' : '1px solid #cbd5e1';
      replacement.style.backgroundColor = '#ffffff';
      replacement.style.height = isInTable ? 'auto' : '28px';
      replacement.style.minHeight = isInTable ? (isLoadBankTable ? '28px' : '22px') : '28px';
      replacement.style.boxSizing = 'border-box';
      replacement.style.display = isInTable ? 'block' : 'table';
      replacement.style.width = '100%';
      replacement.style.padding = isInTable ? (isLoadBankTable ? '6px 4px' : '4px 6px') : '0';
      replacement.style.borderRadius = isInTable ? '0' : '3px';

      const span = document.createElement('span');
      span.textContent = inputValue;
      span.style.display = isInTable ? 'block' : 'table-cell';
      span.style.verticalAlign = 'middle';
      span.style.paddingLeft = isInTable ? '0' : '8px';
      span.style.paddingRight = isInTable ? '0' : '8px';
      span.style.color = '#1e293b';
      span.style.fontSize = isInTable ? (isLoadBankTable ? '10px' : '10px') : '11px';
      span.style.fontWeight = isInTable ? '400' : '500';
      span.style.fontFamily = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      span.style.textAlign = isLoadBankTable ? 'center' : 'left';
      span.style.wordWrap = 'break-word';
      span.style.overflowWrap = 'break-word';
      span.style.lineHeight = '1.3';

      replacement.appendChild(span);
      input.parentNode?.replaceChild(replacement, input);
    });

    // Replace checkboxes
    const checkboxElements = clonedContainer.querySelectorAll('input[type="checkbox"]');
    checkboxElements.forEach((checkbox, index) => {
      const isChecked = checkboxValues[index] || false;
      const replacement = document.createElement('span');
      replacement.textContent = isChecked ? '\u2611' : '\u2610';
      replacement.style.fontSize = '14px';
      replacement.style.color = isChecked ? '#1e40af' : '#64748b';
      replacement.style.display = 'inline-block';
      replacement.style.width = '16px';
      replacement.style.height = '16px';
      replacement.style.textAlign = 'center';
      replacement.style.lineHeight = '16px';
      replacement.style.fontWeight = '600';
      checkbox.parentNode?.replaceChild(replacement, checkbox);
    });

    // Replace textareas
    const textareaElements = clonedContainer.querySelectorAll('textarea');
    textareaElements.forEach((textarea, index) => {
      const textareaValue = textareaValues[index] || '';
      const replacement = document.createElement('div');
      replacement.textContent = textareaValue;
      replacement.style.padding = '8px';
      replacement.style.border = '1px solid #cbd5e1';
      replacement.style.backgroundColor = '#ffffff';
      replacement.style.color = '#1e293b';
      replacement.style.fontSize = '10px';
      replacement.style.lineHeight = '1.4';
      replacement.style.minHeight = '40px';
      replacement.style.boxSizing = 'border-box';
      replacement.style.display = 'block';
      replacement.style.whiteSpace = 'pre-wrap';
      replacement.style.wordWrap = 'break-word';
      replacement.style.fontFamily = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      replacement.style.borderRadius = '3px';
      textarea.parentNode?.replaceChild(replacement, textarea);
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(clonedContainer, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
      imageTimeout: 0,
      removeContainer: false,
    });

    document.body.removeChild(clonedContainer);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const firstPageHeaderHeight = 30;
    const subsequentPageHeaderHeight = 20;
    const footerHeight = 10;
    const contentMargin = 10;

    const logo = new Image();
    logo.src = '/image copy.png';
    const footerImage = new Image();
    footerImage.src = '/image copy copy copy copy.png';

    await Promise.all([
      new Promise((resolve) => { logo.onload = resolve; logo.onerror = resolve; setTimeout(resolve, 1000); }),
      new Promise((resolve) => { footerImage.onload = resolve; footerImage.onerror = resolve; setTimeout(resolve, 1000); })
    ]);

    const imgWidth = pageWidth - (contentMargin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let currentY = 0;
    let pageNumber = 1;

    const addHeader = (pdf: jsPDF, isFirstPage: boolean = false) => {
      if (!isFirstPage) {
        const simpleHeaderHeight = 20;
        pdf.setFillColor(248, 249, 250);
        pdf.rect(0, 0, pageWidth, simpleHeaderHeight, 'F');
        try {
          const logoWidth = 40;
          const logoAspectRatio = logo.naturalWidth / logo.naturalHeight;
          const logoHeight = logoWidth / logoAspectRatio;
          pdf.addImage(logo, 'PNG', contentMargin, 5, logoWidth, logoHeight);
        } catch (e) { /* logo not available */ }
        pdf.setDrawColor(30, 58, 138);
        pdf.setLineWidth(0.8);
        pdf.line(contentMargin, simpleHeaderHeight, pageWidth - contentMargin, simpleHeaderHeight);
        return;
      }

      pdf.setFillColor(248, 249, 250);
      pdf.rect(0, 0, pageWidth, firstPageHeaderHeight - 2, 'F');
      try {
        const logoWidth = 40;
        const logoAspectRatio = logo.naturalWidth / logo.naturalHeight;
        const logoHeight = logoWidth / logoAspectRatio;
        pdf.addImage(logo, 'PNG', contentMargin, 4, logoWidth, logoHeight);
      } catch (e) { /* logo not available */ }

      const jobBoxWidth = 60;
      const jobBoxHeight = 8;
      const jobBoxX = pageWidth - contentMargin - jobBoxWidth;
      const jobBoxY = 4;
      pdf.setFillColor(30, 58, 138);
      pdf.roundedRect(jobBoxX, jobBoxY, jobBoxWidth, jobBoxHeight, 1.5, 1.5, 'F');
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text(`Job No# ${formData.job_po_number || 'N/A'}`, jobBoxX + jobBoxWidth / 2, jobBoxY + 5.5, { align: 'center' });

      pdf.setDrawColor(30, 58, 138);
      pdf.setLineWidth(0.5);
      pdf.line(contentMargin, 16, pageWidth - contentMargin, 16);

      const locationsStartY = 20;
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 58, 138);

      const locations = [
        { name: 'Western WA (HQ)', addr: '8102 Skansie Ave', city: 'Gig Harbor, WA 98332' },
        { name: 'Inland WA & RMR', addr: '1566 E. Weber Rd', city: 'Ritzville, WA 99169' },
        { name: 'Salem, OR', addr: '5873 State Street', city: 'Salem, OR' },
        { name: 'Three Forks, MT', addr: '1600 Bench RD', city: 'PO Box 648' },
        { name: 'Nampa, ID', addr: '2024 N Elder St', city: 'Nampa, ID' }
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

      pdf.setDrawColor(30, 58, 138);
      pdf.setLineWidth(0.8);
      pdf.line(contentMargin, 30, pageWidth - contentMargin, 30);
    };

    const addFooter = (pdf: jsPDF, pageNum: number) => {
      const footerY = pageHeight - footerHeight;
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.line(contentMargin, footerY, pageWidth - contentMargin, footerY);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Page ${pageNum}`, pageWidth - contentMargin, pageHeight - 4, { align: 'right' });
    };

    while (currentY < imgHeight) {
      if (pageNumber > 1) pdf.addPage();

      const isFirstPage = pageNumber === 1;
      const currentHeaderHeight = isFirstPage ? firstPageHeaderHeight : subsequentPageHeaderHeight;
      const availableHeight = pageHeight - currentHeaderHeight - footerHeight;

      addHeader(pdf, isFirstPage);
      addFooter(pdf, pageNumber);

      const remainingHeight = imgHeight - currentY;
      const heightToAdd = Math.min(remainingHeight, availableHeight);
      const sourceY = (currentY / imgHeight) * canvas.height;
      const sourceHeight = (heightToAdd / imgHeight) * canvas.height;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = sourceHeight;
      const tempCtx = tempCanvas.getContext('2d');

      if (tempCtx) {
        tempCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
        const sliceData = tempCanvas.toDataURL('image/jpeg', 0.85);
        const sliceHeight = (sourceHeight * imgWidth) / canvas.width;
        pdf.addImage(sliceData, 'JPEG', contentMargin, currentHeaderHeight, imgWidth, sliceHeight);
      }

      currentY += heightToAdd;
      pageNumber++;
    }

    pdf.save(options.filename);
  } catch (error) {
    console.error('Error generating Load Bank PDF:', error);
    throw error;
  }
}