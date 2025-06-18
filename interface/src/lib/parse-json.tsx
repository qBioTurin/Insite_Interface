"use client"; // se sei in un file dentro /app di Next.js 13+

import React from "react";

export default function DownloadJsonButton() {
  const handleDownload = () => {
    // 1. Crea un oggetto dinamico
    const data = {
      name: "Mario",
      age: 30,
      timestamp: new Date().toISOString(),
    };

    // 2. Converti in JSON
    const json = JSON.stringify(data, null, 2);

    // 3. Crea un blob
    const blob = new Blob([json], { type: "application/json" });

    // 4. Crea un URL temporaneo
    const url = URL.createObjectURL(blob);

    // 5. Crea un link invisibile e fai partire il download
    const a = document.createElement("a");
    a.href = url;
    a.download = "dati.json"; // nome del file
    a.click();

    // 6. Libera la memoria
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Scarica JSON
    </button>
  );
}
