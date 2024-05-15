import { redirect } from 'next/navigation';

/*
    route 파일로 URL의 특정 HTTP method handler를 만들 수 있다는 것을 기억해야 함
    react.js나 HTML을 리턴하고 싶지 않을때 route.ts를 사용했었음

    github parameter 참고 : https://docs.github.com/ko/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
    scope - github에게 우리가 사용자로부터 원하는 데이터가 무엇인지 알려줌
*/
export function GET() {
  const baseURL = 'https://github.com/login/oauth/authorize';
  const params = {
    client_id: process.env.GITHUB_CLIENT_ID!,
    scope: 'read:user, user:email',
    allow_signup: 'true',
  };
  //url parameter 만드는 방법
  const formattedParams = new URLSearchParams(params).toString();
  const finalUrl = `${baseURL}?${formattedParams}`;
  return redirect(finalUrl);
}
