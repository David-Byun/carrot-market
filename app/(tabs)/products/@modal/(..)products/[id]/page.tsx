'use client';

import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';

/* 
  'use client' 이므로 async 필요 없음 
  이 컴포넌트에서 DB에 접근을 하고 있다면 이 로직을 다른 곳으로 옮겨야 함(API, fetch 등)
  버튼만 따로 분리해서 컴포넌트를 만드는 걸 추천(서버사이드로 남겨두면서)

  코드챌린지
  1. 버튼만 따로 컴포넌트로 분리. Modal 은 서버사이드 렌더링으로
  2. 인스타처럼 팝업이 상품의 상세 내용으로 표출(로딩시 스켈레톤 표출)
*/
export default function Modal({ params }: { params: { id: string } }) {
  const router = useRouter();
  const onCloseClick = () => {
    router.back();
  };
  return (
    <div className="absolute w-full h-full z-50 bg-black left-0 top-0 flex justify-center bg-opacity-60 items-center">
      <button
        className="absolute right-20 top-20 text-neutral-200"
        onClick={onCloseClick}
      >
        <XMarkIcon className="size-10" />
      </button>
      <div className="max-w-screen-sm w-full flex justify-center h-1/2">
        <div className="aspect-square bg-neutral-700 rounded-md flex justify-center items-center text-neutral-200">
          <PhotoIcon className="h-28" />
        </div>
      </div>
    </div>
  );
}
