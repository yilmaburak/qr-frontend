import React from 'react';
import { FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const MenuCard = ({ item }) => {
    return (
        <Link to={`/dashboard/menu/${item.id}`} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow block">
            <div className="relative h-48">
                <img
                    src={item.imageUrl || "https://via.placeholder.com/300"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                />
                {item.isPromo && (
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-orange-500 text-xs font-bold px-2 py-1 rounded">
                        {item.discount}% Off
                    </span>
                )}
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-gray-700 text-xs font-bold px-2 py-1 rounded">
                    Customizable
                </span>
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{item.name}</h3>
                        <p className="text-gray-500 text-sm">{item.categoryName || 'General'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-1 mb-3">
                    <div className="flex text-yellow-400 text-sm">
                        {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={i < Math.round(item.rating || 0) ? "text-yellow-400" : "text-gray-300"} />
                        ))}
                    </div>
                    <span className="text-gray-600 text-sm font-semibold">{item.rating || 4.5}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-orange-500 font-bold text-lg">${item.price?.toFixed(2)}</span>
                    {/* Optional: Add button */}
                </div>
            </div>
        </Link>
    );
};

export default MenuCard;
