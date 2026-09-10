"use client";

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="btn btn-primary"
    >
      🖨️ Print to PDF
    </button>
  );
}
