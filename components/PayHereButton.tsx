'use client';

import { useState } from 'react';
import { createPayHerePayment, initializePayHerePayment } from '@/lib/payhere';
import toast from 'react-hot-toast';

interface PayHereButtonProps {
  orderId: string;
  amount: number;
  items: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
  onSuccess?: (orderId: string) => void;
  onError?: (error: any) => void;
  onDismissed?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function PayHereButton({
  orderId,
  amount,
  items,
  customerInfo,
  onSuccess,
  onError,
  onDismissed,
  disabled = false,
  className = ''
}: PayHereButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (isProcessing || disabled) return;

    setIsProcessing(true);
    
    try {
      // First, get payment hash from our API
      const response = await fetch('/api/payments/payhere?action=start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          amount: amount,
          items: items
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initialize payment');
      }

      const { hash, merchant_id, order_id: orderNumber, amount: finalAmount } = await response.json();

      // Create PayHere payment object
      const paymentData = createPayHerePayment({
        orderId: orderNumber,
        amount: parseFloat(finalAmount),
        items: items,
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: customerInfo.address,
        city: customerInfo.city,
        country: 'Sri Lanka',
        returnUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`,
        notifyUrl: `${window.location.origin}/api/payments/payhere-callback`,
        customFields: {
          custom_1: orderId, // Store our internal order ID
        }
      });

      // Override the hash with the one from our API
      paymentData.hash = hash;
      paymentData.merchant_id = merchant_id;

      // Initialize PayHere payment with callbacks
      await initializePayHerePayment(paymentData, {
        onCompleted: (completedOrderId: string) => {
          console.log('Payment completed:', completedOrderId);
          toast.success('Payment completed successfully!');
          if (onSuccess) onSuccess(completedOrderId);
          setIsProcessing(false);
        },
        onDismissed: () => {
          console.log('Payment dismissed');
          toast('Payment was cancelled', { icon: 'ℹ️' });
          if (onDismissed) onDismissed();
          setIsProcessing(false);
        },
        onError: (error: any) => {
          console.error('Payment error:', error);
          toast.error('Payment failed. Please try again.');
          if (onError) onError(error);
          setIsProcessing(false);
        }
      });

    } catch (error) {
      console.error('PayHere initialization error:', error);
      toast.error('Failed to initialize payment. Please try again.');
      if (onError) onError(error);
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || isProcessing}
      className={`
        bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg
        disabled:bg-gray-400 disabled:cursor-not-allowed
        transition-colors duration-200
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {isProcessing ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          Processing...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Pay LKR {amount.toFixed(2)}
        </>
      )}
    </button>
  );
}