import { SignIn } from "@clerk/nextjs";
import React from "react";

const Page = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <SignIn
        appearance={{
          baseTheme: "dark",
        }}
      />
    </div>
  );
};

export default Page;
