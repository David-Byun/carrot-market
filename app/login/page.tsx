'use client';

import FormInput from '../components/input';
import FormButton from '../components/button';
import SocialLogin from '../components/social-login';
import { useFormState, useFormStatus } from 'react-dom';
import { handleForm } from './actions';

export default function Login() {
  const [state, action] = useFormState(handleForm, null);
  return (
    <div className="flex flex-col gap-10 py-8 px-6">
      <div className="flex flex-col gap-2 *:font-medium">
        <h1 className="text-2xl">안녕하세요!</h1>
        <h2 className="text-xl">Log in with email and password.</h2>
      </div>
      <form action={action} className="flex flex-col gap-3">
        <FormInput required type="email" placeholder="Email" name="email" />
        <FormInput
          required
          type="password"
          placeholder="Password"
          name="password"
        />
        <FormButton text="Login" />
      </form>

      <SocialLogin />
    </div>
  );
}
