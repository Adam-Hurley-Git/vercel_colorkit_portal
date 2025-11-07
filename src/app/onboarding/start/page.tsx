'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, ArrowLeft, Chrome, Calendar, Sparkles, Pin } from 'lucide-react';

export default function OnboardingStartPage() {
  const router = useRouter();

  const handleNext = () => {
    router.push('/onboarding/personalize');
  };

  const handleSkip = () => {
    router.push('/onboarding/complete');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Progress Bar - 35% (second page) */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
          style={{ width: '35%' }}
        ></div>
      </div>

      <div className="container mx-auto px-4 flex flex-col justify-center min-h-screen py-8">
        <div className="max-w-3xl mx-auto w-full">
          {/* Back Button */}
          <button
            onClick={() => router.push('/onboarding')}
            className="mb-3 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Introduction Card */}
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-60"></div>

            <div className="relative px-6 py-8 sm:px-8 sm:py-10">
              <div className="text-center space-y-6">
                {/* Main Heading */}
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight">
                    Welcome to ColorKit!
                  </h1>
                  <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
                    Let&apos;s get you set up in under 60 seconds. Here&apos;s what to expect:
                  </p>
                </div>

                {/* Quick Setup Steps */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 max-w-2xl mx-auto">
                  <div className="grid gap-3 text-left">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="font-semibold text-slate-900 text-sm">Personalize Your Experience</p>
                        <p className="text-xs text-slate-600">
                          Choose which features you&apos;d like to use (day coloring, task organization, time blocking)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        2
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="font-semibold text-slate-900 text-sm">See Feature Demos</p>
                        <p className="text-xs text-slate-600">
                          Quick interactive preview showing how each feature works with your calendar
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        3
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="font-semibold text-slate-900 text-sm">Start Your Free Trial</p>
                        <p className="text-xs text-slate-600">
                          Get 7 days of full access to all premium features, no credit card required upfront
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How to Pin Extension */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-200 max-w-2xl mx-auto">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Pin className="w-5 h-5 text-blue-600" />
                    <h3 className="font-display font-semibold text-slate-900">First: Pin Your Extension</h3>
                  </div>
                  <div className="text-left space-y-2 text-sm text-slate-700">
                    <p className="text-xs text-slate-600 text-center mb-3">
                      After setup, you&apos;ll need to access the extension from your Chrome toolbar:
                    </p>
                    <div className="bg-white rounded-lg p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-blue-600 flex-shrink-0">1.</span>
                        <p className="text-xs">Look in the top-right corner of Chrome, next to the address bar</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-blue-600 flex-shrink-0">2.</span>
                        <p className="text-xs">Click the puzzle piece icon (Extensions menu)</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-blue-600 flex-shrink-0">3.</span>
                        <p className="text-xs">
                          Find &quot;ColorKit&quot; in the list and click the pin icon next to it
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-blue-600 flex-shrink-0">4.</span>
                        <p className="text-xs">The ColorKit icon will now appear in your toolbar for easy access</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How It Works with Calendar */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-5 border border-green-200 max-w-2xl mx-auto">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <h3 className="font-display font-semibold text-slate-900">How It Works with Google Calendar</h3>
                  </div>
                  <div className="text-left space-y-2">
                    <div className="bg-white rounded-lg p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <Chrome className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-slate-900 mb-1">Extension Icon</p>
                          <p className="text-xs text-slate-600">
                            Click the ColorKit icon in your toolbar to open settings and customize colors
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-slate-900 mb-1">Open Google Calendar</p>
                          <p className="text-xs text-slate-600">
                            Go to calendar.google.com - the extension only works on Google Calendar pages
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-slate-900 mb-1">See Your Customizations</p>
                          <p className="text-xs text-slate-600">
                            Your color-coded days, organized tasks, and time blocks will appear automatically
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Estimate */}
                <div className="flex items-center justify-center gap-2 text-slate-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <p className="text-sm font-medium">Complete setup in under 60 seconds</p>
                </div>

                {/* CTA Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleNext}
                    className="btn btn-primary btn-lg group shadow-xl hover:shadow-2xl px-8 py-3 w-full sm:w-auto"
                  >
                    <span className="font-semibold">Continue</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </button>

                  <div>
                    <button
                      onClick={handleSkip}
                      className="text-slate-600 hover:text-slate-900 text-sm font-medium underline transition-colors"
                    >
                      Skip to trial signup
                    </button>
                  </div>
                </div>

                {/* Trust Indicators - Compact */}
                <div className="flex items-center justify-center gap-6 text-xs border-t border-slate-200 pt-4 mt-4">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="font-medium">7-Day Free Trial</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <span className="font-medium">Cancel Anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
