import LikeButton from '@/components/like-button';
import db from '@/lib/db';
import getSession from '@/lib/session';
import { formatToTimeAgo } from '@/lib/utils';
import { HandThumbUpIcon as OutlineHandThumbUpIcon } from '@heroicons/react/24/outline';
import { EyeIcon, HandThumbUpIcon } from '@heroicons/react/24/solid';
import {
  revalidatePath,
  unstable_cache as nextCache,
  revalidateTag,
} from 'next/cache';
import Image from 'next/image';
import { notFound } from 'next/navigation';

/*
  게시물당 댓글 기능 추가하기(보여주기, 댓글 optimistic 사용)
  [...previousCommnet, {newComment}]
*/

const getCachedPost = nextCache(getPost, ['post-detail'], {
  tags: ['post-detail'],
  revalidate: 60,
});

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
          },
        },
      },
    });
    return post;
  } catch (e) {}
}

function getCachedLikeStatus(postId: number) {
  const cachedOperation = nextCache(getLikeStatus, ['product-like-status'], {
    tags: [`like-status-${postId}`],
  });
  return cachedOperation(postId);
}

async function getLikeStatus(postId: number) {
  const session = await getSession();
  const isLiked = await db.like.findUnique({
    where: {
      id: {
        postId: postId,
        userId: session.id!,
      },
    },
  });

  const likeCount = await db.like.count({
    where: {
      postId,
    },
  });
  return {
    likeCount,
    isLiked: Boolean(isLiked),
  };
}

/*
  optimistic response는 마치 백엔드에서 mutation이 성공한 것처럼 UI를 수정
  button > client여야한다.
*/
export default async function PostDetail({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }
  const post = await getCachedPost(id);
  if (!post) {
    return notFound();
  }
  const { likeCount, isLiked } = await getCachedLikeStatus(id);
  return (
    <div className="p-5 text-white">
      <div className="flex items-center gap-2 mb-2">
        <Image
          width={28}
          height={28}
          className="size-7 rounded-full"
          src={post.user.avatar!}
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
      <div className="flex flex-col gap-6 items-start">
        <div className="flex items-center gap-2 text-neutral-400 text-sm">
          <EyeIcon className="size-5" />
          <span>조회 {post.views}</span>
        </div>
        <LikeButton isLiked={isLiked} likeCount={likeCount} postId={id} />
      </div>
    </div>
  );
}
