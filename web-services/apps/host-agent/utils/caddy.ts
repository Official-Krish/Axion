const CADDY_ADMIN = "http://localhost:2019";

export async function caddyAddRoute(
  jobId: string,
  domain: string,
  containerName: string,
  port: number,
): Promise<void> {
  const route = {
    "@id": jobId,
    match: [{ host: [domain] }],
    handle: [
      {
        handler: "reverse_proxy",
        upstreams: [{ dial: `${containerName}:${port}` }],
      },
    ],
  };

  const res = await fetch(
    `${CADDY_ADMIN}/config/apps/http/servers/srv0/routes`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(route),
    },
  );

  if (!res.ok && res.status !== 409) {
    const text = await res.text();
    throw new Error(`Caddy add route failed (${res.status}): ${text}`);
  }
}

export async function caddyRemoveRoute(jobId: string): Promise<void> {
  const res = await fetch(`${CADDY_ADMIN}/id/${jobId}`, {
    method: "DELETE",
  });

  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`Caddy remove route failed (${res.status}): ${text}`);
  }
}
