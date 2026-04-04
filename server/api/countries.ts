import fallbackCountries from "../data/countries-fallback.json";
import { getCountries } from "../utils/countries";

type Cache = { t: number; data: unknown[] };
let memory: Cache | null = null;
const TTL_MS = 60 * 60 * 1000;

/** Nuxt maps env `NUXT_COUNTRIES_USE_REMOTE` to this runtime config value. */
function remoteErrorReason(e: unknown): string {
  const err = e as {
    cause?: { code?: string };
    code?: string;
    message?: string;
  };
  const code = err?.cause?.code ?? err?.code;
  const msg = err?.message ?? "unknown error";
  return [code, msg].filter(Boolean).join(" — ");
}

export default defineEventHandler(async (event) => {
  const now = Date.now();
  if (memory && now - memory.t < TTL_MS) return memory.data;

  const tryRemote = useRuntimeConfig().countriesUseRemote;

  if (!tryRemote) {
    const data = fallbackCountries as unknown[];
    memory = { t: now, data };
    return data;
  }

  try {
    const countries = await getCountries(event);
    memory = { t: now, data: countries };
    return countries;
  } catch (e) {
    const reason = remoteErrorReason(e);
    console.error("[api/countries] Remote fetch failed:", reason);
    const data = fallbackCountries as unknown[];
    memory = { t: now, data };
    return data;
  }
});
