import { CardTotals } from "@/components/CardTotals";

export const Dashboard = () => {
  return (
    <div className="w-ful grid grid-cols-12 gap-4">
      <CardTotals
        className="bg-gray-500 col-span-4 h-20 rounded-2xl"
        title="Total de inscritos"
      />
      <CardTotals
        className="bg-green-600  col-span-4 h-20 rounded-2xl"
        title="Check-ins realizados"
      />
      <CardTotals
        className="bg-yellow-600 col-span-4 h-20 rounded-2xl"
        title="inscritos ausentes"
      />

      <div className="bg-white col-span-8 h-96 rounded-2xl"></div>
      <div className="bg-white col-span-4 h-96  rounded-2xl"></div>
      <div className="bg-white col-span-4 h-96 rounded-2xl"></div>
      <div className="bg-white col-span-4 h-96 rounded-2xl"></div>
      <div className="bg-white col-span-4 h-96  rounded-2xl"></div>
    </div>
  );
};
