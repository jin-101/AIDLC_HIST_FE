"use client";

import { useCallback, useState } from "react";
import type { CartState, SubmitResult, SubmitState, TableContext } from "@/features/customer/types";
import { submitOrder } from "@/features/customer/customer-api";
import { customerErrorMessage } from "@/features/customer/customer-error-messages";
import { clearCartItems, toOrderDraft } from "@/features/cart/cart-service";
import { writeCart } from "@/features/cart/cart-storage";

export function useOrderSubmit(context: TableContext | null, cart: CartState | null, onCartCleared: (cart: CartState) => void) {
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const submit = useCallback(async () => {
    if (!context || !cart || state === "submitting") return null;

    setState("submitting");
    setErrorMessage(null);
    try {
      const next = await submitOrder(toOrderDraft(context, cart));
      const emptyCart = clearCartItems(cart);
      writeCart(emptyCart);
      onCartCleared(emptyCart);
      setResult(next);
      setState("succeeded");
      return next;
    } catch (error) {
      setErrorMessage(customerErrorMessage(error, "주문에 실패했습니다. 장바구니는 유지됩니다."));
      setState("failed");
      return null;
    }
  }, [cart, context, onCartCleared, state]);

  return { state, errorMessage, result, submit };
}
