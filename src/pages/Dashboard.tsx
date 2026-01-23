import React, { useEffect, useState } from 'react';
import axios from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import SecureImage from '../components/SecureImage';
import { toast } from 'react-toastify';
import { FaFolder, FaFolderPlus, FaTrash, FaExchangeAlt, FaUsers, FaFolderOpen } from 'react-icons/fa';
import type { QRCodeItem, Folder } from '../types/dashboard_types';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { useTranslation } from 'react-i18next';

/* 
 * Note: FaUsers was imported in original logical flow but imported from react-icons/fa 
 * Original had FaUsers usage in "Organization" button
 */

interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

import { qrService } from '../services/qr';

import { getUsageStats } from '../services/auth';

const Dashboard: React.FC = () => {
    const { t } = useTranslation('dashboard');
    const [qrcodes, setQRCodes] = useState<QRCodeItem[]>([]);
    const [page, setPage] = useState<number>(0);
    const [size, setSize] = useState<number>(6);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [filter, setFilter] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // FOLDERS STATE
    const [projects, setProjects] = useState<Folder[]>([]);
    const [activeFolderId, setActiveFolderId] = useState<string | number>('all');
    const [showCreateFolderModal, setShowCreateFolderModal] = useState<boolean>(false);
    const [newFolderName, setNewFolderName] = useState<string>('');
    const [movingQR, setMovingQR] = useState<QRCodeItem | null>(null); // QR object being moved

    const [usageStats, setUsageStats] = useState<any>(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
        fetchUsage();
    }, []);

    const fetchUsage = async () => {
        try {
            const stats = await getUsageStats();
            setUsageStats(stats);
        } catch (error) {
            console.error("Failed to fetch usage stats", error);
        }
    };

    useEffect(() => {
        fetchQRCodes();
    }, [page, size, filter, activeFolderId]);

    const fetchProjects = async () => {
        try {
            const data = await qrService.getProjects();
            setProjects(data);
        } catch (err) {
            console.warn("Failed to fetch projects, using mock");
            setProjects(MOCK_PROJECTS);
        }
    };

    const fetchQRCodes = async () => {
        setIsLoading(true);
        try {
            let projectIdParam: string | number | undefined = undefined;
            if (activeFolderId === 'uncategorized') projectIdParam = -1;
            else if (activeFolderId !== 'all') projectIdParam = activeFolderId;

            const data = await qrService.getQRCodes({ page, size, filter, projectId: projectIdParam });
            setQRCodes(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (err) {
            console.warn("Failed to fetch QRs, using mock");

            // ⭐ Enhanced Mock Support: Apply filtering locally if it exists
            let filtered = [...MOCK_QR_CODES];

            // Filter by Folder (Mock)
            if (activeFolderId === 'uncategorized') {
                filtered = filtered.filter(q => !q.project);
            } else if (activeFolderId !== 'all') {
                filtered = filtered.filter(q => q.project && q.project.id === activeFolderId);
            }

            if (filter) {
                const term = filter.toLowerCase();
                filtered = filtered.filter(q =>
                    q.title?.toLowerCase().includes(term) ||
                    q.description?.toLowerCase().includes(term) ||
                    q.content?.toLowerCase().includes(term)
                );
            }

            setQRCodes(filtered);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMoveToProject = async (projectId: string | number | null) => {
        if (!movingQR) return;
        try {
            await qrService.moveQRCodeToProject(movingQR.id, projectId);
            toast.success(t('moved_success'));
            setMovingQR(null);
            // Refresh data
            fetchQRCodes();
            fetchProjects(); // update counts
        } catch (err) {
            toast.error(t('failed_move'));
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        try {
            await qrService.createProject(newFolderName);
            toast.success(t('folder_created'));
            setShowCreateFolderModal(false);
            setNewFolderName('');
            fetchProjects();
        } catch (err) {
            toast.error(t('failed_create_folder'));
        }
    };

    const handleDeleteFolder = async (e: React.MouseEvent, id: string | number) => {
        e.stopPropagation();
        if (!window.confirm(t('confirm_delete_folder'))) return;
        try {
            await qrService.deleteProject(id);
            if (activeFolderId === id) setActiveFolderId('all');
            fetchProjects();
            fetchQRCodes(); // refresh to update QR associations if any
            toast.success(t('folder_deleted'));
        } catch (err) {
            toast.error(t('failed_delete_folder'));
        }
    };

    const handleFolderChange = (id: string | number) => {
        setActiveFolderId(id);
        setPage(0);
    };

    // Client-side filtering removed as we use server-side now
    const filteredQRs = qrcodes;

    const handleDelete = async (id: string | number) => {
        if (window.confirm(t('confirm_delete_qr'))) {
            try {
                await qrService.deleteQRCode(id);
                fetchQRCodes();
            } catch (err: any) {
                console.error(err);
                const msg = err.response?.data?.message || err.message || 'Unknown error';
                alert(`Failed to delete QR code: ${msg}`);
            }
        }
    };

    const handleCopyLink = (id: string | number) => {
        const publicUrl = `${window.location.origin}/qr/${id}`;
        navigator.clipboard.writeText(publicUrl).then(() => {
            alert(t('link_copied'));
        });
    };

    const handleDownloadPdf = async (id: string | number, title: string) => {
        try {
            const response = await axios.get(`/qrcodes/${id}/pdf`, {
                responseType: 'blob', // Important
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${title || 'qrcode'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to download PDF', error);
            alert(t('failed_download_pdf'));
        }
    };

    return (
        <DashboardLayout>
            <div className="flex gap-6">
                {/* SIDEBAR - FOLDERS */}
                <div className="w-64 flex-shrink-0 bg-white rounded-lg shadow p-4 min-h-[calc(100vh-120px)] hidden md:block">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2"><FaFolder className="text-yellow-500" /> {t('folders')}</h3>
                        <button onClick={() => setShowCreateFolderModal(true)} className="text-blue-600 hover:text-blue-800"><FaFolderPlus size={18} /></button>
                    </div>

                    <ul className="space-y-1">
                        <li>
                            <button onClick={() => handleFolderChange('all')} className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 text-sm ${activeFolderId === 'all' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}>
                                {t('all_qr_codes')}
                                {activeFolderId === 'all' && <span className="ml-auto bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{totalElements}</span>}
                            </button>
                        </li>
                        <li>
                            <button onClick={() => handleFolderChange('uncategorized')} className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 text-sm ${activeFolderId === 'uncategorized' ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}>
                                {t('uncategorized')}
                                {activeFolderId === 'uncategorized' && <span className="ml-auto bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{totalElements}</span>}
                            </button>
                        </li>
                        <hr className="my-2 border-gray-100" />
                        {projects.map(p => (
                            <li key={p.id} className="group relative">
                                <button onClick={() => handleFolderChange(p.id)} className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 text-sm ${activeFolderId === p.id ? 'bg-purple-50 text-purple-600 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}>
                                    <FaFolder className={activeFolderId === p.id ? 'text-purple-500' : 'text-gray-400'} />
                                    <span className="truncate">{p.name}</span>
                                    {activeFolderId === p.id && <span className="ml-auto bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{totalElements}</span>}
                                </button>
                                <button onClick={(e) => handleDeleteFolder(e, p.id)} className="absolute right-1 top-2 text-red-300 hover:text-red-500 hidden group-hover:block transition-all bg-white rounded shadow-sm p-1">
                                    <FaTrash size={10} />
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* USAGE STATS SECTION */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">{t('usage_limit')}</h3>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${usageStats?.tier?.startsWith('PRO') ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                {usageStats?.tier || 'FREE'}
                            </span>
                        </div>

                        {usageStats && (
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1 text-gray-500">
                                        <span>Dynamic QR Quota</span>
                                        <span>{usageStats.dynamicQrCreated} / {usageStats.dynamicQrLimit || '∞'}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${usageStats.dynamicQrCreated >= (usageStats.dynamicQrLimit || 999) ? 'bg-red-500' : 'bg-purple-500'}`}
                                            style={{ width: `${Math.min(100, (usageStats.dynamicQrCreated / (usageStats.dynamicQrLimit || 1)) * 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {!usageStats.tier?.startsWith('PRO') && (
                                    <button
                                        onClick={() => navigate('/qr/pricing')}
                                        className="w-full text-xs font-bold py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm"
                                    >
                                        🚀 {t('upgrade_for_quota')}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* MAIN CONTENT Area */}
                <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-4">
                        {activeFolderId === 'all' && 'All QR Codes'}
                        {activeFolderId === 'uncategorized' && 'Uncategorized'}
                        {projects.find(p => p.id === activeFolderId)?.name}
                    </h1>

                    <div className="mb-4 flex flex-wrap items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard/bulk')}
                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2"
                        >
                            <FaFolderPlus /> {t('bulk_create')}
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/organization')}
                            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 flex items-center gap-2"
                        >
                            <FaUsers /> {t('organization')}
                        </button>
                        <input
                            type="text"
                            placeholder={t('filter_placeholder')}
                            className="p-2 border rounded"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                        <select
                            className="p-2 border rounded"
                            value={size}
                            onChange={(e) => setSize(Number(e.target.value))}
                        >
                            {[6, 12, 24].map((s) => (
                                <option key={s} value={s}>
                                    {s} {t('per_page')}
                                </option>
                            ))}
                        </select>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="border p-4 rounded bg-white shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <SkeletonLoader width={150} height={24} />
                                        <SkeletonLoader width={60} height={20} />
                                    </div>
                                    <SkeletonLoader count={2} height={16} className="mb-2" />
                                    <SkeletonLoader height={192} className="mb-2" />
                                    <div className="flex gap-2">
                                        <SkeletonLoader width={60} height={30} />
                                        <SkeletonLoader width={60} height={30} />
                                        <SkeletonLoader width={60} height={30} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredQRs.length === 0 ? (
                        <p className="text-gray-500 italic p-4 bg-gray-50 rounded border border-dashed">{t('no_qr_found')}</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredQRs.map((qr) => (
                                <div key={qr.id} className="border p-4 rounded bg-white shadow">
                                    {/* Header with Title and Badge (Dynamic/Static) */}
                                    <div className="flex justify-between items-start mb-2">
                                        <h2 className="font-bold text-lg">{qr.title}</h2>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${qr.dynamic ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {qr.dynamic ? t('dynamic') : t('static')}
                                        </span>
                                    </div>
                                    <p className="text-sm mb-2 text-gray-600">{qr.description}</p>

                                    <div
                                        onClick={() => window.open(`http://localhost:8080/api/public/scan/${qr.publicId}`, '_blank')}
                                        className="cursor-pointer hover:opacity-80 transition-opacity inline-block"
                                        title="Click to open public QR page"
                                    >
                                        <SecureImage
                                            endpoint={`/qrcodes/${qr.id}/image`}
                                            alt={qr.title}
                                            className="w-48 h-48 object-contain bg-gray-50 rounded"
                                        />
                                    </div>
                                    <div className="flex flex-wrap space-x-2 mt-2">
                                        {/* CONDITIONAL EDIT BUTTON */}
                                        {qr.dynamic && (
                                            <button
                                                onClick={() => navigate(`/dashboard/edit/${qr.id}`)}
                                                className="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600"
                                            >
                                                {t('edit')}
                                            </button>
                                        )}

                                        <button
                                            onClick={() => navigate(`/dashboard/analytics/${qr.id}`)}
                                            className="bg-purple-600 text-white px-2 py-1 rounded text-sm hover:bg-purple-700"
                                        >
                                            {t('analytics')}
                                        </button>

                                        <button
                                            onClick={() => handleCopyLink(qr.publicId || qr.id)} // fallback if publicId missing? Intf says publicId is required
                                            className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                                        >
                                            {t('copy_link')}
                                        </button>
                                        <button
                                            onClick={() => setMovingQR(qr)}
                                            className="bg-gray-500 text-white px-2 py-1 rounded text-sm hover:bg-gray-600 flex items-center gap-1"
                                        >
                                            <FaExchangeAlt /> {t('move')}
                                        </button>
                                        <button
                                            onClick={() => handleDownloadPdf(qr.id, qr.title)}
                                            className="bg-indigo-500 text-white px-2 py-1 rounded text-sm hover:bg-indigo-600"
                                        >
                                            PDF
                                        </button>
                                        <button
                                            onClick={() => handleDelete(qr.id)}
                                            className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                                        >
                                            {t('delete')}
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">{t('scans')}: {qr.scanCount} {qr.dynamic && <span className="ml-2 text-xs text-purple-600">({t('analytics_active')})</span>}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-center mt-6 space-x-4">
                        <button
                            onClick={() => setPage((p) => Math.max(p - 1, 0))}
                            disabled={page === 0}
                            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                        >
                            {t('previous')}
                        </button>
                        <span className="px-3 py-1 bg-gray-100 rounded">
                            Page {page + 1} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                            disabled={page + 1 >= totalPages}
                            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                        >
                            {t('next')}
                        </button>
                    </div>
                </div>
            </div>

            {/* MOVE PROJECT MODAL */}
            {movingQR && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-80">
                        <h3 className="font-bold text-lg mb-4">{t('move_qr')}</h3>
                        <p className="text-sm text-gray-500 mb-4">{t('select_folder')} <b>{movingQR.title}</b>:</p>

                        <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                            <button onClick={() => handleMoveToProject(null)} className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 border border-gray-100 flex items-center gap-2">
                                <span className="text-gray-400">🚫</span> {t('uncategorized')}
                            </button>

                            {projects.map(p => (
                                <button key={p.id} onClick={() => handleMoveToProject(p.id)} className="w-full text-left px-3 py-2 rounded hover:bg-purple-50 border border-transparent hover:border-purple-100 text-purple-700 font-medium flex items-center gap-2">
                                    <FaFolder className="text-yellow-500" /> {p.name}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end">
                            <button onClick={() => setMovingQR(null)} className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded">{t('cancel')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE FOLDER MODAL */}
            {showCreateFolderModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-80">
                        <h3 className="font-bold text-lg mb-4">{t('new_folder')}</h3>
                        <input
                            autoFocus
                            type="text"
                            placeholder={t('folder_name')}
                            value={newFolderName}
                            onChange={e => setNewFolderName(e.target.value)}
                            className="w-full border p-2 rounded mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowCreateFolderModal(false)} className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded">{t('cancel')}</button>
                            <button onClick={handleCreateFolder} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">{t('create')}</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default Dashboard;
