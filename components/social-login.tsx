import { MagnifyingGlassIcon } from '@heroicons/react/16/solid';
import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';

export default function SocialLogin() {
  return (
    <>
      <div className="w-full h-px bg-neutral-500" />
      <div className="flex flex-col gap-3">
        <Link
          className="primary-btn flex h-10 items-center justify-center gap-3"
          href="/github/start"
        >
          <MagnifyingGlassIcon className="size-6" />
          <span>Continue with Github</span>
        </Link>
        <Link
          className="primary-btn flex h-10 items-center justify-center gap-3"
          href="/sms"
        >
          <span>
            <ChatBubbleOvalLeftEllipsisIcon className="size-6" />
          </span>
          <span>Continue with SNS</span>
        </Link>
      </div>
    </>
  );
}
