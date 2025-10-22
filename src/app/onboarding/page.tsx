'use client';

import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
          style={{ width: '25%' }}
        ></div>
      </div>

      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="max-w-6xl mx-auto w-full">
          {/* Welcome Card */}
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl animate-fade-in-up">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-60"></div>

            <div className="relative px-8 py-8 sm:px-12 sm:py-10 pb-6 sm:pb-7">
              <div className="text-center space-y-10">
                {/* Icon with Pulse Effect */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl animate-pulse opacity-75"></div>
                  <svg
                    className="w-8 h-8 text-white relative z-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h8m-8 0a4 4 0 004 4h2m6-16a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4 4 4 0 004-4V5z"
                    />
                  </svg>
                </div>

                {/* Heading */}
                <div className="space-y-4">
                  <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight">
                    Welcome to{' '}
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ColorKit
                    </span>
                  </h1>
                  <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
                    Make Google Calendar readable at a glance in{' '}
                    <span className="font-semibold text-slate-900">under 60 seconds</span>
                  </p>
                </div>

                {/* Benefits Grid */}
                <div className="grid sm:grid-cols-3 gap-7 max-w-5xl mx-auto">
                  <div className="bg-white rounded-xl p-5 shadow-lg border border-slate-100 relative overflow-hidden group hover:scale-105 transition-transform">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                        <rect x="7" y="11" width="3" height="3" fill="currentColor" opacity="0.3" rx="0.5" />
                        <rect x="11" y="11" width="3" height="3" fill="currentColor" opacity="0.5" rx="0.5" />
                        <rect x="15" y="11" width="3" height="3" fill="currentColor" opacity="0.7" rx="0.5" />
                      </svg>
                    </div>
                    <h3 className="font-display font-bold text-slate-900 mb-2 text-base">Day-Column Coloring</h3>
                    <p className="text-sm text-slate-600 mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
                      Make your week instantly scannable
                    </p>
                    <div className="text-sm font-semibold text-blue-600">→ 3x Faster Scanning</div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-lg border border-slate-100 relative overflow-hidden group hover:scale-105 transition-transform">
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2.5 py-1 rounded-bl-lg font-bold">
                      POPULAR
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-display font-bold text-slate-900 mb-2 text-base">Custom Task Colors</h3>
                    <p className="text-sm text-slate-600 mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
                      Use any color for your tasks
                    </p>
                    <div className="text-sm font-semibold text-red-600">→ Unlimited Colors</div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-lg border border-slate-100 relative overflow-hidden group hover:scale-105 transition-transform">
                    <div className="absolute top-0 right-0 bg-green-600 text-white text-xs px-2.5 py-1 rounded-bl-lg font-bold">
                      NEW
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-display font-bold text-slate-900 mb-2 text-base">Time-Block Overlays</h3>
                    <p className="text-sm text-slate-600 mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
                      Protect focus without fake events
                    </p>
                    <div className="text-sm font-semibold text-green-600">→ Clean & Simple</div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-2">
                  <button
                    onClick={() => router.push('/onboarding/personalize')}
                    className="btn btn-primary btn-lg group shadow-xl hover:shadow-2xl px-8 py-3"
                  >
                    Let&apos;s Get Started
                    <svg
                      className="w-5 h-5 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center justify-center gap-6 text-sm border-t border-slate-200 pt-5 pb-0 mt-1">
                  <div className="flex items-center gap-2 text-slate-600">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">Chrome Extension</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">Privacy-Friendly</span>
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
