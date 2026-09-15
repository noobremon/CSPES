import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { I18nProvider, useTranslation, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../src/i18n';
import { LanguageSelector } from '../src/components/common/LanguageSelector';
import React from 'react';

const TestConsumerComponent: React.FC = () => {
  const { currentLanguage, setLanguage, t, isRTL, languageInfo } = useTranslation();
  return (
    <div>
      <div data-testid="current-lang">{currentLanguage}</div>
      <div data-testid="native-name">{languageInfo.nativeName}</div>
      <div data-testid="is-rtl">{isRTL ? 'true' : 'false'}</div>
      <div data-testid="gov-title">{t('header.govTitle')}</div>
      <div data-testid="auth-title">{t('auth.portalAuth')}</div>
      <div data-testid="fallback-test">{t('untranslated.missing.key')}</div>
      <div data-testid="interpolation-test">{t('footer.copyright', { year: 2026 })}</div>
      <button onClick={() => setLanguage('hi')}>Switch to Hindi</button>
      <button onClick={() => setLanguage('bn')}>Switch to Bengali</button>
      <button onClick={() => setLanguage('ta')}>Switch to Tamil</button>
      <button onClick={() => setLanguage('ur')}>Switch to Urdu</button>
      <button onClick={() => setLanguage('en')}>Switch to English</button>
      <LanguageSelector />
    </div>
  );
};

describe('Frontend Internationalization (i18n) System', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
  });

  it('contains English + all 22 Eighth Schedule languages (total 23 supported languages)', () => {
    expect(SUPPORTED_LANGUAGES.length).toBe(23);
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toContain('en');
    expect(codes).toContain('hi');
    expect(codes).toContain('bn');
    expect(codes).toContain('ta');
    expect(codes).toContain('te');
    expect(codes).toContain('mr');
    expect(codes).toContain('gu');
    expect(codes).toContain('kn');
    expect(codes).toContain('ml');
    expect(codes).toContain('pa');
    expect(codes).toContain('od');
    expect(codes).toContain('as');
    expect(codes).toContain('ur');
    expect(codes).toContain('sa');
    expect(codes).toContain('ne');
    expect(codes).toContain('mai');
    expect(codes).toContain('doi');
    expect(codes).toContain('kok');
    expect(codes).toContain('mni');
    expect(codes).toContain('sat');
    expect(codes).toContain('ks');
    expect(codes).toContain('sd');
    expect(codes).toContain('brx');
  });

  it('renders default English baseline text', () => {
    render(
      <I18nProvider>
        <TestConsumerComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('current-lang').textContent).toBe('en');
    expect(screen.getByTestId('gov-title').textContent).toBe('Government of India');
    expect(screen.getByTestId('auth-title').textContent).toBe('Portal Authentication');
    expect(screen.getByTestId('interpolation-test').textContent).toBe('© 2026 Government of India');
  });

  it('switches to Hindi and renders translated strings', async () => {
    render(
      <I18nProvider>
        <TestConsumerComponent />
      </I18nProvider>
    );

    fireEvent.click(screen.getByText('Switch to Hindi'));

    await waitFor(() => {
      expect(screen.getByTestId('current-lang').textContent).toBe('hi');
      expect(screen.getByTestId('gov-title').textContent).toBe('भारत सरकार');
      expect(screen.getByTestId('auth-title').textContent).toBe('पोर्टल प्रमाणीकरण');
      expect(localStorage.getItem('app_language')).toBe('hi');
      expect(document.documentElement.lang).toBe('hi');
      expect(document.documentElement.dir).toBe('ltr');
    });
  });

  it('switches to Bengali and renders translated strings', async () => {
    render(
      <I18nProvider>
        <TestConsumerComponent />
      </I18nProvider>
    );

    fireEvent.click(screen.getByText('Switch to Bengali'));

    await waitFor(() => {
      expect(screen.getByTestId('current-lang').textContent).toBe('bn');
      expect(screen.getByTestId('gov-title').textContent).toBe('ভারত সরকার');
      expect(screen.getByTestId('auth-title').textContent).toBe('পোর্টাল প্রমাণীকরণ');
      expect(localStorage.getItem('app_language')).toBe('bn');
    });
  });

  it('switches to Tamil and renders translated strings', async () => {
    render(
      <I18nProvider>
        <TestConsumerComponent />
      </I18nProvider>
    );

    fireEvent.click(screen.getByText('Switch to Tamil'));

    await waitFor(() => {
      expect(screen.getByTestId('current-lang').textContent).toBe('ta');
      expect(screen.getByTestId('gov-title').textContent).toBe('இந்திய அரசு');
      expect(screen.getByTestId('auth-title').textContent).toBe('போர்டல் அங்கீகாரம்');
    });
  });

  it('switches to Urdu and handles RTL layout direction correctly', async () => {
    render(
      <I18nProvider>
        <TestConsumerComponent />
      </I18nProvider>
    );

    fireEvent.click(screen.getByText('Switch to Urdu'));

    await waitFor(() => {
      expect(screen.getByTestId('current-lang').textContent).toBe('ur');
      expect(screen.getByTestId('is-rtl').textContent).toBe('true');
      expect(screen.getByTestId('gov-title').textContent).toBe('حکومت ہند');
      expect(document.documentElement.dir).toBe('rtl');
    });
  });

  it('gracefully falls back to key when translation is missing', () => {
    render(
      <I18nProvider>
        <TestConsumerComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('fallback-test').textContent).toBe('untranslated.missing.key');
  });

  it('persists language selection across reloads via localStorage', () => {
    localStorage.setItem('app_language', 'ta');

    render(
      <I18nProvider>
        <TestConsumerComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('current-lang').textContent).toBe('ta');
    expect(screen.getByTestId('gov-title').textContent).toBe('இந்திய அரசு');
  });

  it('opens language selector dropdown and allows selecting another language', async () => {
    render(
      <I18nProvider>
        <LanguageSelector />
      </I18nProvider>
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText(/22 Languages/i)).toBeInTheDocument();
      expect(screen.getByText(/हिन्दी/i)).toBeInTheDocument();
      expect(screen.getByText(/বাংলা/i)).toBeInTheDocument();
    });

    // Select Hindi from dropdown
    const hindiOption = screen.getByRole('option', { name: /हिन्दी/i });
    fireEvent.click(hindiOption);

    await waitFor(() => {
      expect(localStorage.getItem('app_language')).toBe('hi');
    });
  });
});
