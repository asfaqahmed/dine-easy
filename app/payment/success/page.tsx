'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    if (orderId) {
      setOrderNumber(orderId);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Successful!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your order has been confirmed and payment processed successfully.
          </p>
          {orderNumber && (
            <p className="mt-2 text-sm font-medium text-gray-900">
              Order Number: <span className="text-green-600">{orderNumber}</span>
            </p>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center space-y-4">
            <div className="text-green-600">
              <svg className="mx-auto h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900">
              What happens next?
            </h3>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p>📧 You will receive a confirmation email shortly</p>
              <p>📱 SMS updates will be sent to your registered phone number</p>
              <p>⏰ Your order will be prepared and ready for pickup/delivery</p>
              <p>🍽️ Track your order status on the kitchen dashboard</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <Link
            href="/menu"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Menu
          </Link>
          
          <Link
            href="/kitchen"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Track Order Status
          </Link>
          
          <Link
            href="/"
            className="w-full flex justify-center py-2 px-4 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}