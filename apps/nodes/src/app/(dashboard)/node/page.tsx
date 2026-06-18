"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NodeHomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/node/nodes");
  }, [router]);

  return null;
}
