import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import publicService from '../services/publicService';
import { FaShoppingCart, FaPlus, FaMinus, FaConciergeBell, FaCheck } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import type { Category, MenuItem } from '../types/menu';
import PaymentModal from '../components/common/PaymentModal';
import { FaCreditCard } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface CartItem extends MenuItem {
    quantity: number;
    removedIngredients?: string[];
}

const PublicMenu: React.FC = () => {
    const { t } = useTranslation('public_menu');
    const { restaurantId: paramRestaurantId, branchId, tableNumber, menuUid } = useParams<{ restaurantId?: string; branchId?: string; tableNumber: string; menuUid?: string }>();
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

    // Cart with Persistence
    const CART_KEY = `qr_cart_${paramRestaurantId || branchId || 'guest'}`;
    const [cart, setCart] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem(CART_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    // Save cart on change
    useEffect(() => {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }, [cart, CART_KEY]);

    const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [orderNote, setOrderNote] = useState<string>('');

    // Mock Data
    const MOCK_CATEGORIES: Category[] = [
        { id: 101, name: '🔥 Popular', userId: 0 },
        { id: 102, name: '🍔 Burgers', userId: 0 },
        { id: 103, name: '🍕 Pizzas', userId: 0 },
        { id: 104, name: '🥗 Salads', userId: 0 },
        { id: 105, name: '🥤 Drinks', userId: 0 },
    ];

    const MOCK_ITEMS: Record<number, MenuItem[]> = {
        101: [
            { id: 1, name: 'Double Cheeseburger', description: 'Two juicy beef patties with melted cheddar, served with crispy fries.', price: 14.99, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60', category: { id: 101, name: 'Popular', userId: 0 } },
            { id: 2, name: 'Margherita Pizza', description: 'Classic tomato sauce, fresh mozzarella, and basil.', price: 12.50, imageUrl: 'https://images.unsplash.com/photo-1574071318500-1c58032756db?auto=format&fit=crop&w=500&q=60', category: { id: 101, name: 'Popular', userId: 0 } },
            { id: 3, name: 'Caesar Salad', description: 'Crisp romaine lettuce, parmesan cheese, croutons, and Caesar dressing.', price: 9.99, imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=500&q=60', category: { id: 101, name: 'Popular', userId: 0 } },
        ],
        102: [
            { id: 1, name: 'Double Cheeseburger', description: 'Two juicy beef patties with melted cheddar, served with crispy fries.', price: 14.99, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60', category: { id: 102, name: 'Burgers', userId: 0 } },
            { id: 4, name: 'Mushroom Swiss', description: 'Topped with sautéed mushrooms and melted Swiss cheese.', price: 13.50, imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=500&q=60', category: { id: 102, name: 'Burgers', userId: 0 } },
            { id: 5, name: 'Spicy Chicken Burger', description: 'Crispy fried chicken breast with spicy mayo and pickles.', price: 12.99, imageUrl: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=500&q=60', category: { id: 102, name: 'Burgers', userId: 0 } },
        ],
        103: [
            { id: 2, name: 'Margherita Pizza', description: 'Classic tomato sauce, fresh mozzarella, and basil.', price: 12.50, imageUrl: 'https://images.unsplash.com/photo-1574071318500-1c58032756db?auto=format&fit=crop&w=500&q=60', category: { id: 103, name: 'Pizzas', userId: 0 } },
            { id: 6, name: 'Pepperoni', description: 'Loaded with spicy pepperoni slices and mozzarella.', price: 14.00, imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=60', category: { id: 103, name: 'Pizzas', userId: 0 } },
        ],
        104: [
            { id: 3, name: 'Caesar Salad', description: 'Crisp romaine lettuce, parmesan cheese, croutons, and Caesar dressing.', price: 9.99, imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=500&q=60', category: { id: 104, name: 'Salads', userId: 0 } },
            { id: 7, name: 'Greek Salad', description: 'Tomatoes, cucumbers, olives, feta cheese, and red onions.', price: 10.50, imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=500&q=60', category: { id: 104, name: 'Salads', userId: 0 } },
        ],
        105: [
            { id: 8, name: 'Cola', description: 'Ice cold cola.', price: 2.50, imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=60', category: { id: 105, name: 'Drinks', userId: 0 } },
            { id: 9, name: 'Fresh Lemonade', description: 'Homemade lemon juice with mint.', price: 3.50, imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=60', category: { id: 105, name: 'Drinks', userId: 0 } },
        ]
    };

    // Derived restaurantId (either from param or from data)
    const [restaurantId, setRestaurantId] = useState<string | number | undefined>(paramRestaurantId);

    // Modal State
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [itemNote, setItemNote] = useState<string>('');
    const [itemQuantity, setItemQuantity] = useState<number>(1);
    const [availableIngredients, setAvailableIngredients] = useState<string[]>([]);
    const [currentRemovedIngredients, setCurrentRemovedIngredients] = useState<string[]>([]);
    const [editingCartIndex, setEditingCartIndex] = useState<number | null>(null);

    // Voice Order State
    const [isListening, setIsListening] = useState<boolean>(false);
    const recognitionRef = React.useRef<any>(null); // Store recognition instance
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);

    // Dark Mode State
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        const saved = localStorage.getItem('publicMenu_darkMode');
        return saved ? JSON.parse(saved) : false;
    });

    // Restaurant Info State
    const [restaurantName, setRestaurantName] = useState<string>('Our Restaurant');
    const [restaurantLogo, setRestaurantLogo] = useState<string | null>(null);

    // Save dark mode preference
    useEffect(() => {
        localStorage.setItem('publicMenu_darkMode', JSON.stringify(isDarkMode));
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
    const audioChunksRef = React.useRef<Blob[]>([]);

    const toggleListening = async () => {
        if (isListening) {
            stopRecording();
            return;
        }
        startRecording();
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await sendToWhisper(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsListening(true);
            toast.info("Listening...");
        } catch (err) {
            console.error("Microphone access denied", err);
            toast.error("Microphone access denied.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isListening) {
            mediaRecorderRef.current.stop();
            setIsListening(false);
        }
    };

    const sendToWhisper = async (audioBlob: Blob) => {
        setIsTranscribing(true);
        const formData = new FormData();
        formData.append('file', audioBlob, 'voice.webm');

        try {
            const res = await fetch('http://localhost:8080/api/voice/transcribe', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            const transcript = data.transcript;
            if (transcript) {
                toast.success(`Heard: "${transcript}"`);
                handleVoiceResult(transcript);
            }
        } catch (err) {
            console.error("Transcription failed", err);
            toast.error("Did not catch that. Try again.");
        } finally {
            setIsTranscribing(false);
        }
    };

    const handleVoiceResult = async (transcript: string) => {
        try {
            // Call Backend
            const response = await fetch('http://localhost:8080/api/voice/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transcript: transcript,
                    restaurantId: restaurantId || 0,
                    language: 'en'
                })
            });

            if (!response.ok) throw new Error("Backend Parse Error");

            const items: any[] = await response.json();

            if (items.length === 0) {
                toast.warn("Could not understand your order. Try saying 'Burger' or 'Pizza'.");
                return;
            }

            // Add to Cart using Functional Update for Safety
            setCart(prevCart => {
                const newCartItems = [...prevCart];
                items.forEach(voiceItem => {
                    // Find complete item details to ensure we have image/desc
                    // We search in currently loaded menuItems or fallbacks
                    let fullItem = menuItems.find(i => i.id === voiceItem.menuItemId);

                    // If not found in current category view, try finding in keys of MOCK_ITEMS just in case
                    if (!fullItem) {
                        // Quick fallback search
                        fullItem = {
                            id: voiceItem.menuItemId,
                            name: voiceItem.menuItemName,
                            price: voiceItem.price,
                            description: 'Added via Voice',
                            imageUrl: '',
                            category: { id: 0, name: 'Voice', userId: 0 }
                        };
                    }

                    newCartItems.push({
                        ...fullItem,
                        quantity: voiceItem.quantity || 1,
                        notes: voiceItem.notes
                    });
                });
                return newCartItems;
            });

            toast.success(`Added ${items.length} items to cart!`);
            setIsCartOpen(true);

        } catch (e) {
            console.error(e);
            toast.error("Voice processing failed. " + e);
        }
    };

    useEffect(() => {
        if (paramRestaurantId || branchId || menuUid) loadCategories();
    }, [paramRestaurantId, branchId, menuUid]);

    useEffect(() => {
        if (selectedCategory) {
            loadItems(selectedCategory.id);
        }
    }, [selectedCategory]);

    const loadCategories = async () => {
        try {
            const data = await publicService.getCategories({
                restaurantId: paramRestaurantId,
                branchId: branchId,
                menuUid: menuUid
            });
            setCategories(data);
            if (data.length > 0) {
                setSelectedCategory(data[0]);
                // If we didn't have restaurantId from params (branch mode), get it from data
                if (!restaurantId && data[0].userId) {
                    setRestaurantId(data[0].userId);
                }
            }
        } catch (error) {
            console.warn("Failed to load menu from API, using mock data");
            setCategories(MOCK_CATEGORIES);
            setSelectedCategory(MOCK_CATEGORIES[0]);
            toast.info("Showing Demo Menu (Mock Data)");
        } finally {
            setLoading(false);
        }
    };

    const loadItems = async (categoryId: string | number) => {
        try {
            // First check if we are in mock mode (if categories matched mock ids)
            if (typeof categoryId === 'number' && categoryId > 100) {
                setMenuItems(MOCK_ITEMS[categoryId] || []);
                return;
            }

            const data = await publicService.getMenuItems(categoryId);
            setMenuItems(data);
        } catch (error) {
            console.error(error);
            // Fallback for items if needed, though usually categories fallback handles the entry
        }
    };

    const openItemModal = (item: MenuItem, cartIndex: number | null = null, cartItem: CartItem | null = null) => {
        setSelectedItem(item);

        // Parse Ingredients
        const ingredients = item.ingredients ? item.ingredients.split(',').map(i => i.trim()) : [];
        setAvailableIngredients(ingredients);

        if (cartItem && cartIndex !== null) {
            // Edit Mode
            setEditingCartIndex(cartIndex);
            setItemNote(cartItem.notes || '');
            setItemQuantity(cartItem.quantity);
            setCurrentRemovedIngredients(cartItem.removedIngredients || []);
        } else {
            // New Item Mode
            setEditingCartIndex(null);
            setItemNote('');
            setItemQuantity(1);
            setCurrentRemovedIngredients([]);
        }
    };

    const closeItemModal = () => {
        setSelectedItem(null);
        setEditingCartIndex(null);
    };

    const confirmAddToCart = () => {
        if (!selectedItem) return;

        const newItem: CartItem = {
            ...selectedItem,
            quantity: itemQuantity,
            notes: itemNote,
            removedIngredients: currentRemovedIngredients
        };

        if (editingCartIndex !== null) {
            // Update Existing
            const newCart = [...cart];
            newCart[editingCartIndex] = newItem;
            setCart(newCart);
            toast.success(t('actions.order_now'));
        } else {
            // Add New
            setCart([...cart, newItem]);
            toast.success(`${t('actions.add_to_cart')}: ${selectedItem.name}`);
        }

        closeItemModal();
    };

    const toggleIngredient = (ingredient: string) => {
        setCurrentRemovedIngredients(prev => {
            if (prev.includes(ingredient)) {
                // Add back (remove from removed list)
                return prev.filter(i => i !== ingredient);
            } else {
                // Remove (add to removed list)
                return [...prev, ingredient];
            }
        });
    };

    const removeFromCart = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const placeOrder = async () => {
        if (cart.length === 0 || !restaurantId) return;

        const orderData = {
            tableNumber: tableNumber,
            customerNote: orderNote,
            items: cart.map(i => {
                // Format removed ingredients into note if present
                let finalNote = i.notes || '';
                if (i.removedIngredients && i.removedIngredients.length > 0) {
                    finalNote += (finalNote ? ', ' : '') + 'NO ' + i.removedIngredients.join(', NO ');
                }

                return {
                    itemName: i.name,
                    quantity: i.quantity,
                    price: i.price,
                    notes: finalNote
                };
            }),
            totalAmount: cart.reduce((sum, i) => sum + (i.price * i.quantity), 0)
        };

        try {
            await publicService.createOrder(restaurantId, orderData);
            toast.success(t('actions.order_now') + '!');
            setCart([]);
            setOrderNote('');
            setIsCartOpen(false);
        } catch (error) {
            toast.error("Failed to place order");
        }
    };

    const handleCallWaiter = () => {
        toast.info(`Waiter has been called to Table ${tableNumber || '1'}!`, {
            autoClose: 3000,
            icon: <FaConciergeBell className="text-yellow-500" />
        });
    };

    const totalAmount = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    if (loading) return <div className="p-8 text-center">Loading menu...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-300">
            <ToastContainer />
            {/* Enhanced Header with Logo and Dark Mode */}
            <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {restaurantLogo && (
                            <img
                                src={restaurantLogo}
                                alt="Restaurant Logo"
                                className="w-10 h-10 object-cover rounded-lg shadow-sm"
                            />
                        )}
                        <div>
                            <h1 className="font-bold text-lg dark:text-white transition-colors">{restaurantName}</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">Table: {tableNumber}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Toggle dark mode"
                        >
                            {isDarkMode ? (
                                <span className="text-2xl">☀️</span>
                            ) : (
                                <span className="text-2xl">🌙</span>
                            )}
                        </button>
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2 text-orange-500 dark:text-orange-400 transition-colors"
                        >
                            <FaShoppingCart size={24} />
                            {cart.length > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                                    {cart.reduce((s, i) => s + i.quantity, 0)}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>


            {/* Categories */}
            <div className="flex gap-2 p-4 overflow-x-auto bg-white mb-4 shadow-sm sticky top-16 z-10">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${selectedCategory?.id === cat.id
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Menu Items */}
            <div className="px-4 space-y-4">
                {menuItems.map(item => (
                    <div key={item.id} onClick={() => openItemModal(item)} className="bg-white p-4 rounded-xl shadow-sm flex gap-4 cursor-pointer hover:shadow-md transition">
                        <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {item.imageUrl && (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-gray-800">{item.name}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="font-bold text-orange-500">${item.price.toFixed(2)}</span>
                                <div className="bg-orange-100 text-orange-600 p-2 rounded-lg">
                                    <FaPlus size={14} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Item Details Modal */}
            {
                selectedItem && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto animate-slide-up sm:animate-fade-in">
                            <div className="relative h-64 bg-gray-200">
                                {selectedItem.imageUrl && (
                                    <img src={selectedItem.imageUrl} alt={selectedItem.name} className="w-full h-full object-cover" />
                                )}
                                <button onClick={closeItemModal} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm">
                                    <FaMinus className="rotate-45" />
                                </button>
                            </div>
                            <div className="p-6">
                                <h2 className="text-2xl font-bold mb-2">{selectedItem.name}</h2>
                                <p className="text-gray-500 text-sm mb-6">{selectedItem.description}</p>

                                {/* Ingredients Section */}
                                {availableIngredients.length > 0 && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('item_details.ingredients')}</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {availableIngredients.map(ing => (
                                                <button
                                                    key={ing}
                                                    onClick={() => toggleIngredient(ing)}
                                                    className={`p-2 rounded-lg text-sm text-left flex items-center gap-2 border transition-all ${currentRemovedIngredients.includes(ing)
                                                        ? 'border-gray-200 text-gray-400 bg-gray-50' // Removed State
                                                        : 'border-orange-200 text-orange-700 bg-orange-50 font-medium' // Active State
                                                        }`}
                                                >
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${currentRemovedIngredients.includes(ing) ? 'border-gray-300' : 'bg-orange-500 border-orange-500'
                                                        }`}>
                                                        {!currentRemovedIngredients.includes(ing) && <FaCheck size={10} className="text-white" />}
                                                    </div>
                                                    <span className={currentRemovedIngredients.includes(ing) ? 'line-through' : ''}>{ing}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">{t('actions.customize')}</p>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('item_details.description')}</label>
                                    <textarea
                                        value={itemNote}
                                        onChange={(e) => setItemNote(e.target.value)}
                                        placeholder="e.g. No onions, extra spicy..."
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4 bg-gray-100 rounded-xl p-2">
                                        <button onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm font-bold">-</button>
                                        <span className="font-bold text-lg w-4 text-center">{itemQuantity}</span>
                                        <button onClick={() => setItemQuantity(itemQuantity + 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm font-bold">+</button>
                                    </div>
                                    <div className="text-xl font-bold">
                                        ${(selectedItem.price * itemQuantity).toFixed(2)}
                                    </div>
                                </div>

                                <button onClick={confirmAddToCart} className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition shadow-lg shadow-orange-200">
                                    {editingCartIndex !== null ? t('actions.order_now') : t('actions.add_to_cart')}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Cart Modal */}
            {
                isCartOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
                        <div className="w-full max-w-md bg-white h-full flex flex-col animate-slide-in">
                            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                                <h2 className="font-bold text-lg">{t('actions.order_now')}</h2>
                                <button onClick={() => setIsCartOpen(false)} className="text-gray-500 font-bold">{t('actions.close')}</button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {cart.length === 0 ? (
                                    <p className="text-center text-gray-400 mt-10">{t('search.no_results')}</p>
                                ) : (
                                    cart.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start border-b border-gray-100 pb-4 last:border-0">
                                            <div className="flex-1 cursor-pointer" onClick={() => {
                                                openItemModal(item, idx, item);
                                                setIsCartOpen(false); // Close cart to show modal
                                            }}>
                                                <p className="font-bold text-gray-800">{item.name}</p>
                                                {item.notes && <p className="text-xs text-orange-600 mt-1 italic">Note: {item.notes}</p>}
                                                {item.removedIngredients && item.removedIngredients.length > 0 && (
                                                    <p className="text-xs text-red-500 mt-1 font-medium">NO {item.removedIngredients.join(', ')}</p>
                                                )}
                                                <p className="text-sm text-gray-500 mt-1">${item.price.toFixed(2)} x {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold mb-2">${(item.price * item.quantity).toFixed(2)}</p>
                                                <button onClick={() => removeFromCart(idx)} className="text-xs text-red-500 hover:underline">{t('actions.close')}</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-4 border-t bg-gray-50">
                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Order Notes</label>
                                    <textarea
                                        value={orderNote}
                                        onChange={(e) => setOrderNote(e.target.value)}
                                        placeholder="Any request for the kitchen?"
                                        className="w-full p-3 border border-gray-200 rounded-lg text-sm"
                                        rows={2}
                                    />
                                </div>

                                <div className="flex justify-between mb-4 text-xl font-bold">
                                    <span>{t('labels.price')}</span>
                                    <span>${totalAmount.toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={placeOrder}
                                    disabled={cart.length === 0}
                                    className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 disabled:bg-gray-300 shadow-lg shadow-orange-200"
                                >
                                    {t('actions.order_now')}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsCartOpen(false);
                                        setIsPaymentModalOpen(true);
                                    }}
                                    disabled={cart.length === 0}
                                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 shadow-lg shadow-blue-200 mt-3 flex items-center justify-center gap-2"
                                >
                                    <FaCreditCard /> {t('actions.order_now')}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Call Waiter Button */}
            <button
                onClick={handleCallWaiter}
                className="fixed bottom-24 left-4 w-16 h-16 rounded-full bg-yellow-400 hover:bg-yellow-500 shadow-xl flex items-center justify-center transition-all z-40 text-white"
            >
                <FaConciergeBell size={28} />
            </button>

            {/* Voice Order Button */}
            <button
                onClick={toggleListening}
                disabled={isTranscribing}
                className={`fixed bottom-24 right-4 w-16 h-16 rounded-full shadow-xl flex items-center justify-center transition-all z-40 ${isListening ? 'bg-red-500 animate-pulse' :
                    isTranscribing ? 'bg-gray-400 cursor-wait' :
                        'bg-blue-600 hover:bg-blue-700'
                    }`}
            >
                {isTranscribing ? (
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isListening ? (
                    <div className="flex gap-1 h-6 items-center">
                        <div className="w-1 h-3 bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 h-5 bg-white animate-bounce" style={{ animationDelay: '100ms' }} />
                        <div className="w-1 h-3 bg-white animate-bounce" style={{ animationDelay: '200ms' }} />
                    </div>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                )}
            </button>
            {
                (isListening || isTranscribing) && (
                    <div className="fixed bottom-44 right-4 bg-black/80 text-white p-3 rounded-lg text-sm max-w-[200px] text-center z-40 backdrop-blur-sm">
                        {isTranscribing ? 'Processing...' : 'Listening... Say "Burger", "Pizza" or "Cola"'}
                    </div>
                )
            }

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                amount={totalAmount}
                restaurantId={restaurantId?.toString() || ''}
                onSuccess={() => {
                    setIsPaymentModalOpen(false);
                    placeOrder();
                }}
            />
        </div >
    );
};

export default PublicMenu;
