import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase, formatPrice } from "../../lib/supabase";

function useAdminGuard() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("azmayra_admin")) {
      router.replace("/admin");
    }
  }, [router]);
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "azmayra_unsigned";

const emptyProduct = {
  slug: "", name: "", tagline: "", price: "", original_price: "",
  images: "", sizes: "S, M, L, XL", colors: '[{"name":"Hitam","hex":"#1A1A1A"}]',
  description: "", details: "", wa_message: "", featured: false, badge: "", sort_order: 0,
};

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "azmayra");
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST", body: formData,
  });
  const data = await
