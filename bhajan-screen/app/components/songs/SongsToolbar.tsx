"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Search, Filter } from "lucide-react";
import { InputField } from "../UI/InputField";
import { SelectField } from "../UI/SelectField";

export default function SongToolbar() {
  const router = useRouter();
  const params = useSearchParams();

  const q = params.get("q") || "";

  const updateQuery = (value: string) => {
    const newParams = new URLSearchParams(params.toString());
    newParams.set("q", value);
    router.push(`?${newParams.toString()}`);
  };

  return (
    <div className="flex gap-3 rounded-3xl border bg-white p-4 mt-25">
      <div className="relative w-full">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <InputField
          defaultValue={q}
          onChange={(e) => updateQuery(e.target.value)}
          placeholder="Search songs..."
          className="pl-10"
        />
      </div>

      <div className="w-48">
        <SelectField
          options={[
            { label: "All", value: "" },
            { label: "Worship", value: "worship" },
            { label: "Praise", value: "praise" },
          ]}
        />
      </div>
    </div>
  );
}