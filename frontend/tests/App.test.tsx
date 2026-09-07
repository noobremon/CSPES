import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { App } from '../src/app/App';

// Mock global fetch for health check
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        success: true,
        data: {
          status: 'healthy',
          app_name: 'AI-Powered National Unified Material Master Framework',
          environment: 'development',
          version: '0.1.0',
          timestamp: '2026-09-08T00:00:00Z',
        },
      }),
  })
) as unknown as typeof fetch;

describe('Frontend Foundation Application Shell', () => {
  it('renders application header and title successfully', () => {
    render(<App />);
    const headings = screen.getAllByText(/National Unified Material Master Framework/i);
    expect(headings.length).toBeGreaterThan(0);
    expect(headings[0]).toBeInTheDocument();
  });

  it('renders architecture tier cards', () => {
    render(<App />);
    expect(screen.getByText(/Frontend Tier/i)).toBeInTheDocument();
    expect(screen.getByText(/Backend API Gateway/i)).toBeInTheDocument();
    expect(screen.getByText(/Data & Storage Layer/i)).toBeInTheDocument();
  });
});
