import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JobCard } from './JobCard';
import { Job } from '@/services/api';

const mockJob: Job = {
  id: '1',
  title: 'Senior Software Engineer',
  company: 'TechCorp Inc.',
  location: 'San Francisco, CA',
  salary: '$150,000 - $200,000',
  matchScore: 92,
  description: 'Join our innovative team to build next-generation cloud solutions.',
  requirements: ['5+ years experience', 'React/TypeScript', 'Cloud platforms'],
  postedAt: '2 days ago',
  type: 'Full-time',
};

describe('JobCard', () => {
  it('should render job title and company', () => {
    const onApply = vi.fn();
    render(<JobCard job={mockJob} onApply={onApply} />);
    
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('TechCorp Inc.')).toBeInTheDocument();
  });

  it('should display match score', () => {
    const onApply = vi.fn();
    render(<JobCard job={mockJob} onApply={onApply} />);
    
    expect(screen.getByText('92% Match')).toBeInTheDocument();
  });

  it('should display location and salary', () => {
    const onApply = vi.fn();
    render(<JobCard job={mockJob} onApply={onApply} />);
    
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
    expect(screen.getByText('$150,000 - $200,000')).toBeInTheDocument();
  });

  it('should display job type', () => {
    const onApply = vi.fn();
    render(<JobCard job={mockJob} onApply={onApply} />);
    
    expect(screen.getByText('Full-time')).toBeInTheDocument();
  });

  it('should display job description', () => {
    const onApply = vi.fn();
    render(<JobCard job={mockJob} onApply={onApply} />);
    
    expect(screen.getByText(/Join our innovative team/)).toBeInTheDocument();
  });

  it('should call onApply when Apply Now button is clicked', async () => {
    const onApply = vi.fn().mockResolvedValue(undefined);
    render(<JobCard job={mockJob} onApply={onApply} />);
    
    const applyButton = screen.getByText('Apply Now');
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      expect(onApply).toHaveBeenCalledWith('1');
    });
  });

  it('should show Applied state after successful application', async () => {
    const onApply = vi.fn().mockResolvedValue(undefined);
    render(<JobCard job={mockJob} onApply={onApply} />);
    
    const applyButton = screen.getByText('Apply Now');
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      expect(screen.getByText('Applied')).toBeInTheDocument();
    });
  });

  it('should disable button while applying', async () => {
    let resolveApply: (value: void) => void;
    const onApply = vi.fn().mockImplementation(() => new Promise<void>((resolve) => {
      resolveApply = resolve;
    }));
    
    render(<JobCard job={mockJob} onApply={onApply} />);
    
    const applyButton = screen.getByText('Apply Now');
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      expect(screen.getByText('Applying...')).toBeInTheDocument();
    });
    
    resolveApply!(undefined);
  });

  it('should display requirements as badges', () => {
    const onApply = vi.fn();
    render(<JobCard job={mockJob} onApply={onApply} />);
    
    // Should show first 2 requirements
    expect(screen.getByText('5+ years experience')).toBeInTheDocument();
    expect(screen.getByText('React/TypeScript')).toBeInTheDocument();
  });
});
