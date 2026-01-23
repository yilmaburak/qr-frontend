```typescript
import React, { useState, useEffect } from 'react';
import axios from '../../services/api'; // Use generic api
import { FaStar, FaCheck } from 'react-icons/fa';
import type { Review } from '../../types/restaurant';
import { useTranslation } from 'react-i18next';

const Reviews: React.FC = () => {
    const { t } = useTranslation('restaurant');
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        try {
            const res = await axios.get<Review[]>('/restaurant/feedback');
            setReviews(res.data);
        } catch (error) {
            console.error("Failed to load reviews", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: number | string) => {
        try {
            await axios.put(`/ restaurant / feedback / ${ id }/read`);
setReviews(reviews.map(r => r.id === id ? { ...r, read: true } : r));
        } catch (error) {
    console.error("Failed to update review", error);
}
    };

if (loading) return <div>{t('reviews.loading')}</div>;

return (
    <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t('reviews.title')}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map(review => (
                <div key={review.id} className={`p-6 rounded-xl shadow-sm border ${review.read ? 'bg-white border-gray-100 opacity-75' : 'bg-orange-50 border-orange-200'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                                {review.customerName ? review.customerName.charAt(0).toUpperCase() : 'G'}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">{review.customerName || t('reviews.guest')}</h3>
                                <div className="flex text-yellow-400 text-sm">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>

                    <p className="text-gray-700 mb-4 italic">"{review.comment}"</p>

                    {!review.read && (
                        <button
                            onClick={() => handleMarkAsRead(review.id)}
                            className="text-sm flex items-center gap-2 text-green-600 hover:text-green-800 font-semibold"
                        >
                            <FaCheck /> {t('reviews.mark_read')}
                        </button>
                    )}
                    {review.read && (
                        <span className="text-xs text-green-600 font-bold flex items-center gap-1"><FaCheck /> {t('reviews.read')}</span>
                    )}
                </div>
            ))}

            {reviews.length === 0 && (
                <div className="col-span-2 p-12 text-center bg-white rounded-xl text-gray-400">
                    {t('reviews.no_reviews')}
                </div>
            )}
        </div>
    </div>
);
};

export default Reviews;
