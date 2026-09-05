// Pixel ID diambil dari environment variable
// Set di Vercel Dashboard > Settings > Environment Variables
// Key: NEXT_PUBLIC_PIXEL_ID

export const PIXEL_ID = process.env.NEXT_PUBLIC_PIXEL_ID || "PIXEL_ID_BELUM_DIISI";

export function MetaPixelScript() {
  if (!PIXEL_ID || PIXEL_ID === "PIXEL_ID_BELUM_DIISI") return null;
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img height="1" width="1" style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`} alt="" />
      </noscript>
    </>
  );
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
