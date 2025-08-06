document.getElementById("imgInput").onchange = async function () {
  const file = this.files[0];
  if (!file) return;

  // Use global config if present, else default to 300 KB
  const maxSizeKB = window.IMGRATE_MAX_SIZE_KB || 300;

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
    document.getElementById("preview").src = url;

    // Optional: log size
    blob.arrayBuffer().then((buffer) => {
      const sizeKB = (buffer.byteLength / 1024).toFixed(2);
      console.log(`Optimized to ${sizeKB} KB (target was ${maxSizeKB} KB)`);
    });
  } catch (err) {
    alert("Upload failed: " + err.message);
    console.error(err);
  }

  document.getElementById(
    "statusMsg"
  ).innerText = `✅ Optimized image below ${maxSizeKB} KB loaded.`;
  document.getElementById("preview").hidden = false;
};
