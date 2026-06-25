import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CircleNotch } from "@phosphor-icons/react";
import { loginResolver, type LoginDto } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";

export function LoginPage() {
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
    onSuccess: (res) => {
      const { token, user } = res.data.data;
      setToken(token);
      setUser(user);
      toast.success(res.data.message || "Đăng nhập thành công!");
      navigate("/dashboard");
    },
    onError: () => {
      // Lỗi đã được xử lý tập trung tại axios interceptor (toast & logout)
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({
    resolver: loginResolver,
    defaultValues: {
      phone: "0901234567",
      password: "password123",
    },
  });

  const onError = (errs: typeof errors) => {
    const firstError = Object.values(errs).find((err) => err.message);
    if (firstError?.message) toast.error(firstError.message as string);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-6 md:p-10">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src="/orderly-icon.svg" alt="Orderly" className="size-12" />
            </div>
            <CardTitle className="text-2xl">Đăng nhập hệ thống</CardTitle>
            <CardDescription>
              Nhập số điện thoại và mật khẩu của bạn để truy cập Orderly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((data) => mutate(data), onError)}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="phone">Số điện thoại</FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0901234567"
                    {...register("phone")}
                    disabled={isPending}
                  />
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-primary"
                    >
                      Quên mật khẩu?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    disabled={isPending}
                  />
                </Field>
                <Field className="pt-2">
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <CircleNotch className="mr-2 animate-spin" />}
                    Đăng nhập
                  </Button>
                  <FieldDescription className="text-center mt-2">
                    Chưa có tài khoản?{" "}
                    <a href="#" className="text-primary hover:underline">
                      Liên hệ quản trị viên
                    </a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
