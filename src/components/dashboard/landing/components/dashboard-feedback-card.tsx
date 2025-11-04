'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, Bug, HelpCircle, Copy, Mail } from 'lucide-react';
import { useState } from 'react';

export function DashboardFeedbackCard() {
  const [showSupport, setShowSupport] = useState(false);
  const [copied, setCopied] = useState(false);
  const supportEmail = 'adam@calendarextension.com';

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(supportEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  const handleOpenEmail = () => {
    window.open(`mailto:${supportEmail}`, '_blank');
  };

  return (
    <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
      <CardHeader className="p-0 space-y-0">
        <CardTitle className="flex justify-between items-center text-xl mb-2 font-medium">
          User Feedback Portal
        </CardTitle>
      </CardHeader>
      <CardContent className={'p-0 flex flex-col gap-4'}>
        <div className="text-base leading-6 text-slate-600">
          Share your thoughts and help us improve your experience.
        </div>
        <div className="flex flex-col gap-3">
          <Button
            size={'sm'}
            variant={'outline'}
            className={'flex gap-2 text-sm rounded-sm border-border justify-start'}
            onClick={() => window.open('https://calendarextension.sleekplan.app/', '_blank')}
          >
            <MessageSquarePlus size={16} className={'text-slate-700'} />
            Request Feature
          </Button>
          <Button
            size={'sm'}
            variant={'outline'}
            className={'flex gap-2 text-sm rounded-sm border-border justify-start'}
            onClick={() => window.open('https://bugs-calendarextension.sleekplan.app/', '_blank')}
          >
            <Bug size={16} className={'text-slate-700'} />
            Report Issue or Bug
          </Button>
          <div className="flex flex-col gap-2">
            <Button
              size={'sm'}
              variant={'outline'}
              className={'flex gap-2 text-sm rounded-sm border-border justify-start'}
              onClick={() => setShowSupport(!showSupport)}
            >
              <HelpCircle size={16} className={'text-slate-700'} />
              Get Support or Help
            </Button>
            {showSupport && (
              <div className="ml-4 p-3 bg-slate-50 rounded-sm border border-border flex flex-col gap-2">
                <div className="text-sm text-slate-700 font-medium">{supportEmail}</div>
                <div className="flex gap-2">
                  <Button size={'sm'} variant={'outline'} className={'flex gap-2 text-xs'} onClick={handleCopyEmail}>
                    <Copy size={14} />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button size={'sm'} variant={'outline'} className={'flex gap-2 text-xs'} onClick={handleOpenEmail}>
                    <Mail size={14} />
                    Send Email
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
