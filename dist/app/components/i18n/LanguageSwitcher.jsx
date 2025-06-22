'use strict';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = LanguageSwitcher;
const react_1 = require('react');
const button_1 = require('../ui/button');
const lucide_react_1 = require('lucide-react');
const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
];
function LanguageSwitcher({ currentLanguage = 'en', onLanguageChange, className }) {
  const [isOpen, setIsOpen] = (0, react_1.useState)(false);
  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];
  const handleLanguageSelect = languageCode => {
    onLanguageChange?.(languageCode);
    setIsOpen(false);
  };
  return (
    <div className={`relative ${className}`}>
      <button_1.Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <lucide_react_1.Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLang.flag}</span>
        <span className="hidden md:inline">{currentLang.nativeName}</span>
      </button_1.Button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border bg-white shadow-lg dark:bg-gray-800">
          <div className="py-1">
            {languages.map(language => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${currentLanguage === language.code ? 'bg-pink-50 dark:bg-pink-900/20' : ''}`}
              >
                <span className="text-lg">{language.flag}</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {language.nativeName}
                  </div>
                  <div className="text-sm text-gray-500">{language.name}</div>
                </div>
                {currentLanguage === language.code && (
                  <lucide_react_1.Check className="h-4 w-4 text-pink-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
}
