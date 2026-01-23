import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { FaTimes, FaCreditCard, FaLock } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

// Remove static loadStripe and stripePromise
// import { loadStripe } from '@stripe/stripe-js';

// Internal component for Stripe Form
const StripeCheckoutForm: React.FC<CheckoutFormProps & { restaurantId: string }> = ({ amount, onSuccess, onClose, restaurantId }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setProcessing(true);
        setError(null);

        if (!stripe || !elements) {
            setProcessing(false);
            return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            setProcessing(false);
            return;
        }

        try {
            // 1. Create Payment Intent on Backend (Public Endpoint)
            const response = await fetch('http://localhost:8080/api/payment/create-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: amount,
                    currency: 'usd',
                    restaurantId: restaurantId
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to initialize payment');
            }

            const { clientSecret } = await response.json();

            // 2. Confirm Card Payment
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                }
            });

            if (result.error) {
                setError(result.error.message || 'Payment failed');
                toast.error(result.error.message);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    toast.success('Payment Successful!');
                    onSuccess();
                }
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
            toast.error('Payment Error: ' + err.message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-bold text-lg">${amount.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                    <FaLock /> Secure SSL Encrypted
                </div>
            </div>

            <div className="p-3 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 bg-white shadow-sm">
                <CardElement options={{
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': { color: '#aab7c4' },
                        },
                        invalid: { color: '#9e2146' },
                    },
                }} />
            </div>

            {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg flex items-center gap-2">
                    <FaTimes /> {error}
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-400 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
                {processing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <FaCreditCard /> Pay Now
                    </>
                )}
            </button>
        </form>
    );
};

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    onSuccess: () => void;
    restaurantId: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, amount, onSuccess, restaurantId }) => {
    const { t } = useTranslation('common');
    const [config, setConfig] = useState<{ provider: string; publicKey: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [stripePromise, setStripePromise] = useState<any>(null); // Dynamic Stripe Promise

    // Fetch config when modal opens
    React.useEffect(() => {
        if (isOpen && restaurantId) {
            setLoading(true);
            fetch(`http://localhost:8080/api/payment/config/${restaurantId}`)
                .then(res => {
                    if (!res.ok) throw new Error("Failed to load payment config");
                    return res.json();
                })
                .then(data => {
                    setConfig(data);
                    if (data.provider === 'STRIPE' && data.publicKey) {
                        setStripePromise(loadStripe(data.publicKey));
                    }
                })
                .catch(err => {
                    console.error(err);
                    toast.error("Could not load payment options.");
                })
                .finally(() => setLoading(false));
        }
    }, [isOpen, restaurantId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        <FaCreditCard className="text-blue-600" /> Secure Payment
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition">
                        <FaTimes />
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : !config ? (
                        <div className="text-center text-red-500">Payment system unavailable.</div>
                    ) : config.provider === 'STRIPE' && stripePromise ? (
                        <Elements stripe={stripePromise}>
                            <StripeCheckoutForm amount={amount} onSuccess={onSuccess} onClose={onClose} restaurantId={restaurantId} />
                        </Elements>
                    ) : (
                        <div className="text-center p-4">
                            <h4 className="font-bold text-lg">{config.provider} Payment</h4>
                            <p className="text-sm text-gray-500 mb-4">Mock Integration Ready</p>
                            <button
                                onClick={onSuccess}
                                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700"
                            >
                                Simulate Successful Payment
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 p-3 text-center text-xs text-gray-400 border-t">
                    Powered by {config?.provider || 'Secure Payment'}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
