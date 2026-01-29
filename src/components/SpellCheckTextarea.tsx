import React, { useEffect, useRef, useState } from 'react';
import { checkText, loadDictionary } from '../utils/spellCheck';

interface SpellCheckTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  uppercase?: boolean;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
}

export const SpellCheckTextarea: React.FC<SpellCheckTextareaProps> = ({
  value,
  onChange,
  placeholder = '',
  className = '',
  uppercase = false,
  required = false,
  disabled = false,
  rows = 6
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadDictionary().then(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (!contentRef.current || !isReady) return;

    const currentText = contentRef.current.textContent || '';
    if (currentText === value) return;

    const spellCheckResults = checkText(value);
    const html = renderWithSpellCheck(value, spellCheckResults);

    const selection = window.getSelection();
    const cursorPosition = selection && selection.rangeCount > 0
      ? getCursorPosition(contentRef.current)
      : value.length;

    contentRef.current.innerHTML = html;

    setCursorPosition(contentRef.current, cursorPosition);
  }, [value, isReady]);

  const renderWithSpellCheck = (text: string, results: ReturnType<typeof checkText>): string => {
    if (!text) return '';

    const displayText = uppercase ? text.toUpperCase() : text;
    let html = '';
    let lastIndex = 0;

    results.forEach(({ correct, start, end }) => {
      html += escapeHtml(displayText.substring(lastIndex, start));

      const word = displayText.substring(start, end);
      if (!correct) {
        html += `<span class="spell-error">${escapeHtml(word)}</span>`;
      } else {
        html += escapeHtml(word);
      }

      lastIndex = end;
    });

    html += escapeHtml(displayText.substring(lastIndex));

    return html || '<br>';
  };

  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/ /g, '&nbsp;').replace(/\n/g, '<br>');
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    let text = e.currentTarget.innerText || '';

    if (text.endsWith('\n')) {
      text = text.slice(0, -1);
    }

    onChange(text);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const getCursorPosition = (element: HTMLElement): number => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return 0;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    return preCaretRange.toString().length;
  };

  const setCursorPosition = (element: HTMLElement, position: number) => {
    const selection = window.getSelection();
    const range = document.createRange();

    let currentPos = 0;
    let found = false;

    const traverseNodes = (node: Node): boolean => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textLength = node.textContent?.length || 0;
        if (currentPos + textLength >= position) {
          range.setStart(node, Math.min(position - currentPos, textLength));
          range.collapse(true);
          found = true;
          return true;
        }
        currentPos += textLength;
      } else if (node.nodeName === 'BR') {
        currentPos += 1;
        if (currentPos === position) {
          range.setStartAfter(node);
          range.collapse(true);
          found = true;
          return true;
        }
      } else {
        for (const child of Array.from(node.childNodes)) {
          if (traverseNodes(child)) return true;
        }
      }
      return false;
    };

    traverseNodes(element);

    if (!found && element.lastChild) {
      range.selectNodeContents(element);
      range.collapse(false);
    }

    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  return (
    <div className="relative">
      <div
        ref={contentRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onPaste={handlePaste}
        className={`spell-check-textarea ${className}`}
        style={{
          minHeight: `${rows * 1.5}rem`,
          outline: 'none',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
      <style>{`
        .spell-check-textarea {
          position: relative;
        }
        .spell-check-textarea[data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          position: absolute;
        }
        .spell-error {
          text-decoration: underline;
          text-decoration-color: red;
          text-decoration-style: wavy;
          text-decoration-thickness: 2px;
          text-underline-offset: 2px;
        }
      `}</style>
    </div>
  );
};
