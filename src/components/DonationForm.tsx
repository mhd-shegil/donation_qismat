import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Loader2, Upload } from "lucide-react";
import axios from "axios";

const BAG_PRICE = 199;

const formSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"),
  userType: z.enum(["student", "other"]),
  institutionName: z.string().trim().optional(),
  municipality: z.string().trim().optional(),
  wardNumber: z.string().trim().optional(),
  quantity: z.string().trim().min(1, "Please enter number of bags"),
});

type FormData = z.infer<typeof formSchema>;

interface DonationFormProps {
  onSuccess: (name: string, quantity: string, total: string) => void;
}

const DonationForm = ({ onSuccess }: DonationFormProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDonationDone, setIsDonationDone] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [userType, setUserType] = useState<"student" | "other" | "">("");
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const quantity = watch("quantity");
  const totalAmount = quantity ? (parseInt(quantity) * BAG_PRICE).toString() : "0";

  // 🧠 Handle UPI payment redirection
  const onSubmit = async (data: FormData) => {
    setIsProcessing(true);

    const total = (parseInt(data.quantity) * BAG_PRICE).toString();
    const upiLink = `upi://pay?pa=76143701@ubin&pn=Qismat%20Foundation&am=${total}&cu=INR&tn=Donation%20for%20Bag%20Challenge`;

    toast({
      title: "Redirecting to UPI App",
      description: "Complete your donation in your UPI app, then upload the screenshot below.",
    });

    // redirect to UPI
    window.location.href = upiLink;

    setTimeout(() => {
      setIsDonationDone(true);
      setIsProcessing(false);
    }, 4000);
  };

  // 🧩 Upload screenshot to backend
  const handleUpload = async () => {
    if (!screenshot) {
      toast({
        title: "No file selected",
        description: "Please select a screenshot to upload.",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", watch("name"));
      formData.append("phone", watch("phone"));
      formData.append("userType", watch("userType"));
      formData.append("institutionName", watch("institutionName") || "");
      formData.append("municipality", watch("municipality") || "");
      formData.append("wardNumber", watch("wardNumber") || "");
      formData.append("quantity", watch("quantity"));
      formData.append("totalAmount", totalAmount);
      formData.append("screenshot", screenshot);

      await axios.post("https://donation-qismat-1.onrender.com/api/registerDonation",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast({
        title: "Upload Successful 🎉",
        description: "Thank you for supporting the Bag Challenge!",
      });

      // Redirect to thank-you page
      window.location.href = "/thank-you";

      // reset states
      setScreenshot(null);
      setIsDonationDone(false);
    } catch (error) {
      console.error("❌ Upload failed:", error);
      toast({
        title: "Upload Failed",
        description: "There was an issue uploading your screenshot. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-[var(--shadow-card)] border-border/50">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-3xl font-bold text-center text-foreground">
          Join the Bag Challenge
        </CardTitle>
        <CardDescription className="text-center text-base text-muted-foreground">
          Each bag at ₹199 helps provide education and skills to underprivileged students
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Basic Details */}
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input placeholder="Enter your name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input placeholder="Enter 10-digit number" {...register("phone")} />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>I am a...</Label>
            <Select
              value={userType}
              onValueChange={(value: "student" | "other") => {
                setUserType(value);
                setValue("userType", value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.userType && (
              <p className="text-sm text-destructive">{errors.userType.message}</p>
            )}
          </div>

          {/* Conditional fields */}
          {userType === "student" && (
            <div className="space-y-2">
              <Label>Institution Name</Label>
              <Input placeholder="Enter institution name" {...register("institutionName")} />
            </div>
          )}

          {userType === "other" && (
            <>
              <div className="space-y-2">
                <Label>Municipality/Panchayat</Label>
                <Input placeholder="Enter municipality name" {...register("municipality")} />
              </div>
              <div className="space-y-2">
                <Label>Ward Name</Label>
                <Input placeholder="Enter ward name" {...register("wardNumber")} />
              </div>
            </>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Number of Bags</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max="100"
              placeholder="Enter number of bags"
              {...register("quantity")}
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            )}

            <div className="flex gap-2 mt-2">
              {["1", "2", "5", "10"].map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setValue("quantity", preset)}
                  className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {preset} {preset === "1" ? "bag" : "bags"}
                </Button>
              ))}
            </div>

            {quantity && parseInt(quantity) > 0 && (
              <div className="mt-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-primary">₹{totalAmount}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {quantity} bag{parseInt(quantity) !== 1 ? "s" : ""} × ₹{BAG_PRICE}
                </p>
              </div>
            )}
          </div>

          {/* QR Code */}
          <div className="text-center mt-6">
           <img
  src="/assets/qr.jpg"
  alt="Scan to pay via UPI"
  className="mx-auto w-40"
/>

            <p className="text-xs text-muted-foreground mt-2">
              Scan the QR code to donate via any UPI app
            </p>
          </div>

          {/* Donate Button */}
          <Button
            type="submit"
            disabled={isProcessing}
            className="w-full mt-6 h-12 text-lg font-semibold"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                <ShoppingBag className="mr-2 h-5 w-5" />
                {quantity ? `Pay ₹${totalAmount}` : "Proceed to Payment"}
              </>
            )}
          </Button>

          {/* Screenshot Upload Section */}
          {isDonationDone && (
            <div className="mt-8 p-4 border rounded-lg bg-muted/30">
              <Label className="text-sm font-medium">Upload Payment Screenshot</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                className="mt-2"
              />
              <Button
                type="button"
                onClick={handleUpload}
                disabled={!screenshot}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
              >
                <Upload className="mr-2 h-5 w-5" /> Upload Screenshot
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default DonationForm;
