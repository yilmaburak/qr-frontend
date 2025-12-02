import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaArrowLeft, FaHeart, FaShareAlt, FaEdit } from 'react-icons/fa';
import menuService from '../services/menuService';
import Layout from './Layout';

const MenuDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const data = await menuService.getMenuItem(id);
                setItem(data);
            } catch (error) {
                console.error("Failed to load item", error);
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id]);

    if (loading) return <Layout title="Menu Details"><div>Loading...</div></Layout>;
    if (!item) return <Layout title="Menu Details"><div>Item not found</div></Layout>;

    return (
        <Layout title="Menu Details">
            <button onClick={() => navigate('/dashboard/menu')} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-orange-500">
                <FaArrowLeft /> Back to Menu
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Image and Basic Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-6">
                            <img
                                src={item.imageUrl || "https://via.placeholder.com/800x400"}
                                alt={item.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">{item.name}</h1>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="text-orange-500 font-semibold">{item.categoryName || 'General'}</span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <FaStar className="text-yellow-400" />
                                        <span className="font-bold text-gray-700">{item.rating || 4.5}</span>
                                        <span>({item.reviewCount || 0} reviews)</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-bold text-orange-500">${item.price?.toFixed(2)}</p>
                                <div className="flex gap-2 mt-2 justify-end">
                                    <button className="p-2 text-gray-400 hover:text-red-500 border rounded-lg"><FaHeart /></button>
                                    <button className="p-2 text-gray-400 hover:text-blue-500 border rounded-lg"><FaShareAlt /></button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="font-bold text-lg mb-3">Description</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {item.description || "No description available."}
                            </p>
                        </div>

                        <div className="mt-8">
                            <h3 className="font-bold text-lg mb-3">Values</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Calories', value: item.calories || '320 Kcal' },
                                    { label: 'Proteins', value: item.proteins || '5 gram' },
                                    { label: 'Fats', value: item.fats || '12 gram' },
                                    { label: 'Carbs', value: item.carbs || '50 gram' }
                                ].map((val, idx) => (
                                    <div key={idx} className="text-center p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-gray-500 text-xs mb-1">{val.label}</p>
                                        <p className="font-bold text-gray-800">{val.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8">
                            <button className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 flex items-center justify-center gap-2">
                                <FaEdit /> Edit Menu
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Ingredients or Similar Items (Placeholder for now) */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Ingredients</h3>
                        <ul className="space-y-3">
                            {['Mango', 'Coconut Milk', 'Banana', 'Pineapple'].map((ing, i) => (
                                <li key={i} className="flex items-center gap-2 text-gray-600">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                    {ing}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default MenuDetails;
