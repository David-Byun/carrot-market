import db from '@/lib/db';
import getSession from '@/lib/session';
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
    },
  });
}

export default async function ChatRoom({ params }: { params: { id: string } }) {
  /*
  id가 String이기 때문에 number로 바꿔줄 필요는 없음
  if(isNan) Number(params.id);
  */
  const room = await getRoom(params.id);
  if (!room) {
    return notFound();
  }

  return <h1>chat!</h1>;
}
