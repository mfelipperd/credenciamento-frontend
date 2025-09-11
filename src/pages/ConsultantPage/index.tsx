import { EnhancedTableConsultant } from "./Table";
import { PopupOverlay } from "./PopupOverlay";
import { HeaderBanner } from "./HeaderBanner";
import { FullFooter } from "@/components/Footer";

export const ConsultantPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950 flex flex-col">
      <div className="pt-20 sm:pt-24 lg:pt-28 xl:pt-36">
        <HeaderBanner />
        <PopupOverlay />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <EnhancedTableConsultant />
        </div>
      </div>
      <FullFooter />
    </div>
  );
};
