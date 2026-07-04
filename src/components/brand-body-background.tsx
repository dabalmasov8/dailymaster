"use client";

import { useEffect } from "react";

const BRAND_COLOR = "#E25B00";

export function BrandBodyBackground() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.backgroundColor;
    const prevBody = body.style.backgroundColor;
    html.style.backgroundColor = BRAND_COLOR;
    body.style.backgroundColor = BRAND_COLOR;
    return () => {
      html.style.backgroundColor = prevHtml;
      body.style.backgroundColor = prevBody;
    };
  }, []);

  return null;
}
