import React from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "outlined" | "outlinedDark";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    className?: string;
    children: React.ReactNode;
    size?: "small" | "medium" | "large";
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
    primary: "bg-black text-white hover:bg-neutral-800",
    secondary: "bg-[#E5E5E5] text-black hover:bg-[#c9c9c9]",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outlined: "bg-transparent border border-black text-black hover:bg-black hover:text-white",
    outlinedDark: "bg-transparent border border-white text-white hover:bg-white hover:text-black",
};

const Button: React.FC<ButtonProps> = ({
    children,
    type = "button",
    onClick,
    className = "",
    variant = "secondary",
    disabled = false,
    size = "medium",
    ...rest
}) => {
    const baseStyles = "p-2 rounded transition-colors duration-200";
    const variantStyles = VARIANT_STYLES[variant];

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variantStyles} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""} 
                ${size === "small" ? "text-sm" : size === "large" ? "text-lg" : "text-md"}`}
            {...rest}
        >
            {children}
        </button>
    );
};

export default Button;
