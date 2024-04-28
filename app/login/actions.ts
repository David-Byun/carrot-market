'use server';

import bcrypt from 'bcrypt';
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from '@/lib/constants';
import db from '@/lib/db';
import { z } from 'zod';
import getSession from '@/lib/session';
import { redirect } from 'next/navigation';

const checkEmailExists = async (email: string) => {
  const user = await db.user.findUnique({
    where: {
      email,
    },
    // 우린 user의 모든 것을 알고 싶지않음 id만 얻고 싶다.
    select: {
      id: true,
    },
  });
  return Boolean(user);
};
const formSchema = z.object({
  email: z
    .string()
    .email()
    .toLowerCase()
    .refine(checkEmailExists, 'An account with this email does not exists.'),
  password: z.string({
    required_error: 'Password is required',
  }),
  //.min(PASSWORD_MIN_LENGTH)
  //.regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
});

export async function login(prevState: any, formData: FormData) {
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  };
  //값이 유효한지 확인
  // formSchema에서는 이메일 확인을 위해 async await를 쓰는 refine이 생겼으므로 safeParseAsync를 써야함. await 붙여줘야함
  const result = await formSchema.safeParseAsync(data);
  if (!result.success) {
    return result.error.flatten();
  } else {
    // find a user with the email
    // if the user is found, check password hash
    const user = await db.user.findUnique({
      where: {
        email: result.data.email,
      },
      select: {
        id: true,
        password: true,
      },
    });
    // refine 한 값이므로 user가 존재하는게 분명하므로 user!.password로 해주고, 없으면 빈문자와 비교한다고 정해준다
    const ok = await bcrypt.compare(result.data.password, user!.password ?? '');

    // log the user in
    // redirect "/profile"
    if (ok) {
      const session = await getSession();
      session.id = user!.id;
      await session.save();
      redirect('/profile');
    } else {
      return {
        fieldErrors: {
          password: ['Wrong password.'],
          email: [],
        },
      };
    }
  }
}
