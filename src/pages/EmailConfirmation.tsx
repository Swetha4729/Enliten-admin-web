import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const EmailConfirmation = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-[#181F2A] to-[#111620]">
      <Card className="w-[450px] bg-[#1A202C] border-gray-700 text-white shadow-2xl shadow-blue-500/10">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-500/10 rounded-full p-3 w-fit">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <CardTitle className="text-3xl font-bold mt-4">Email Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="text-center flex flex-col items-center gap-6">
          <p className="text-gray-400 text-lg">
            Thank you for confirming your email address. Your account is now active.
          </p>
          <Link to="/">
            <Button 
              size="lg" 
              className="bg-[#FFA726] hover:bg-orange-500 text-white font-semibold px-8 py-3 rounded-lg shadow-lg text-lg transition-transform transform hover:scale-105"
            >
              Go to Homepage
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmation;
