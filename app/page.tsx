import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCartIcon } from '@heroicons/react/24/solid';

export default function Home() {
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ViaBill Payment Integration</h1>
            <p className="text-gray-600 mt-1">Next.js Example Implementation</p>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Checkout Card */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <ShoppingCartIcon className="w-12 h-12 text-blue-600 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-3">Start Payment</h2>
            <p className="text-gray-600 mb-6">
              Create a new checkout and process a payment through ViaBill.
            </p>
            <Link
              href="/checkout"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
            >
              New Checkout
            </Link>
          </div>

          {/* Documentation Card */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="w-12 h-12 bg-blue-100 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-blue-600 text-xl font-bold">📚</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">API Documentation</h2>
            <p className="text-gray-600 mb-6">
              Learn about the available API endpoints and how to use them.
            </p>
            <a
              href="https://viabill.stoplight.io/docs/merchant-api/875734860e7eb-merchant"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
            >
              View Docs
            </a>
          </div>

          {/* Configuration Card */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="w-12 h-12 bg-blue-100 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-blue-600 text-xl font-bold">⚙️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Configuration</h2>
            <p className="text-gray-600 mb-6">
              Update .env.local with your ViaBill API credentials.
            </p>
          </div>
        </div>

        {/* Quick Start Section */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Start</h2>
          <ol className="space-y-4 text-gray-600">
            <li className="flex">
              <span className="font-bold text-blue-600 mr-4">1.</span>
              <span>Update <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> with your ViaBill API key and secret</span>
            </li>
            <li className="flex">
              <span className="font-bold text-blue-600 mr-4">2.</span>
              <span>Click "New Checkout" to create a test payment</span>
            </li>
            <li className="flex">
              <span className="font-bold text-blue-600 mr-4">3.</span>
              <span>You'll be redirected to the ViaBill payment page</span>
            </li>
            <li className="flex">
              <span className="font-bold text-blue-600 mr-4">4.</span>
              <span>Complete your test payment</span>
            </li>
          </ol>
        </div>
      </main>
    </div>
  );
}
