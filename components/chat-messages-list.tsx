'use client';

import { InitialChatMessages } from '@/app/chats/[id]/page';
import { saveMessage } from '@/app/chats/actions';

import { formatToTimeAgo } from '@/lib/utils';
import { ArrowUpCircleIcon } from '@heroicons/react/24/solid';
import { RealtimeChannel, createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

// https://supabase.com/docs/guides/realtime
const SUPABASE_PUBLIC_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4eXBwdWt2bWpzaWNsanR6d3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU3MzE5ODAsImV4cCI6MjAzMTMwNzk4MH0.zkz9Dlkm8Ojf3VGDBdRjmt5g9S2zlwg_KRkXE2N0CoE';
const SUPABASE_URL = 'https://rxyppukvmjsicljtzwtf.supabase.co';
interface ChatMessagesListProps {
  initialMessages: InitialChatMessages;
  userId: number;
  chatRoomId: string;
  username: string;
  avatar: string;
}

export default function ChatMessagesList({
  initialMessages,
  userId,
  chatRoomId,
  username,
  avatar,
}: ChatMessagesListProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState('');
  /* 
   기본적으로 컴포넌트 내에서 여러 함수 간에 데이터를 공유하려면 그냥 ref를 사용하면 됨 
   컴포넌트 내의 여러 함수 사이에서 데이터를 저장하고 공유하는데 굉장히 편리함 useRef 
    useRef()는 단순히 데이터를 넣을 상자를 제공해주는데,
    그 안에는 수정 가능한 데이터가 들어가고, 그 데이터를 덮어쓸 수 있고, 삭제하고, 업데이트할 수 있음. 데이터로 원하는 어떤 것이든 가능
    다시 렌더링 되지 않음
  */
  const channel = useRef<RealtimeChannel>();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = event;
    setMessage(value);
  };
  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setMessages((prevMsgs) => [
      ...prevMsgs,
      {
        id: Date.now(),
        payload: message,
        created_at: new Date(),
        userId,
        user: {
          username: 'string',
          avatar: 'xx',
        },
      },
    ]);
    channel.current?.send({
      type: 'broadcast',
      event: 'message',
      payload: {
        id: Date.now(),
        payload: message,
        userId,
        created_at: new Date(),
        user: {
          username,
          avatar,
        },
      },
    });
    saveMessage(message, chatRoomId);
    setMessage('');
  };
  useEffect(() => {
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
    //room에 들어감, channel - ref 활용
    channel.current = client.channel(`room-${chatRoomId}`);
    //broadcast는 다른 참가자로부터 실시간 chatroom에서 받는 글로벌 event, 아래 함수는 subscribe
    channel.current
      .on('broadcast', { event: 'message' }, (payload) => {
        console.log(payload);
        setMessages((prevMsgs) => [...prevMsgs, payload.payload]);
      })
      .subscribe();
    return () => {
      //user가 채팅창을 나갔더라도 user의 subscribe를 유지하고 싶지 않음
      channel.current?.unsubscribe();
    };
  }, [chatRoomId]);
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
      <form className="flex relative" onSubmit={onSubmit}>
        <input
          required
          onChange={onChange}
          value={message}
          className="bg-transparent rounded-full w-full h-10 focus:outline-none px-5 ring-2 focus:ring-4 transition ring-neutral-200 focus:ring-neutral-50 placeholder:text-neutral-400"
          type="text"
          name="message"
          placeholder="Write a message..."
        />
        <button className="absolute right-0">
          <ArrowUpCircleIcon className="size-10 text-orange-500 transition-colors hover:text-orange-300" />
        </button>
      </form>
    </div>
  );
}
