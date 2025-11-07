'use client';

import { useRouter } from 'next/navigation';
import { Rocket, CheckCircle, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

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

      <div className="container mx-auto px-4 py-8 flex flex-col justify-center min-h-screen">
        <div className="max-w-4xl mx-auto w-full">
          {/* Back Button */}
          <button
            onClick={() => router.push('/onboarding')}
            className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Introduction Card */}
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl animate-fade-in-up">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-60"></div>

            <div className="relative px-8 py-12 sm:px-12 sm:py-16">
              <div className="text-center space-y-8">
                {/* Icon with Animation */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl animate-pulse opacity-75"></div>
                  <Rocket className="w-10 h-10 text-white relative z-10" />
                </div>

                {/* Main Heading */}
                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl font-display font-bold text-slate-900 tracking-tight">
                    Welcome to{' '}
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ColorKit
                    </span>
                  </h1>
                  <p className="text-xl sm:text-2xl text-slate-600 max-w-2xl mx-auto font-medium">
                    Transform your Google Calendar in just a few steps
                  </p>
                </div>

                {/* Instructions Box */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200 max-w-2xl mx-auto">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-display font-bold text-slate-900">Getting Started</h2>
                  </div>

                  <div className="text-left space-y-4">
                    <p className="text-base text-slate-700 leading-relaxed">
                      Before you can use the ColorKit extension, you&apos;ll need to complete a quick setup process:
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mt-0.5">
                          1
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Explore Features</p>
                          <p className="text-sm text-slate-600">
                            Learn about ColorKit&apos;s powerful customization options
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm mt-0.5">
                          2
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Personalize Your Experience</p>
                          <p className="text-sm text-slate-600">Tell us what you need and see interactive demos</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm mt-0.5">
                          3
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Start Your Free Trial</p>
                          <p className="text-sm text-slate-600">Activate all features with a 7-day free trial</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Estimate */}
                <div className="flex items-center justify-center gap-2 text-slate-600">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-base font-medium">Takes less than 60 seconds</p>
                </div>

                {/* CTA Buttons */}
                <div className="pt-4 space-y-4">
                  <button
                    onClick={handleNext}
                    className="btn btn-primary btn-lg group shadow-xl hover:shadow-2xl px-10 py-4 text-lg"
                  >
                    <span className="font-semibold">Let&apos;s Get Started</span>
                    <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                  </button>

                  <div className="pt-2">
                    <button
                      onClick={handleSkip}
                      className="text-slate-600 hover:text-slate-900 text-sm font-medium underline transition-colors"
                    >
                      Skip onboarding and go straight to trial signup
                    </button>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center justify-center gap-8 text-sm border-t border-slate-200 pt-6 mt-6">
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">7-Day Free Trial</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">No Credit Card Required</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
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
