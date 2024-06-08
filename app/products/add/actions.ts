'use server';

import { z } from 'zod';
import fs from 'fs/promises';
import db from '@/lib/db';
import getSession from '@/lib/session';
import { redirect } from 'next/navigation';
import { productSchema } from './schema';
// async와 await를 사용하기 위해서 promises 사용

/*
  코드챌린지 1. 유저가 다른 것 말고 이미지를 업로드했는지 확인
  2. 사이즈 체크(예를 들면 이미지 최대 사이즈 2MB)
*/
export async function uploadProduct(_: any, formData: FormData) {
  const data = {
    title: formData.get('title'),
    photo: formData.get('photo'),
    description: formData.get('description'),
    price: formData.get('price'),
  };
  // 유저가 업로드한 파일을 우리 파일 시스템에 저장하는 건 좋은 방법이 아님
  /*
  if (data.photo instanceof File) {
    const photoData = await data.photo.arrayBuffer();
    console.log(photoData);
    await fs.appendFile(`./public/${data.photo.name}`, Buffer.from(photoData));
    data.photo = `/${data.photo.name}`;
  }
  */
  const result = productSchema.safeParse(data);
  if (!result.success) {
    return result.error.flatten();
  } else {
    const session = await getSession();
    if (session.id) {
      const product = await db.product.create({
        data: {
          title: result.data.title,
          decsription: result.data.description,
          price: result.data.price,
          photo: result.data.photo,
          user: {
            connect: {
              id: session.id,
            },
          },
        },
        select: {
          id: true,
        },
      });
      redirect(`/products/${product.id}`);
    }
  }
}

/*
Cloudflare
URL 알려줌 : User --> Server --> 브라우저 이미지 (cloudflare 안전한 업로드 URL 알려줘) CF(Upload URL) --> User
서버에 저장하는게 아니라 CF로 바로 저장 : User --> CF --> 업로드 URL --> DB에 저장
키 노출을 하지 않기 위해서 서버에서 실행함(API Key, Account ID)
*/
export async function getUploadUrl() {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY!}`,
      },
    }
  );
  const data = await response.json();
  console.log(data);
  return data;
}
