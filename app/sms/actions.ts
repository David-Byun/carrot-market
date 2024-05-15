'use server';

import { z } from 'zod';
import crypto from 'crypto';
import validator from 'validator';
import { redirect } from 'next/navigation';
import db from '@/lib/db';

const phoneSchema = z
  .string()
  .trim()
  .refine(
    (phone) => validator.isMobilePhone(phone, 'ko-KR'),
    'Wrong phone format'
  );

const tokenSchema = z.coerce.number().min(100000).max(999999);

interface ActionState {
  token: boolean;
}

async function createToken() {
  const token = crypto.randomInt(100000, 999999).toString();
  const exists = await db.sMSToken.findUnique({
    where: {
      token,
    },
    select: {
      id: true,
    },
  });
  if (exists) {
    return createToken();
  } else {
    return token;
  }
}

export async function smsLogIn(prevState: ActionState, formData: FormData) {
  const phone = formData.get('phone');
  const token = formData.get('token');
  if (!prevState.token) {
    const result = phoneSchema.safeParse(phone);
    if (!result.success) {
      console.log(result.error.flatten());
      return {
        token: false,
        error: result.error.flatten(),
      };
    } else {
      // 이전 토큰 삭제하기(유저마다 새로운 토큰을 가져야 하므로)
      await db.sMSToken.deleteMany({
        where: {
          user: {
            //result는 zod가 phone 값을 parse 할때 전달하는 값, result는 error나 data를 가질 수 있는 object
            phone: result.data,
          },
        },
      });
      // 새로운 토큰 생성하기
      // twilio 사용해서 토큰 보내기
      return {
        token: true,
      };
    }
  } else {
    const result = tokenSchema.safeParse(token);
    if (!result.success) {
      return {
        token: true,
        error: result.error.flatten(),
      };
    } else {
      redirect('/');
    }
  }
}
