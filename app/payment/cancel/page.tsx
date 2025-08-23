'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentCancelPage() {
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
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Cancelled
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your payment was cancelled and no charges were made.
          </p>
          {orderNumber && (
            <p className="mt-2 text-sm font-medium text-gray-900">
              Order Number: <span className="text-yellow-600">{orderNumber}</span>
            </p>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center space-y-4">
            <div className="text-yellow-600">
              <svg className="mx-auto h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900">
              What would you like to do?
            </h3>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p>💳 Your payment was not processed</p>
              <p>🛒 Your order is still in your cart</p>
              <p>🔄 You can try the payment again</p>
              <p>📞 Contact us if you need assistance</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <Link
            href="/menu"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Payment Again
          </Link>
          
          <Link
            href="/menu"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Continue Shopping
          </Link>
          
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact us at{' '}
              <a href="tel:+94701234567" className="text-indigo-600 hover:text-indigo-500">
                +94 70 123 4567
              </a>
            </p>
          </div>
          
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