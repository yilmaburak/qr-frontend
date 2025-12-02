import React, { useState } from 'react';
import { FaTrash, FaPlus, FaImage } from 'react-icons/fa';

const MenuItemList = ({ items, categoryName, onDeleteItem, onCreateItem }) => {
    const [newItem, setNewItem] = useState({
        name: '',
        description: '',
        price: '',
        imageUrl: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const price = parseFloat(newItem.price);
        if (newItem.name && !isNaN(price) && price >= 0) {
            onCreateItem({
                ...newItem,
                price: price
            });
            setNewItem({ name: '', description: '', price: '', imageUrl: '' });
        } else {
            alert("Please enter a valid name and price.");
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Items in {categoryName}</h2>

            <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded border">
                <h3 className="font-semibold mb-3">Add New Item</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                        type="text"
                        placeholder="Item Name"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        className="p-2 border rounded"
                        required
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                        className="p-2 border rounded"
                        step="0.01"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Description"
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        className="p-2 border rounded md:col-span-2"
                    />
                    <input
                        type="text"
                        placeholder="Image URL (optional)"
                        value={newItem.imageUrl}
                        onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                        className="p-2 border rounded md:col-span-2"
                    />
                </div>
                <button
                    type="submit"
                    className="mt-3 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
                >
                    <FaPlus /> Add Item
                </button>
            </form>

            <div className="grid grid-cols-1 gap-4">
                {items.map((item) => (
                    <div key={item.id} className="border rounded p-3 flex justify-between items-start hover:bg-gray-50">
                        <div className="flex gap-3">
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded" />
                            ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                                    <FaImage />
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold">{item.name}</h3>
                                <p className="text-sm text-gray-600">{item.description}</p>
                                <p className="text-blue-600 font-semibold mt-1">${item.price.toFixed(2)}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onDeleteItem(item.id)}
                            className="text-red-500 hover:text-red-700 p-2"
                        >
                            <FaTrash />
                        </button>
                    </div>
                ))}
                {items.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No items in this category yet.</p>
                )}
            </div>
        </div>
    );
};

export default MenuItemList;
