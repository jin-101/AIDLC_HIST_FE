import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home-page">
      <section>
        <p className="eyebrow">Table Order MVP</p>
        <h1>테이블 주문 프로토타입</h1>
        <p>고객 주문과 관리자 운영 흐름을 함께 확인할 수 있습니다.</p>
        <div className="home-actions">
          <Link data-testid="home-customer-setup-link" className="primary-link" href="/customer/setup">
            고객 주문 시작
          </Link>
          <Link data-testid="home-admin-login-link" className="primary-link secondary" href="/admin/login">
            관리자 로그인
          </Link>
        </div>
      </section>
    </main>
  );
}
