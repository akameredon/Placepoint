"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

export default function Qr({ text, size = 200, className }: { text: string; size?: number; className?: string }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    QRCode.toString(text, { type: "svg", margin: 1, width: size, errorCorrectionLevel: "M" }).then(setSvg, () => setSvg(""));
  }, [text, size]);
  return <div className={className} style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: svg }} />;
}
