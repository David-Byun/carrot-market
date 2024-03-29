'use client';

import FormInput from '../../components/input';
import FormButton from '../../components/button';
import SocialLogin from '../../components/social-login';
import { useFormState, useFormStatus } from 'react-dom';
import { login } from './actions';
import { PASSWORD_MIN_LENGTH } from '@/lib/constants';

export default function Login() {
  const [state, dispatch] = useFormState(login, null);
  return (
    <div className="flex flex-col gap-10 py-8 px-6">
      <div className="flex flex-col gap-2 *:font-medium">
        <h1 className="text-2xl">안녕하세요!</h1>
        <h2 className="text-xl">Log in with email and password.</h2>
      </div>
      <form action={dispatch} className="flex flex-col gap-3">
        <FormInput
          required
          type="email"
          placeholder="Email"
          name="email"
          errors={state?.fieldErrors.email}
        />
        <FormInput
          required
          type="password"
          placeholder="Password"
          name="password"
          minLength={PASSWORD_MIN_LENGTH}
          errors={state?.fieldErrors.password}
        />
        <FormButton text="Login" />
      </form>

      <SocialLogin />
    </div>
  );
}
