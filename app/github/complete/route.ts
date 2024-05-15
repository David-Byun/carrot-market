import db from '@/lib/db';
import getSession from '@/lib/session';
import { notFound, redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return notFound();
  }
  const accessTokenParams = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    client_secret: process.env.GITHUB_CLIENT_SECRET!,
    code,
  }).toString();
  const accessTokenURL = `https://github.com/login/oauth/access_token?${accessTokenParams}`;
  /* 
  일단 request를 await 하고, 그 다음에 request가 JSON으로 변환되는 것을 기다린다
  아래 방식이 헷갈리면,
  const accessTokenResponse = await fetch(accessTokenURL);
  const accessTokenJSON = await accessTokenResponse.json();
  */
  const { error, access_token } = await (
    await fetch(accessTokenURL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    })
  ).json();
  if (error) {
    return new Response(null, {
      status: 400,
    });
  }
  /*
    여기서 기억해야할 중요한 부분은 우리가 Nextjs에서 GET 요청을 보내면 기본적으로 그 GET request들은 Nextjs의 cache에 의해서 저장됨
    하지만 cache 되기를 원하지 않음. 이 request가 모든 user에 대해 동일하게 적용되면 안됨
    그래서 cache : "no-cache" 옵션 설정
  */
  const userProfileResponse = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    cache: 'no-cache',
  });
  const { id, avatar_url, login } = await userProfileResponse.json();
  const user = await db.user.findUnique({
    where: {
      github_id: id + '',
    },
    select: {
      id: true,
    },
  });
  if (user) {
    const session = await getSession();
    session.id = user.id;
    await session.save();
    return redirect('/profile');
  }
  /*
    username이 unique 한데, 이미 존재할 수 있으므로 이를 처리할 수 있는 로직 필요
  */
  const newUser = await db.user.create({
    //id가 숫자로 오기 때문에 문자열로 변환
    data: {
      username: `${login}-gh`,
      github_id: id + '',
      avatar: avatar_url,
    },
    select: {
      id: true,
    },
  });
  const session = await getSession();
  session.id = newUser.id;
  await session.save();
  return redirect('/profile');
}
