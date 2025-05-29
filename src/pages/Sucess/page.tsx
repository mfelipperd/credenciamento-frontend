import { useNavigate } from "react-router-dom";

export const SucessForm = () => {
  const navigate = useNavigate();
  return (
    <section className="w-full h-[100vh]  p-5 flex flex-col justify-around items-center  bg-neutral-100  ">
      <img src="/logo.png" className="w-3xs" />
      <h1 className="text-green-600 uppercase text-center text-2xl font-bold w-96">
        Inscrição realizada com sucesso!{" "}
      </h1>

      <h2 className="text-2xl w-96 text-center text-gray-700">
        Sua inscrição foi concluída com sucesso, verifique o e-mail cadastrado
        para mais informações.
      </h2>
      <a
        href="https://www.expomultimix.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="p-3 text-white bg-blue-950 flex justify-center items-center rounded-2xl h-9"
      >
        Voltar para a página inicial
      </a>
      <div
        onClick={() => navigate(-1)}
        className="text-gray-500 text-xl cursor-pointer hover:underline"
      >
        fazer outro credenciamento
      </div>
    </section>
  );
};
