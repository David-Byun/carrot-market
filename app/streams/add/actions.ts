'use server';
import { redirect } from 'next/navigation';

import db from '@/lib/db';
import getSession from '@/lib/session';

import { z } from 'zod';

const title = z.string();

export async function startStream(_: any, formData: FormData) {
  const results = title.safeParse(formData.get('title'));
  if (!results.success) {
    return results.error.flatten();
  }
  console.log(results);
  /*
  cloudflare API와 소통
  https://developers.cloudflare.com/stream/get-started/
  */
  /*
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/live_inputs`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY}`,
      },
      //string으로 들어가므로 JSON.stringify 함
      body: JSON.stringify({
        meta: {
          //검증되었고 변환되는등 모든 과정을 거친 데이터
          name: results.data,
        },
        recording: {
          mode: 'automatic',
        },
      }),
    }
  );
  */
  //const data = await response.json();
  const session = await getSession();
  console.log(session.id);
  const stream = await db.liveStream.create({
    data: {
      title: results.data,
      //stream_id: data.result.uid,
      //stream_key: data.result.rtmps.streamKey,
      stream_id: '1234',
      stream_key: '1234',
      userId: session.id!,
    },
    select: {
      id: true,
    },
  });
  redirect(`/streams/${stream.id}`);
}
