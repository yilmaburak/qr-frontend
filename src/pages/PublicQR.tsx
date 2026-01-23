import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const PublicQR: React.FC = () => {
    const { t } = useTranslation('qr');
    const { id } = useParams<{ id: string }>();
    const [qrUrl, setQrUrl] = useState<string>('');

    useEffect(() => {
        if (id) {
            setQrUrl(`/api/public/qr/image/${id}`);
        }
    }, [id]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
            <h1 className="text-2xl font-bold mb-4">{t('public_qr.title')}</h1>
            {qrUrl ? (
                <img src={qrUrl} alt="Public QR Code" className="w-64 h-64 border p-2 bg-white shadow" />
            ) : (
                <p>{t('public_qr.loading')}</p>
            )}
        </div>
    );
}

export default PublicQR;
