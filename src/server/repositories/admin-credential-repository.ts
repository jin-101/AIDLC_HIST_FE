import { getDatabase } from "@/server/db/connection";
import type { AdminCredential } from "@/lib/types/domain";
import { mapAdminCredential } from "./row-mappers";

export const adminCredentialRepository = {
  findByStore(storeId: string): AdminCredential | null {
    const row = getDatabase().prepare("SELECT * FROM admin_credentials WHERE store_id = ?").get(storeId);
    return row ? mapAdminCredential(row as Record<string, unknown>) : null;
  }
};
