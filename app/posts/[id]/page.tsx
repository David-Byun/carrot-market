import db from '@/lib/db';
import { formatToTimeAgo } from '@/lib/utils';
import { EyeIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { notFound } from 'next/navigation';

async function getPost(id: number) {
  /*
    db.post.update : database 안의 record를 수정하고 나서 수정된 record를 return 해줌
    한가지 주의할 점 : update method는 업데이트할 post를 찾지 못하면 에러 발생시킴
    그래서 try catch 구문 사용
  */
  try {
    const post = await db.post.update({
      where: {
        id,
      },
      data: {
        //현재 views 값을 모르더라도 더하기, 나누기, 빼기, 곱하기등을 할 수 있음
        views: {
          increment: 1,
        },
      },
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });
    return post;
  } catch (e) {
    return null;
  }
}

export default async function PostDetail({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }
  const post = await getPost(id);
  if (!post) {
    return notFound();
  }
  console.log(post);
  return (
    <div className="p-5 text-white">
      <div>
        <Image
          width={28}
          height={28}
          className="size-7 rounded-full"
          alt={post.user.username}
        />
        <div>
          <span className="text-sm font-semibold">{post.user.username}</span>
          <div className="text-xs">
            <span>{formatToTimeAgo(post.created_at.toString())}</span>
          </div>
        </div>
      </div>
      <h2 className="text-lg font-semibold">{post.title}</h2>
      <p className="mb-5">{post.description}</p>
      <div className="flex flex-col gal-5 items-start">
        <div className="flex items-center gap-2 text-neutral-400 text-sm">
          <EyeIcon className="size-5" />
          <span>조회 {post.views}</span>
        </div>
        <form>
          <button>
            <HandThumbUpIcon className="size-5" />
            <span>공감하기 ({post._count.likes})</span>
          </button>
        </form>
      </div>
    </div>
  );
}
