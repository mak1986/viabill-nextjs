'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
          <Image
            src="/viabill-logo.svg"
            alt="ViaBill Logo"
            width={108}
            height={25}
          />
          <h1 className="text-2xl font-bold text-gray-900">Payment Successful</h1>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your payment has been processed successfully.
          </p>

          {orderId && (
            <div className="bg-gray-50 rounded-md p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Order ID:</p>
              <p className="font-mono text-gray-900 break-all">{orderId}</p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/checkout"
              className="block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
            >
              New Checkout
            </Link>
            <Link
              href="/"
              className="block bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-md transition duration-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
