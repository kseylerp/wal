import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import hikerImage from '@/assets/hiker_mountain.png';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen bg-[#fcf8f5]">
      {/* Auth Form Section */}
      <div className="flex flex-col justify-center w-full px-6 py-12 lg:w-1/2">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Welcome to <span className="text-[#FB8C9A]">Wally</span></h1>
            <p className="mt-2 text-sm text-gray-600">
              Your personal AI travel planner for off-the-beaten-path adventures
            </p>
          </div>

          <Tabs
            defaultValue="login"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <div className="space-y-2 mb-4">
                <h2 className="text-xl font-semibold">Sign in to your account</h2>
                <p className="text-sm text-gray-500">
                  Enter your credentials to access your account
                </p>
              </div>
              <LoginForm />
              <p className="mt-4 text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <button
                  onClick={() => setActiveTab("register")}
                  className="text-[#655590] hover:underline font-medium"
                >
                  Sign up now
                </button>
              </p>
            </TabsContent>
            <TabsContent value="register">
              <div className="space-y-2 mb-4">
                <h2 className="text-xl font-semibold">Create a new account</h2>
                <p className="text-sm text-gray-500">
                  Sign up to save your trip plans and preferences
                </p>
              </div>
              <RegisterForm />
              <p className="mt-4 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <button
                  onClick={() => setActiveTab("login")}
                  className="text-[#655590] hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hero Image Section - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative">
        <div className="absolute inset-0 bg-[#655590]/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="mb-8">
            <img 
              src={hikerImage} 
              alt="Hiker on mountain trail" 
              className="rounded-lg h-[380px] w-auto object-cover shadow-lg"
            />
          </div>
          <div className="text-center max-w-md">
            <h2 className="font-jost text-4xl leading-tight text-white font-bold mb-4">
              GO BEYOND<br />THE POST
            </h2>
            <p className="text-lg">
              Meet <span className="text-[#FB8C9A]">Wally</span>: powered by local guides
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}