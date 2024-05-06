import db from '@/lib/db';
import { formatToWon } from '@/lib/utils';
import { UserIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { unstable_cache as nextCache, revalidateTag } from 'next/cache';
import getSession from '@/lib/session';

/*
  fetch("api") - nextjs에서 자동으로 캐시해줌
  nextCache - 다른 데이터를 cache하는데 사용됨

  아래와 같은 형식도 가능(db 직접 연동이 아닌 API 사용할 때)
  async function getProduct(id : number){
    fetch("https://api.com", {
      next : {
        revalidate: 60,
        tags:["hello"]
      }
    })
  }
*/
async function getIsOwner(userId: number) {
  const session = await getSession();
  if (session.id) {
    return session.id === userId;
  }
  return false;
}

async function getProduct(id: number) {
  console.log('product');
  const product = await db.product.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          username: true,
          avatar: true,
        },
      },
    },
  });
  console.log(product);
  return product;
}

const getCachedProduct = nextCache(getProduct, ['product-detail'], {
  tags: ['product-detail'],
});

async function getProductTitle(id: number) {
  console.log('title');
  const product = await db.product.findUnique({
    where: {
      id,
    },
    select: {
      title: true,
    },
  });
  console.log(product);
  return product;
}

/* 
  getProductTitle(id) 안하는 이유는 nextCache가 자동으로 여러분이 적은 함수에 여러분이 보낸 argument를 제공함 
  key는 unique 해야하며, tags와 key가 같을 필요는 없음
  tags는 여러 태그를 가질 수 있으며 여러분의 애플리케이션 여러 cache에서 공유될 수 있음
*/
const getCachedProductTitle = nextCache(getProductTitle, ['product-title'], {
  tags: ['product-title'],
});

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getCachedProductTitle(Number(params.id));
  return {
    title: product?.title,
  };
}

export default async function ProductDetail({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }
  const product = await getCachedProduct(id);
  if (!product) {
    return notFound();
  }
  const isOwner = await getIsOwner(product.userId);
  const revalidate = async () => {
    'use server';
    revalidateTag('product-title');
  };

  //server action을 만들 때마다 모든 server action을 별도의 파일에 옮겨두는게 좋을 것 같음
  const createChatRoom = async () => {
    'use server';
    const session = await getSession();
    const room = await db.chatRoom.create({
      data: {
        users: {
          //seller, buyer
          connect: [{ id: product.userId }, { id: session.id }],
        },
      },
      select: {
        id: true,
      },
    });
    redirect(`/chats/${room.id}`);
  };
  return (
    <div>
      <div className="relative aspect-square">
        <Image
          fill
          src={product.photo}
          alt={product.title}
          className="object-cover"
        />
      </div>
      <div className="p-5 flex items-center gap-3 border-b border-neutral-700">
        <div className="size-10 rounded-full overflow-hidden">
          {product.user.avatar !== null ? (
            <Image
              src={product.user.avatar}
              width={40}
              height={40}
              alt={product.user.username}
            />
          ) : (
            <UserIcon />
          )}
        </div>
        <div>
          <h3>{product.user.username}</h3>
        </div>
      </div>
      <div className="p-5">
        <h1 className="text-2xl font-semibold">{product.title}</h1>
        <p>{product.decsription}</p>
      </div>
      <div className="fixed w-full p-5 bottom-0 left-0 pb-10 bg-neutral-800 flex justify-between items-center">
        <span className="font-semibold text-xl">
          {formatToWon(product.price)}원
        </span>
        {isOwner ? (
          <form action={revalidate}>
            <button className="bg-orange-500 px-5 py-2.5 text-white font-semibold">
              Revalidate title cache
            </button>
          </form>
        ) : (
          <form action={revalidate}>
            <button className="bg-orange-500 px-5 py-2.5 text-white font-semibold">
              Revalidate title cache
            </button>
          </form>
        )}
        <form action={createChatRoom}>
          <button className="bg-orange-500 px-5 py-2.5 text-white font-semibold">
            채팅하기
          </button>
        </form>
      </div>
    </div>
  );
}
