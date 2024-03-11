'use client';

import { useFormState } from 'react-dom';
import Button from '../../components/button';
import Input from '../../components/input';
import { smsLogIn } from './actions';

export default function SMSLogin() {
  const [state, dispatch] = useFormState(smsLogIn, null);
  return (
    <div className="flex flex-col gap-10 py-8 px-6">
      <div className="flex flex-col gap-2 *:font-medium">
        <h1 className="text-2xl">SMS Login</h1>
        <h2 className="text-xl">Verify your phone number</h2>
      </div>
      <form action={dispatch} className="flex flex-col gap-3">
        <Input required type="text" placeholder="Phone Number" name="phone" />
        <Input
          required
          type="number"
          placeholder="Verification code"
          name="token"
          min={100000}
          max={999999}
        />
        <Button text="Verify" />
      </form>
    </div>
  );
}
