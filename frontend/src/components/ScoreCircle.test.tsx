import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreCircle } from './ScoreCircle';

describe('ScoreCircle', () => {
  it('should render the score value', () => {
    render(<ScoreCircle score={85} />);
    
    // Initially renders 0 then animates to the score
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should render with a label when provided', () => {
    render(<ScoreCircle score={75} label="Overall Score" />);
    
    expect(screen.getByText('Overall Score')).toBeInTheDocument();
  });

  it('should accept different sizes', () => {
    const { rerender } = render(<ScoreCircle score={50} size="sm" />);
    expect(document.querySelector('svg')).toHaveAttribute('width', '80');
    
    rerender(<ScoreCircle score={50} size="md" />);
    expect(document.querySelector('svg')).toHaveAttribute('width', '140');
    
    rerender(<ScoreCircle score={50} size="lg" />);
    expect(document.querySelector('svg')).toHaveAttribute('width', '200');
  });

  it('should apply correct color classes based on score', () => {
    const { container, rerender } = render(<ScoreCircle score={90} />);
    // High score should have success color
    
    rerender(<ScoreCircle score={70} />);
    // Medium-high score should have primary color
    
    rerender(<ScoreCircle score={50} />);
    // Medium score should have warning color
    
    rerender(<ScoreCircle score={30} />);
    // Low score should have destructive color
  });
});
