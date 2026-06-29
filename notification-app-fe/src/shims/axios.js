export default {
  async post(url, body, config = {}) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.headers ?? {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  },
};