import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, Bug, HelpCircle } from 'lucide-react';

export function DashboardFeedbackCard() {
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
          >
            <MessageSquarePlus size={16} className={'text-slate-700'} />
            Request Feature
          </Button>
          <Button
            size={'sm'}
            variant={'outline'}
            className={'flex gap-2 text-sm rounded-sm border-border justify-start'}
          >
            <Bug size={16} className={'text-slate-700'} />
            Report Issue or Bug
          </Button>
          <Button
            size={'sm'}
            variant={'outline'}
            className={'flex gap-2 text-sm rounded-sm border-border justify-start'}
          >
            <HelpCircle size={16} className={'text-slate-700'} />
            Get Support or Help
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
