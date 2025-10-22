'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const features = [
    {
      id: 'dayColoring',
      title: 'Day-Column Coloring',
      subtitle: 'See your week at a glance',
      description:
        'Soft tints color each day of the week differently, making your calendar instantly scannable. No more squinting to figure out which day is which.',
      benefit: '⚡ Instant clarity',
      gradient: 'from-blue-500 to-purple-500',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      ),
    },
    {
      id: 'customColors',
      title: 'Custom Task Colors',
      subtitle: "Break Free from Google Tasks' 1-Color Limit",
      description:
        'Google Tasks only allows 1 color for all your tasks. ColorKit lets you pick ANY color for each task—giving you unlimited visual organization.',
      benefit: '🎨 Unlimited colors',
      gradient: 'from-red-500 to-orange-500',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
          />
        </svg>
      ),
    },
    {
      id: 'timeBlocks',
      title: 'Time-Block Overlays',
      subtitle: 'Protect your focus time',
      description:
        'Add visual time blocks to protect deep work sessions—without cluttering your calendar with fake events that mess up your schedule.',
      benefit: '🧘 Stay focused',
      gradient: 'from-green-500 to-teal-500',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  const handleTryFeature = () => {
    if (currentStep < features.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    router.push('/onboarding/complete');
  };

  const currentFeature = features[currentStep];
  const progress = ((currentStep + 1) / features.length) * 50 + 50; // 50-100%

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="container mx-auto px-4 h-screen flex flex-col justify-center">
        <div className="max-w-4xl mx-auto w-full">
          {/* Back Button */}
          <button
            onClick={() => router.push('/onboarding/personalize')}
            className="mb-3 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Feature Demo */}
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl animate-fade-in-up">
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentFeature.gradient} opacity-5`}></div>

            <div className="relative px-6 py-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${currentFeature.gradient} rounded-2xl mb-4 shadow-xl`}
                >
                  <div className="text-white scale-75">{currentFeature.icon}</div>
                </div>
                <h1 className="text-2xl font-display font-bold text-slate-900 mb-2">{currentFeature.title}</h1>
                <p className="text-lg text-slate-600 mb-2 font-medium">{currentFeature.subtitle}</p>
                <p className="text-sm text-slate-600 max-w-2xl mx-auto">{currentFeature.description}</p>
              </div>

              {/* Visual Demo - Before/After Infographics */}
              <div className="mb-6 min-h-[280px] flex items-center">
                {currentStep === 0 ? (
                  /* Day Coloring Demo */
                  <div className="bg-white rounded-xl p-4 shadow-2xl border-2 border-blue-300 w-full">
                    <div className="flex gap-6 justify-center items-start">
                      {/* Before - Plain gray days */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-600 text-center uppercase tracking-wide mb-1">
                          Before
                        </p>
                        <p className="text-xs font-bold text-slate-600 text-center mb-3">All Look the Same</p>
                        <div className="flex gap-2 justify-center min-w-[200px]">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-semibold text-slate-500">Mon</span>
                            <div className="w-8 h-24 bg-slate-50 rounded border-2 border-slate-300 shadow-sm"></div>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-semibold text-slate-500">Tue</span>
                            <div className="w-8 h-24 bg-slate-50 rounded border-2 border-slate-300 shadow-sm"></div>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-semibold text-slate-500">Wed</span>
                            <div className="w-8 h-24 bg-slate-50 rounded border-2 border-slate-300 shadow-sm"></div>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-semibold text-slate-500">Thu</span>
                            <div className="w-8 h-24 bg-slate-50 rounded border-2 border-slate-300 shadow-sm"></div>
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="w-px h-32 bg-slate-300 self-center"></div>

                      {/* After - Colored days */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-blue-600 text-center uppercase tracking-wide mb-1">
                          After ✨
                        </p>
                        <p className="text-xs font-bold text-green-600 text-center mb-3">Each Day Unique!</p>
                        <div className="flex gap-2 justify-center min-w-[200px]">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-bold text-blue-600">Mon</span>
                            <div className="w-8 h-24 bg-gradient-to-b from-blue-200 to-blue-300 rounded border-2 border-blue-400 shadow-md"></div>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-bold text-purple-600">Tue</span>
                            <div className="w-8 h-24 bg-gradient-to-b from-purple-200 to-purple-300 rounded border-2 border-purple-400 shadow-md"></div>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-bold text-pink-600">Wed</span>
                            <div className="w-8 h-24 bg-gradient-to-b from-pink-200 to-pink-300 rounded border-2 border-pink-400 shadow-md"></div>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-bold text-green-600">Thu</span>
                            <div className="w-8 h-24 bg-gradient-to-b from-green-200 to-green-300 rounded border-2 border-green-400 shadow-md"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Benefit Callout */}
                    <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg px-4 py-3 text-center">
                      <p className="text-sm font-bold text-blue-900">
                        💙 Give Monday a Mood and Friday a Vibe - scan your week 3x faster!
                      </p>
                    </div>
                  </div>
                ) : currentStep === 1 ? (
                  /* Custom Task Colors Demo */
                  <div className="bg-white rounded-xl p-4 shadow-2xl border-2 border-green-300 w-full">
                    <div className="flex gap-6 justify-center items-start">
                      {/* Before - Standard blue tasks */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-600 text-center uppercase tracking-wide mb-1">
                          Google Tasks
                        </p>
                        <p className="text-xs font-bold text-red-600 text-center mb-3">Only 1 Color</p>
                        <div className="space-y-2 min-w-[200px]">
                          <div className="h-8 bg-blue-100 rounded border-l-4 border-blue-500 px-2 flex items-center gap-2 shadow-sm">
                            <svg
                              className="w-4 h-4 text-blue-500 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"
                                opacity="0.3"
                              />
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                            <span className="text-xs text-blue-900">Team Meeting</span>
                          </div>
                          <div className="h-8 bg-blue-100 rounded border-l-4 border-blue-500 px-2 flex items-center gap-2 shadow-sm">
                            <svg
                              className="w-4 h-4 text-blue-500 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"
                                opacity="0.3"
                              />
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                            <span className="text-xs text-blue-900">Review Docs</span>
                          </div>
                          <div className="h-8 bg-blue-100 rounded border-l-4 border-blue-500 px-2 flex items-center gap-2 shadow-sm">
                            <svg
                              className="w-4 h-4 text-blue-500 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"
                                opacity="0.3"
                              />
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                            <span className="text-xs text-blue-900">Send Email</span>
                          </div>
                          <div className="h-8 bg-blue-100 rounded border-l-4 border-blue-500 px-2 flex items-center gap-2 shadow-sm">
                            <svg
                              className="w-4 h-4 text-blue-500 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"
                                opacity="0.3"
                              />
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                            <span className="text-xs text-blue-900">Call Client</span>
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="w-px h-32 bg-slate-300 self-center"></div>

                      {/* After - Priority colored tasks */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-blue-600 text-center uppercase tracking-wide mb-1">
                          ColorKit Power
                        </p>
                        <p className="text-xs font-bold text-green-600 text-center mb-3">∞ Unlimited Colors! ✨</p>
                        <div className="space-y-2 min-w-[200px]">
                          <div className="h-8 bg-red-100 rounded border-l-4 border-red-500 px-2 flex items-center gap-2 shadow-md">
                            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"
                                opacity="0.3"
                              />
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                            <span className="text-xs font-semibold text-red-900">Team Meeting</span>
                          </div>
                          <div className="h-8 bg-amber-100 rounded border-l-4 border-amber-500 px-2 flex items-center gap-2 shadow-md">
                            <svg
                              className="w-4 h-4 text-amber-600 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"
                                opacity="0.3"
                              />
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                            <span className="text-xs font-semibold text-amber-900">Review Docs</span>
                          </div>
                          <div className="h-8 bg-green-100 rounded border-l-4 border-green-500 px-2 flex items-center gap-2 shadow-md">
                            <svg
                              className="w-4 h-4 text-green-600 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"
                                opacity="0.3"
                              />
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                            <span className="text-xs font-semibold text-green-900">Send Email</span>
                          </div>
                          <div className="h-8 bg-blue-100 rounded border-l-4 border-blue-500 px-2 flex items-center gap-2 shadow-md">
                            <svg
                              className="w-4 h-4 text-blue-500 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"
                                opacity="0.3"
                              />
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                            <span className="text-xs font-semibold text-blue-900">Call Client</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Benefit Callout */}
                    <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg px-4 py-3 text-center">
                      <p className="text-sm font-bold text-green-900">
                        💡 Pick the <span className="underline">perfect color</span> for every task - not stuck with
                        just one color like Google Tasks!
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Time Block Overlays Demo */
                  <div className="bg-white rounded-xl p-4 shadow-2xl border-2 border-green-300 w-full">
                    <div className="flex gap-6 justify-center items-start">
                      {/* Before - Plain calendar grid */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-600 text-center uppercase tracking-wide mb-3">
                          Before
                        </p>
                        <div className="space-y-1 min-w-[200px]">
                          <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                            <span className="text-xs text-slate-400 font-mono">8:30 AM</span>
                            <div className="flex-1 h-6 bg-white border border-slate-200 rounded"></div>
                          </div>
                          <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                            <span className="text-xs text-slate-400 font-mono">10:15 AM</span>
                            <div className="flex-1 h-6 bg-white border border-slate-200 rounded"></div>
                          </div>
                          <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                            <span className="text-xs text-slate-400 font-mono">1:00 PM</span>
                            <div className="flex-1 h-6 bg-white border border-slate-200 rounded"></div>
                          </div>
                          <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                            <span className="text-xs text-slate-400 font-mono">3:45 PM</span>
                            <div className="flex-1 h-6 bg-white border border-slate-200 rounded"></div>
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="w-px h-36 bg-slate-300 self-center"></div>

                      {/* After - Time blocks with labels */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-green-600 text-center uppercase tracking-wide mb-3">
                          After ✨
                        </p>
                        <div className="space-y-1 min-w-[200px]">
                          <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                            <span className="text-xs text-slate-400 font-mono">8:30 AM</span>
                            <div className="flex-1 h-6 bg-gradient-to-r from-purple-200 to-purple-300 border-2 border-purple-400 rounded px-2 flex items-center shadow-md">
                              <span className="text-xs font-bold text-purple-700">🎯 Deep Work</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                            <span className="text-xs text-slate-400 font-mono">10:15 AM</span>
                            <div className="flex-1 h-6 bg-gradient-to-r from-teal-200 to-teal-300 border-2 border-teal-400 rounded px-2 flex items-center shadow-md">
                              <span className="text-xs font-bold text-teal-700">💬 Meetings</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                            <span className="text-xs text-slate-400 font-mono">1:00 PM</span>
                            <div className="flex-1 h-6 bg-gradient-to-r from-amber-200 to-amber-300 border-2 border-amber-400 rounded px-2 flex items-center shadow-md">
                              <span className="text-xs font-bold text-amber-700">🍽️ Lunch Break</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 h-10 bg-slate-50 rounded border border-slate-200 px-2">
                            <span className="text-xs text-slate-400 font-mono">3:45 PM</span>
                            <div className="flex-1 h-6 bg-gradient-to-r from-blue-200 to-blue-300 border-2 border-blue-400 rounded px-2 flex items-center shadow-md">
                              <span className="text-xs font-bold text-blue-700">📧 Admin Time</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Benefit Callout */}
                    <div className="mt-4 bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-300 rounded-lg px-4 py-3 text-center">
                      <p className="text-sm font-bold text-purple-900">
                        🎯 Protect deep work time without cluttering your calendar with fake events!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Feature Progress Dots */}
              <div className="flex items-center justify-center gap-2 mb-4">
                {features.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-blue-500'
                        : index < currentStep
                          ? 'w-2 bg-blue-300'
                          : 'w-2 bg-slate-300'
                    }`}
                  ></div>
                ))}
              </div>

              {/* Action Button */}
              <div className="text-center">
                <button onClick={handleTryFeature} className="btn btn-primary btn-xl group">
                  {currentStep < features.length - 1 ? 'Next Feature' : "I'm Ready!"}
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
            </div>
          </div>

          {/* Skip Option */}
          <div className="text-center mt-6">
            <button onClick={handleComplete} className="text-slate-600 hover:text-slate-900 text-sm transition-colors">
              Skip demo and explore on my own
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
