document.getElementById("imgInput").onchange = async function () {
  const file = this.files[0];
  if (!file) return;

  // Use global config if present, else default to 300 KB
  const maxSizeKB = window.IMGRATE_MAX_SIZE_KB || 300;
  const showPreview = window.IMGRATE_SHOW_PREVIEW ?? true; // Default: true

  const formData = new FormData();
  formData.append("image", file);

  document.getElementById("statusMsg").innerHTML =
    "<span class='loading'>Uploading & optimizing...</span>";

  try {
    const res = await fetch(`/optimize?max_size_kb=${maxSizeKB}`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      alert("Optimization failed: " + res.statusText);
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    if (showPreview) {
      let previewImg = document.getElementById("preview");
      if (!previewImg) {
        previewImg = document.createElement("img");
        previewImg.id = "preview";
        document.body.appendChild(previewImg);
      }
      previewImg.src = url;
      previewImg.hidden = false;
    }

    // Optional: log size
    blob.arrayBuffer().then((buffer) => {
      const sizeKB = (buffer.byteLength / 1024).toFixed(2);
      console.log(`Optimized to ${sizeKB} KB (target was ${maxSizeKB} KB)`);
    });

    // Dispatch event if developer wants to use blob
    const optimizedImageEvent = new CustomEvent("imgrate:optimized", {
      detail: { blob, url, fileName: file.name },
    });
    document.dispatchEvent(optimizedImageEvent);
  } catch (err) {
    alert("Upload failed: " + err.message);
    console.error(err);
  }

  document.getElementById(
    "statusMsg"
  ).innerText = `✅ Optimized image below ${maxSizeKB} KB loaded.`;
};
