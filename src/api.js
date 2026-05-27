const API_BASE = "https://muster-cartridge-prevent.ngrok-free.dev";

export async function sendChat(prompt, policy) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      policy,
    }),
  });

  if (!res.ok) {
    throw new Error("Chat request failed");
  }

  return res.json();
}

export async function uploadFile(file, policy) {
  const form = new FormData();
  form.append("file", file);
  form.append("enable_web_search", policy.enable_web_search);
  form.append("sanitize_user_input", policy.sanitize_user_input);
  form.append("detect_prompt_injection", policy.detect_prompt_injection);
  form.append("debug", policy.debug);

  const res = await fetch(`${API_BASE}/upload/file`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error("File upload failed");
  }

  return res.json();
}

export async function uploadImage(file, policy) {
  const form = new FormData();
  form.append("image", file);
  form.append("enable_web_search", policy.enable_web_search);
  form.append("sanitize_user_input", policy.sanitize_user_input);
  form.append("detect_prompt_injection", policy.detect_prompt_injection);
  form.append("debug", policy.debug);

  const res = await fetch(`${API_BASE}/upload/image`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error("Image upload failed");
  }

  return res.json();
}
