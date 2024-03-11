'use client';

import Input from '../../components/input';
import FormButton from '../../components/button';
import SocialLogin from '../../components/social-login';
import { useFormState } from 'react-dom';
import { createAccount } from './actions';
import Button from '../../components/button';
import { PASSWORD_MIN_LENGTH } from '@/lib/constants';

export default function CreateAccount() {
  const [state, dispatch] = useFormState(createAccount, null);
  return (
    <div className="flex flex-col gap-10 py-8 px-6">
      <div className="flex flex-col gap-2 *:font-medium">
        <h1 className="text-2xl">안녕하세요!</h1>
        <h2 className="text-xl">Fill in the form below to join!</h2>
      </div>
      <form action={dispatch} className="flex flex-col gap-3">
        <Input
          required
          type="text"
          placeholder="Username"
          name="username"
          errors={state?.fieldErrors.username}
          minLength={3}
          maxLength={10}
        />
        <Input
          required
          type="email"
          placeholder="Email"
          name="email"
          errors={state?.fieldErrors.email}
        />
        <Input
          required
          type="password"
          placeholder="Password"
          name="password"
          minLength={PASSWORD_MIN_LENGTH}
          errors={state?.fieldErrors.password}
        />
        <Input
          required
          minLength={PASSWORD_MIN_LENGTH}
          name="confirm_password"
          type="password"
          placeholder="Confirm Password"
          errors={state?.fieldErrors.confirm_password}
        />
        <Button text="Create Account" />
      </form>
      <SocialLogin />
    </div>
  );
}
