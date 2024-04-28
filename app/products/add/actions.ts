'use server';

import { z } from 'zod';
import fs from 'fs/promises';
import db from '@/lib/db';
// async와 await를 사용하기 위해서 promises 사용

const productSchema = z.object({
  photo: z.string({
    required_error: 'Photo is required',
  }),
  title: z
    .string({
      required_error: 'Title is required',
    })
    .min(10)
    .max(50),
  description: z.string({
    required_error: 'Description is required',
  }),
  price: z.coerce.number({
    required_error: 'Price is required',
  }),
  // string -> number
});

export async function uploadProduct(_: any, formData: FormData) {
  const data = {
    title: formData.get('title'),
    photo: formData.get('photo'),
    description: formData.get('price'),
    price: formData.get('description'),
  };
  // 유저가 업로드한 파일을 우리 파일 시스템에 저장하는 건 좋은 방법이 아님
  if (data.photo instanceof File) {
    const photoData = await data.photo.arrayBuffer();
    console.log(photoData);
    await fs.appendFile(`./public/${data.photo.name}`, Buffer.from(photoData));
    data.photo = `/${data.photo.name}`;
  }
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
    }
  }
}
