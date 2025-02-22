import React from "react";
import Header from "@/components/header";

const AuthLayout = ({ children }) => {
  return (
    <div>
      <Header />
      <div className="bg-black flex justify-center">{children}</div>
    </div>
  );
};

export default AuthLayout;
