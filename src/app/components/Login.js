"use client";

import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { Typography, Button, Box, Alert } from "@mui/material";
import { FaLightbulb, FaSolarPanel, FaLeaf } from 'react-icons/fa';

const Login = () => {
  const router = useRouter();
  const [accessDenied, setAccessDenied] = useState(false);

  const handleLoginSuccess = (response) => {
    const token = response.credential;
    const decoded = jwtDecode(token);
    const email = decoded.email;
    const organization = email.split("@")[1];

    if (organization === "goa.bits-pilani.ac.in") {
      localStorage.setItem("token", token);
      router.push("/");
    } else {
      setAccessDenied(true);
    }
  };

  const handleLoginFailure = (error) => {
    console.log("Login Failed:", error);
  };

  return (
    <div className="min-h-screen flex bg-[#04080F]">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex justify-center mb-8">
              <div className="bg-[#507DBC] p-4 rounded-full">
                <FaLightbulb className="text-[#FFFFFF] text-4xl" />
              </div>
            </div>
            <Typography
              variant="h3"
              className="mt-6 text-center text-[#507DBC] font-bold"
            >
              Welcome to WattWise
            </Typography>
            <Typography
              variant="body1"
              className="mt-2 text-[#B8DBD9] text-center"
            >
              Empowering BITS Goa to build a sustainable future
            </Typography>
          </div>

          <div className="mt-8">
            {accessDenied && (
              <Alert severity="error" className="mb-4 bg-red-500 bg-opacity-90 text-white">
                Access Denied. Only BITS Goa email accounts are allowed.
              </Alert>
            )}

            <div className="mt-6">
              <GoogleLogin
                clientId="752300815973-ptjap2259e5m868hggcan5j9plgvbk50.apps.googleusercontent.com"
                onSuccess={handleLoginSuccess}
                onError={handleLoginFailure}
                useOneTap
                render={(renderProps) => (
                  <Button
                    onClick={renderProps.onClick}
                    disabled={renderProps.disabled}
                    variant="contained"
                    fullWidth
                    className="bg-[#507DBC] hover:bg-[#3A5A8C] text-[#FFFFFF] py-3 rounded-full text-lg font-semibold transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Login with Google
                  </Button>
                )}
              />
            </div>
          </div>

          <Typography
            variant="body2"
            className="mt-6 text-[#B8DBD9] text-center"
          >
            By logging in, you agree to our Terms of Service and Privacy Policy.
          </Typography>
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 h-full w-full bg-[#04080F] flex items-center justify-center">
          <div className="text-center">
            <div className="flex justify-center space-x-8 mb-8">
              <FaSolarPanel className="text-[#507DBC] text-6xl" />
              <FaLeaf className="text-[#B8DBD9] text-6xl" />
            </div>
            <Typography variant="h4" className="text-[#FFFFFF] font-bold mb-4">
              Monitor. Analyze. Optimize.
            </Typography>
            <Typography variant="body1" className="text-[#B8DBD9] max-w-md mx-auto">
              Join us in our mission to create a more sustainable BITS Goa. 
              Together, we can make a difference in energy consumption and environmental impact.
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;