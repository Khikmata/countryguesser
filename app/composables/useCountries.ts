import type { Country } from "~/types/quiz";
import { mapRestCountry } from "~/utils/countryData";

const LS_KEY = "flags-quiz-countries-cache";
const LS_TS_KEY = "flags-quiz-countries-cache-ts";
const TTL_MS = 1000 * 60 * 60 * 24;

function readLocalCache(): Country[] | null {
  if (!import.meta.client) return null;
  try {
    const ts = Number(localStorage.getItem(LS_TS_KEY) ?? "0");
    if (Date.now() - ts > TTL_MS) return null;
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Country[];
  } catch {
    return null;
  }
}

function writeLocalCache(list: Country[]) {
  if (!import.meta.client) return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
    localStorage.setItem(LS_TS_KEY, String(Date.now()));
  } catch {
    /* quota */
  }
}

export function useCountries() {
  const list = useState<Country[]>("countries-list", () => []);

  const { data, status, error, refresh } = useFetch<unknown[]>("/api/countries", {
    key: "countries-api",
    default: () => [],
  });

  const ready = computed(() => list.value.length > 0);

  function normalize(raw: unknown[]): Country[] {
    const out: Country[] = [];
    for (const el of raw) {
      const cleanedCountry = mapRestCountry(el as Parameters<typeof mapRestCountry>[0]);
      if (cleanedCountry) out.push(cleanedCountry);
    }
    return out;
  }

  watch(
    data,
    (raw) => {
      if (!raw?.length) return;
      const next = normalize(raw);
      list.value = next;
      writeLocalCache(next);
    },
    { immediate: true },
  );

  onMounted(() => {
    if (!list.value.length) {
      const cached = readLocalCache();
      if (cached?.length) list.value = cached;
    }
  });

  return {
    countries: list,
    status,
    error,
    refresh,
    ready,
  };
}
