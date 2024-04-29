'use client';

import Button from '@/components/button';
import Input from '@/components/input';
import { PhotoIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { uploadProduct } from './actions';
import { useFormState } from 'react-dom';
import { resolve } from 'path';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ProductType, productSchema } from './schema';

export default function AddProduct() {
  const [preview, setPreview] = useState('');
  // react hook form 강의 관련
  const { register, handleSubmit } = useForm<ProductType>({
    resolver: zodResolver(productSchema),
  });

  const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //console.log(event.target.files);
    const {
      target: { files },
    } = event;
    if (!files) {
      return;
    }
    const file = files[0];
    //이미지 사이즈 체크
    //이미지 용량 체크
    const url = URL.createObjectURL(file);
    setPreview(url);
  };
  const [state, action] = useFormState(uploadProduct, null);

  return (
    <div>
      {/* form의 validation이 성공했을때 호출할 함수를 넣기 handleSubmit(onValid) onValid는 validation이 끝난 데이터로 호출됨*/}
      <form className="flex flex-col gap-5 p-5" action={action}>
        <label
          htmlFor="photo"
          className="border-2 aspect-square flex items-center justify-center flex-col text-neutral-300 border-neutral-300 rounded-md border-dashed cursor-pointer bg-center bg-cover"
          style={{
            backgroundImage: `url(${preview})`,
          }}
        >
          {preview === '' ? (
            <>
              <PhotoIcon className="w-20" />
              <div className="text-neutral-400 text-sm">
                사진을 추가해주세요.
                {state?.fieldErrors.photo}
              </div>
            </>
          ) : null}
        </label>
        <input
          type="file"
          id="photo"
          name="photo"
          className="hidden"
          accept="image/*"
          onChange={onImageChange}
        />
        {/* register가 name을 주기 때문에 name을 제거 */}
        <Input
          required
          placeholder="제목"
          type="text"
          errors={state?.fieldErrors.title}
          {...register('title')}
        />
        <Input
          type="number"
          required
          placeholder="가격"
          {...register('price')}
          errors={state?.fieldErrors.price}
        />
        <Input
          type="text"
          required
          placeholder="자세한 설명"
          {...register('description')}
          errors={state?.fieldErrors.description}
        />
        <Button text="작성 완료" />
      </form>
    </div>
  );
}
