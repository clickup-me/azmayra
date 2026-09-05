import { useEffect } from "react";
import { supabase } from "../lib/supabase";

// Load Pixel ID dari Supabase cs_config
async function getPixelId() {
  const { data } = await supabase.from("cs_config").select("value").eq("key", "pixel_id").single();
  return data?.value || process.env.NEXT_PUBLIC_PIXEL_ID || null;
}

function injectPixel(pixelId) {
  if (!pixelId || typeof window === "undefined") return;
  if (window.fbq) return;
  const script = document.createElement("script");
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window,document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init','${pixelId}');
    fbq('track','PageView');
  `;
  document.head.appendChild(script);
}

export function MetaPixelScript() {
  useEffect(() => {
    getPixelId().then(injectPixel);
  }, []);
  return null;
}

export function trackViewContent(product) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", "ViewContent", {
    content_name: product.name,
    content_ids: [product.slug],
    content_type: "product",
    value: product.price,
    currency: "IDR",
  });
}

export function trackContact(product) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", "Contact", {
    content_name: product.name,
    content_ids: [product.slug],
    value: product.price,
    currency: "IDR",
  });
}

export function trackInitiateCheckout(product, size, color) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", "InitiateCheckout", {
    content_name: product.name,
    content_ids: [product.slug],
    content_type: "product",
    value: product.price,
    currency: "IDR",
    num_items: 1,
  });
}
