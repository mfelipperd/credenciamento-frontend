/* eslint-disable @typescript-eslint/no-unused-vars */

import { useVisitorsService } from "@/service/visitors.service";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

export const useTableVisitorsController = () => {
  const fairId = useSearchParams()[0].get("fairId") ?? "";
  const [id, setId] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [openCreateForm, setOpenCreateForm] = useState<boolean>(false);
  const { getVisitors, loading, visitors, deleteVisitor } =
    useVisitorsService();
  const [search, setSearch] = useState("");

  const handleCreateForm = () => {
    setOpenCreateForm((prev) => !prev);
  };

  const handleClick = (checkinId: string) => {
    const params = new URLSearchParams(window.location.search);
    const fairId = params.get("fairId");

    if (!fairId) {
      console.warn("fairId não encontrado na URL.");
      return;
    }

    const url = `${window.location.origin}/visitor/checkin${checkinId}?fairId=${fairId}`;
    window.open(url, "_blank");
  };

  const filteredData = useMemo(() => {
    if (!search) return visitors;
    const term = search.toLowerCase();

    return visitors.filter((visitor) =>
      Object.entries(visitor).some(([_, value]) => {
        const str = Array.isArray(value) ? value.join(", ") : String(value);
        return str.toLowerCase().includes(term);
      })
    );
  }, [search, visitors]);

  const reload = () => {
    getVisitors(fairId);
  };

  const handleDelete = async () => {
    const result = await deleteVisitor(id);
    if (!result) return;
    getVisitors(fairId);
    setIsOpen(false);
  };

  const openDeleteModal = (id: string) => {
    setIsOpen(true);
    setId(id);
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
    isOpen,
    setIsOpen,
    openDeleteModal,
    handleClick,
    reload,
    handleCreateForm,
    openCreateForm,
  };
};
