'use server';
import bcrypt from 'bcrypt';

import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from '@/lib/constants';
import db from '@/lib/db';
import { z } from 'zod';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import getSession from '@/lib/session';

const checkUsername = async (username: string) => {
  const user = await db.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });
  // if (user) {
  //   return false;
  // } else {
  //   return true;
  // }
  return !Boolean(user);
};

const checkEmail = async (email: string) => {
  const user = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });
  return !Boolean(user);
};

const checkPasswords = ({
  password,
  confirm_password,
}: {
  password: string;
  confirm_password: string;
}) => password === confirm_password;

const formSchema = z
  .object({
    username: z //에러가 여러개인 경우에는 여러 에러 메시지들을 object로 전달할 수 있음
      .string({
        invalid_type_error: 'Username must be a string!',
        required_error: 'Where is my username???',
      })
      .toLowerCase()
      .trim()
      //.transform((username) => `😀 ${username}`)
      .refine(checkUsername, 'This username is already taken'),
    email: z.string().email().toLowerCase().refine(
      //validators 를 직접 만들어서 확인할 수 있음
      checkEmail,
      'There is an account already registered with that email'
    ) /* 
      password는 password와 confirm_password를 모두 확인해야 하므로 refine을 사용할 수 없었음(그래서 refine을 밖으로 옮김) 
      아래 .refine(checkPasswords ~ 부분)
    */,
    password: z.string().min(PASSWORD_MIN_LENGTH),
    // .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
    confirm_password: z.string().min(PASSWORD_MIN_LENGTH),
  })
  // refine 하고 있는 데이터, 두번째 인재는 에러묶음(ctx) zod는 기본적으로 여러분의 데이터를 검사하고 refineCTX에 넘김.
  // 원한다면 에러를 ctx에 추가할 수 있음(우리는 이 object를 refine 하고 있음)
  // superRefine을 사용하므로 전체가 refine , db를 검증하는게 아니라 제일 위에 내용이 에러가 있으면 아래 내용은 검색 안하게 함
  .superRefine(async ({ username }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      //Zod 유효성검사에서 에러를 추가하는 방법
      ctx.addIssue({
        code: 'custom',
        message: 'This username is already taken',
        //username 하단에 에러를 보여준다
        path: ['username'],
        fatal: true,
      });
      // fatal issue를 만들고 never를 return 하면 뒤에 다른 refine이 있어도 실행되지 않음(superRefine을 제일 위로 배치)
      return z.NEVER;
    }
  })
  .superRefine(async ({ email }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      //Zod 유효성검사에서 에러를 추가하는 방법
      ctx.addIssue({
        code: 'custom',
        message: 'This email is already taken',
        //username 하단에 에러를 보여준다
        path: ['email'],
        fatal: true,
      });
      // fatal issue를 만들고 never를 return 하면 뒤에 다른 refine이 있어도 실행되지 않음(superRefine을 제일 위로 배치)
      return z.NEVER;
    }
  })
  .refine(checkPasswords, {
    message: 'Both passwords should be the same!',
    path: ['confirm_password'],
  });

// check if username is taken
// check if the email is already used
// hash password
// save the user to db
// log the user in
// redirect "/home"

export async function createAccount(prevState: any, formData: FormData) {
  const data = {
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirm_password: formData.get('confirm_password'),
  };
  //data는 데이터 검증으로만 사용하고 데이터의 검증과 변환이 끝나면 result.data로 사용해야함(data object는 사용하면 안됨 - validation X)
  //safeParse는 데이터를 parse, validate, transform 해줌 - schema 형태에 따라서, schema는 우리가 zod에게 작성해둔 zod object임
  const result = await formSchema.safeParseAsync(data);
  //safeParse는 try - catch 없이, success 값을 내려줌
  if (!result.success) {
    //superRefine을 사용하므로 에러타입이 fieldErrors가 아닌 formErrors 형태로 들어감(zod는 타입을 모르기 때문에)
    /*
    flatten 함수를 호출하면 에러가 이런 형식으로 포맷팅 됨
      {
        password : ["too short", "too weak"]
      }
    */
    console.log(result.error.flatten());
    return result.error.flatten();
  } else {
    // hash password
    const hashedPassword = await bcrypt.hash(result.data.password, 12);
    console.log(hashedPassword);

    // save the user to db
    const user = await db.user.create({
      data: {
        username: result.data.username,
        email: result.data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
      },
    });
    const session = await getSession();
    // 로그인을 안했거나 로그아웃 상태면 id를 알지 못해서 에러
    session.id = user.id;
    await session.save();

    redirect('/profile');
  }
}
