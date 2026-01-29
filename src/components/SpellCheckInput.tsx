import React, { useEffect, useRef, useState } from 'react';
import { checkText, loadDictionary } from '../utils/spellCheck';

interface SpellCheckInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  uppercase?: boolean;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
}

export const SpellCheckInput: React.FC<SpellCheckInputProps> = ({
  value,
  onChange,
  placeholder = '',
  className = '',
  uppercase = false,
  required = false,
  disabled = false,
  maxLength
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
    return div.innerHTML.replace(/ /g, '&nbsp;');
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || '';

    if (maxLength && text.length > maxLength) {
      e.currentTarget.textContent = text.substring(0, maxLength);
      setCursorPosition(e.currentTarget, maxLength);
      return;
    }

    onChange(text);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const finalText = maxLength ? text.substring(0, maxLength) : text;

    document.execCommand('insertText', false, finalText);
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
          range.setStart(node, position - currentPos);
          range.collapse(true);
          found = true;
          return true;
        }
        currentPos += textLength;
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
        className={`spell-check-input ${className}`}
        style={{
          minHeight: '40px',
          outline: 'none',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
      <style>{`
        .spell-check-input {
          position: relative;
        }
        .spell-check-input[data-placeholder]:empty:before {
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
