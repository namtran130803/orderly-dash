import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const loginSchema = z.object({
  phone: z.string()
    .min(1, 'Số điện thoại không được để trống')
    .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});

export const loginResolver = zodResolver(loginSchema);

export type LoginDto = z.infer<typeof loginSchema>;
