import { useState } from "react";

export const useCheckboxTableControl = <T extends { id?: string | number }>(
  items: T[] = []
) => {
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleSelectRow = (id?: string | number) => {
    if (id === undefined) return;
    const itemId = String(id);
    setSelectedRows((prev) =>
      prev.includes(itemId)
        ? prev.filter((sid) => sid !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      const allIds = items
        .map((rev) => rev.id)
        .filter((id): id is string | number => id !== undefined)
        .map((id) => String(id));
      setSelectedRows(allIds);
    }
    setSelectAll((prev) => !prev);
  };

  const clearSelection = () => {
    setSelectedRows([]);
    setSelectAll(false);
  };

  const isAllSelected =
    items.length > 0 &&
    selectedRows.length === items.filter((rev) => rev.id !== undefined).length;

  const selectedItems = items.filter(
    (rev) => rev.id !== undefined && selectedRows.includes(String(rev.id))
  );

  return {
    selectedRows,
    selectAll,
    handleSelectAll,
    handleSelectRow,
    isAllSelected,
    selectedItems,
    clearSelection,
  };
};
