'use client';

import Button from '@/components/button';
import Input from '@/components/input';
import { PhotoIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { getUploadUrl, uploadProduct } from './actions';
import { useFormState } from 'react-dom';
import { resolve } from 'path';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ProductType, productSchema } from './schema';

/*
  게시할때 URL 을 받으면 오래 걸릴 수 있기 때문에 사진을 선택할때 업로드 URL을 받아올 수 있음
  유저가 사용하지 않으면 one-time upload URL은 사라짐
*/
export default function AddProduct() {
  const [preview, setPreview] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');
  //cloudflare image
  const [photoId, setPhotoId] = useState('');

  // react hook form 강의 관련
  const { register, handleSubmit } = useForm<ProductType>({
    resolver: zodResolver(productSchema),
  });

  const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
    //cloud flare 부분
    const { success, result } = await getUploadUrl();
    if (success) {
      const { id, uploadURL } = result;
      setUploadUrl(uploadURL);
      setPhotoId(id);
    }
  };
  /* 
    uploadProduct action이 실행되기 전에, uploadUrl을 가져와서 이미지를 업로드하고, 그 다음 uploadProduct를 실행
    (input에서 가져온 form data 속의 data를 교체) 
    intercept 만듦 : interceptionAction
    form aciton 실행 > interceptAction 실행 > formData를 받을 수 있음
  */
  const interceptAction = async (_: any, formData: FormData) => {
    //upload image to cloudflare
    const file = formData.get('photo');
    if (!file) {
      return;
    }
    const cloudflareForm = new FormData();
    cloudflareForm.append('file', file);
    const response = await fetch(uploadUrl, {
      method: 'post',
      body: cloudflareForm,
    });
    if (response.status !== 200) {
      return;
      //에러메시지
    }
    //replace 'photo' in formData
    const photoUrl = `https://imagedelivery.net/Slmx2qA8uBDXvxkwhxaZrg/${photoId}`;
    formData.set('photo', photoUrl);

    //call upload product(return upload product 하는게 중요함, 에러를 return 할수도 있기 때문에)
    return uploadProduct(_, formData);
  };
  const [state, action] = useFormState(interceptAction, null);

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
