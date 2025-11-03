import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ThankYou = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center px-6">
      <h1 className="text-4xl font-bold text-primary mb-4">Thank You! 🎉</h1>
      <p className="text-muted-foreground text-lg mb-8">
        Your support helps us continue providing education and opportunities to underprivileged children.
      </p>
      <Button onClick={() => navigate("/")}>Back to Home</Button>
    </div>
  );
};

export default ThankYou;
