import { use, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {  getQRCodes } from '../../services/qr';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import Input from '../../ui/Input';
import QrCard from '../../components/QrCard';

const Dashboard = () => {
    const [qrcodes, setQRCodes] = useState<any>([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(6);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch({ type: 'general/setTitle', payload: 'dashboard' });
        dispatch({ type: 'general/setSubTitle', payload: 'my qrcodes' });
    }, [dispatch]);

    const fetchQRCodes = async () => {
        try {
            const res = await getQRCodes({ page, size, filter });
            setQRCodes(res.content);
            setTotalPages(res.totalPages);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch QR codes');
        }
    };

    useEffect(() => {
        fetchQRCodes();
    }, [page, size, filter]);

    return (
        <>
            <h1 className="text-2xl font-bold mb-4">My QR Codes</h1>

            <div className="mb-4 flex flex-wrap items-center gap-4">
                <Input
                    type="text"
                    placeholder="Filter by title or description"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <select
                    className="p-2 border rounded text-black"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                >
                    {[6, 12, 24].map((s) => (
                        <option key={s} value={s}>
                            {s} per page
                        </option>
                    ))}
                </select>
            </div>

            {qrcodes.length === 0 ? (
                <p className="text-center text-gray-600 mt-8">
                    No QR Codes found.
                    <button
                        onClick={() => navigate('/dashboard/create')}
                        className="text-blue-500 underline ml-2"
                    >Create your first QR Code</button>.
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {qrcodes.map((qr: any) => (
                        <QrCard data={qr} key={qr.id} />
                    ))}
                </div>
            )}

            <div className="flex justify-center mt-6 space-x-4">
                <button
                    onClick={() => setPage((p) => Math.max(p - 1, 0))}
                    disabled={page === 0}
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="px-3 py-1 bg-gray-100 rounded">
                    Page {page + 1} of {totalPages}
                </span>
                <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                    disabled={page + 1 >= totalPages}
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </>
    )
}

export default Dashboard