'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PersonalizePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [featureSuggestion, setFeatureSuggestion] = useState('');
  const router = useRouter();

  const painPoints = [
    {
      id: 'visualClarity',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      ),
      title: 'My calendar days blend together',
      description: 'Hard to distinguish between different days at a glance—need visual clarity',
      gradient: 'from-blue-500 to-purple-500',
    },
    {
      id: 'taskPriority',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
      title: 'Important tasks get buried',
      description: 'Need a way to make critical events stand out with custom colors',
      gradient: 'from-red-500 to-orange-500',
    },
    {
      id: 'timeProtection',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
      title: 'Need to block time for deep work',
      description: 'Want to protect focus time without cluttering calendar with fake events',
      gradient: 'from-green-500 to-teal-500',
    },
    {
      id: 'allFeatures',
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
      title: 'Want complete calendar control',
      description: 'Need day coloring, custom task colors, and time blocks all in one',
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  const handleContinue = async () => {
    if (!selected) return;

    // Navigate to demo page with context
    router.push(`/onboarding/demo?painPoint=${selected}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
          style={{ width: '50%' }}
        ></div>
      </div>

      <div className="container mx-auto px-4 h-screen flex flex-col justify-center">
        <div className="max-w-4xl mx-auto w-full">
          {/* Back Button */}
          <button
            onClick={() => router.push('/onboarding')}
            className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Main Content */}
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-3">
              What&apos;s your biggest challenge?
            </h1>
            <p className="text-lg text-slate-600">We&apos;ll personalize your experience</p>
          </div>

          {/* Pain Point Cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {painPoints.map((point) => (
              <button
                key={point.id}
                onClick={() => setSelected(point.id)}
                className={`group relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 ${
                  selected === point.id
                    ? 'ring-2 ring-offset-2 ring-blue-500 shadow-xl scale-[1.02]'
                    : 'bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg'
                }`}
              >
                {/* Gradient Background (when selected) */}
                {selected === point.id && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${point.gradient} opacity-5`}></div>
                )}

                <div className="relative flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      selected === point.id
                        ? `bg-gradient-to-br ${point.gradient} text-white shadow-lg`
                        : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 group-hover:from-blue-50 group-hover:to-purple-50 group-hover:text-blue-600'
                    }`}
                  >
                    <div className="scale-75">{point.icon}</div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-display font-bold text-base mb-1 transition-colors ${
                        selected === point.id ? 'text-slate-900' : 'text-slate-800 group-hover:text-slate-900'
                      }`}
                    >
                      {point.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{point.description}</p>
                  </div>

                  {/* Checkmark */}
                  {selected === point.id && (
                    <div className="flex-shrink-0 animate-scale-in">
                      <div
                        className={`w-6 h-6 bg-gradient-to-br ${point.gradient} rounded-full flex items-center justify-center shadow-lg`}
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Feature Suggestion Input */}
          <div className="mb-6">
            <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 shadow-lg">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-200 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-slate-900 text-base mb-1">
                    Got a feature idea? <span className="text-slate-500 font-normal text-sm">(Optional)</span>
                  </h3>
                  <p className="text-xs text-slate-600 mb-3">
                    Share any feature you&apos;d like to see - we&apos;re always building based on your feedback!
                  </p>
                  <textarea
                    value={featureSuggestion}
                    onChange={(e) => setFeatureSuggestion(e.target.value)}
                    placeholder="e.g., I wish I could color-code by event type..."
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all resize-none text-slate-800 placeholder-slate-400"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-slate-500">Help us build what you need</p>
                    <p className="text-xs text-slate-400">{featureSuggestion.length}/500</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <button
              onClick={handleContinue}
              disabled={!selected}
              className="btn btn-primary btn-xl group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
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
    </div>
  );
}
