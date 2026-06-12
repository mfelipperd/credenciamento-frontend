import { EnhancedTableConsultant } from "./Table";
import { FullFooter } from "@/components/Footer";

export const ConsultantPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
      <div className="grow">
        <EnhancedTableConsultant />
      </div>
      <FullFooter />
    </div>
  );
};
