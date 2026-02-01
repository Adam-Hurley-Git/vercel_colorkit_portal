'use client';

import { useRouter } from 'next/navigation';
import { PricingTier } from '@/constants/pricing-tier';
import { CheckCircle, Calendar, Palette, Clock, ArrowRight, Crown, Chrome, ExternalLink, Sparkles } from 'lucide-react';

export default function CompletePage() {
  const router = useRouter();

  // Get the Pro plan price ID for upgrade
  const proPlan = PricingTier.find((tier) => tier.id === 'pro');
  const proPriceId = proPlan?.priceId.month || '';

  const handleStartFree = () => {
    // Open Google Calendar in a new tab
    window.open('https://calendar.google.com', '_blank');
  };

  const handleUpgrade = () => {
    router.push(`/checkout/${proPriceId}`);
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

      <div className="container mx-auto px-4 min-h-screen flex items-center justify-center py-8">
        <div className="max-w-4xl mx-auto w-full">
          {/* Main Card */}
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50 opacity-60"></div>

            <div className="relative px-6 py-8 sm:px-10 sm:py-10">
              <div className="text-center space-y-6">
                {/* Success Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full animate-scale-in">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>

                {/* Heading */}
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">
                    You&apos;re All Set!
                  </h1>
                  <p className="text-lg text-slate-600 max-w-xl mx-auto">
                    ColorKit is ready to transform your Google Calendar. Here&apos;s how to get started.
                  </p>
                </div>

                {/* Quick Setup Guide */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 max-w-2xl mx-auto">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Chrome className="w-5 h-5 text-blue-600" />
                    <h3 className="font-display font-semibold text-slate-900">Quick Setup</h3>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 text-left">
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                        <span className="font-semibold text-slate-900 text-sm">Pin Extension</span>
                      </div>
                      <p className="text-xs text-slate-600">Click the puzzle icon in Chrome and pin ColorKit to your toolbar</p>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                        <span className="font-semibold text-slate-900 text-sm">Open Calendar</span>
                      </div>
                      <p className="text-xs text-slate-600">Go to calendar.google.com and ColorKit will activate automatically</p>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                        <span className="font-semibold text-slate-900 text-sm">Customize</span>
                      </div>
                      <p className="text-xs text-slate-600">Click the ColorKit icon to open settings and start customizing</p>
                    </div>
                  </div>
                </div>

                {/* What's Included Free */}
                <div className="max-w-2xl mx-auto">
                  <h3 className="font-display font-semibold text-slate-900 mb-3 flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    What&apos;s Included Free
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="font-medium text-slate-900 text-sm">Day Coloring</p>
                      <p className="text-xs text-slate-500">Weekday colors</p>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Palette className="w-5 h-5 text-red-600" />
                      </div>
                      <p className="font-medium text-slate-900 text-sm">Event Colors</p>
                      <p className="text-xs text-slate-500">Background styling</p>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Clock className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="font-medium text-slate-900 text-sm">Time Blocks</p>
                      <p className="text-xs text-slate-500">Weekly schedule</p>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleStartFree}
                    className="btn btn-primary btn-lg group shadow-xl hover:shadow-2xl w-full sm:w-auto"
                  >
                    Open Google Calendar
                    <ExternalLink className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>

                {/* Pro Upgrade Section */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border-2 border-purple-200 max-w-2xl mx-auto relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-500 opacity-10 rounded-bl-full"></div>

                  <div className="relative">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Crown className="w-5 h-5 text-purple-600" />
                      <h3 className="font-display font-bold text-purple-900">Want More Power?</h3>
                    </div>

                    <p className="text-sm text-purple-800 mb-4 max-w-lg mx-auto">
                      Unlock Pro features like date-specific colors, custom text colors, borders, templates, and more.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2 mb-4 text-xs">
                      {['Date-specific colors', 'Text colors', 'Borders', 'Templates', 'Calendar defaults'].map((feature) => (
                        <span key={feature} className="bg-white px-2 py-1 rounded-full text-purple-700 border border-purple-200">
                          {feature}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={handleUpgrade}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
                    >
                      <Sparkles className="w-4 h-4" />
                      Upgrade to Pro
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <p className="text-xs text-purple-600 mt-3">7-day free trial included</p>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center justify-center gap-6 text-xs text-slate-500 border-t border-slate-200 pt-4">
                  <span>No credit card for free features</span>
                  <span>•</span>
                  <span>Upgrade anytime</span>
                  <span>•</span>
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
