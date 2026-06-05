"use client";

import { Suspense } from "react";
import PNRStatusContent from "./PNRStatusContent";

export default function PNRStatusPage() {
  return (
    <Suspense>
      <PNRStatusContent />
    </Suspense>
  );
}