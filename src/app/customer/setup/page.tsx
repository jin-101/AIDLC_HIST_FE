"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CustomerShell } from "@/components/customer/customer-shell";
import { useTableContext } from "@/features/customer/use-table-context";

export default function CustomerSetupPage() {
  const router = useRouter();
  const { context, state, errorMessage, submitSetup } = useTableContext();
  const [storeCode, setStoreCode] = useState("demo-store");
  const [tableNumber, setTableNumber] = useState("1");
  const [tablePassword, setTablePassword] = useState("table-1");

  useEffect(() => {
    if (context) router.push("/customer/menu");
  }, [context, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = await submitSetup({ storeCode, tableNumber, tablePassword });
    if (next) router.push("/customer/menu");
  }

  return (
    <CustomerShell tableContext={context} cartCount={0}>
      <section className="panel">
        <h2>테이블 설정</h2>
        <form className="form-grid" data-testid="table-setup-form" onSubmit={onSubmit}>
          <label>
            매장 코드
            <input
              data-testid="table-setup-store-code-input"
              value={storeCode}
              onChange={(event) => setStoreCode(event.target.value)}
              required
            />
          </label>
          <label>
            테이블 번호
            <input
              data-testid="table-setup-table-number-input"
              value={tableNumber}
              onChange={(event) => setTableNumber(event.target.value)}
              required
            />
          </label>
          <label>
            테이블 비밀번호
            <input
              data-testid="table-setup-password-input"
              type="password"
              value={tablePassword}
              onChange={(event) => setTablePassword(event.target.value)}
              required
            />
          </label>
          {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
          <button data-testid="table-setup-submit-button" disabled={state === "loading"} type="submit">
            {state === "loading" ? "확인 중" : "주문 시작"}
          </button>
        </form>
      </section>
    </CustomerShell>
  );
}
