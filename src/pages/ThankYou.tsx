import React from "react";
import { Button } from "@/components/ui/button";

const ThankYou = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-green-100 text-center p-6">
      <h1 className="text-4xl font-bold text-green-700 mb-4">🎉 Thank You!</h1>
      <p className="text-lg text-gray-700 max-w-md mb-6">
        Your donation has been received successfully.  
        Your contribution helps empower slum students through education and technology. 💚
      </p>
      <Button onClick={() => (window.location.href = "/")}>
        Go Back to Home
      </Button>
    </div>
  );
};

export default ThankYou;
