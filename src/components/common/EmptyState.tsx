import React from 'react';
import type { IconType } from 'react-icons';

interface EmptyStateProps {
    icon?: IconType;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className = ''
}) => {
    return (
        <div className={`flex flex-col items-center justify-center p-12 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 ${className}`}>
            {Icon && (
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <Icon className="text-4xl text-gray-400" />
                </div>
            )}
            <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
            <p className="max-w-md text-gray-500 mb-6">{description}</p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
