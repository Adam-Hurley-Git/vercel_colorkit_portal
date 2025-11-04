'use client';

import { PriceSection } from '@/components/checkout/price-section';
import { CheckoutFormGradients } from '@/components/gradients/checkout-form-gradients';
import { type Environments, initializePaddle, type Paddle } from '@paddle/paddle-js';
import type { CheckoutEventsData } from '@paddle/paddle-js/types/checkout/events';
import throttle from 'lodash.throttle';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface PathParams {
  priceId: string;
  [key: string]: string | string[];
}

interface Props {
  userEmail?: string;
}

export function CheckoutContents({ userEmail }: Props) {
  const params = useParams<PathParams>();
  const priceId = params?.priceId ?? '';
  const [quantity, setQuantity] = useState<number>(1);
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutEventsData | null>(null);

  const handleCheckoutEvents = (event: CheckoutEventsData) => {
    setCheckoutData(event);
  };

  const updateItems = useCallback((paddle: Paddle, priceId: string, quantity: number) => {
    const throttledUpdate = throttle(() => {
      paddle.Checkout.updateItems([{ priceId, quantity }]);
    }, 1000);
    throttledUpdate();
  }, []);

  useEffect(() => {
    if (!paddle?.Initialized && process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN && process.env.NEXT_PUBLIC_PADDLE_ENV) {
      initializePaddle({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
        environment: process.env.NEXT_PUBLIC_PADDLE_ENV as Environments,
        eventCallback: (event) => {
          if (event.data && event.name) {
            handleCheckoutEvents(event.data);
          }
        },
        checkout: {
          settings: {
            variant: 'one-page',
            displayMode: 'inline',
            theme: 'light',
            allowLogout: !userEmail,
            frameTarget: 'paddle-checkout-frame',
            frameInitialHeight: 450,
            frameStyle: 'width: 100%; background-color: transparent; border: none',
            successUrl: '/checkout/success',
          },
        },
      }).then(async (paddle) => {
        if (paddle && priceId) {
          setPaddle(paddle);
          paddle.Checkout.open({
            ...(userEmail && { customer: { email: userEmail } }),
            items: [{ priceId: priceId, quantity: 1 }],
          });
        }
      });
    }
  }, [paddle?.Initialized, priceId, userEmail]);

  useEffect(() => {
    if (paddle && priceId && paddle.Initialized) {
      updateItems(paddle, priceId, quantity);
    }
  }, [paddle, priceId, quantity, updateItems]);

  const [agreedToAutoRenew, setAgreedToAutoRenew] = useState(false);
  const [agreedToPolicies, setAgreedToPolicies] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  // Only show Paddle checkout when both consents are given
  useEffect(() => {
    setShowCheckoutForm(agreedToAutoRenew && agreedToPolicies);
  }, [agreedToAutoRenew, agreedToPolicies]);

  return (
    <div
      className={
        'rounded-lg md:bg-background/80 md:backdrop-blur-[24px] md:p-10 md:pl-16 md:pt-16 md:min-h-[400px] flex flex-col justify-between relative'
      }
    >
      <CheckoutFormGradients />
      <div className={'flex flex-col md:flex-row gap-8 md:gap-16'}>
        <div className={'w-full md:w-[400px]'}>
          <PriceSection checkoutData={checkoutData} quantity={quantity} handleQuantityChange={setQuantity} />
        </div>
        <div className={'min-w-[375px] lg:min-w-[535px] flex flex-col gap-6'}>
          {/* 7-Day Trial + 7-Day Money-Back Guarantee Explanation */}
          <div className={'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6'}>
            <div className={'flex items-start gap-3 mb-4'}>
              <div className={'flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center'}>
                <svg className={'w-6 h-6 text-white'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className={'flex-1'}>
                <h3 className={'text-lg font-bold text-slate-900 mb-2'}>14 Days Risk-Free</h3>
                <div className={'space-y-2 text-sm text-slate-700'}>
                  <p className={'flex items-center gap-2'}>
                    <span className={'font-semibold text-blue-600'}>✓ Days 1-7:</span>
                    <span>Free trial - No charge</span>
                  </p>
                  <p className={'flex items-center gap-2'}>
                    <span className={'font-semibold text-purple-600'}>✓ Day 7:</span>
                    <span>First payment charged</span>
                  </p>
                  <p className={'flex items-center gap-2'}>
                    <span className={'font-semibold text-green-600'}>✓ Days 8-14:</span>
                    <span>7-day money-back guarantee - Full refund if not satisfied</span>
                  </p>
                  <p className={'flex items-center gap-2'}>
                    <span className={'font-semibold text-slate-600'}>✓ Day 15+:</span>
                    <span>Subscription continues until you cancel</span>
                  </p>
                </div>
              </div>
            </div>
            <div className={'bg-white/80 rounded-md p-3 text-xs text-slate-600'}>
              <strong>Note:</strong> 7-day money-back guarantee applies to first payment only. Renewal charges (month
              2+) are non-refundable.
            </div>
          </div>

          {/* Required Consent Checkboxes */}
          <div className={'bg-amber-50 border-2 border-amber-300 rounded-lg p-6 space-y-4'}>
            <h3 className={'text-base font-bold text-slate-900 mb-3'}>⚠️ Required Agreements</h3>

            {/* Automatic Renewal Consent */}
            <label className={'flex items-start gap-3 cursor-pointer group'}>
              <input
                type="checkbox"
                checked={agreedToAutoRenew}
                onChange={(e) => setAgreedToAutoRenew(e.target.checked)}
                className={
                  'mt-1 w-5 h-5 text-blue-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer'
                }
              />
              <span className={'text-sm text-slate-700 select-none'}>
                <strong className={'font-semibold text-slate-900'}>I agree to automatic recurring charges.</strong> My
                subscription will automatically renew at the end of each billing period (monthly or annual) until I
                cancel. I understand I must cancel before my next billing date to avoid being charged.
              </span>
            </label>

            {/* Policies Consent */}
            <label className={'flex items-start gap-3 cursor-pointer group'}>
              <input
                type="checkbox"
                checked={agreedToPolicies}
                onChange={(e) => setAgreedToPolicies(e.target.checked)}
                className={
                  'mt-1 w-5 h-5 text-blue-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer'
                }
              />
              <span className={'text-sm text-slate-700 select-none'}>
                <strong className={'font-semibold text-slate-900'}>I have read and agree to the policies.</strong> I
                have read and agree to the{' '}
                <a
                  href="https://calendarextension.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={'text-blue-600 hover:underline font-medium'}
                >
                  Terms of Service
                </a>
                ,{' '}
                <a
                  href="https://calendarextension.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={'text-blue-600 hover:underline font-medium'}
                >
                  Privacy Policy
                </a>
                , and{' '}
                <a
                  href="https://calendarextension.com/refund-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={'text-blue-600 hover:underline font-medium'}
                >
                  Refund Policy
                </a>
                .
              </span>
            </label>

            {!showCheckoutForm && (
              <div className={'text-xs text-amber-700 bg-amber-100 rounded p-2 mt-2'}>
                <strong>Note:</strong> You must agree to both items above before proceeding to payment.
              </div>
            )}
          </div>

          {/* Payment Details Section */}
          <div className={showCheckoutForm ? 'opacity-100' : 'opacity-50 pointer-events-none'}>
            <div className={'text-base leading-[20px] font-semibold mb-4'}>Payment details</div>
            {!showCheckoutForm && (
              <div className={'bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center'}>
                <svg
                  className={'w-12 h-12 text-slate-400 mx-auto mb-3'}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <p className={'text-sm text-slate-600 font-medium'}>
                  Please agree to the required terms above to continue
                </p>
              </div>
            )}
            {showCheckoutForm && <div className={'paddle-checkout-frame'} />}
          </div>
        </div>
      </div>
    </div>
  );
}
