'use client';

/*
    client 컴포넌트로 데이터가 누출되길 원하지 않음
*/
export default function HackedComponent({}: any) {
  return <h1>Hacked</h1>;
}
