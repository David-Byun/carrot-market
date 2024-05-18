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
/*
데이터를 fetch 하기 위해 backend로 보내는 모든 get 요청은 cookie, header를 사용하지 않으면 nextjs가 자동으로 캐싱함
revalidate, revalidate Path등으로 해줘야함
언제 cache이고 언제 아닌지 확인하려면 next.config.mjs 수정(내용은 파일에서 직접 확인)
*/
async function getData() {
  const data = fetch('https://nomad-movies.nomadcoders.workers.dev/movies');
}

export default async function Extras({ params }: { params: { id: string[] } }) {
  await getData();
  return (
    <div className="flex flex-col gap-3 py-10">
      <h1 className="text-6xl">Extras!</h1>
      <h2 className="font-kb">So much more to learn!</h2>
    </div>
  );
}
