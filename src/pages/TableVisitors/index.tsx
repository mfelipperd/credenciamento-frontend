import { useTableVisitorsController } from "./tableVisitors.controller";

export const TabeleVisitors = () => {
  const controller = useTableVisitorsController();
  console.log(controller.loading);
  return (
    <div>
      <h1>Table Visitors</h1>
      <p>This page will display the visitors of a specific fair.</p>
      {/* Additional components or logic can be added here */}
    </div>
  );
};
