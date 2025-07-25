interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    className?: string;
    text?: string;
}

export default function LoadingSpinner({
    size = 'medium',
    className = '',
    text = 'Chargement...'
}: LoadingSpinnerProps) {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-8 h-8',
        large: 'w-12 h-12'
    };

    const textSizeClasses = {
        small: 'text-sm',
        medium: 'text-base',
        large: 'text-lg'
    };

    return (
        <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
            <div className={`${sizeClasses[size]} animate-spin`}>
                <svg
                    className="w-full h-full text-mauritania-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            </div>

            {text && (
                <p className={`text-gray-600 font-medium ${textSizeClasses[size]}`}>
                    {text}
                </p>
            )}
        </div>
    );
}