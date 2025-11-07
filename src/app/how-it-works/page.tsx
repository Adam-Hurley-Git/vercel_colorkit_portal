'use client';

import { useRouter } from 'next/navigation';
import { Calendar, MousePointerClick, Palette, ExternalLink, ArrowRight, Chrome, Settings } from 'lucide-react';

export default function HowItWorksPage() {
  const router = useRouter();

  const handleOpenCalendar = () => {
    window.open('https://calendar.google.com', '_blank');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
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

      <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
        <div className="max-w-5xl mx-auto w-full">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full mb-4">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-display font-bold text-slate-900 mb-3">You&apos;re All Set!</h1>
            <p className="text-lg text-slate-600">Here&apos;s how to use ColorKit with Google Calendar</p>
          </div>

          {/* How It Works Steps */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4 relative">
                  <Chrome className="w-7 h-7 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                </div>
                <h3 className="font-display font-bold text-slate-900 mb-2">Find the Extension</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Look for the ColorKit icon in your Chrome toolbar (top-right corner, next to the address bar)
                </p>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-500 italic">
                    💡 If you don&apos;t see it, click the puzzle icon to pin ColorKit
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4 relative">
                  <Calendar className="w-7 h-7 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                </div>
                <h3 className="font-display font-bold text-slate-900 mb-2">Open Google Calendar</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Navigate to{' '}
                  <a
                    href="https://calendar.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    calendar.google.com
                  </a>{' '}
                  in your browser
                </p>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-xs text-blue-700 font-medium">
                    ✨ The extension only works on Google Calendar pages
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4 relative">
                  <MousePointerClick className="w-7 h-7 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                </div>
                <h3 className="font-display font-bold text-slate-900 mb-2">Click the Icon</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Click the ColorKit extension icon to open settings and start customizing your calendar
                </p>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-xs text-green-700 font-medium">🎨 Customize colors, tasks & time blocks!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Features Overview */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border border-blue-200">
            <h3 className="font-display font-bold text-slate-900 mb-4 text-center">What You Can Do</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <Palette className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-900 text-sm mb-1">Day Coloring</p>
                <p className="text-xs text-slate-600">Color-code weekdays and special dates</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <Settings className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-900 text-sm mb-1">Task Colors</p>
                <p className="text-xs text-slate-600">Auto-color tasks by list or manually</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-900 text-sm mb-1">Time Blocking</p>
                <p className="text-xs text-slate-600">Protect focus time with visual blocks</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleOpenCalendar}
              className="btn btn-primary btn-lg group shadow-xl hover:shadow-2xl px-8 py-3 w-full sm:w-auto"
            >
              <span className="font-semibold">Open Google Calendar</span>
              <ExternalLink className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button onClick={handleGoToDashboard} className="btn btn-secondary btn-lg px-8 py-3 w-full sm:w-auto">
              <span className="font-semibold">Go to Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Help Text */}
          <div className="text-center mt-6">
            <p className="text-sm text-slate-600">
              Need help?{' '}
              <a
                href="https://www.calendarextension.com/help"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                Visit our help center
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
