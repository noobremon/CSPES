import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { App } from '../src/app/App';

describe('Header & Footer Real Navigation Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, '', '/');
    vi.clearAllMocks();
  });

  it('renders official Category A external links with target="_blank" and rel="noopener noreferrer"', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Portal Authentication')).toBeInTheDocument();
    });

    // 1. Digital India
    const digitalIndiaLink = screen.getByRole('link', { name: /Digital India/i });
    expect(digitalIndiaLink).toHaveAttribute('href', 'https://www.digitalindia.gov.in/');
    expect(digitalIndiaLink).toHaveAttribute('target', '_blank');
    expect(digitalIndiaLink).toHaveAttribute('rel', 'noopener noreferrer');

    // 2. Atmanirbhar Bharat
    const atmanirbharLink = screen.getByRole('link', { name: /Atmanirbhar Bharat/i });
    expect(atmanirbharLink).toHaveAttribute('href', 'https://transformingindia.mygov.in/aatmanirbharbharat/');
    expect(atmanirbharLink).toHaveAttribute('target', '_blank');
    expect(atmanirbharLink).toHaveAttribute('rel', 'noopener noreferrer');

    // 3. Viksit Bharat
    const viksitLink = screen.getByRole('link', { name: /Viksit Bharat/i });
    expect(viksitLink).toHaveAttribute('href', 'https://innovateindia.mygov.in/viksitbharat2047/');
    expect(viksitLink).toHaveAttribute('target', '_blank');
    expect(viksitLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('navigates to Privacy Policy (/privacy-policy) on footer link click and returns to portal', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Portal Authentication')).toBeInTheDocument();
    });

    const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i });
    fireEvent.click(privacyLink);

    expect(screen.getByRole('heading', { level: 1, name: /Privacy Policy/i })).toBeInTheDocument();
    expect(screen.getByText(/Information Handled by the Portal/i)).toBeInTheDocument();
    expect(screen.getByText(/Authentication & Session Information/i)).toBeInTheDocument();

    // Click Return to Portal
    const returnBtn = screen.getByRole('button', { name: /Return to Portal/i });
    fireEvent.click(returnBtn);

    await waitFor(() => {
      expect(screen.getByText('Portal Authentication')).toBeInTheDocument();
    });
  });

  it('navigates to Accessibility Statement (/accessibility) on footer link click', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Portal Authentication')).toBeInTheDocument();
    });

    const accessLink = screen.getByRole('link', { name: /Accessibility/i });
    fireEvent.click(accessLink);

    expect(screen.getByRole('heading', { level: 1, name: /Accessibility Statement/i })).toBeInTheDocument();
    expect(screen.getByText(/Keyboard Navigation & Focus Management/i)).toBeInTheDocument();
  });

  it('navigates to Terms of Use (/terms-of-use) on footer link click', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Portal Authentication')).toBeInTheDocument();
    });

    const termsLink = screen.getByRole('link', { name: /Terms of Use/i });
    fireEvent.click(termsLink);

    expect(screen.getByRole('heading', { level: 1, name: /Terms of Use/i })).toBeInTheDocument();
    expect(screen.getByText(/Authorized Enterprise Scope/i)).toBeInTheDocument();
  });

  it('navigates to Help & Support (/help-support) on footer link click', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Portal Authentication')).toBeInTheDocument();
    });

    const helpLink = screen.getByRole('link', { name: /Help & Support/i });
    fireEvent.click(helpLink);

    expect(screen.getByRole('heading', { level: 1, name: /Help & Support/i })).toBeInTheDocument();
    expect(screen.getByText(/Pre-Configured Demonstration Accounts/i)).toBeInTheDocument();
  });
});
