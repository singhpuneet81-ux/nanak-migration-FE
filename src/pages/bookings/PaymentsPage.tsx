import { useQuery } from "@tanstack/react-query";
import { getBookingPayments, fday, ftime, fm } from "@/lib/api";
import { ListLoaderCard } from "@/components/runway/ListLoader";
import { PaginationBar, usePagination } from "@/components/runway/Pagination";

export default function PaymentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["booking-payments"],
    queryFn: getBookingPayments,
  });
  const pager = usePagination(data?.payments ?? []);

  if (isLoading || !data) {
    return (
      <>
        <div className="mb-5">
          <h1 className="page-title">Consultation payments</h1>
          <p className="mt-1 text-[13px] text-muted">
            Stripe payments for paid consults booked on the website.
          </p>
        </div>
        <ListLoaderCard label="Loading payments…" />
      </>
    );
  }

  return (
    <>
      <div className="mb-5">
        <h1 className="page-title">Consultation payments</h1>
        <p className="mt-1 text-[13px] text-muted">
          Successful Stripe payments from the book-consultation popup. Free consults are not listed here.
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <div className="card p-3.5">
          <div className="text-[11px] font-semibold uppercase text-muted">Payments done</div>
          <div className="text-2xl font-bold text-ok">{data.kpis.paidCount}</div>
        </div>
        <div className="card p-3.5">
          <div className="text-[11px] font-semibold uppercase text-muted">Pending checkout</div>
          <div className="text-2xl font-bold">{data.kpis.pendingCount}</div>
        </div>
        <div className="card p-3.5">
          <div className="text-[11px] font-semibold uppercase text-muted">Revenue (AUD)</div>
          <div className="text-2xl font-bold">{fm(data.kpis.totalAud)}</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface/60 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Consult</th>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {pager.slice.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-muted">
                  No paid consultations yet.
                </td>
              </tr>
            ) : (
              pager.slice.map((p) => (
                <tr key={p.id || p._id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-navy">{p.name}</div>
                    <div className="text-xs text-muted">{p.email}</div>
                  </td>
                  <td className="px-4 py-3 text-muted">{p.consultType?.name || p.type}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {fday(p.at)} {ftime(p.at)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {p.payment?.paidAt
                      ? new Date(p.payment.paidAt).toLocaleString("en-AU", {
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-ok">
                    {fm(p.amountAud ?? (p.payment?.amountCents || 0) / 100)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <PaginationBar {...pager} noun="payments" />
      </div>
    </>
  );
}
