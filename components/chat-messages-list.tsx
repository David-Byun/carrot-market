'use client';

import { InitialChatMessages } from '@/app/chats/[id]/page';
import { formatToTimeAgo } from '@/lib/utils';
import Image from 'next/image';
import { useState } from 'react';

interface ChatMessagesListProps {
  initialMessages: InitialChatMessages;
  userId: number;
}

export default function ChatMessagesList({
  initialMessages,
  userId,
}: ChatMessagesListProps) {
  const [messages, setMessages] = useState(initialMessages);
  return (
    <div className="p-5 flex flex-col gap-5 min-h-screen justify-end">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-2 items-start ${
            message.userId === userId ? 'justify-end' : ''
          }`}
        >
          {message.userId === userId ? null : (
            <Image
              src={message.user.avatar!}
              alt={message.user.username}
              width={50}
              height={50}
              className="size-12 rounded-full"
            />
          )}
          <div
            className={`flex flex-col gap-1 ${
              message.userId === userId ? 'items-end' : ''
            }`}
          >
            <span
              className={`${
                message.userId === userId ? 'bg-neutral-500' : 'bg-orange-500'
              }  p-2.5 rounded-md`}
            >
              {message.payload}
            </span>
            <span>{formatToTimeAgo(message.created_at.toString())}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
