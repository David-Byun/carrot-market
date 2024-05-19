/*
Private Folders
Private 폴더는 폴더 앞에 밑줄(_folderName)을 붙여 생성할 수 있습니다.
https://nextjs.org/docs/app/building-your-application/routing/colocation#private-folders

안에 page.tsx 있어도 안보임
*/
/*
Catch-all Segments
대괄호 [...folderName] 안에 줄임표를 추가하면 동적 세그먼트를 모든 후속 세그먼트로 확장할 수 있습니다.
https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes#catch-all-segments

optional 로 하려면 [...id] 에 한번더 []를 감싸서 [[...id]]
위와 같이 하면 파라미터 없어도 /extras로 가도 열림
 */

import HackedComponent from '@/components/hacked-component';
import {
  experimental_taintObjectReference,
  experimental_taintUniqueValue,
} from 'react';

/*
데이터를 fetch 하기 위해 backend로 보내는 모든 get 요청은 cookie, header를 사용하지 않으면 nextjs가 자동으로 캐싱함
revalidate, revalidate Path등으로 해줘야함
언제 cache이고 언제 아닌지 확인하려면 next.config.mjs 수정(내용은 파일에서 직접 확인)
*/
async function getData() {
  const data = fetch('https://nomad-movies.nomadcoders.workers.dev/movies');
}

/*
#17.5 Security
experimental_taintObjectReference
특정 객체 인스턴스가 사용자 객체와 같은 클라이언트 컴포넌트에 전달되는 것을 방지할 수 있습니다.
client 컴포넌트로 전달해서는 안되는 object를 표시
https://react.dev/reference/react/experimental_taintObjectReference

hacked-component.tsx 파일에서 내용 작성 진행
*/
export default async function Extras({ params }: { params: { id: string[] } }) {
  await getData();
  const data = getHackedData();
  return (
    <div className="flex flex-col gap-3 py-10">
      <h1 className="text-6xl">Extras!</h1>
      <h2 className="font-kb">So much more to learn!</h2>
      <HackedComponent data={data} />
    </div>
  );
}

function getHackedData() {
  const secret = {
    apiKey: '11191119',
    secret: '1010101',
  };
  //첫번째는 우리가 볼 error이고, 두번째는 object -> 함수를 사용하는 것 만으로도 server 단에 남아야하는 object 확인해줌
  experimental_taintObjectReference('API Keys were leaked!!', secret);

  const keys = {
    apiKey: '11191119',
    secret: '1010101',
  };
  //object 전체를 tainting 하는 대신에 키중 특정 항목만 걸러줌
  experimental_taintUniqueValue('Secret key was exposed', keys, keys.secret);
  return secret;
}

/*
  파일이나 폴더 전체를 노출시키지 않으려면
  npm i server-only
  
*/
