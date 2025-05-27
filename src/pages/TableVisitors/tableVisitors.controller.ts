/* eslint-disable @typescript-eslint/no-unused-vars */

import { useVisitorsService } from "@/service/visitors.service";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

export const useTableVisitorsController = () => {
  const fairId = useSearchParams()[0].get("fairId") ?? "";
  const { getVisitors, loading, visitors, deleteVisitor } =
    useVisitorsService();
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    if (!search) return visitors;
    const term = search.toLowerCase();

    return visitors.filter((visitor) =>
      Object.entries(visitor).some(([key, value]) => {
        const str = Array.isArray(value) ? value.join(", ") : String(value);
        return str.toLowerCase().includes(term);
      })
    );
  }, [search, visitors]);

  const handleDelete = async (id: string) => {
    const result = await deleteVisitor(id);
    if (!result) return;
    getVisitors(fairId);
  };

  useEffect(() => {
    getVisitors(fairId);
  }, [fairId]);

  return {
    loading,
    setSearch,
    filteredData,
    search,
    handleDelete,
  };
};
