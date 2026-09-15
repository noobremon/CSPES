import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation, LanguageCode } from '../../i18n';
import { Globe, Check, Search, X } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'header' | 'compact' | 'footer';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { currentLanguage, languageInfo, setLanguage, languages, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right?: number; left?: number; width: number }>({
    top: 0,
    width: 320,
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Calculate positioning attached to trigger button
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownWidth = Math.min(320, window.innerWidth - 24);
    
    // Position directly under the trigger button, aligned to its right edge
    let left = rect.right - dropdownWidth;
    if (left < 12) {
      left = 12;
    } else if (left + dropdownWidth > window.innerWidth - 12) {
      left = window.innerWidth - dropdownWidth - 12;
    }

    setDropdownPosition({
      top: rect.bottom + 6,
      left,
      width: dropdownWidth,
    });
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);

  // Handle scroll and resize to keep dropdown anchored
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen]);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    // Auto-focus search input when opened
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const filteredLanguages = languages.filter((lang) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      lang.name.toLowerCase().includes(term) ||
      lang.nativeName.toLowerCase().includes(term) ||
      lang.code.toLowerCase().includes(term)
    );
  });

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
    setSearchTerm('');
    triggerRef.current?.focus();
  };

  const dropdownModal = isOpen && typeof document !== 'undefined' ? createPortal(
    <div
      ref={dropdownRef}
      role="dialog"
      aria-label={t('header.selectLanguage')}
      style={{
        position: 'fixed',
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
        zIndex: 9999,
      }}
      className="bg-white rounded-2xl shadow-2xl border border-[#CBD5E1] p-3 text-left animate-in fade-in zoom-in-95 duration-150 select-none"
    >
      {/* Header & Search */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-[#1E3A8A]" />
          <span className="text-xs font-bold text-[#0F172A]">
            {t('header.selectLanguage')} (22 Languages)
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Search */}
      <div className="relative mb-2">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search language / भाषा खोजें..."
          className="w-full pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-hidden focus:border-[#2563EB] focus:bg-white font-medium"
        />
      </div>

      {/* Language Options List */}
      <div
        className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar"
        role="listbox"
        tabIndex={-1}
      >
        {filteredLanguages.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400 font-medium">
            No matching language found
          </div>
        ) : (
          filteredLanguages.map((lang) => {
            const isSelected = lang.code === currentLanguage;
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-[#EFF6FF] text-[#1E3A8A] font-bold border border-blue-200 shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-[#0F172A]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{lang.nativeName}</span>
                  <span className="text-[11px] text-slate-400">({lang.name})</span>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-[#2563EB] shrink-0" aria-hidden="true" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Footer note */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
        <span>Eighth Schedule of the Constitution</span>
        <span className="font-semibold text-slate-500">{languageInfo.name}</span>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className={`relative inline-flex items-center shrink-0 text-left ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('header.selectLanguage')}
        className="flex items-center gap-1.5 font-semibold text-[#0F172A] hover:text-[#1E3A8A] px-2 py-1 rounded-lg hover:bg-slate-100/80 transition-colors cursor-pointer text-[12px] sm:text-[12.5px] border border-transparent hover:border-slate-200 shrink-0"
      >
        <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
        <span className="truncate max-w-[90px] sm:max-w-none">
          {languageInfo.nativeName}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-slate-600 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Portal Dropdown */}
      {dropdownModal}
    </div>
  );
};
