import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * Card displayed when user has no active subscription
 * Shows CTA to start trial or reinstate subscription
 */
export function DashboardNoSubscriptionCard() {
  return (
    <Card className={'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 p-6 shadow-lg'}>
      <CardHeader className="p-0 space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
            />
          </svg>
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900">Start Your ColorKit Subscription</CardTitle>
      </CardHeader>

      <CardContent className={'p-0 pt-4 space-y-6'}>
        <div className="space-y-3">
          <p className="text-slate-700 text-base">
            Unlock all ColorKit features with a subscription and make Google Calendar instantly readable.
          </p>

          <div className="bg-white rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">7-Day Free Trial</p>
                <p className="text-slate-600 text-sm">Try all features risk-free</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Cancel Anytime</p>
                <p className="text-slate-600 text-sm">No commitments, full control</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Full Access</p>
                <p className="text-slate-600 text-sm">Day coloring, custom colors & time blocks</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            asChild={true}
            className={
              'w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all'
            }
            size={'lg'}
          >
            <Link href={'/checkout/pri_01k81t07rfhatra9vs6zf8831c'}>
              Start 7-Day Free Trial
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </Button>

          <p className="text-center text-xs text-slate-500">
            Your trial starts now • Cancel anytime during trial • No charges until trial ends
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
