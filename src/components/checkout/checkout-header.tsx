import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function CheckoutHeader() {
  return (
    <div className={'flex gap-4'}>
      <Link href={'/'}>
        <Button
          variant={'secondary'}
          className={
            'h-[32px] bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 w-[32px] p-0 rounded-[4px]'
          }
        >
          <ChevronLeft />
        </Button>
      </Link>
      <Image src={'/logo.svg'} alt={'AeroEdit'} width={131} height={28} />
    </div>
  );
}
