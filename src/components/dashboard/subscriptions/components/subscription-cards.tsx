import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Status } from '@/components/shared/status/status';
import { Subscription } from '@paddle/paddle-node-sdk';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { parseMoney } from '@/utils/paddle/parse-money';
import { Button } from '@/components/ui/button';

interface Props {
  subscriptions: Subscription[];
  className: string;
}

export function SubscriptionCards({ subscriptions, className }: Props) {
  if (subscriptions.length === 0) {
    return <span className={'text-base font-medium'}>No active subscriptions</span>;
  } else {
    return (
      <div className={cn('grid flex-1 items-start', className)}>
        {subscriptions.map((subscription) => {
          const subscriptionItem = subscription.items[0];
          const price = subscriptionItem.quantity * parseFloat(subscriptionItem.price.unitPrice.amount);
          const formattedPrice = parseMoney(price.toString(), subscription.currencyCode);
          const frequency =
            subscription.billingCycle.frequency === 1
              ? `/${subscription.billingCycle.interval}`
              : `every ${subscription.billingCycle.frequency} ${subscription.billingCycle.interval}s`;

          // Check if subscription is NOT active (canceled or paused)
          // Active states: 'active', 'trialing', 'past_due'
          const isInactive = subscription.status === 'canceled' || subscription.status === 'paused';

          return (
            <Card key={subscription.id} className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
              <CardHeader className="p-0 space-y-0">
                <CardTitle className="flex flex-col justify-between items-start mb-6">
                  <div
                    className={cn('flex mb-4 w-full', {
                      'justify-between': subscriptionItem.product.imageUrl,
                      'justify-end': !subscriptionItem.product.imageUrl,
                    })}
                  >
                    {subscriptionItem.product.imageUrl && (
                      <Image
                        src={subscriptionItem.product.imageUrl}
                        alt={subscriptionItem.product.name}
                        width={48}
                        height={48}
                      />
                    )}
                    <Link href={`/dashboard/subscriptions/${subscription.id}`}>
                      <ArrowRight size={20} />
                    </Link>
                  </div>
                  <span className={'text-xl leading-7 font-medium'}>{subscriptionItem.product.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className={'p-0 flex flex-col gap-4'}>
                <div className={'flex justify-between gap-3 flex-wrap xl:flex-nowrap'}>
                  <div className={'flex flex-col gap-3'}>
                    <div className="text-base leading-6 text-slate-600">{subscriptionItem.product.description}</div>
                    <div className="text-base leading-[16px] text-slate-900 font-semibold">
                      {formattedPrice}
                      {frequency}
                    </div>
                  </div>
                  <Status status={subscription.status} />
                </div>

                {/* Show reinstate button for inactive subscriptions */}
                {isInactive && (
                  <div className="pt-3 border-t border-slate-200">
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-slate-700 mb-2">
                        Your subscription is no longer active. Resubscribe to continue using ColorKit.
                      </p>
                    </div>
                    <Button
                      asChild={true}
                      className={
                        'w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      }
                      size={'sm'}
                    >
                      <Link href={'/checkout/pri_01k8m1wyqcebmvsvsc7pwvy69j'}>
                        Start New Subscription
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }
}
