'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    amount: '100.00',
    currency: 'DKK',
    orderNumber: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.orderNumber) {
        throw new Error('Please enter an order number');
      }

      const response = await fetch('/api/viabill/checkout-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Checkout failed');
      }

      const data = await response.json();
      const { viabillCheckoutUrl, formData: checkoutFormData } = data;

      // Create a hidden form and auto-submit it to ViaBill
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = viabillCheckoutUrl;
      form.style.display = 'none';

      // Add all fields to the form
      Object.entries(checkoutFormData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700">
                Order Number
              </label>
              <input
                type="text"
                id="orderNumber"
                name="orderNumber"
                value={formData.orderNumber}
                onChange={handleInputChange}
                placeholder="e.g., ORD-12345"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                Currency
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DKK">DKK</option>
              </select>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

