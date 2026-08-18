export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Em algumas máquinas Windows, fetch() tenta IPv6 primeiro e trava até
    // dar timeout antes de cair pro IPv4 — isso derrubava o login com Google
    // (a troca do código OAuth por token trava/falha com ETIMEDOUT).
    const { setDefaultResultOrder } = await import("dns");
    setDefaultResultOrder("ipv4first");
  }
}
