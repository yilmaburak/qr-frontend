import React, { useEffect, useState } from 'react';
import { FaStar, FaCheck, FaComments, FaRegStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from '../services/api';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { useTranslation } from 'react-i18next';

interface Feedback {
    id: number;
    customerName?: string;
    rating: number;
    comment: string;
    createdAt: string;
    read: boolean;
}

const FeedbackList: React.FC = () => {
    const { t } = useTranslation('restaurant');
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            const res = await axios.get('/restaurant/feedback');
            // Sort by date desc
            const sorted = res.data.sort((a: Feedback, b: Feedback) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setFeedbacks(sorted);
        } catch (error) {
            console.error('Failed to load feedback');
            toast.error(t('feedback.load_fail'));
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await axios.put(`/restaurant/feedback/${id}/read`);
            setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, read: true } : f));
            toast.success(t('feedback.marked_read'));
        } catch (error) {
            toast.error(t('feedback.update_fail'));
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex text-yellow-400 gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                    <span key={star}>
                        {rating >= star ? <FaStar /> : <FaRegStar className="text-gray-300" />}
                    </span>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <FaComments className="text-indigo-600" /> {t('feedback.title')}
                </h1>
                <SkeletonLoader height={100} count={5} className="mb-4 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800">
                <FaComments className="text-indigo-600" /> {t('feedback.title')}
            </h1>

            {feedbacks.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                    <FaComments className="text-6xl text-gray-200 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900">{t('feedback.no_feedback')}</h3>
                    <p className="text-gray-500">{t('feedback.no_feedback_desc')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {feedbacks.map(item => (
                        <div key={item.id} className={`bg-white p-6 rounded-xl border transition-all ${item.read ? 'border-gray-100 opacity-75' : 'border-indigo-100 shadow-md transform hover:-translate-y-1'}`}>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${item.read ? 'bg-gray-100 text-gray-500' : 'bg-indigo-100 text-indigo-600'}`}>
                                        {item.customerName ? item.customerName.charAt(0).toUpperCase() : 'G'}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{item.customerName || 'Anonymous Guest'}</h4>
                                        <span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                                {renderStars(item.rating)}
                            </div>

                            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg italic border-l-4 border-indigo-200">
                                "{item.comment}"
                            </p>

                            <div className="flex justify-end mt-4">
                                {!item.read && (
                                    <button
                                        onClick={() => markAsRead(item.id)}
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                                    >
                                        <FaCheck /> {t('feedback.mark_read')}
                                    </button>
                                )}
                                {item.read && (
                                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 mt-2 sm:mt-0">
                                        {t('feedback.read')}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FeedbackList;
