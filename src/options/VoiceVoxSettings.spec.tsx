import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import VoiceVoxSettings from './VoiceVoxSettings';

export {};

// Mock fetch
global.fetch = jest.fn();

const MockVoiceVoxSettings = () => (
  <RecoilRoot>
    <VoiceVoxSettings />
  </RecoilRoot>
);

describe('VoiceVoxSettings', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  test('renders VoiceVox settings with default values', () => {
    render(<MockVoiceVoxSettings />);
    
    expect(screen.getByText('VoiceVox設定')).toBeInTheDocument();
    expect(screen.getByLabelText('GCPモード（デフォルト）')).toBeChecked();
    expect(screen.getByLabelText('Localモード')).not.toBeChecked();
    expect(screen.getByDisplayValue('http://localhost:50021')).toBeInTheDocument();
  });

  test('switches between local and GCP modes', () => {
    render(<MockVoiceVoxSettings />);
    
    const localModeRadio = screen.getByLabelText('Localモード');
    const gcpModeRadio = screen.getByLabelText('GCPモード（デフォルト）');
    
    fireEvent.click(localModeRadio);
    expect(localModeRadio).toBeChecked();
    expect(gcpModeRadio).not.toBeChecked();
    
    fireEvent.click(gcpModeRadio);
    expect(gcpModeRadio).toBeChecked();
    expect(localModeRadio).not.toBeChecked();
  });

  test('updates local endpoint URL', () => {
    render(<MockVoiceVoxSettings />);
    
    const endpointInput = screen.getByDisplayValue('http://localhost:50021');
    fireEvent.change(endpointInput, { target: { value: 'http://localhost:8080' } });
    
    expect(endpointInput).toHaveValue('http://localhost:8080');
  });

  test('local VoiceVox test success', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ version: '0.14.0' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ accent_phrases: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024))
      });

    // Mock Audio
    global.Audio = jest.fn().mockImplementation(() => ({
      play: jest.fn()
    }));

    render(<MockVoiceVoxSettings />);
    
    const testButton = screen.getByText('Local VoiceVoxをテスト');
    fireEvent.click(testButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Local VoiceVoxのテストが成功しました/)).toBeInTheDocument();
    });
  });

  test('local VoiceVox test failure', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Connection failed'));

    render(<MockVoiceVoxSettings />);
    
    const testButton = screen.getByText('Local VoiceVoxをテスト');
    fireEvent.click(testButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Local VoiceVoxのテストに失敗しました/)).toBeInTheDocument();
    });
  });

  test('GCP VoiceVox test success', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024))
    });

    // Mock Audio
    global.Audio = jest.fn().mockImplementation(() => ({
      play: jest.fn()
    }));

    render(<MockVoiceVoxSettings />);
    
    const testButton = screen.getByText('GCP VoiceVoxをテスト');
    fireEvent.click(testButton);
    
    await waitFor(() => {
      expect(screen.getByText(/GCP VoiceVoxのテストが成功しました/)).toBeInTheDocument();
    });
  });

  test('displays usage instructions', () => {
    render(<MockVoiceVoxSettings />);
    
    expect(screen.getByText('使用方法:')).toBeInTheDocument();
    expect(screen.getByText(/1\. Localモード:/)).toBeInTheDocument();
    expect(screen.getByText(/2\. GCPモード:/)).toBeInTheDocument();
  });
});
