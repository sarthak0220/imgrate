// static/dropin.js
(async function () {
  const input = document.getElementById("imgInput");
  if (!input) {
    console.error("No input with id 'imgInput' found.");
    return;
  }

  input.onchange = async function () {
    const file = this.files[0];
    if (!file) return;

    const maxSizeKB = window.IMGRATE_MAX_SIZE_KB || 300;
    const showPreview = window.IMGRATE_SHOW_PREVIEW ?? true;

    const statusEl = document.getElementById("statusMsg");
    statusEl && (statusEl.innerHTML = "<span class='loading'>Uploading & optimizing...</span>");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`/optimize?max_size_kb=${maxSizeKB}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }

      const contentType = (res.headers.get("content-type") || "").toLowerCase();

      let blob = null;
      let url = null;
      let sizeKB = null;

      if (contentType.includes("application/json")) {
        // Node proxy returned JSON { url, sizeKB }
        const data = await res.json();
        url = data.url || null;
        sizeKB = data.sizeKB || data.size || null;

        // If the proxy returned a URL, try to fetch the image blob (so we can dispatch blob)
        if (url) {
          try {
            const r2 = await fetch(url);
            if (!r2.ok) throw new Error("Failed to fetch uploaded image");
            blob = await r2.blob();
            // prefer blob size if available
            sizeKB = (blob.size / 1024).toFixed(2);
          } catch (err) {
            console.warn("Could not fetch uploaded image to get blob:", err);
            // sizeKB stays as provided by server (if present)
          }
        }
      } else if (contentType.startsWith("image/")) {
        // FastAPI returned the raw image bytes straight through
        blob = await res.blob();
        sizeKB = (blob.size / 1024).toFixed(2);
        url = URL.createObjectURL(blob);
      } else {
        // Unknown content-type: try to read as blob, fallback to text
        try {
          blob = await res.blob();
          sizeKB = (blob.size / 1024).toFixed(2);
          url = URL.createObjectURL(blob);
        } catch (e) {
          const txt = await res.text();
          console.warn("Unknown response from /optimize:", contentType, txt);
          throw new Error("Unexpected /optimize response");
        }
      }

      // show preview if desired and available URL
      if (showPreview && url) {
        let preview = document.getElementById("preview");
        if (!preview) {
          preview = document.createElement("img");
          preview.id = "preview";
          document.body.appendChild(preview);
        }
        preview.src = url;
        preview.hidden = false;
      }

      // Log consistent, accurate size
      console.log(`Optimized to ${sizeKB} KB (target was ${maxSizeKB} KB)`);

      // Dispatch event so integrators can upload/store result
      const detail = { blob, url, sizeKB, fileName: file.name };
      document.dispatchEvent(new CustomEvent("imgrate:optimized", { detail }));

      // Also dispatch uploaded event if we have an uploaded url
      if (url) {
        document.dispatchEvent(new CustomEvent("imgrate:uploaded", {
          detail: { uploadedUrl: url, sizeKB, fileName: file.name }
        }));
      }

      statusEl && (statusEl.innerText = `✅ Optimized ${sizeKB} KB`);
    } catch (err) {
      console.error("Imgrate error:", err);
      statusEl && (statusEl.innerText = `❌ ${err.message}`);
      alert("Optimization/upload failed: " + err.message);
    }
  };
})();
