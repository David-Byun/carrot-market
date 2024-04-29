import ListProduct from '@/components/list-product';
import ProductList from '@/components/product-list';
import db from '@/lib/db';
import { PlusIcon } from '@heroicons/react/24/solid';
import { Prisma } from '@prisma/client';
import { unstable_cache as nextCache, revalidatePath } from 'next/cache';
import Link from 'next/link';

/* 
  https://nextjs.org/docs/app/api-reference/functions/unstable_cache
  첫번째 argument : 비용이 많이 드는 계산이나 데이터베이스 query를 가동시키는 함수 
  두번째 argument : keyParts 이 함수가 return 하는 데이터를 cache 안에서 식별할 수 있게 해줌
  nextCache의 요점은 데이터가 같을시엔 데이터베이스에 접근하지 않는다.

  cache 새로 고침 방법
  1. revalidate : 함수가 호출된 후 60초가 지나지 않은 경우에 NextJs는 Cache 안에 있는 데이터를 return, 시간이 지나면 최신 데이터 복사본을 얻기 위해 함수를 다시 실행

  const getCachedProducts = nextCache(getInitialProducts, ['home-products'], {
  revalidate: 60,
  });

  2. 새로고침해줘 요청하기

*/
const getCachedProducts = nextCache(getInitialProducts, ['home-products']);

async function getInitialProducts() {
  console.log('hit');
  const products = await db.product.findMany({
    select: {
      title: true,
      price: true,
      created_at: true,
      photo: true,
      id: true,
    },
    orderBy: {
      created_at: 'asc',
    },
  });
  return products;
}

export type InitialProducts = Prisma.PromiseReturnType<
  typeof getInitialProducts
>;

export const metadata = {
  title: 'Home',
};

/* 
  처음에 getCachedProducts 실행해서 'home-products' 찾고 없으면 getInitialProducts 실행해서 해당 데이터를 저장한다.
  다음에는 캐시가 작동해서 db 조회안해도 처리됨
*/
export default async function Products() {
  const initialProducts = await getCachedProducts();
  const revalidate = async () => {
    'use server';
    // 이 함수는 NextJS에게 특정 URL의 cache를 새로고침해달라고 해줌
    revalidatePath('/home');
  };
  return (
    <div>
      <ProductList initialProducts={initialProducts} />
      <form action={revalidate}>
        <button>Revalidate</button>
      </form>
      <Link
        href="/products/add"
        className="bg-orange-500 flex items-center justify-center rounded-full size-16 fixed bottom-24 right-8 text-white transition-colors hover:bg-orange-400"
      >
        <PlusIcon className="size-10" />
      </Link>
    </div>
  );
}
