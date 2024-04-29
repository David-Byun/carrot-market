import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import getSession from './lib/session';

/*
    웹사이트의 모든 request 하나마다 middleware가 실행됨(함수명은 무조건 middleware, config 로 설정해야함)
*/

interface Routes {
  [key: string]: boolean;
}

//array 보다 더 빠르다
const publicOnlyUrls: Routes = {
  '/': true,
  '/login': true,
  '/sms': true,
  '/create-account': true,
};

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const exists = publicOnlyUrls[request.nextUrl.pathname];
  if (!session.id) {
    if (!exists) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } else {
    if (exists) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
  }
}

//request.nextUrl을 사용해서 url을 컨트롤할 수 있음
/*
  console.log(request.nextUrl.pathname);
  console.log(cookies());
  const session = await getSession();
  console.log(session);
  const pathname = request.nextUrl.pathname;
  if (pathname === '/') {
    //user에게 제공할 response를 가져와서 우리가 원하는 cookie를 그 response에 넣기 원함
    const response = NextResponse.next();
    response.cookies.set('middleware-cookie', 'hello!');
    return response;
  }
  if (pathname === '/profile') {
    //NextResponse는 모든 기본 response의 extension 같은 것이다.
    return NextResponse.redirect(new URL('/', request.url));
  }
  */

//https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    //middleware 실행하기 싫은 url을 필터링할 정규식을 입력
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

//edge runtime : nodejs 사용못함(prisma X) => middleware에서
//https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes
