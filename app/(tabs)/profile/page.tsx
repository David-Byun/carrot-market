import db from '@/lib/db';
import getSession from '@/lib/session';
import { redirect, notFound } from 'next/navigation';
import { Suspense } from 'react';

async function getUser() {
  const session = await getSession();
  if (session.id) {
    const user = await db.user.findUnique({
      where: {
        id: session.id,
      },
    });
    if (user) {
      return user;
    }
  }
  notFound();
}

//Suspense 활용해서 데이터베이스에 조회하는 동안 로딩 처리(페이지에서 다른 부분은 보여짐)
async function Username() {
  // await new Promise((resolve) => setTimeout(resolve, 10000));
  const user = await getUser();
  return <h1>Welcome! {user?.username} ! </h1>;
}

export default async function Profile() {
  //inline 서버 액션 넣는 법
  const logOut = async () => {
    'use server';
    const session = await getSession();
    await session.destroy();
    redirect('/');
  };

  return (
    <div>
      <Suspense fallback={'Hello!'}>
        <Username />
      </Suspense>
      <form action={logOut}>
        <button>Log out</button>
      </form>
    </div>
  );
}
