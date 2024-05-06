'use client';

import { dislikePost, likePost } from '@/app/posts/[id]/actions';
import { HandThumbUpIcon as OutlineHandThumbUpIcon } from '@heroicons/react/24/outline';
import { EyeIcon, HandThumbUpIcon } from '@heroicons/react/24/solid';
import { useOptimistic } from 'react';

interface LikeButtonProps {
  isLiked: boolean;
  likeCount: number;
  postId: number;
}

export default function LikeButton({
  isLiked,
  likeCount,
  postId,
}: LikeButtonProps) {
  /*
    mutation이 유저에게 그닥 중요하지 않을 때 useOptimistic을 써도 됨(ex 좋아요, 댓글등)

    useOptimistic hook : 
    1. mutation이 발생하기 전에 유저에게 보여주고 싶은 데이터(유저가 봐야할 initial data는 서버에서 보낸 데이터)
    2. reducer : 기본적으로 isLiked, likeCount 데이터를 수정하는 것
       reducer 함수는 반드시 새로운 state를 return 해야함

    useState 함수랑 비슷하게 생김
    const [state, setState] = useState(0)

    앞에가 state, 뒤에가 함수 reducerFn
    const [state, reducerFn] = useOptimistic(
    { isLiked, likeCount },
    (previousState, payload) => {
      return { isLiked: false, likeCount: 1000000 };
    }
  );
*/

  const [state, reducerFn] = useOptimistic(
    { isLiked, likeCount },
    (previousState, payload) => ({
      isLiked: !previousState.isLiked,
      likeCount: previousState.isLiked
        ? previousState.likeCount - 1
        : previousState.likeCount + 1,
    })
  );
  const onClick = async () => {
    //default state를 알기 때문에 값 안넣어줘도 됨
    reducerFn(undefined);
    if (isLiked) {
      await dislikePost(postId);
    } else {
      await likePost(postId);
    }
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 text-neutral-400 text-sm border border-neutral-400 rounded-full p-2  transition-colors ${
        state.isLiked
          ? 'bg-orange-500 text-white border-orange-500'
          : 'hover:bg-neutral-800'
      }`}
    >
      {state.isLiked ? (
        <HandThumbUpIcon className="size-5" />
      ) : (
        <OutlineHandThumbUpIcon className="size-5" />
      )}
      {state.isLiked ? (
        <span>{state.likeCount}</span>
      ) : (
        <span>공감하기 ({state.likeCount})</span>
      )}
    </button>
  );
}
