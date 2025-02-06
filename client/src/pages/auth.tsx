import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast();
  const { login, register } = useAuth();
  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
      email: ""
    }
  });

  const onSubmit = async (data: any) => {
    try {
      if (isLogin) {
        await login(data);
      } else {
        await register(data);
      }
      toast({
        title: "Success",
        description: isLogin ? "Logged in successfully" : "Registered successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Authentication failed",
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
            <Input
              placeholder="Username"
              {...form.register("username")}
            />
            {!isLogin && (
              <Input
                type="email"
                placeholder="Email"
                {...form.register("email")}
              />
            )}
            <Input
              type="password"
              placeholder="Password"
              {...form.register("password")}
            />
            <Button type="submit" className="w-full">
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