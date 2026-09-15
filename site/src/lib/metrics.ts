import client from 'prom-client'

type Metrics = {
    register: client.Registry;
    requestsTotal: client.Counter<"outcome">;
    httpDuration: client.Histogram<"route" | "method" | "status">;
};

const g = globalThis as unknown as {__vanguardMetrics?: Metrics};


function build(): Metrics {
  const register = new client.Registry();
  register.setDefaultLabels({ app: "vanguard-site" });

  // Дефолтні метрики процесу Node: CPU, RSS/heap, event loop lag, GC.
  client.collectDefaultMetrics({ register });

  // Counter — тільки зростає. Лейбл outcome розрізняє підсумок обробки заявки.
  const requestsTotal = new client.Counter({
    name: "vanguard_requests_total",
    help: "Заявки за підсумком обробки",
    labelNames: ["outcome"], // ok | fallback | rate_limited | validation | invalid_json | error
    registers: [register],
  });

  // Histogram — розподіл тривалості обробки по «кошиках» (для p95/p99).
  const httpDuration = new client.Histogram({
    name: "vanguard_http_request_duration_seconds",
    help: "Тривалість HTTP-обробки за маршрутом",
    labelNames: ["route", "method", "status"],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
    registers: [register],
  });

  return { register, requestsTotal, httpDuration };
}

export const metrics = g.__vanguardMetrics ?? (g.__vanguardMetrics = build());