import React from 'react';
import { render } from '@testing-library/react';
import { DotLoader } from '@/components/ui/dot-loader';

describe('DotLoader Component', () => {
    it('renders the dot grid correctly', () => {
        const frames = [[0, 1, 2], [3, 4, 5]];
        const { container } = render(
            <DotLoader frames={frames} />
        );
        
        const grid = container.querySelector('.grid');
        expect(grid).toBeInTheDocument();
        
        // Should render 49 dots (7x7 grid)
        const dots = container.querySelectorAll('.grid > div');
        expect(dots.length).toBe(49);
    });

    it('applies custom className', () => {
        const frames = [[0, 1]];
        const { container } = render(
            <DotLoader frames={frames} className="custom-class" />
        );
        
        const grid = container.querySelector('.grid');
        expect(grid).toHaveClass('custom-class');
    });

    it('applies custom dotClassName', () => {
        const frames = [[0, 1]];
        const { container } = render(
            <DotLoader frames={frames} dotClassName="custom-dot" />
        );
        
        const dots = container.querySelectorAll('.grid > div');
        dots.forEach(dot => {
            expect(dot).toHaveClass('custom-dot');
        });
    });

    it('passes through HTML attributes', () => {
        const frames = [[0, 1]];
        const { container } = render(
            <DotLoader frames={frames} aria-label="test-loader" />
        );
        
        const grid = container.querySelector('[data-testid="dot-loader"]');
        expect(grid).toBeInTheDocument();
        expect(grid).toHaveAttribute('aria-label', 'test-loader');
    });

    it('renders without playing by default', () => {
        const frames = [[0, 1, 2]];
        const { container } = render(
            <DotLoader frames={frames} isPlaying={false} />
        );
        
        const grid = container.querySelector('.grid');
        expect(grid).toBeInTheDocument();
    });
});