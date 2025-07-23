import { Card, CardContent } from "@/components/ui/card";
import { EnhancedTableConsultant } from "./Table";
import { PopupOverlay } from "./PopupOverlay";
import { HeaderBanner } from "./HeaderBanner";

export const ConsultantPage = () => {
  const headerHeight = 140; // deve bater com o height do HeaderBanner

  return (
    <div style={{ paddingTop: `${headerHeight}px` }}>
      <HeaderBanner />
      <PopupOverlay />
      <Card>
        <CardContent>
          <EnhancedTableConsultant />
        </CardContent>
      </Card>
    </div>
  );
};
