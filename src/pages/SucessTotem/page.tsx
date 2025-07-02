import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const SucessFormTotem = () => {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(3);
  const TOTAL_SECONDS = 10;

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    if (secondsLeft <= 0) {
      clearInterval(intervalId);
      navigate(-1);
    }

    return () => clearInterval(intervalId);
  }, [secondsLeft, navigate]);
  const progressValue = Math.round(
    ((TOTAL_SECONDS - secondsLeft) / TOTAL_SECONDS) * 100
  );
  return (
    <section
      className="w-full h-[100vh]  p-5 flex flex-col justify-around items-center  bg-neutral-100  "
      style={{
        backgroundImage:
          "linear-gradient(rgba(15, 35, 72, 1), rgba(15, 35, 72, 0.65)), url(/logo.png)",
        backgroundColor: "#0f2348",
      }}
    >
      <div className="flex flex-col items-center justify-center space-y-4 bg-white p-8 rounded-3xl shadow-lg">
        <img src="/logo2.png" className="w-3xs" />
        <h1 className="text-green-600 uppercase text-center text-2xl font-bold w-96">
          Inscrição realizada com sucesso!{" "}
        </h1>

        <h2 className="text-2xl w-96 text-center text-gray-700">
          Sua inscrição foi concluída com sucesso, verifique o e-mail cadastrado
          para mais informações.
        </h2>
        <div className="flex flex-col items-center space-y-2 mt-8 px-4">
          <p className="text-lg font-medium">
            Proximo cadastro em {secondsLeft} segundo{secondsLeft !== 1 && "s"}…
          </p>
          <Progress value={progressValue} className="w-full max-w-xs" />
        </div>
        <p className="py-4 px-8 text-white text-3xl bg-blue-950 flex justify-center items-center rounded-2xl h-9">
          Rerire seu crachá na recepção
        </p>
      </div>
    </section>
  );
};
