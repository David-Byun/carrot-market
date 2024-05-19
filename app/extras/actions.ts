/*
    이렇게 함으로써 client 컴포넌트가 이 함수를 import 하려고 하면 error를 발생시킴
*/
import 'server-only';

export function fetchFromAPI() {
  fetch('....');
}
