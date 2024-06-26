import ChatMessagesList from '@/components/chat-messages-list';
import db from '@/lib/db';
import getSession from '@/lib/session';
import { Prisma } from '@prisma/client';
import { notFound } from 'next/navigation';

/*
    room의 URL을 얻었다고 해서 그 room으로 가서 메세지를 읽을수 있으면 안됨
    우리가 해야할 일은 사용자가 이 room에 실제로 허용이 되는지 확인해야함
*/

async function getRoom(id: string) {
  const room = await db.chatRoom.findUnique({
    where: {
      id,
    },
    include: {
      users: {
        select: { id: true },
      },
    },
  });
  console.log(room);
  if (room) {
    const session = await getSession();
    const canSee = Boolean(room.users.find((user) => user.id === session.id));
    if (!canSee) {
      return null;
    }
  }
  //users array 안에 현재 로그인한 사용자와 같은 id가 있는 object가 있는지 검색
  return room;
}

// 이상적으로 하려면 이걸 캐싱하고 싶지만, 스스로 해볼 것
async function getUserProfile() {
  const session = await getSession();
  const user = await db.user.findUnique({
    where: {
      id: session.id,
    },
    select: {
      username: true,
      avatar: true,
    },
  });
  return user;
}

async function getMessage(chatRoomId: string) {
  const messages = await db.message.findMany({
    where: {
      chatRoomId,
    },
    select: {
      id: true,
      payload: true,
      created_at: true,
      // 누구의 메시지인지를 알아야 하는 것이 중요하다
      userId: true,
      user: {
        select: {
          avatar: true,
          username: true,
        },
      },
    },
  });
  return messages;
}

//type을 보내기 위한 작업 : chat-messages-list 에서 import 할 수 있음
export type InitialChatMessages = Prisma.PromiseReturnType<typeof getMessage>;

export default async function ChatRoom({ params }: { params: { id: string } }) {
  /*
  id가 String이기 때문에 number로 바꿔줄 필요는 없음
  if(isNan) Number(params.id);
  */
  const room = await getRoom(params.id);
  if (!room) {
    return notFound();
  }
  const initialMessages = await getMessage(params.id);
  const session = await getSession();
  const user = await getUserProfile();
  if (!user) {
    return notFound();
  }
  console.log(initialMessages);

  //바로 아래 렌더링 하지 않는 이유는 채팅 메세지가 상호작용되지 않게 하고 새로고침해주고 싶기 때문임
  return (
    <ChatMessagesList
      chatRoomId={params.id}
      userId={session.id!}
      username={user.username}
      avatar={user.avatar!}
      initialMessages={initialMessages}
    />
  );
}
