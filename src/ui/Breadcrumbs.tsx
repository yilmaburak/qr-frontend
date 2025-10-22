import React from "react"
import { Link } from "react-router-dom";

interface BreadcrumbsProps {
    data: Array<{ label: string; path: string }>
    labelClassName?: string
    iconClassName?: string
}

const Breadcrumbs = ({ data: breadcrumbs = [], labelClassName, iconClassName }: BreadcrumbsProps) => {

    return (
        <nav aria-label="Breadcrumb" className="overflow-x-auto max-w-[100%]">
            <ol className="flex list-none items-stretch gap-2 px-2">
                {breadcrumbs.map((item, index) => {
                    return (
                        <li
                            className={`${index === breadcrumbs.length - 1
                                ? "flex flex-1 items-center gap-2"
                                : index === breadcrumbs.length - 2
                                    ? "flex items-center gap-2"
                                    : "hidden items-center gap-2 md:flex"
                                }`}
                            key={index}
                        >
                            <Link
                                to={index !== breadcrumbs.length - 1 ? `/${item.path}` : '#'}
                                className={`
                                            ${index === breadcrumbs.length - 1
                                        ? "pointer-events-none max-w-[20ch] items-center gap-1 truncate whitespace-nowrap text-[#EDEDED]"
                                        : "flex max-w-[20ch] items-center gap-1 truncate whitespace-nowrap text-[#888888] hover:text-[#EDEDED]"}
                                            ${labelClassName || ''}
                                        `}
                            >
                                {item.label}
                            </Link>
                            {index !== breadcrumbs.length - 1 && (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-4 w-4 flex-none stroke-[#888888] rotate-180 ${iconClassName || ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    aria-hidden="true"
                                    aria-labelledby={`aria-title-0${index} aria-description-0${index}`}
                                    role="graphics-symbol"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}

export default Breadcrumbs