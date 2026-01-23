import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PasswordFieldProps {
    label?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    id?: string;
    required?: boolean;
}

const PasswordField: React.FC<PasswordFieldProps> = ({ label, value, onChange, placeholder, id, required = true }) => {
    const { t } = useTranslation('common');
    const [show, setShow] = useState<boolean>(false);
    const displayLabel = label || t('auth.password');
    const displayPlaceholder = placeholder || t('auth.password');
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium mb-1">{displayLabel}</label>
            <div style={{ display: 'flex', gap: 8 }}>
                <input
                    id={id}
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={displayPlaceholder}
                    required={required}
                    className="w-full border rounded px-3 py-2"
                />
                <button type="button" onClick={() => setShow(s => !s)} className="border rounded px-3 py-2">
                    {show ? t('common.hide') : t('common.show')}
                </button>
            </div>
        </div>
    );
};

export default PasswordField;
