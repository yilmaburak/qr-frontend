import React, { useId } from 'react';

export interface InputProps {
    type?: string;
    value?: string;
    label?: string;
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    inputClass?: string;
    labelClass?: string;
    id?: string;
    name?: string;
    autoComplete?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    title?: string;
    inputMode?: 'text' | 'search' | 'email' | 'tel' | 'url' | 'none' | 'numeric' | 'decimal';
    autoFocus?: boolean;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    Icon?: React.ReactNode;
    iconOnRight?: boolean;
    iconProps?: React.HTMLAttributes<HTMLDivElement>;
    iconClassName?: string;
    showAsterisk?: boolean;
    [key: string]: any; // Support for additional props (e.g., data-*, aria-*)
}

const Input: React.FC<InputProps> = ({
    type = 'text',
    inputClass,
    labelClass,
    label,
    id,
    Icon,
    iconOnRight = false,
    iconProps,
    iconClassName,
    value,
    placeholder,
    required = false,
    showAsterisk = true,
    ...props
}) => {
    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;

    const inputPadding = Icon
        ? iconOnRight
            ? 'pr-10 pl-4'
            : 'pl-10 pr-4'
        : 'px-4';

    const inputBaseClass = `
        peer relative w-full h-10 text-sm placeholder-transparent transition-all border rounded outline-none 
        focus-visible:outline-none border-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50 
        disabled:text-slate-400 bg-black text-slate-500 autofill:bg-black 
        [&:not(:placeholder-shown):invalid]:border-pink-500 [&:not(:placeholder-shown):invalid]:text-pink-500
    `;

    const labelOffset = Icon && !iconOnRight && !value ? 'ml-6' : '';

    const labelBaseClass = `
        peer-placeholder-shown:top-2.5 cursor-text px-2 absolute left-2 -top-2 z-[1] text-xs transition-all before:absolute 
        before:top-0 before:left-0 before:z-[-1] before:block before:h-full before:w-full before:bg-black before:transition-all
        peer-focus:cursor-default peer-autofill:-top-2 peer-autofill:ml-0 peer-focus:ml-0 
        peer-placeholder-shown:text-sm peer-required:after:content-['*'] peer-focus:-top-2 peer-focus:text-xs 
        peer-disabled:cursor-not-allowed peer-disabled:text-slate-400 peer-disabled:before:bg-transparent
    `;

    const iconPositionClass = iconOnRight ? 'right-2' : 'left-2';

    return (
        <div className="relative">
            <input
                {...props}
                id={inputId}
                type={type}
                value={value}
                placeholder={placeholder}
                className={`${inputClass ?? ''} ${inputPadding} ${inputBaseClass}`}
            />

            <label
                htmlFor={inputId}
                className={`${labelClass ?? ''} ${labelOffset} ${labelBaseClass}`}
            >
                {label ?? placeholder}
                {showAsterisk && required && (
                    <span className="text-red-500 ml-1">*</span>
                )}
            </label>

            {Icon && (
                <div
                    className={`
                        ${iconClassName ?? ''} ${iconPositionClass}
                        absolute top-1/2 z-1 flex -translate-y-1/2 items-center justify-center 
                        rounded bg-black text-slate-400 w-fit
                    `}
                    {...iconProps}
                >
                    {Icon}
                </div>
            )}
        </div>
    );
};

export default Input;
