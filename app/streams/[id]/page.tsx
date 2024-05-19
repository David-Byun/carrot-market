import db from '@/lib/db';
import { UserIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { notFound } from 'next/navigation';

async function getStream(id: number) {
  //stream_key, id는 생성자에게 보이도록 해야함
  const stream = await db.liveStream.findUnique({
    where: {
      id,
    },
    select: {
      title: true,
      stream_key: true,
      stream_id: true,
      userId: true,
      user: {
        select: {
          avatar: true,
          username: true,
        },
      },
    },
  });
  return stream;
}

export default async function StreamDetail({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }
  const stream = await getStream(id);
  if (!stream) {
    return notFound();
  }
  return (
    <div>
      <div className="relative aspect-video"></div>
      <div className="p-5 flex items-center gap-3 border-b border-neutral-700">
        <div className="size-10 rounded-full overflow-hidden">
          {stream.user.avatar !== null ? (
            <Image
              src={stream.user.avatar!}
              alt={stream.user.username}
              width={40}
              height={40}
            />
          ) : (
            <UserIcon />
          )}
        </div>
        <div>
          <h3>{stream.user.username}</h3>
        </div>
      </div>
      <div className="p-5">
        <h1 className="text-2xl font-semibold">타이틀</h1>
        <p>설명</p>
      </div>
      <div className="fixed w-full p-5 bottom-0 left-0 pb-10 bg-neutral-800 flex justify-between items-center">
        <span className="font-semibold text-xl">원</span>
        <form>
          <button className="bg-orange-500 px-5 py-2.5 text-white font-semibold">
            채팅하기
          </button>
        </form>
      </div>
    </div>
  );
}
