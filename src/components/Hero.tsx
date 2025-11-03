import { ShoppingBag } from "lucide-react";
import logo from '../assets/Qismat Dark-foundation.png';  

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-accent to-primary py-20 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="flex items-center justify-center mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <img src={logo} alt="Qismat Logo" className="hero-logo" style={{ width: '200px', height: 'auto', display: 'block', margin: '0 auto' }}/>
        </div>
        <p className="text-xl md:text-2xl text-primary-foreground/95 text-center max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          Join the Bag Challenge - Empowering education and skill development in North India's slum communities
        </p>
        <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <p className="text-primary-foreground/90 text-lg font-medium">
            Each bag at ₹199 creates opportunity
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
