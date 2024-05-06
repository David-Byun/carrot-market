'use server';

import db from '@/lib/db';
import getSession from '@/lib/session';
import { revalidateTag } from 'next/cache';

export async function likePost(postId: number) {
  await new Promise((r) => setTimeout(r, 10000));
  const session = await getSession();
  try {
    await db.like.create({
      data: {
        postId,
        //TypeScript는 session에 id가 없을수도 있다고 생각하므로, 로그인하지 않은 유저는 아예 이 페이지에 들어올 수 없으므로 느낌표로 있다고 알려줌
        userId: session.id!,
      },
    });
    revalidateTag(`like-status-${postId}`);
  } catch (e) {}
}

export async function dislikePost(postId: number) {
  await new Promise((r) => setTimeout(r, 10000));
  try {
    const session = await getSession();
    console.log(session.id);
    await db.like.delete({
      where: {
        id: {
          postId,
          //TypeScript는 session에 id가 없을수도 있다고 생각하므로, 로그인하지 않은 유저는 아예 이 페이지에 들어올 수 없으므로 느낌표로 있다고 알려줌
          userId: session.id!,
        },
      },
    });
    revalidateTag(`like-status-${postId}`);
  } catch (e) {}
}
