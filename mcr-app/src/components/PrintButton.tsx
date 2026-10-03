"use client";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="rounded-md border border-line bg-white px-4 py-2 text-sm font-medium">
      Print / save PDF
    </button>
  );
}
