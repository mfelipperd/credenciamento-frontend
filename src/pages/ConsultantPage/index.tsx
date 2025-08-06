import { EnhancedTableConsultant } from "./Table";
import { PopupOverlay } from "./PopupOverlay";
import { HeaderBanner } from "./HeaderBanner";

export const ConsultantPage = () => {
  return (
    <div className="pt-20 sm:pt-24 lg:pt-28 xl:pt-36">
      <HeaderBanner />
      <PopupOverlay />
      <div className="container mx-auto px-4 py-8">
        <EnhancedTableConsultant />
      </div>
    </div>
  );
};
