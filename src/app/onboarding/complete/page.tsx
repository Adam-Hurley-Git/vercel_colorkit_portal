'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PricingTier } from '@/constants/pricing-tier';
import { CheckCircle, Calendar, Palette, Clock, ArrowRight, Loader2 } from 'lucide-react';

export default function CompletePage() {
  const router = useRouter();

  // Checkbox states
  const [agreements, setAgreements] = useState({
    terms: false,
    refund: false,
    privacy: false,
    recurring: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Get the Pro plan (featured tier) - monthly by default
  const proPlan = PricingTier.find((tier) => tier.id === 'pro');
  const proPriceId = proPlan?.priceId.month || '';

  // Check if all required agreements are checked
  const allRequiredChecked = agreements.terms && agreements.refund && agreements.privacy && agreements.recurring;

  const handleCheckboxChange = (key: keyof typeof agreements) => {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAgreeToAll = () => {
    setAgreements({
      terms: true,
      refund: true,
      privacy: true,
      recurring: true,
    });
  };

  const saveAgreementsToDatabase = async () => {
    try {
      const response = await fetch('/api/user-agreements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agreements }),
      });

      if (!response.ok) {
        throw new Error('Failed to save agreements');
      }

      const result = await response.json();

      // TEMPORARY: Log when database save is skipped for local testing
      if (result.skipped) {
        console.log('✅ Database save skipped - proceeding to checkout (local testing mode)');
      }

      return result.success;
    } catch (error) {
      console.error('Error saving agreements:', error);
      throw error;
    }
  };

  const handleStartTrial = async () => {
    if (!allRequiredChecked) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      // Save agreements to database with timestamps
      await saveAgreementsToDatabase();

      // Redirect to the existing Paddle checkout page with the Pro plan
      router.push(`/checkout/${proPriceId}`);
    } catch (error) {
      setIsSaving(false);
      setSaveError('Failed to save your agreements. Please try again.');
      console.error('Error in handleStartTrial:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Progress Bar - Complete! */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
          style={{ width: '100%' }}
        ></div>
      </div>

      <div className="container mx-auto px-4 h-screen flex items-center justify-center">
        <div className="max-w-3xl mx-auto w-full">
          {/* Success Card */}
          <div className="card card-elevated animate-fade-in-up">
            <div className="card-body text-center space-y-6">
              {/* Success Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full animate-scale-in">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              {/* Heading */}
              <div className="space-y-2">
                <h1 className="text-3xl font-display font-bold text-slate-900">You&apos;re All Set! 🎉</h1>
                <p className="text-lg text-slate-600">Your ColorKit extension is ready to go</p>
              </div>

              {/* Welcome Box */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-base font-semibold text-slate-900">Welcome to ColorKit!</p>
                </div>
                <p className="text-sm text-slate-700 mb-1">Your calendar extension is configured and ready</p>
                <p className="text-xs text-slate-600">Start with a free trial to unlock all features</p>
              </div>

              {/* What's Next */}
              <div className="text-left space-y-3 max-w-lg mx-auto">
                <h3 className="font-display font-semibold text-base text-slate-900 text-center">What You Get:</h3>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="font-medium text-slate-900 text-xs mb-1">Day Coloring</p>
                    <p className="text-xs text-slate-600">Tinted columns per day</p>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Palette className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="font-medium text-slate-900 text-xs mb-1">Task Colors</p>
                    <p className="text-xs text-slate-600">Any color, any task</p>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="font-medium text-slate-900 text-xs mb-1">Time Blocks</p>
                    <p className="text-xs text-slate-600">Protect focus time</p>
                  </div>
                </div>
              </div>

              {/* Trial & Refund Badges */}
              <div className="flex items-center justify-center gap-3 max-w-xl mx-auto">
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2">
                  <span className="text-lg">🎁</span>
                  <span className="text-sm font-semibold text-blue-900">7-Day Free Trial</span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
                  <span className="text-lg">💰</span>
                  <span className="text-sm font-semibold text-green-900">7-Day Refund</span>
                </div>
              </div>

              {/* Agreements Section */}
              <div className="space-y-2 max-w-xl mx-auto">
                {/* Accept All Checkbox - Prominent */}
                <div className="bg-blue-50 rounded-md p-2.5 border border-blue-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allRequiredChecked}
                      onChange={handleAgreeToAll}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer flex-shrink-0"
                    />
                    <span className="text-sm font-semibold text-blue-900">
                      Accept All Terms and Conditions to Start
                    </span>
                  </label>
                </div>

                {/* Individual Checkboxes - Compact */}
                <div className="space-y-1 text-left">
                  {/* Terms of Service */}
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreements.terms}
                      onChange={() => handleCheckboxChange('terms')}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer flex-shrink-0"
                    />
                    <span className="text-xs text-slate-700">
                      I agree to the{' '}
                      <a
                        href="https://www.calendarextension.com/terms"
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        Terms of Service
                      </a>
                    </span>
                  </label>

                  {/* Refund Policy */}
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreements.refund}
                      onChange={() => handleCheckboxChange('refund')}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer flex-shrink-0"
                    />
                    <span className="text-xs text-slate-700">
                      I agree to the{' '}
                      <a
                        href="https://www.calendarextension.com/refund"
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        Refund Policy
                      </a>
                    </span>
                  </label>

                  {/* Privacy Policy */}
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreements.privacy}
                      onChange={() => handleCheckboxChange('privacy')}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer flex-shrink-0"
                    />
                    <span className="text-xs text-slate-700">
                      I agree to the{' '}
                      <a
                        href="https://www.calendarextension.com/privacy"
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        Privacy Policy
                      </a>
                    </span>
                  </label>

                  {/* Recurring Payments */}
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreements.recurring}
                      onChange={() => handleCheckboxChange('recurring')}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer flex-shrink-0"
                    />
                    <span className="text-xs text-slate-700">
                      I agree to automatic recurring charges. My subscription will automatically renew at the end of
                      each billing period until I cancel. I understand I must cancel before my next billing date to
                      avoid being charged.
                    </span>
                  </label>
                </div>
              </div>

              {/* CTA Button */}
              <div className="flex flex-col items-center justify-center gap-2">
                <button
                  onClick={handleStartTrial}
                  disabled={!allRequiredChecked || isSaving}
                  className="btn btn-primary btn-lg group w-full sm:w-auto shadow-2xl hover:shadow-3xl relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-pulse opacity-20"></div>
                  <span className="relative">{isSaving ? 'Saving...' : 'Start Free Trial'}</span>
                  {!isSaving && (
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 relative" />
                  )}
                  {isSaving && <Loader2 className="animate-spin h-5 w-5 relative" />}
                </button>
                {!allRequiredChecked && !saveError && (
                  <p className="text-xs text-slate-500 italic">Please accept all required agreements to continue</p>
                )}
                {saveError && <p className="text-xs text-red-600 font-medium">{saveError}</p>}
              </div>

              {/* Trust Indicator */}
              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-500">🔒 Privacy First • ✨ 7 Day Free Trial</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
