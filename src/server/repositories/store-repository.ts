import { getDatabase } from "@/server/db/connection";
import type { Store } from "@/lib/types/domain";
import { mapStore } from "./row-mappers";

export const storeRepository = {
  findByCode(code: string): Store | null {
    const row = getDatabase().prepare("SELECT * FROM stores WHERE code = ?").get(code);
    return row ? mapStore(row as Record<string, unknown>) : null;
  },

  findById(id: string): Store | null {
    const row = getDatabase().prepare("SELECT * FROM stores WHERE id = ?").get(id);
    return row ? mapStore(row as Record<string, unknown>) : null;
  }
};
