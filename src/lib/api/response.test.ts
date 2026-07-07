import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { fail, ok } from "./response";
import { apiPayloadArb } from "@/test/generators/domain-generators";

describe("API response helpers", () => {
  it("성공 응답을 생성한다", () => {
    expect(ok({ id: "1" })).toEqual({ ok: true, data: { id: "1" } });
  });

  it("실패 응답을 생성한다", () => {
    expect(fail("NOT_FOUND", "없음")).toEqual({
      ok: false,
      error: { code: "NOT_FOUND", message: "없음" }
    });
  });

  it("success wrapper는 payload를 보존한다", () => {
    fc.assert(
      fc.property(apiPayloadArb, (payload) => {
        expect(ok(payload).data).toEqual(payload);
      })
    );
  });
});
