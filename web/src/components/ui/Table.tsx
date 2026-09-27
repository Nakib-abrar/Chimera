import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cx } from "@/lib/ui";
import s from "./ui.module.css";

export interface Column<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  width?: string;
  /** Hide below a given breakpoint (drops low-priority columns on small screens). */
  hideBelow?: "tablet" | "mobile";
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  defaultSort?: { key: string; dir: "asc" | "desc" };
  emptyLabel?: ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  defaultSort,
  emptyLabel,
}: TableProps<T>) {
  const [sort, setSort] = useState(defaultSort ?? null);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [rows, sort, columns]);

  const toggleSort = (key: string) => {
    setSort((prev) =>
      prev?.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );
  };

  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{ width: c.width }}
                data-hide={c.hideBelow}
              >
                {c.sortValue ? (
                  <button className={s.sortBtn} onClick={() => toggleSort(c.key)} type="button">
                    {c.header}
                    {sort?.key === c.key &&
                      (sort.dir === "asc" ? <ChevronUp /> : <ChevronDown />)}
                  </button>
                ) : (
                  c.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="t-body-sm t-mute" style={{ padding: "var(--space-lg)", textAlign: "center" }}>
                  {emptyLabel ?? "Nothing here yet."}
                </div>
              </td>
            </tr>
          ) : (
            sorted.map((row) => (
              <tr
                key={rowKey(row)}
                className={cx(onRowClick && s.rowClickable)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === "Enter") onRowClick(row);
                      }
                    : undefined
                }
              >
                {columns.map((c) => (
                  <td key={c.key} data-hide={c.hideBelow}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
