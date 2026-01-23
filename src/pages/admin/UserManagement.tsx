import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaTrash, FaBan, FaCheck, FaUserShield, FaEdit } from 'react-icons/fa';
import type { AdminUser, PaginatedResponse } from '../../types/admin';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const UserManagement: React.FC = () => {
    const { t } = useTranslation('admin');
    const navigate = useNavigate();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);

    // Create User State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        password: '',
        role: 'USER'
    });

    // Edit Role State
    const [editingRoleUser, setEditingRoleUser] = useState<AdminUser | null>(null);
    const [selectedRole, setSelectedRole] = useState<string>('USER');

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const fetchUsers = async () => {
        try {
            const response = await api.get<PaginatedResponse<AdminUser>>(`/admin/users?page=${page}&size=10`);
            setUsers(response.data.content);
            setTotalPages(response.data.totalPages);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch users', error);
            toast.error(t('users.alerts.fetch_error') || 'Failed to load users');
            setUsers([]);
            setTotalPages(0);
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/users', newUser);
            toast.success(t('users.alerts.create_success'));
            setShowCreateModal(false);
            setNewUser({ username: '', email: '', password: '', role: 'USER' });
            fetchUsers();
        } catch (error: any) {
            const message = error.response?.data?.message || t('users.alerts.create_error_default');
            toast.error(message);
        }
    };

    const handleActivate = async (userId: string | number) => {
        try {
            await api.post(`/admin/users/${userId}/activate`, {});
            toast.success(t('users.alerts.activate_success'));
            fetchUsers();
        } catch (error) {
            toast.error(t('users.alerts.activate_error'));
        }
    };

    const handleSuspend = async (userId: string | number) => {
        if (!confirm(t('users.alerts.suspend_confirm'))) return;

        try {
            await api.post(`/admin/users/${userId}/suspend`, {});
            toast.success(t('users.alerts.suspend_success'));
            fetchUsers();
        } catch (error) {
            toast.error(t('users.alerts.suspend_error'));
        }
    };

    const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

    const handleDelete = async (user: AdminUser) => {
        setDeletingUser(user);
    };

    const confirmDelete = async () => {
        if (!deletingUser) return;
        try {
            await api.delete(`/admin/users/${deletingUser.id}`);
            toast.success(t('users.alerts.delete_success'));
            setDeletingUser(null);
            fetchUsers();
        } catch (error) {
            toast.error(t('users.alerts.delete_error'));
        }
    };

    const openRoleModal = (user: AdminUser) => {
        setEditingRoleUser(user);
        setSelectedRole(user.role);
    };

    const handleSaveRole = async () => {
        if (!editingRoleUser) return;
        try {
            await api.put(`/admin/users/${editingRoleUser.id}/role`, { role: selectedRole });
            toast.success(t('users.alerts.role_update_success'));
            setEditingRoleUser(null);
            fetchUsers();
        } catch (error) {
            toast.error(t('users.alerts.role_update_error'));
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'SUPER_ADMIN': return 'bg-red-100 text-red-800';
            case 'RESTAURANT_OWNER': return 'bg-green-100 text-green-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800';
            case 'SUSPENDED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">{t('common.loading')}</div>;
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">{t('users.title')}</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <span className="text-xl">+</span> {t('users.add_user')}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('users.table.id')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('users.table.username')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('users.table.email')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('users.table.role')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('users.table.status')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('users.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => navigate(`/admin/users/${user.id}`)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/admin/users/${user.id}`);
                                        }}
                                        className="text-blue-600 hover:text-blue-900"
                                        title={t('users.tooltips.edit')}
                                    >
                                        <FaEdit />
                                    </button>
                                    {user.status !== 'ACTIVE' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleActivate(user.id);
                                            }}
                                            className="text-green-600 hover:text-green-900"
                                            title={t('users.tooltips.activate')}
                                        >
                                            <FaCheck />
                                        </button>
                                    )}
                                    {user.status === 'ACTIVE' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSuspend(user.id);
                                            }}
                                            className="text-yellow-600 hover:text-yellow-900"
                                            title={t('users.tooltips.suspend')}
                                        >
                                            <FaBan />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openRoleModal(user);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-900"
                                        title={t('users.tooltips.change_role')}
                                    >
                                        <FaUserShield />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(user);
                                        }}
                                        className="text-red-600 hover:text-red-900"
                                        title={t('users.tooltips.delete')}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-6 space-x-2">
                <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                >
                    {t('common.previous')}
                </button>
                <span className="px-4 py-2">
                    {t('common.page_info', { current: page + 1, total: totalPages })}
                </span>
                <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages - 1}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                >
                    {t('common.next')}
                </button>
            </div>


            {/* Create User Modal */}
            {
                showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-md w-full">
                            <h2 className="text-2xl font-bold mb-6">{t('users.create_modal.title')}</h2>
                            <form onSubmit={handleCreateUser}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">{t('users.create_modal.username')}</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded px-3 py-2"
                                        required
                                        value={newUser.username}
                                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">{t('users.create_modal.email')}</label>
                                    <input
                                        type="email"
                                        className="w-full border rounded px-3 py-2"
                                        required
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">{t('users.create_modal.password')}</label>
                                    <input
                                        type="password"
                                        className="w-full border rounded px-3 py-2"
                                        required
                                        minLength={6}
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-gray-700 mb-2">{t('users.create_modal.role')}</label>
                                    <select
                                        className="w-full border rounded px-3 py-2"
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    >
                                        <option value="USER">{t('users.roles.user')}</option>
                                        <option value="RESTAURANT_OWNER">{t('users.roles.restaurant_manager')}</option>
                                        <option value="SUPER_ADMIN">{t('users.roles.admin')}</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                    >
                                        {t('users.create_modal.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        {t('users.create_modal.create_btn')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Delete Confirmation Modal */}
            {deletingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                        <h3 className="text-xl font-bold mb-4">{t('users.delete_modal.title') || 'Delete User'}</h3>
                        <p className="text-gray-600 mb-6">
                            {t('users.delete_modal.message', { username: deletingUser.username }) || `Are you sure you want to delete ${deletingUser.username}? This action cannot be undone.`}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeletingUser(null)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                {t('common.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Role Edit Modal */}
            {editingRoleUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                        <h3 className="text-xl font-bold mb-4">{t('users.role_modal.title') || 'Change Role'}</h3>
                        <p className="text-sm text-gray-500 mb-4">{t('users.role_modal.message', { username: editingRoleUser.username }) || `Select new role for ${editingRoleUser.username}`}</p>

                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2">{t('users.table.role')}</label>
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                            >
                                <option value="USER">{t('users.roles.user')}</option>
                                <option value="RESTAURANT_OWNER">{t('users.roles.restaurant_manager')}</option>
                                <option value="SUPER_ADMIN">{t('users.roles.admin')}</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setEditingRoleUser(null)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleSaveRole}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                {t('common.save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default UserManagement;
