"use client";

import { ChangeEvent, FormEvent, ReactNode, useCallback, useEffect, useState } from "react";
import { api, Paginated } from "@/lib/api";
import { ErrorBox, inputCls, btnPrimary, btnGhost, card } from "@/components/PageShell";

export interface Option {
  value: number | string;
  label: string;
}
export interface Field {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "checkbox" | "select";
  required?: boolean;
  options?: Option[];
  hint?: string;
  full?: boolean; // chiếm cả hàng
}
export interface Column<T> {
  label: string;
  render: (row: T) => ReactNode;
}
export interface FilterDef {
  key: string;
  label: string;
  options: Option[];
}
export type FormState = Record<string, string | boolean>;

interface Props<T extends { id: number }> {
  title: string;
  noun: string; // "sản phẩm", "thương hiệu"…
  endpoint: string; // "/admin/products"
  columns: Column<T>[];
  fields: Field[];
  blank: FormState;
  toForm: (row: T) => FormState;
  filters?: FilterDef[];
}

export default function ResourceManager<T extends { id: number }>({
  title,
  noun,
  endpoint,
  columns,
  fields,
  blank,
  toForm,
  filters = [],
}: Props<T>) {
  const [data, setData] = useState<Paginated<T> | null>(null);
  const [q, setQ] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  // null = đóng form; "new" = thêm mới; còn lại là dòng đang sửa
  const [editing, setEditing] = useState<T | "new" | null>(null);
  const [form, setForm] = useState<FormState>(blank);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    const p = new URLSearchParams({ page: String(page) });
    if (q.trim()) p.set("q", q.trim());
    Object.entries(filterValues).forEach(([k, v]) => v && p.set(k, v));
    api<Paginated<T>>(`${endpoint}?${p}`)
      .then((r) => {
        setData(r);
        setError("");
      })
      .catch((e) => setError(e.message));
  }, [endpoint, page, q, filterValues]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const openNew = () => {
    setForm(blank);
    setFormError("");
    setEditing("new");
  };
  const openEdit = (row: T) => {
    setForm(toForm(row));
    setFormError("");
    setEditing(row);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    const payload: Record<string, unknown> = {};
    for (const f of fields) {
      const v = form[f.key];
      if (f.type === "checkbox") payload[f.key] = Boolean(v);
      else if (f.type === "number" || f.type === "select")
        payload[f.key] = v === "" || v === undefined ? null : Number(v);
      else payload[f.key] = String(v ?? "").trim() === "" ? null : String(v).trim();
    }

    try {
      if (editing === "new") {
        await api(endpoint, { method: "POST", body: payload });
        setOk(`Đã thêm ${noun}`);
      } else if (editing) {
        await api(`${endpoint}/${editing.id}`, { method: "PUT", body: payload });
        setOk(`Đã cập nhật ${noun}`);
      }
      setEditing(null);
      load();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: T) => {
    if (!confirm(`Xóa ${noun} này? Thao tác không thể hoàn tác.`)) return;
    setError("");
    setOk("");
    try {
      await api(`${endpoint}/${row.id}`, { method: "DELETE" });
      setOk(`Đã xóa ${noun}`);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const setField = (k: string) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target instanceof HTMLInputElement && e.target.type === "checkbox" ? e.target.checked : e.target.value });

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">{title}</h1>
        <button onClick={openNew} className={btnPrimary}>+ Thêm {noun}</button>
      </div>

      <ErrorBox message={error} />
      {ok && <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{ok}</p>}

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder={`Tìm ${noun}…`}
          className={`${inputCls} max-w-sm`}
        />
        {filters.map((f) => (
          <select
            key={f.key}
            value={filterValues[f.key] ?? ""}
            onChange={(e) => { setFilterValues({ ...filterValues, [f.key]: e.target.value }); setPage(1); }}
            className={`${inputCls} max-w-[200px]`}
            aria-label={f.label}
          >
            <option value="">{f.label}: tất cả</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        ))}
      </div>

      <div className={`${card} overflow-x-auto !p-0`}>
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              {columns.map((c) => (
                <th key={c.label} className="p-3">{c.label}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {data?.data.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                {columns.map((c) => (
                  <td key={c.label} className="p-3 align-middle">{c.render(row)}</td>
                ))}
                <td className="whitespace-nowrap pr-3 text-right">
                  <button onClick={() => openEdit(row)} className="mr-3 font-medium text-blue-600 hover:underline">Sửa</button>
                  <button onClick={() => remove(row)} className="text-red-600 hover:underline">Xóa</button>
                </td>
              </tr>
            ))}
            {!data && !error && (
              <tr><td colSpan={columns.length + 1} className="p-6 text-center text-slate-500">Đang tải…</td></tr>
            )}
            {data && data.data.length === 0 && (
              <tr><td colSpan={columns.length + 1} className="p-6 text-center text-slate-500">Chưa có {noun} nào</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.last_page > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className={`${btnGhost} disabled:opacity-40`}>Trang trước</button>
          <span>Trang {data.current_page} / {data.last_page}</span>
          <button disabled={page >= data.last_page} onClick={() => setPage(page + 1)} className={`${btnGhost} disabled:opacity-40`}>Trang sau</button>
        </div>
      )}

      {/* ---------- Form thêm / sửa ---------- */}
      {editing && (
        <div
          className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4"
          onClick={() => setEditing(null)}
        >
          <form
            role="dialog"
            aria-label={editing === "new" ? `Thêm ${noun}` : `Sửa ${noun}`}
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6"
          >
            <h2 className="mb-4 text-xl font-extrabold">
              {editing === "new" ? `Thêm ${noun}` : `Sửa ${noun}`}
            </h2>
            <ErrorBox message={formError} />

            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((f) => (
                <label
                  key={f.key}
                  className={`block text-sm ${f.full || f.type === "textarea" ? "sm:col-span-2" : ""}`}
                >
                  {f.type === "checkbox" ? (
                    <span className="flex items-center gap-2 pt-6">
                      <input type="checkbox" checked={Boolean(form[f.key])} onChange={setField(f.key)} className="h-4 w-4" />
                      {f.label}
                    </span>
                  ) : (
                    <>
                      {f.label}
                      {f.required && <span className="text-red-600"> *</span>}
                      {f.type === "textarea" ? (
                        <textarea rows={4} value={String(form[f.key] ?? "")} onChange={setField(f.key)} className={`${inputCls} mt-1`} />
                      ) : f.type === "select" ? (
                        <select required={f.required} value={String(form[f.key] ?? "")} onChange={setField(f.key)} className={`${inputCls} mt-1`}>
                          <option value="">— Chọn —</option>
                          {f.options?.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={f.type === "number" ? "number" : "text"}
                          min={f.type === "number" ? 0 : undefined}
                          required={f.required}
                          value={String(form[f.key] ?? "")}
                          onChange={setField(f.key)}
                          className={`${inputCls} mt-1`}
                        />
                      )}
                      {f.hint && <span className="mt-1 block text-xs text-slate-500">{f.hint}</span>}
                    </>
                  )}
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className={btnGhost}>Hủy</button>
              <button disabled={saving} className={btnPrimary}>{saving ? "Đang lưu…" : "Lưu"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

/* Nhãn trạng thái dùng chung cho các bảng */
export function StatusBadge({ on, onText = "Hiển thị", offText = "Đang ẩn" }: { on: boolean | number; onText?: string; offText?: string }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${on ? "bg-emerald-100 text-emerald-900" : "bg-slate-200 text-slate-700"}`}>
      {on ? onText : offText}
    </span>
  );
}
