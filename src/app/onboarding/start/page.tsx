'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

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
              <div className="text-center space-y-5">
                {/* Main Heading */}
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight">
                    Before We Begin
                  </h1>
                  <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
                    Complete these quick steps to activate your ColorKit extension
                  </p>
                </div>

                {/* Instructions Grid - Compact */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 max-w-xl mx-auto">
                  <div className="grid gap-3 text-left">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="font-semibold text-slate-900 text-sm">Personalize Your Experience</p>
                        <p className="text-xs text-slate-600">Tell us what features matter most to you</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        2
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="font-semibold text-slate-900 text-sm">See Feature Demos</p>
                        <p className="text-xs text-slate-600">Quick interactive preview of key features</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        3
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="font-semibold text-slate-900 text-sm">Start Your Free Trial</p>
                        <p className="text-xs text-slate-600">7-day trial with full access to all features</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Estimate */}
                <div className="flex items-center justify-center gap-2 text-slate-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <p className="text-sm font-medium">Takes less than 60 seconds</p>
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
