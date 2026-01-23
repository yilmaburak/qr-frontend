import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaMicrophone, FaTrash, FaPaperPlane } from 'react-icons/fa';
import { useBranch } from '../contexts/BranchContext';
import { MenuItem } from '../types/menu';
import publicService from '../services/publicService'; // Or a dedicated restaurantService
import axios from 'axios';
import { useTranslation } from 'react-i18next';

interface CartItem extends MenuItem {
    quantity: number;
    notes?: string;
}

const WaiterOrder: React.FC = () => {
    const { t } = useTranslation('restaurant');
    const { activeBranch } = useBranch();
    const [tableNumber, setTableNumber] = useState<string>('');
    const [isListening, setIsListening] = useState<boolean>(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Whisper Voice Logic
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
                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsListening(true);
            toast.info(t('waiter.listening'));
        } catch (err) {
            console.error("Microphone access denied", err);
            toast.error(t('waiter.mic_error') || "Microphone access denied");
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
            const res = await axios.post('http://localhost:8080/api/voice/transcribe', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const transcript = res.data.transcript;
            if (transcript) {
                toast.success(t('waiter.heard', { transcript }));
                handleVoiceResult(transcript);
            }
        } catch (err) {
            console.error("Transcription failed", err);
            toast.error(t('waiter.parse_error'));
        } finally {
            setIsTranscribing(false);
        }
    };

    const handleVoiceResult = async (transcript: string) => {
        if (!activeBranch) {
            toast.error(t('waiter.select_branch_error'));
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/voice/parse', {
                transcript,
                restaurantId: activeBranch.restaurantId, // Assuming branch has restaurantId, else use user context
                language: 'en'
            });

            const items: any[] = response.data;
            if (items.length === 0) {
                toast.warn(t('waiter.no_items_recognized'));
                return;
            }

            setCart(prev => {
                const newCart = [...prev];
                items.forEach(voiceItem => {
                    const existing = newCart.find(i => i.id === voiceItem.menuItemId);
                    if (existing) {
                        existing.quantity += (voiceItem.quantity || 1);
                        if (voiceItem.notes) existing.notes = (existing.notes ? existing.notes + ", " : "") + voiceItem.notes;
                    } else {
                        newCart.push({
                            id: voiceItem.menuItemId,
                            name: voiceItem.menuItemName || t('waiter.unknown_item'),
                            price: voiceItem.price || 0,
                            description: '',
                            imageUrl: '',
                            category: { id: 0, name: 'Voice', userId: 0 },
                            quantity: voiceItem.quantity || 1,
                            notes: voiceItem.notes
                        });
                    }
                });
                return newCart;
            });
            toast.success(t('waiter.items_added', { count: items.length }));
        } catch (e) {
            console.error(e);
            toast.error(t('waiter.parse_error'));
        }
    };

    const sendOrder = async () => {
        if (!tableNumber) {
            toast.error(t('waiter.enter_table_number'));
            return;
        }
        if (cart.length === 0) {
            toast.error(t('waiter.cart_is_empty'));
            return;
        }
        if (!activeBranch) {
            toast.error(t('waiter.select_branch_error'));
            return;
        }

        setLoading(true);
        try {
            // Construct Order DTO
            const orderData = {
                tableNumber: tableNumber,
                branchId: activeBranch.id,
                items: cart.map(i => ({
                    menuItemId: i.id,
                    quantity: i.quantity,
                    notes: i.notes
                })),
                totalAmount: cart.reduce((s, i) => s + (i.price * i.quantity), 0),
                customerName: t('waiter.waiter_entry'),
                customerPhone: ""
            };

            await publicService.createOrder(activeBranch.restaurantId, orderData);
            // Note: publicService.createOrder might need updates to handle backend Auth if we use the authenticated endpoint.
            // But reuse public endpoint for now as it's easiest, effectively acting as "User ordered".
            // Ideally should use an authenticated /api/restaurant/orders endpoint.

            toast.success(t('waiter.order_sent'));
            setCart([]);
            setTableNumber('');
        } catch (e) {
            console.error(e);
            toast.error(t('waiter.send_error'));
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = (index: number, delta: number) => {
        setCart(prev => {
            const newCart = [...prev];
            const item = newCart[index];
            item.quantity = Math.max(1, item.quantity + delta);
            return newCart;
        });
    };

    const removeItem = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">{t('waiter.title')}</h1>

            {!activeBranch ? (
                <div className="p-4 bg-yellow-50 text-yellow-700 rounded-xl">{t('waiter.select_branch')}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t('waiter.table_number')}</label>
                            <input
                                type="text"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                placeholder="e.g. 5"
                                className="w-full text-4xl font-bold p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 text-center"
                            />
                        </div>

                        <button
                            onClick={toggleListening}
                            disabled={isTranscribing}
                            className={`w-full py-12 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all ${isListening ? 'bg-red-500 animate-pulse text-white' :
                                isTranscribing ? 'bg-gray-400 text-white cursor-wait' :
                                    'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200'
                                }`}
                        >
                            {isTranscribing ? (
                                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <FaMicrophone size={48} />
                            )}
                            <span className="text-xl font-bold">
                                {isListening ? t('waiter.listening') :
                                    isTranscribing ? t('waiter.processing') || 'Processing...' :
                                        t('waiter.tap_to_speak')}
                            </span>
                        </button>
                        <p className="text-center text-gray-400 mt-4 text-sm">{t('waiter.example_phrase')}</p>
                    </div>

                    {/* Review Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
                        <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
                            {t('waiter.current_order')}
                            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {t('waiter.items_count', { count: cart.length })}
                            </span>
                        </h2>

                        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                            {cart.length === 0 ? (
                                <div className="text-center text-gray-400 mt-20">
                                    <p>{t('waiter.cart_empty')}</p>
                                    <p className="text-sm">{t('waiter.speak_to_add')}</p>
                                </div>
                            ) : (
                                cart.map((item, idx) => (
                                    <div key={idx} className="bg-gray-50 p-3 rounded-xl flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-gray-800">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.notes}</p>
                                            <p className="text-xs font-bold text-indigo-600">${item.price}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center bg-white rounded-lg border border-gray-200">
                                                <button onClick={() => updateQuantity(idx, -1)} className="px-2 py-1 hover:bg-gray-100">-</button>
                                                <span className="px-2 font-bold text-sm">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(idx, 1)} className="px-2 py-1 hover:bg-gray-100">+</button>
                                            </div>
                                            <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                            <div className="flex justify-between mb-4 text-xl font-bold">
                                <span>{t('orders.total')}</span>
                                <span>${cart.reduce((s, i) => s + (i.price * i.quantity), 0).toFixed(2)}</span>
                            </div>
                            <button
                                onClick={sendOrder}
                                disabled={cart.length === 0 || !tableNumber || loading}
                                className="w-full bg-green-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                            >
                                {loading ? t('waiter.sending') : <><FaPaperPlane /> {t('waiter.send_to_kitchen')}</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WaiterOrder;
