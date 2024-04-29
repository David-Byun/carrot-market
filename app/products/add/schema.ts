import { z } from 'zod';

/*
    react hook form을 사용하면서 Zod Schema를 프런트와 백엔드 양쪽에 공유할 수 있음
*/
export const productSchema = z.object({
  photo: z.string({
    required_error: 'Photo is required',
  }),
  title: z.string({
    required_error: 'Title is required',
  }),
  description: z.string({
    required_error: 'Description is required',
  }),
  price: z.coerce.number({
    required_error: 'Price is required',
  }),
});

//schema 에 대한 typescript 를 가져와줌
export type ProductType = z.infer<typeof productSchema>;
