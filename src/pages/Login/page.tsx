import { LoginForm } from "./components/LoginForm";
import { useLocation } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Login = () => {
  const location = useLocation();
  const errorMessage = location.state?.message;

  return (
    <section className="flex flex-col items-center justify-center bg-neutral-100 h-[100vh] lg:bg-white lg:py-40 scrollable-content">
      <div className="w-full lg:w-fit p-5 flex flex-col gap-6 items-center   bg-neutral-100  lg:rounded-3xl sm:border-amber-300 lg:shadow-md ">
        <img src="/logo2.png" className="w-3xs animate-pulse" />
        <h1 className="text-blue-950 uppercase text-center text-2xl font-bold w-96 animate-pulse">
          Login{" "}
        </h1>
        
        {errorMessage && (
          <Alert className="w-full max-w-md">
            <AlertDescription className="text-red-600">
              ⚠️ {errorMessage}
            </AlertDescription>
          </Alert>
        )}
        
        <LoginForm />
      </div>
    </section>
  );
};
