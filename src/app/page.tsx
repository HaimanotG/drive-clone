"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CloudUpload, Folder, Shield, Zap } from "lucide-react";
import { createAuthClient } from "better-auth/client";
import { useAuth } from "@/hooks/useAuth";
import { redirect } from "next/navigation";
import "./global.css";

const signInWithGoogle = async () => {
  const authClient = createAuthClient();
  await authClient.signIn.social({
    provider: "google",
  });
};

export default function Landing() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return redirect("/home");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mx-auto mb-6">
            <CloudUpload className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Drive Clone
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Store, organize, and share your files securely in the cloud. Access
            your documents from anywhere, anytime.
          </p>

          <div className="space-y-4">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg relative"
              onClick={signInWithGoogle}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin inline-block mr-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </span>
                  Signing in...
                </>
              ) : (
                "Get Started - Sign In"
              )}
            </Button>
            <p className="text-sm text-gray-500">
              Sign in with your account to access your files
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CloudUpload className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Upload</h3>
              <p className="text-gray-600">
                Drag and drop files or upload from your device with just a few
                clicks.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Folder className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Organize</h3>
              <p className="text-gray-600">
                Create folders and organize your files exactly how you want
                them.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure</h3>
              <p className="text-gray-600">
                Your files are protected with enterprise-grade security and
                encryption.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-50 rounded-full px-6 py-3">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="text-blue-700 font-medium">
              10GB of free storage included
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
