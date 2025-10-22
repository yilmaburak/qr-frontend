import React, { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import Input from '../../ui/Input';
import { toast } from 'react-toastify';
import { generateQRCode, getQRCodeDetails, updateQRCode } from '../../services/qr';
import SelectMenu from '../../ui/SelectMenu';
import QRCodeStyling, {
    DrawType,
    DotType,
    CornerSquareType,
    CornerDotType,
    Options
} from "qr-code-styling";
import AccordionIcon from '../../ui/AccordionIcon';
import Button from '../../ui/Button';

const dotsStyles = [
    {
        label: 'Square',
        value: 'square',
    },
    {
        label: 'Dots',
        value: 'dots',
    },
    {
        label: 'Rounded',
        value: 'rounded',
    },
    {
        label: 'Classy',
        value: 'classy',
    },
    {
        label: 'Classy Rounded',
        value: 'classy-rounded',
    },
    {
        label: 'Extra Rounded',
        value: 'extra-rounded',
    }
];

const colorTypeOptions = [
    { label: 'Single Color', value: 'single' },
    { label: 'Gradient', value: 'gradient' },
];

const gradientTypeOptions = [
    { label: 'Linear', value: 'linear' },
    { label: 'Radial', value: 'radial' },
];

const cornerSquareStyles = [
    {
        label: 'Square',
        value: 'square',
    },
    {
        label: 'Dot',
        value: 'dot',
    },
    {
        label: 'Extra Rounded',
        value: 'extra-rounded',
    }
];

const cornerDotStyles = [
    {
        label: 'Dot',
        value: 'dot',
    },
    {
        label: 'Square',
        value: 'square',
    }
];

const backgroundTypeOptions = [
    { label: 'Solid Color', value: 'solid' },
    { label: 'Gradient', value: 'gradient' }
];

const QrForm = () => {
    const { id } = useParams<{ id: string }>()
    const [options, setOptions] = useState<Options | any>({
        title: 'My QR Code',
        description: 'Generated QR Code',
        width: 300,
        height: 300,
        type: 'svg' as DrawType,
        data: 'https://example.com',
        image: undefined,
        margin: 0,
        imageOptions: {
            hideBackgroundDots: true,
            imageSize: 0.4,
            margin: 20,
        },
        dotsOptions: {
            color: '#000000',
            type: 'square' as DotType
        },
        backgroundOptions: {
            color: '#ffffff',
            // gradient: {
            //   type: 'linear', // 'radial'
            //   rotation: 0,
            //   colorStops: [{ offset: 0, color: '#ededff' }, { offset: 1, color: '#e6e7ff' }]
            // },
        },
        cornersSquareOptions: {
            color: '#000000',
            type: 'extra-rounded' as CornerSquareType,
            // gradient: {
            //   type: 'linear', // 'radial'
            //   rotation: 180,
            //   colorStops: [{ offset: 0, color: '#25456e' }, { offset: 1, color: '#4267b2' }]
            // },
        },
        cornersDotOptions: {
            color: '#000000',
            type: 'dot' as CornerDotType,
            // gradient: {
            //   type: 'linear', // 'radial'
            //   rotation: 180,
            //   colorStops: [{ offset: 0, color: '#00266e' }, { offset: 1, color: '#4060b3' }]
            // },
        }
    });
    const [qrCode] = useState<QRCodeStyling>(new QRCodeStyling(options));
    const ref = useRef<HTMLDivElement>(null);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [logoBase64, setLogoBase64] = useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const getQRCode = async (id: string) => {
        const res = await getQRCodeDetails(id);
        setOptions(res.data); //TODO: map data properly
    }

    useEffect(() => {
        if (ref.current) {
            qrCode.append(ref.current);
        }
    }, [qrCode, ref]);

    useEffect(() => {
        if (!qrCode) return;
        qrCode.update(options);
    }, [qrCode, options]);

    useEffect(() => {
        if (id) {
            getQRCode(id)
            dispatch({ type: 'general/setSubTitle', payload: 'edit qr code' });
            dispatch({ type: 'general/setTitle', payload: 'dashboard' });
        } else {
            dispatch({ type: 'general/setSubTitle', payload: 'create qr code' });
            dispatch({ type: 'general/setTitle', payload: 'dashboard' });
        }
    }, [dispatch, id]);

    const handleChangeOptions = (key: string, value: any) => {
        if (key.includes('.')) {
            const keys = key.split('.');
            setOptions((prev: any) => {
                let updated = { ...prev };
                let current = updated;
                for (let i = 0; i < keys.length - 1; i++) {
                    current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = value;
                return updated;
            }
            );
            return;
        }
        setOptions((prev: any) => ({
            ...prev,
            [key]: value,
        }));
    }

    const handleLogoChange = (e: any) => {
        const file: any = e.target.files[0];
        if (!file) return;

        setLogoFile(file);
        setOptions((prev: any) => ({
            ...prev,
            image: URL.createObjectURL(file) as any,
        }));

        const reader: any = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            setLogoBase64(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        //TODO
        console.log('Submitting with options:', options);
        const data = {
            content: options.data,
            title: options.title,
            description: options.description,
            logoBase64: logoBase64,
            foregroundColor: options.dotsOptions.gradient ? options.dotsOptions.gradient.colorStops[0].color : options.dotsOptions.color,
            backgroundColor: options.backgroundOptions.gradient ? options.backgroundOptions.gradient.colorStops[0].color : options.backgroundOptions.color,
            style: options.dotsOptions.type,
        };

        try {
            if (id) {
                const res = await updateQRCode(id, data)
            } else {
                const res = await generateQRCode(data)
            }
            toast.success('QR Code başarıyla oluşturuldu!');
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            toast.error('QR Code oluşturulamadı!');
        }
    }

    return (
        <>
            {/* Header Section */}
            <section
                className="bg-neutral-900 py-6 mb-8 rounded-lg shadow-md"
            >
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-white">
                        {id ? 'Edit Your QR Code' : 'Create a New QR Code'}
                    </h2>
                    <p className="text-neutral-300 mt-2">
                        {id ? 'Update the details of your QR code below.' : 'Fill in the details below to generate your QR code.'}
                    </p>
                </div>
            </section>
            {/* Main Content Section */}
            <section className="flex flex-col-reverse md:flex-row gap-8 container mx-auto overflow-visible">
                {/* Form Section */}
                <section className="flex-[4] w-full rounded">
                    <details className="group" open>
                        <summary className="px-2 py-4 rounded bg-neutral-900 [&::-webkit-details-marker]:hidden relative pr-8 font-medium list-none cursor-pointer text-[#acacac] focus-visible:outline-none transition-colors duration-300 group-hover:text-white group-open:text-white">
                            Main Options
                            <AccordionIcon />
                        </summary>
                        <div className="flex-1 mt-4 grid grid-cols-2 gap-4">
                            <Input
                                type="text"
                                placeholder='Title'
                                value={options.title}
                                onChange={(e) => handleChangeOptions('title', e.target.value)}
                                required
                            />
                            <Input
                                type="text"
                                placeholder='Description'
                                value={options.description}
                                onChange={(e) => handleChangeOptions('description', e.target.value)}
                                required
                            />
                            <div className="col-span-2 mt-4">
                                <Input
                                    type="text"
                                    placeholder='Content (URL or text)'
                                    value={options.data}
                                    onChange={(e) => handleChangeOptions('data', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </details>
                    <details className="mt-4 group">
                        <summary className="px-2 py-4 rounded bg-neutral-900 [&::-webkit-details-marker]:hidden relative pr-8 font-medium list-none cursor-pointer text-[#acacac] focus-visible:outline-none transition-colors duration-300 group-hover:text-white group-open:text-white">
                            Image Options
                            <AccordionIcon />
                        </summary>
                        <div className="flex-1 mt-4 grid grid-cols-2 gap-4">
                            <div className="relative col-span-2">
                                <input
                                    id="id-dropzone02"
                                    name="file-upload"
                                    type="file"
                                    className="peer hidden"
                                    accept="image/*"
                                    multiple={false}
                                    onChange={handleLogoChange}
                                />
                                {options.image ? (<>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            type="number"
                                            placeholder='Logo Size (0-1)'
                                            value={options.imageOptions.imageSize?.toString() || '0.4'}
                                            onChange={(e) => handleChangeOptions('imageOptions.imageSize', parseFloat(e.target.value))}
                                            required
                                            wrapperClass='mb-3'
                                            min="0.2" max="1" step="0.1"
                                        />
                                        <Input
                                            type="number"
                                            placeholder='Logo Margin (px)'
                                            value={options.imageOptions.margin?.toString() || '0'}
                                            onChange={(e) => handleChangeOptions('imageOptions.margin', parseInt(e.target.value))}
                                            required
                                            wrapperClass='mb-3'
                                            min="0" step="1"
                                        />
                                        <div className="relative flex flex-wrap items-center col-span-2">
                                            <input
                                                className="peer h-4 w-4 cursor-pointer appearance-none rounded border-2 border-slate-500 bg-white transition-colors checked:border-emerald-500 checked:bg-emerald-500 checked:hover:border-emerald-600 checked:hover:bg-emerald-600 focus:outline-none checked:focus:border-emerald-700 checked:focus:bg-emerald-700 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50"
                                                type="checkbox"
                                                checked={options.imageOptions.hideBackgroundDots || false}
                                                onChange={() => handleChangeOptions('imageOptions.hideBackgroundDots', !options.imageOptions.hideBackgroundDots)}
                                                id="id-c01"
                                            />
                                            <label
                                                className="cursor-pointer pl-2 text-slate-500 peer-disabled:cursor-not-allowed peer-disabled:text-slate-400"
                                                htmlFor="id-c01"
                                            >
                                                Hide Background Dots
                                            </label>
                                            <svg
                                                className="pointer-events-none absolute left-0 top-1 h-4 w-4 -rotate-90 fill-white stroke-white opacity-0 transition-all duration-300 peer-checked:rotate-0 peer-checked:opacity-100 peer-disabled:cursor-not-allowed"
                                                viewBox="0 0 16 16"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                aria-hidden="true"
                                                aria-labelledby="title-1 description-1"
                                                role="graphics-symbol"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M12.8116 5.17568C12.9322 5.2882 13 5.44079 13 5.5999C13 5.759 12.9322 5.91159 12.8116 6.02412L7.66416 10.8243C7.5435 10.9368 7.37987 11 7.20925 11C7.03864 11 6.87501 10.9368 6.75435 10.8243L4.18062 8.42422C4.06341 8.31105 3.99856 8.15948 4.00002 8.00216C4.00149 7.84483 4.06916 7.69434 4.18846 7.58309C4.30775 7.47184 4.46913 7.40874 4.63784 7.40737C4.80655 7.406 4.96908 7.46648 5.09043 7.57578L7.20925 9.55167L11.9018 5.17568C12.0225 5.06319 12.1861 5 12.3567 5C12.5273 5 12.691 5.06319 12.8116 5.17568Z"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="relative w-fit flex flex-col md:flex-row gap-4 items-center mx-auto">
                                        <p
                                            className="mb-2 font-medium text-white max-w-[200px] text-center"
                                        >
                                            Logo Preview
                                            {logoFile && ` (${(logoFile as any).name})`}
                                        </p>
                                        <img
                                            src={options.image as string}
                                            alt="Logo Preview"
                                            className="w-56 h-56 object-contain border rounded"
                                        />
                                        <button
                                            type="button"
                                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                            onClick={() => {
                                                setLogoFile(null);
                                                setLogoBase64(null);
                                                setOptions((prev: any) => ({
                                                    ...prev,
                                                    image: undefined,
                                                }));
                                            }}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className="w-4 h-4"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </>) : (
                                    <label
                                        htmlFor="id-dropzone02"
                                        className="flex cursor-pointer flex-col items-center gap-6 rounded border border-dashed bg-neutral-900 border-slate-300 px-6 py-10 text-center"
                                    >
                                        <span className="inline-flex h-12 items-center justify-center self-center rounded bg-white px-3 text-black">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                aria-label="File input icon"
                                                role="graphics-symbol"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className="h-6 w-6"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                                                />
                                            </svg>
                                        </span>
                                        <p className="flex flex-col items-center justify-center gap-1 text-sm">
                                            <span className="text-blue-500 hover:text-blue-500">
                                                Upload media
                                                <span className="text-slate-500"> or drag and drop </span>
                                            </span>
                                            <span className="text-slate-600"> PNG, JPG or GIF up to 10MB </span>
                                        </p>
                                    </label>
                                )}
                            </div>
                        </div>
                    </details>
                    <details className="mt-4 group">
                        <summary className="px-2 py-4 rounded bg-neutral-900 [&::-webkit-details-marker]:hidden relative pr-8 font-medium list-none cursor-pointer text-[#acacac] focus-visible:outline-none transition-colors duration-300 group-hover:text-white group-open:text-white">
                            Dots Options
                            <AccordionIcon />
                        </summary>
                        <div className="flex-1 grid grid-cols-2 gap-6 mt-2">
                            <SelectMenu
                                options={dotsStyles}
                                selected={dotsStyles.find((style) => style.value === options.dotsOptions.type)}
                                handleChange={(e: any) => handleChangeOptions('dotsOptions.type', e.target.value)}
                                label="Select Dot Style"
                            />
                            <SelectMenu
                                label="Select Color Type"
                                options={colorTypeOptions}
                                selected={colorTypeOptions.find((ct) => ct.value === options.dotsOptions.gradient ? 'gradient' : 'single')}
                                handleChange={(e: any) =>
                                    setOptions((prev: any) => ({
                                        ...prev,
                                        dotsOptions: {
                                            ...prev.dotsOptions,
                                            gradient: e.target.value === 'gradient' ? {
                                                type: 'linear',
                                                rotation: 0,
                                                colorStops: [
                                                    { offset: 0, color: options.dotsOptions.color },
                                                    { offset: 1, color: options.dotsOptions.color }
                                                ]
                                            } : undefined
                                        }
                                    })
                                    )}
                            />
                            {!options.dotsOptions.gradient ? (<>
                                <div className="flex gap-4">
                                    <label htmlFor='fc-input1' className="font-medium mb-1">Dots Color</label>
                                    <input
                                        id='fc-input1'
                                        type="color"
                                        value={options.dotsOptions.color}
                                        onChange={(e) => handleChangeOptions('dotsOptions.color', e.target.value)}
                                        required
                                    />
                                </div>
                            </>) : (
                                <>
                                    <div className="flex gap-4">
                                        <label htmlFor='fc-input2' className="font-medium mb-1">Dots Color Start</label>
                                        <input
                                            id='fc-input2'
                                            type="color"
                                            value={options.dotsOptions.gradient.colorStops[0].color}
                                            onChange={(e) => setOptions((prev: any) => ({
                                                ...prev,
                                                dotsOptions: {
                                                    ...prev.dotsOptions,
                                                    gradient: {
                                                        ...prev.dotsOptions.gradient,
                                                        colorStops: [
                                                            { offset: 0, color: e.target.value },
                                                            prev.dotsOptions.gradient.colorStops[1]
                                                        ]
                                                    }
                                                }
                                            }))}
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <label htmlFor='fc-input3' className="font-medium mb-1">Dots Color End</label>
                                        <input
                                            id='fc-input3'
                                            type="color"
                                            value={options.dotsOptions.gradient.colorStops[1].color}
                                            onChange={(e) => setOptions((prev: any) => ({
                                                ...prev,
                                                dotsOptions: {
                                                    ...prev.dotsOptions,
                                                    gradient: {
                                                        ...prev.dotsOptions.gradient,
                                                        colorStops: [
                                                            prev.dotsOptions.gradient.colorStops[0],
                                                            { offset: 1, color: e.target.value }
                                                        ]
                                                    }
                                                }
                                            }))}
                                            required
                                        />
                                    </div>
                                    <SelectMenu
                                        label="Select Gradient Type"
                                        options={gradientTypeOptions}
                                        selected={gradientTypeOptions.find((gt) => gt.value === options.dotsOptions.gradient.type)}
                                        handleChange={(e: any) => setOptions((prev: any) => ({
                                            ...prev,
                                            dotsOptions: {
                                                ...prev.dotsOptions,
                                                gradient: {
                                                    ...prev.dotsOptions.gradient,
                                                    type: e.target.value
                                                }
                                            }
                                        }))}
                                    />
                                    <Input
                                        type="number"
                                        placeholder='Rotation (0-360)'
                                        value={options.dotsOptions.gradient.rotation}
                                        onChange={(e) => setOptions((prev: any) => ({
                                            ...prev,
                                            dotsOptions: {
                                                ...prev.dotsOptions,
                                                gradient: {
                                                    ...prev.dotsOptions.gradient,
                                                    rotation: parseInt(e.target.value)
                                                }
                                            }
                                        }))}
                                        required
                                        wrapperClass='mt-3'
                                    />
                                </>
                            )}
                        </div>
                    </details>
                    <details className="mt-4 group">
                        <summary className="px-2 py-4 rounded bg-neutral-900 [&::-webkit-details-marker]:hidden relative pr-8 font-medium list-none cursor-pointer text-[#acacac] focus-visible:outline-none transition-colors duration-300 group-hover:text-white group-open:text-white">
                            Corner Square Options
                            <AccordionIcon />
                        </summary>
                        <div className="flex-1 mt-4 grid grid-cols-2 gap-4">
                            <SelectMenu
                                options={cornerSquareStyles}
                                selected={cornerSquareStyles.find((style) => style.value === options.cornersSquareOptions.type)}
                                handleChange={(e: any) => handleChangeOptions('cornersSquareOptions.type', e.target.value)}
                                label="Select Corner Square Style"
                            />
                            <SelectMenu
                                label="Select Color Type"
                                options={colorTypeOptions}
                                selected={options.cornersSquareOptions.gradient ? 'gradient' : 'single'}
                                handleChange={(e: any) =>
                                    setOptions((prev: any) => ({
                                        ...prev,
                                        cornersSquareOptions: {
                                            ...prev.cornersSquareOptions,
                                            gradient: e.target.value === 'gradient' ? {
                                                type: 'linear',
                                                rotation: 180,
                                                colorStops: [
                                                    { offset: 0, color: options.cornersSquareOptions.color },
                                                    { offset: 1, color: options.cornersSquareOptions.color }
                                                ]
                                            } : undefined
                                        }
                                    }))}
                            />
                            {!options.cornersSquareOptions.gradient ? (<>
                                <div className="flex gap-4">
                                    <label htmlFor='fc-input4' className="font-medium mb-1">Corner Square Color</label>
                                    <input
                                        id='fc-input4'
                                        type="color"
                                        value={options.cornersSquareOptions.color}
                                        onChange={(e) => handleChangeOptions('cornersSquareOptions.color', e.target.value)}
                                        required
                                    />
                                </div>
                            </>) : (
                                <>
                                    <div className="flex gap-4">
                                        <label htmlFor='fc-input5' className="font-medium mb-1">Corner Square Color Start</label>
                                        <input
                                            id='fc-input5'
                                            type="color"
                                            value={options.cornersSquareOptions.gradient.colorStops[0].color}
                                            onChange={(e) => setOptions((prev: any) => ({
                                                ...prev,
                                                cornersSquareOptions: {
                                                    ...prev.cornersSquareOptions,
                                                    gradient: {
                                                        ...prev.cornersSquareOptions.gradient,
                                                        colorStops: [
                                                            { offset: 0, color: e.target.value },
                                                            prev.cornersSquareOptions.gradient.colorStops[1]
                                                        ]
                                                    }
                                                }
                                            }))}
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <label htmlFor='fc-input6' className="font-medium mb-1">Corner Square Color End</label>
                                        <input
                                            id='fc-input6'
                                            type="color"
                                            value={options.cornersSquareOptions.gradient.colorStops[1].color}
                                            onChange={(e) => setOptions((prev: any) => ({
                                                ...prev,
                                                cornersSquareOptions: {
                                                    ...prev.cornersSquareOptions,
                                                    gradient: {
                                                        ...prev.cornersSquareOptions.gradient,
                                                        colorStops: [
                                                            prev.cornersSquareOptions.gradient.colorStops[0],
                                                            { offset: 1, color: e.target.value }
                                                        ]
                                                    }
                                                }
                                            }))}
                                            required
                                        />
                                    </div>
                                    <Input
                                        type="number"
                                        placeholder='Rotation (0-360)'
                                        value={options.cornersSquareOptions.gradient.rotation}
                                        onChange={(e) => setOptions((prev: any) => ({
                                            ...prev,
                                            cornersSquareOptions: {
                                                ...prev.cornersSquareOptions,
                                                gradient: {
                                                    ...prev.cornersSquareOptions.gradient,
                                                    rotation: parseInt(e.target.value)
                                                }
                                            }
                                        }))}
                                        required
                                        wrapperClass='mt-3'
                                    />
                                </>
                            )}
                        </div>
                    </details>
                    <details className="mt-4 group">
                        <summary className="px-2 py-4 rounded bg-neutral-900 [&::-webkit-details-marker]:hidden relative pr-8 font-medium list-none cursor-pointer text-[#acacac] focus-visible:outline-none transition-colors duration-300 group-hover:text-white group-open:text-white">
                            Corner Dot Options
                            <AccordionIcon />
                        </summary>
                        <div className="flex-1 mt-4 grid grid-cols-2 gap-4">
                            <SelectMenu
                                options={cornerDotStyles}
                                selected={cornerDotStyles.find((style) => style.value === options.cornersDotOptions.type)}
                                handleChange={(e: any) => handleChangeOptions('cornersDotOptions.type', e.target.value)}
                                label="Select Corner Dot Style"
                            />
                            <SelectMenu
                                label="Select Color Type"
                                options={colorTypeOptions}
                                selected={options.cornersDotOptions.gradient ? 'gradient' : 'single'}
                                handleChange={(e: any) =>
                                    setOptions((prev: any) => ({
                                        ...prev,
                                        cornersDotOptions: {
                                            ...prev.cornersDotOptions,
                                            gradient: e.target.value === 'gradient' ? {
                                                type: 'linear',
                                                rotation: 180,
                                                colorStops: [
                                                    { offset: 0, color: options.cornersDotOptions.color },
                                                    { offset: 1, color: options.cornersDotOptions.color }
                                                ]
                                            } : undefined
                                        }
                                    }))}
                            />
                            {!options.cornersDotOptions.gradient ? (<>
                                <div className="flex gap-4">
                                    <label htmlFor='fc-input7' className="font-medium mb-1">Corner Dot Color</label>
                                    <input
                                        id='fc-input7'
                                        type="color"
                                        value={options.cornersDotOptions.color}
                                        onChange={(e) => handleChangeOptions('cornersDotOptions.color', e.target.value)}
                                        required
                                    />
                                </div>
                            </>) : (
                                <>
                                    <div className="flex gap-4">
                                        <label htmlFor='fc-input8' className="font-medium mb-1">Corner Dot Color Start</label>
                                        <input
                                            id='fc-input8'
                                            type="color"
                                            value={options.cornersDotOptions.gradient.colorStops[0].color}
                                            onChange={(e) => setOptions((prev: any) => ({
                                                ...prev,
                                                cornersDotOptions: {
                                                    ...prev.cornersDotOptions,
                                                    gradient: {
                                                        ...prev.cornersDotOptions.gradient,
                                                        colorStops: [
                                                            { offset: 0, color: e.target.value },
                                                            prev.cornersDotOptions.gradient.colorStops[1]
                                                        ]
                                                    }
                                                }
                                            }))}
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <label htmlFor='fc-input9' className="font-medium mb-1">Corner Dot Color End</label>
                                        <input
                                            id='fc-input9'
                                            type="color"
                                            value={options.cornersDotOptions.gradient.colorStops[1].color}
                                            onChange={(e) => setOptions((prev: any) => ({
                                                ...prev,
                                                cornersDotOptions: {
                                                    ...prev.cornersDotOptions,
                                                    gradient: {
                                                        ...prev.cornersDotOptions.gradient,
                                                        colorStops: [
                                                            prev.cornersDotOptions.gradient.colorStops[0],
                                                            { offset: 1, color: e.target.value }
                                                        ]
                                                    }
                                                }
                                            }))}
                                            required
                                        />
                                    </div>
                                    <Input
                                        type="number"
                                        placeholder='Rotation (0-360)'
                                        value={options.cornersDotOptions.gradient.rotation}
                                        onChange={(e) => setOptions((prev: any) => ({
                                            ...prev,
                                            cornersDotOptions: {
                                                ...prev.cornersDotOptions,
                                                gradient: {
                                                    ...prev.cornersDotOptions.gradient,
                                                    rotation: parseInt(e.target.value)
                                                }
                                            }
                                        }))}
                                        required
                                        wrapperClass='mt-3'
                                    />
                                </>
                            )}
                        </div>
                    </details>
                    <details className="mt-4 group">
                        <summary className="px-2 py-4 rounded bg-neutral-900 [&::-webkit-details-marker]:hidden relative pr-8 font-medium list-none cursor-pointer text-[#acacac] focus-visible:outline-none transition-colors duration-300 group-hover:text-white group-open:text-white">
                            Background Options
                            <AccordionIcon />
                        </summary>
                        <div className="flex-1 mt-4 grid grid-cols-2 gap-4">
                            <SelectMenu
                                label="Select Background Type"
                                options={backgroundTypeOptions}
                                selected={options.backgroundOptions.gradient ? 'gradient' : 'single'}
                                handleChange={(e: any) => setOptions((prev: any) => ({
                                    ...prev,
                                    backgroundOptions: {
                                        ...prev.backgroundOptions,
                                        gradient: e.target.value === 'gradient' ? {
                                            type: 'linear',
                                            rotation: 0,
                                            colorStops: [
                                                { offset: 0, color: options.backgroundOptions.color },
                                                { offset: 1, color: options.backgroundOptions.color }
                                            ]
                                        } : undefined
                                    }
                                }))}
                            />
                            {!options.backgroundOptions.gradient ? (<>
                                <div className="flex gap-4 items-center pt-3">
                                    <label htmlFor='fc-input10' className="font-medium mb-1">Background Color</label>
                                    <input
                                        id='fc-input10'
                                        type="color"
                                        value={options.backgroundOptions.color}
                                        onChange={(e) => handleChangeOptions('backgroundOptions.color', e.target.value)}
                                        required
                                    />
                                </div>
                            </>) : (
                                <>
                                    <SelectMenu
                                        label="Select Gradient Type"
                                        options={gradientTypeOptions}
                                        selected={gradientTypeOptions.find((gt) => gt.value === options.backgroundOptions.gradient.type)}
                                        handleChange={(e: any) => setOptions((prev: any) => ({
                                            ...prev,
                                            backgroundOptions: {
                                                ...prev.backgroundOptions,
                                                gradient: {
                                                    ...prev.backgroundOptions.gradient,
                                                    type: e.target.value
                                                }
                                            }
                                        }))}
                                    />
                                    <div className="flex gap-4 items-center pt-3">
                                        <label htmlFor='fc-input11' className="font-medium mb-1">Background Color Start</label>
                                        <input
                                            id='fc-input11'
                                            type="color"
                                            value={options.backgroundOptions.gradient.colorStops[0].color}
                                            onChange={(e) => setOptions((prev: any) => ({
                                                ...prev,
                                                backgroundOptions: {
                                                    ...prev.backgroundOptions,
                                                    gradient: {
                                                        ...prev.backgroundOptions.gradient,
                                                        colorStops: [
                                                            { offset: 0, color: e.target.value },
                                                            prev.backgroundOptions.gradient.colorStops[1]
                                                        ]
                                                    }
                                                }
                                            }))}
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-4 items-center pt-3">
                                        <label htmlFor='fc-input12' className="font-medium mb-1">Background Color End</label>
                                        <input
                                            id='fc-input12'
                                            type="color"
                                            value={options.backgroundOptions.gradient.colorStops[1].color}
                                            onChange={(e) => setOptions((prev: any) => ({
                                                ...prev,
                                                backgroundOptions: {
                                                    ...prev.backgroundOptions,
                                                    gradient: {
                                                        ...prev.backgroundOptions.gradient,
                                                        colorStops: [
                                                            prev.backgroundOptions.gradient.colorStops[0],
                                                            { offset: 1, color: e.target.value }
                                                        ]
                                                    }
                                                }
                                            }))}
                                            required
                                        />
                                    </div>
                                    <Input
                                        type="number"
                                        placeholder='Rotation (0-360)'
                                        value={options.backgroundOptions.gradient.rotation}
                                        onChange={(e) => setOptions((prev: any) => ({
                                            ...prev,
                                            backgroundOptions: {
                                                ...prev.backgroundOptions,
                                                gradient: {
                                                    ...prev.backgroundOptions.gradient,
                                                    rotation: parseInt(e.target.value)
                                                }
                                            }
                                        }))}
                                        required
                                        wrapperClass='mt-3'
                                    />
                                </>
                            )}
                        </div>
                    </details>
                    <Button
                        className="mt-6 w-full md:hidden"
                        onClick={handleSubmit}
                    >
                        {id ? 'Update QR Code' : 'Generate QR Code'}
                    </Button>
                </section>
                {/* QR Preview Section */}
                <div className="flex-[2]">
                    <div className="md:sticky md:top-4 h-fit">
                        <div className="w-full p-4 bg-neutral-900 rounded flex flex-col items-center">
                            <h3 className="block mb-4 font-semibold text-white">QR Preview</h3>

                            {!options.data && (
                                <p className="text-neutral-400 my-2 max-w-60 text-center border p-4 rounded">
                                    QR code preview will appear here after entering content.
                                </p>
                            )}
                            <div ref={ref} />
                        </div>

                        <Button
                            className="mt-4 w-full hidden md:block"
                            onClick={handleSubmit}
                        >
                            {id ? 'Update QR Code' : 'Generate QR Code'}
                        </Button>
                    </div>
                </div>
            </section>
        </>
    )
}

export default QrForm