import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast'; // Using react-hot-toast as per original file, or switch to react-toastify if preferred
import { FaUsers, FaPlus, FaTrash, FaBuilding, FaCrown, FaUserShield } from 'react-icons/fa';
import api from '../services/api';
import type { Organization } from '../types/dashboard_types';
import type { User } from '../services/auth';
import SkeletonLoader from '../components/common/SkeletonLoader';

const OrganizationDashboard: React.FC = () => {
    const { t } = useTranslation('dashboard');
    const [org, setOrg] = useState<Organization | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [createName, setCreateName] = useState<string>('');
    const [inviteEmail, setInviteEmail] = useState<string>('');
    const [inviteRole, setInviteRole] = useState<string>('MEMBER');
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        fetchOrg();
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setCurrentUser(JSON.parse(userStr));
        }
    }, []);

    const fetchOrg = async () => {
        try {
            const res = await api.get<Organization>('/organizations/my');
            if (res.status === 200 && res.data) {
                setOrg(res.data);
            } else {
                setOrg(null);
            }
        } catch (err: any) {
            // 204 No Content is standard for "no org found" in this API
            if (err.response && err.response.status === 204) {
                setOrg(null);
            } else {
                console.error(err);
                setOrg(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const createOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post<Organization>('/organizations', { name: createName });
            setOrg(res.data);
            toast.success(t('organization_page.create_success'));
        } catch (err) {
            toast.error(t('organization_page.create_fail'));
        }
    };

    const inviteMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!org) return;
        try {
            await api.post(`/organizations/${org.id}/members`, { email: inviteEmail, role: inviteRole });
            toast.success(t('organization_page.invite_success'));
            setInviteEmail('');
            fetchOrg(); // Refresh list
        } catch (err: any) {
            toast.error(err.response?.data || t('organization_page.invite_fail'));
        }
    };

    const removeMember = async (userId: number) => {
        if (!org) return;
        if (!window.confirm(t('organization_page.remove_confirm'))) return;

        try {
            await api.delete(`/organizations/${org.id}/members/${userId}`);
            toast.success(t('organization_page.remove_success'));
            fetchOrg();
        } catch (err: any) {
            toast.error(err.response?.data || t('organization_page.remove_fail'));
        }
    };

    if (loading) {
        return (
            <div className="p-8 max-w-6xl mx-auto">
                <SkeletonLoader height={200} className="mb-8 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <SkeletonLoader height={300} className="rounded-xl" />
                    <SkeletonLoader height={300} className="col-span-2 rounded-xl" />
                </div>
            </div>
        );
    }

    if (!org) {
        return (
            <div className="max-w-2xl mx-auto p-8 mt-10">
                <div className="text-center mb-10">
                    <div className="bg-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <FaBuilding className="text-purple-600 text-4xl" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">{t('organization_page.create_title')}</h2>
                    <p className="text-gray-500 mt-2 text-lg">{t('organization_page.create_subtitle')}</p>
                </div>

                <form onSubmit={createOrg} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <label className="block text-gray-700 font-semibold mb-3">{t('organization_page.org_name_label')}</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            value={createName}
                            onChange={(e) => setCreateName(e.target.value)}
                            placeholder={t('organization_page.org_name_placeholder')}
                            className="flex-1 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition bg-gray-50 focus:bg-white"
                            required
                        />
                        <button type="submit" className="bg-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-200">
                            {t('organization_page.create_team_btn')}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // Determine current user's role in org
    const isOwner = currentUser?.username === org.ownerUsername;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-200">
                        {org.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{org.name}</h1>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">{t('organization_page.slug')} <span className="font-mono text-gray-700">{org.slug}</span></span>
                            <span className="flex items-center gap-1"><FaCrown className="text-amber-500" /> {t('organization_page.owner')} {org.ownerUsername}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold text-sm border border-green-200">
                        {t('organization_page.active_plan')}
                    </span>
                    <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-semibold text-sm border border-purple-100">
                        {t('organization_page.members_count', { count: org.members.length + 1 })}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Invite Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
                            <FaPlus className="text-purple-500" /> {t('organization_page.invite_member_title')}
                        </h3>
                        <form onSubmit={inviteMember}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('organization_page.email_label')}</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder={t('organization_page.email_placeholder')}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition"
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('organization_page.role_label')}</label>
                                <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                                >
                                    <option value="MEMBER">{t('organization_page.roles.member')}</option>
                                    <option value="ADMIN">{t('organization_page.roles.admin')}</option>
                                    <option value="VIEWER">{t('organization_page.roles.viewer')}</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition flex items-center justify-center gap-2">
                                <FaUsers /> {t('organization_page.send_invite_btn')}
                            </button>
                        </form>

                        <div className="mt-8 p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <h4 className="font-bold text-purple-800 text-sm mb-2">{t('organization_page.pro_tip_title')}</h4>
                            <p className="text-purple-700 text-xs leading-relaxed">
                                {t('organization_page.pro_tip_desc')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Member List */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
                            <FaUsers className="text-purple-500" /> {t('organization_page.team_members_title')}
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        <th className="py-3 pl-2">{t('organization_page.table.user')}</th>
                                        <th className="py-3">{t('organization_page.table.role')}</th>
                                        <th className="py-3 text-right pr-2">{t('organization_page.table.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {/* Owner Row */}
                                    <tr className="border-b border-gray-50 hover:bg-gray-50 transition">
                                        <td className="py-4 pl-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold">
                                                    <FaCrown />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{org.ownerUsername}</div>
                                                    <div className="text-xs text-gray-500">Owner</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold border border-amber-200">
                                                OWNER
                                            </span>
                                        </td>
                                        <td className="py-4 text-right pr-2 text-gray-400">
                                            <FaUserShield title="Cannot be removed" />
                                        </td>
                                    </tr>

                                    {/* Members Rows */}
                                    {org.members.map((m, i) => (
                                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                            <td className="py-4 pl-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                        {m.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900">{m.username}</div>
                                                        <div className="text-xs text-gray-500">{m.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold border ${m.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                    {m.role}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right pr-2">
                                                {isOwner && (
                                                    <button
                                                        onClick={() => removeMember(m.userId)}
                                                        className="text-gray-400 hover:text-red-500 transition p-2 hover:bg-red-50 rounded-lg group"
                                                        title="Remove Member"
                                                    >
                                                        <FaTrash className="group-hover:scale-110 transition-transform" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {org.members.length === 0 && (
                                <div className="text-center py-12 text-gray-400">
                                    <p>{t('organization_page.no_members')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationDashboard;
