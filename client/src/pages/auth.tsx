import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast();
  const { loginMutation, registerMutation, user } = useAuth();
  const [, setLocation] = useLocation();

  const form = useForm({
    resolver: zodResolver(
      isLogin
        ? insertUserSchema.pick({ username: true, password: true })
        : insertUserSchema.omit({ isAdmin: true, created_at: true, updated_at: true })
    ),
    defaultValues: {
      username: "",
      password: "",
      email: ""
    }
  });

  if (user) {
    setLocation(user.isAdmin ? '/admin/dashboard' : '/');
    return null;
  }

  const onSubmit = async (data: any) => {
    try {
      if (isLogin) {
        await loginMutation.mutateAsync({
          username: data.username,
          password: data.password
        });
      } else {
        await registerMutation.mutateAsync({
          ...data,
          isAdmin: false // Regular users can't register as admin
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Authentication failed",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">
            {isLogin ? "Login" : "Register"}
          </h1>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                placeholder="Username"
                {...form.register("username")}
              />
              {form.formState.errors.username && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            {!isLogin && (
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
            )}

            <div>
              <Input
                type="password"
                placeholder="Password"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loginMutation.isPending || registerMutation.isPending}
            >
              {isLogin ? "Login" : "Register"}
            </Button>
          </form>

          <Button
            variant="link"
            className="w-full mt-4"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Need an account? Register" : "Have an account? Login"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}