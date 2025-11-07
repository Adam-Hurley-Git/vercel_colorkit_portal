import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ExtensionNotifier } from '@/components/extension/ExtensionNotifier';
import { preparePaymentSuccessMessage } from '@/utils/extension-messaging';

export default async function SuccessPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  // Redirect non-authenticated users to signup
  if (!data.user) {
    redirect('/signup');
  }

  // Prepare payment success message for extension
  const extensionMessage = await preparePaymentSuccessMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Notify extension of payment success */}
      {extensionMessage && <ExtensionNotifier message={extensionMessage} />}

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
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              {/* Heading */}
              <div className="space-y-2">
                <h1 className="text-3xl font-display font-bold text-slate-900">Payment Successful! 🎉</h1>
                <p className="text-lg text-slate-600">You&apos;re all set - welcome to ColorKit!</p>
              </div>

              {/* Welcome Box */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-base font-semibold text-slate-900">ColorKit Activated</p>
                </div>
                <p className="text-sm text-slate-700 mb-1">Your calendar extension is now active</p>
                <p className="text-xs text-slate-600">Next: Learn how to use ColorKit with Google Calendar</p>
              </div>

              {/* What's Next */}
              <div className="text-left space-y-3 max-w-lg mx-auto">
                <h3 className="font-display font-semibold text-base text-slate-900 text-center">What You Get:</h3>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="font-medium text-slate-900 text-xs mb-1">Day Coloring</p>
                    <p className="text-xs text-slate-600">Tinted columns per day</p>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                        />
                      </svg>
                    </div>
                    <p className="font-medium text-slate-900 text-xs mb-1">Custom Colors</p>
                    <p className="text-xs text-slate-600">Any color, any event</p>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="font-medium text-slate-900 text-xs mb-1">Time Blocks</p>
                    <p className="text-xs text-slate-600">Protect focus time</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="flex items-center justify-center">
                <Link href="/onboarding/how-it-works" className="btn btn-primary btn-lg group w-full sm:w-auto">
                  Continue
                  <svg
                    className="w-5 h-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>

              {/* Trust Indicator */}
              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-500">🔒 Your data is secure • ✨ Full access enabled</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
