import { SignUp } from "@clerk/nextjs";
import React from "react";

const Page = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <SignUp
        appearance={{
          baseTheme: "dark",
        }}
      />
    </div>
  );
};

export default Page;
