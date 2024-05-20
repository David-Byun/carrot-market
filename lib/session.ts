import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

interface SessionContent {
  id?: number;
}

/*
  getIronSession : Framework가 우리에게 보내는 cookie를 관리할 수 있음 
  ironSession은 쿠키를 생성하고, User의 ID를 cookie 안에 넣음

*/
export default function getSession() {
  console.log(cookies());
  return getIronSession<SessionContent>(cookies(), {
    cookieName: 'delicious-karrot',
    password: process.env.COOKIE_PASSWORD!,
  });
}
