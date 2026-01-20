import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResumeUpload } from './ResumeUpload';

describe('ResumeUpload', () => {
  it('should render upload prompt when no file is uploaded', () => {
    const onUpload = vi.fn();
    render(<ResumeUpload onUpload={onUpload} />);
    
    expect(screen.getByText('Upload your resume')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop or click to browse')).toBeInTheDocument();
    expect(screen.getByText('Supports PDF, DOC, DOCX')).toBeInTheDocument();
  });

  it('should show loading state when uploading', () => {
    const onUpload = vi.fn();
    render(<ResumeUpload onUpload={onUpload} isUploading={true} />);
    
    expect(screen.getByText('Analyzing your resume...')).toBeInTheDocument();
  });

  it('should show uploaded file name when file is uploaded', () => {
    const onUpload = vi.fn();
    const mockFile = new File(['test'], 'my-resume.pdf', { type: 'application/pdf' });
    
    render(<ResumeUpload onUpload={onUpload} uploadedFile={mockFile} />);
    
    expect(screen.getByText('my-resume.pdf')).toBeInTheDocument();
    expect(screen.getByText('Resume uploaded successfully')).toBeInTheDocument();
  });

  it('should call onUpload when file is selected', () => {
    const onUpload = vi.fn();
    render(<ResumeUpload onUpload={onUpload} />);
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    
    const file = new File(['test content'], 'resume.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(onUpload).toHaveBeenCalledWith(file);
  });

  it('should have correct accept attribute for file types', () => {
    const onUpload = vi.fn();
    render(<ResumeUpload onUpload={onUpload} />);
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.accept).toBe('.pdf,.doc,.docx');
  });

  it('should disable input while uploading', () => {
    const onUpload = vi.fn();
    render(<ResumeUpload onUpload={onUpload} isUploading={true} />);
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
