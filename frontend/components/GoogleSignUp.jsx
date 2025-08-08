"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const GoogleSignUp = ({form}) => {
    const {toast}=useToast();
    const [user,setUser]=useState(null);
  const responseGoogle = async (result) => {
   try{
     console.log("Google result:", result);
     const code=result.code
    if(code){
        const data={
            code
        }
        console.log(data);
        const response=await axios.post("https://campusbites-mxpe.onrender.com/api/v1/users/google",data);
        if(!response.data.success){
            throw new Error(response.data.message)
        }
        setUser((response.data.data))
        toast({
        variant: "destructive", 
        title: "Google verification done",
        description: "Please fill in the remaining details to complete your registration.",
        });

        
    }
   }
   catch(err){
    console.log(err)
      toast({
        variant: "default",
        title: "Registration failed",
        description: err instanceof Error ? err.message : "An error occurred during registration. Please try again.",
      })
   }
  
  };
   useEffect(()=>{
       if(user){
         form.setValue("name",user.name);
        form.setValue("email",user.email);
       }
   },[user]);
  const handleGoogleSignIn = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: (error) => {
      console.error("Login Failed:", error);
    },
    flow: "auth-code",
  });

  return (
    <Button
      onClick={() => handleGoogleSignIn()}
      variant="outline"
      className="w-full bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/20 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
    >
      <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
        <path
          fill="#FFC107"
          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
          c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
          s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        />
        <path
          fill="#FF3D00"
          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
          C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        />
        <path
          fill="#4CAF50"
          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
          c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
        />
        <path
          fill="#1976D2"
          d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.089,5.571l6.19,5.238
          C43.021,36.697,44,34.0,44,30C44,22.659,43.862,21.35,43.611,20.083z"
        />
      </svg>
      Sign up with Google
    </Button>
  );
};

export default GoogleSignUp;
