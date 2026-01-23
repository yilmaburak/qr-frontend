import React from 'react';

interface SkeletonLoaderProps {
    variant?: 'text' | 'rect' | 'circle';
    width?: string | number;
    height?: string | number;
    className?: string;
    count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
    variant = 'text',
    width,
    height,
    className = '',
    count = 1
}) => {
    const getBaseClasses = () => {
        const base = "animate-pulse bg-gray-200 rounded";
        switch (variant) {
            case 'circle':
                return `${base} rounded-full`;
            case 'rect':
                return `${base}`;
            case 'text':
            default:
                return `${base} rounded-md`;
        }
    };

    const style = {
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || (variant === 'text' ? '1rem' : undefined),
    };

    const skeletons = Array(count).fill(0).map((_, index) => (
        <div
            key={index}
            className={`${getBaseClasses()} ${className}`}
            style={style}
        />
    ));

    return (
        <div className="space-y-2">
            {skeletons}
        </div>
    );
};

export default SkeletonLoader;
