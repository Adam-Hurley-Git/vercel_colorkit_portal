'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Lightbulb, Sparkles } from 'lucide-react';

export default function PersonalizePage() {
  const [featureSuggestion, setFeatureSuggestion] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    // TODO: Send feature suggestion to backend if user provided one
    if (featureSuggestion.trim()) {
      console.log('Feature suggestion:', featureSuggestion);
      // Could save to database here
    }

    // Navigate to complete page
    router.push('/onboarding/complete');
  };

  const handleSkip = () => {
    router.push('/onboarding/complete');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Progress Bar - 50% (third page) */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
          style={{ width: '50%' }}
        ></div>
      </div>

      <div className="container mx-auto px-4 flex flex-col justify-center min-h-screen py-8">
        <div className="max-w-2xl mx-auto w-full">
          {/* Back Button */}
          <button
            onClick={() => router.push('/onboarding/start')}
            className="mb-3 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Main Content Card */}
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-60"></div>

            <div className="relative px-6 py-8 sm:px-8 sm:py-10">
              <div className="text-center space-y-6">
                {/* Optional Badge */}
                <div className="flex justify-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                    <Sparkles className="w-3 h-3" />
                    Optional Step
                  </span>
                </div>

                {/* Main Heading */}
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight">
                    Help Us Build What You Need
                  </h1>
                  <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
                    Have ideas for features or changes you&apos;d like to see in your Google Calendar experience?
                  </p>
                </div>

                {/* Feature Suggestion Input */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-200 max-w-xl mx-auto">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-display font-semibold text-slate-900 text-base mb-1">Share Your Ideas</h3>
                      <p className="text-xs text-slate-600 mb-3">
                        Tell us about any features or improvements you&apos;d like to see. We actively build based on
                        user feedback!
                      </p>
                    </div>
                  </div>

                  <textarea
                    value={featureSuggestion}
                    onChange={(e) => setFeatureSuggestion(e.target.value)}
                    placeholder="e.g., I wish I could automatically color-code events by type, or sync my calendar theme across devices..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-3 text-sm border-2 border-blue-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all resize-none text-slate-800 placeholder-slate-400 bg-white"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-slate-500">Your feedback shapes our roadmap</p>
                    <p className="text-xs text-slate-400">{featureSuggestion.length}/500</p>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="pt-2 space-y-3">
                  {/* Skip Button - Very Prominent */}
                  <button
                    onClick={handleSkip}
                    className="w-full sm:w-auto px-8 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm hover:shadow-md"
                  >
                    Skip for Now
                  </button>

                  {/* Submit Button - Only if they typed something */}
                  {featureSuggestion.trim() && (
                    <div>
                      <button
                        onClick={handleSubmit}
                        className="btn btn-primary btn-lg group shadow-xl hover:shadow-2xl px-8 py-3 w-full sm:w-auto"
                      >
                        <span className="font-semibold">Submit Feedback</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Help Text */}
                <p className="text-xs text-slate-500 max-w-md mx-auto pt-2">
                  This is completely optional. You can skip this step and start your free trial right away.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
