import React, { useState } from 'react';
import axios from '../services/api';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const CreateVCard: React.FC = () => {
    const { t } = useTranslation(['qr', 'common']);
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [company, setCompany] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [website, setWebsite] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [logoBase64, setLogoBase64] = useState<string>('');
    const [foregroundColor, setForegroundColor] = useState<string>('#000000');
    const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');

    const navigate = useNavigate();

    const handleLogoUpload = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                setLogoBase64(reader.result.split(',')[1]); // sadece base64
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/vcards', {
                firstName,
                lastName,
                email,
                phone,
                company,
                title,
                website,
                address,
                foregroundColor,
                backgroundColor,
                logoBase64,
            });
            toast.success(t('qr:create.messages.qr_created'));
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            toast.error(t('qr:create.messages.qr_failed'));
        }
    };

    return (
        <DashboardLayout>
            <h1 className="text-2xl font-bold mb-4">{t('vcard.title')}</h1>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">

                <div className="flex space-x-2">
                    <input
                        type="text"
                        placeholder={t('vcard.first_name')}
                        className="w-1/2 p-2 border rounded"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder={t('vcard.last_name')}
                        className="w-1/2 p-2 border rounded"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </div>

                <input
                    type="email"
                    placeholder={t('common:email')}
                    className="w-full p-2 border rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="tel"
                    placeholder={t('qr:create.labels.phone')}
                    className="w-full p-2 border rounded"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />

                <input
                    type="text"
                    placeholder={t('qr:create.labels.company')}
                    className="w-full p-2 border rounded"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                />

                <input
                    type="text"
                    placeholder={t('qr:create.labels.job_title')}
                    className="w-full p-2 border rounded"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <input
                    type="url"
                    placeholder={t('qr:create.labels.website')}
                    className="w-full p-2 border rounded"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                />

                <input
                    type="text"
                    placeholder={t('qr:create.labels.address')}
                    className="w-full p-2 border rounded"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />

                <div className="flex flex-col space-y-2">
                    <label className="font-semibold">{t('qr:create.labels.upload_logo_opt')}</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files && handleLogoUpload(e.target.files[0])}
                    />
                </div>

                <div className="flex space-x-4">
                    <div className="flex flex-col space-y-1">
                        <label className="font-semibold">{t('qr:create.labels.foreground_color')}</label>
                        <input
                            type="color"
                            value={foregroundColor}
                            onChange={(e) => setForegroundColor(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col space-y-1">
                        <label className="font-semibold">{t('qr:create.labels.background_color')}</label>
                        <input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                        />
                    </div>
                </div>

                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                    {t('vcard.create_button')}
                </button>
            </form>
        </DashboardLayout>
    );
}

export default CreateVCard;
