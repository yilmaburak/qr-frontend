import React, { useId } from 'react'

const SelectMenu = ({ options, selected, handleChange, label, classNames }: any) => {
    const generatedId = useId();

    return (
        <div className={`relative mt-3 w-full ${classNames || ''}`}>
            <select
                id={generatedId}
                name={generatedId}
                required
                className="peer relative h-10 w-full appearance-none rounded border border-neutral-800 bg-neutral-900 px-4 text-sm text-white outline-none transition-all focus:border-neutral-700 focus-visible:outline-none focus:focus-visible:outline-none"
                value={selected.value}
                onChange={handleChange}
            >
                {options.map((option: any, index: number) => (
                    <option
                        key={index}
                        value={option.value}
                        onClick={handleChange}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
            <label
                htmlFor={generatedId}
                className="pointer-events-none absolute top-2.5 left-2 z-[1] px-2 text-sm text-white transition-all before:absolute before:top-0 before:left-0 before:z-[-1] before:block before:h-full before:w-full before:bg-neutral-900 before:transition-all peer-required:after:text-pink-500 peer-required:after:content-['\00a0*'] peer-valid:-top-2 peer-valid:text-xs peer-focus:-top-2 peer-focus:text-xs peer-focus:text-neutral-700"
            >
                {label}
            </label>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="pointer-events-none absolute top-2.5 right-2 h-5 w-5 fill-slate-400 transition-all peer-focus:fill-white peer-disabled:cursor-not-allowed"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-labelledby="title-05 description-05"
                role="graphics-symbol"
            >
                <title id="title-05">Arrow Icon</title>
                <desc id="description-05">Arrow icon of the select list.</desc>
                <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                />
            </svg>
        </div>
    )
}

export default SelectMenu