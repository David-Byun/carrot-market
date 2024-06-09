'use client';

import { getMoreProducts } from '@/app/(tabs)/products/actions';
import ListProduct from './list-product';
import { useEffect, useRef, useState } from 'react';
import { InitialProducts } from '@/app/(tabs)/products/page';

interface ProductListProps {
  initialProducts: InitialProducts;
}

export default function ProductList({ initialProducts }: ProductListProps) {
  const [products, setProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const [page, setPage] = useState(0);
  const trigger = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    // page 변화가 일어나면 실행(IntersectionObserver는 우리의 trigger를 observe 함)
    const observer = new IntersectionObserver(
      //함수의 첫번째 인자는 intersectionObserver가 observe 하는 모든 요소가 됨, 두번째는 observer 자체가 됨
      async (
        entries: IntersectionObserverEntry[],
        observer: IntersectionObserver
      ) => {
        //우리는 하나의 요소만 observe하고 있기 때문에, array[0]에서 가져옴
        const element = entries[0];
        //element가 intersect 하는지 확인한다.
        if (element.isIntersecting && trigger.current) {
          //중요한 건 우리가 trigger를 unobserve 한다는 것이다. 더 이상 감지하지 않기 위해서
          observer.unobserve(trigger.current);
          setIsLoading(true);

          const newProducts = await getMoreProducts(page + 1);
          if (newProducts.length !== 0) {
            setProducts((prev: any) => [...prev, ...newProducts]);
            //page를 변경할 때 page가 useEffect의 dependency 이기 때문에 이 모든 코드가 다시 실행됨 -> 우리의 trigger가 다시 observe 된다는 의미
            setPage((prev) => prev + 1);
          } else {
            setIsLastPage(true);
          }
          setIsLoading(false);
        }
        console.log(entries[0].isIntersecting);
      },
      {
        threshold: 1.0,
        rootMargin: '0px 0px -100px 0px',
      }
    );
    //span에 trigger가 추가되고, null 이 아닌 경우 trigger를 observe 함, IntersectionObserver가 요소를 observe 하는 것을 멈추면, 위에 async 함수 호출
    if (trigger.current) {
      observer.observe(trigger.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [page]);
  // 아래 html ref={trigger}는 document.getElementByID를 하는 것과 같다(span을 가져옴)
  /*
    style marginTop 했던 이유는 trigger를 page 아래로 보내고 싶었기 때문이다.
    style={{
            marginTop: `${page + 1 * 900}vh`,
          }}
  */
  return (
    <div className="p-5 flex flex-col gap-5">
      {products.map((product: any) => (
        <ListProduct key={product.id} {...product} />
      ))}
      {!isLastPage ? (
        <span
          className="text-sm font-semibold bg-orange-500 mx-auto px-3 py-2 rounded-md hover:opacity-90 active:scale-95 w-fit"
          ref={trigger}
        >
          {isLoading ? '로딩 중' : 'Load More'}
        </span>
      ) : null}
    </div>
  );
}
