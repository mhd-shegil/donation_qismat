import { useState } from "react";
import Hero from "@/components/Hero";
import DonationForm from "@/components/DonationForm";
import ThankYou from "@/pages/ThankYou";

const Index = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [donorData, setDonorData] = useState({ name: "", quantity: "", total: "" });

  const handleSuccess = (name: string, quantity: string, total: string) => {
    setDonorData({ name, quantity, total });
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setDonorData({ name: "", quantity: "", total: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <main className="container mx-auto py-12 px-4">
        {isSubmitted ? (
          <ThankYou 
            name={donorData.name} 
            quantity={donorData.quantity}
            total={donorData.total}
            onReset={handleReset}
          />
        ) : (
          <DonationForm onSuccess={handleSuccess} />
        )}
      </main>
      <footer className="bg-muted/30 border-t border-border mt-16 py-8">
        <div className="container mx-auto text-center text-muted-foreground">
          <p className="text-sm">
            © 2024 Qismat NGO. Empowering communities through education.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
