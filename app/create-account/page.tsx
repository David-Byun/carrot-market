'use client';

import FormInput from '../components/form-input';
import FormButton from '../components/form-btn';
import SocialLogin from '../components/social-login';
import { useFormState } from 'react-dom';
import { createAccount } from './actions';

export default function CreateAccount() {
  const [state, dispatch] = useFormState(createAccount, null);
  return (
    <div className="flex flex-col gap-10 py-8 px-6">
      <div className="flex flex-col gap-2 *:font-medium">
        <h1 className="text-2xl">안녕하세요!</h1>
        <h2 className="text-xl">Fill in the form below to join!</h2>
      </div>
      <form action={dispatch} className="flex flex-col gap-3">
        <FormInput
          required
          type="text"
          placeholder="Username"
          name="username"
          errors={state?.fieldErrors.username}
        />
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
          errors={state?.fieldErrors.password}
        />
        <FormInput
          required
          name="confirm_password"
          type="password"
          placeholder="Confirm Password"
          errors={state?.fieldErrors.confirm_password}
        />
        <FormButton text="Create Account" />
      </form>
      <SocialLogin />
    </div>
  );
}
