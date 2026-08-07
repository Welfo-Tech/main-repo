import AdminLayout from "../../components/layout/AdminLayout";
import LiveClock from "../../components/common/LiveClock";
import Link from "next/link";
import CountNumber from "../../components/common/CountNumber";

function StatusBadge({ label, tone }: { label: string; tone: "emerald" | "amber" | "blue" | "rose" | "violet" }) {
  const toneClasses = {
    emerald: "bg-teal-50 text-teal-800 ring-teal-200",
    amber: "bg-stone-100 text-stone-700 ring-stone-200",
    blue: "bg-slate-100 text-slate-700 ring-slate-200",
    rose: "bg-stone-100 text-stone-700 ring-stone-200",
    violet: "bg-stone-100 text-stone-700 ring-stone-200",
  }[tone];

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${toneClasses}`}>
      {label}
    </span>
  );
}

function MetricCard({
  title,
  value,
  note,
  accent,
  trend,
  tone,
}: {
  title: string;
  value: number;
  note: string;
  accent: string;
  trend: string;
  tone: "emerald" | "amber" | "blue" | "rose" | "violet";
}) {
  const toneClasses = {
    emerald: "bg-teal-50 text-teal-800 ring-teal-100",
    amber: "bg-stone-100 text-stone-700 ring-stone-100",
    blue: "bg-slate-100 text-slate-700 ring-slate-200",
    rose: "bg-stone-100 text-stone-700 ring-stone-200",
    violet: "bg-slate-100 text-slate-700 ring-slate-200",
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${toneClasses}`}>
          <span className="text-sm font-bold tracking-wide">{accent}</span>
        </div>
        <StatusBadge label={trend} tone={tone} />
      </div>

      <p className="mt-6 text-sm font-medium uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <div className="mt-2 text-slate-900">
        <CountNumber value={value} />
      </div>
      <p className={`mt-3 text-sm ${tone === "emerald" ? "text-teal-700" : tone === "amber" ? "text-stone-600" : tone === "blue" ? "text-slate-600" : tone === "rose" ? "text-slate-600" : "text-slate-600"}`}>
        {note}
      </p>
    </div>
  );
}

function ActionCard({
  href,
  title,
  description,
  accent,
  tone,
}: {
  href: string;
  title: string;
  description: string;
  accent: string;
  tone: "emerald" | "amber" | "blue" | "rose" | "violet";
}) {
  const toneClasses = {
    emerald: "bg-teal-50 text-teal-800 group-hover:border-teal-300",
    amber: "bg-stone-100 text-stone-700 group-hover:border-stone-300",
    blue: "bg-slate-100 text-slate-700 group-hover:border-slate-300",
    rose: "bg-stone-100 text-stone-700 group-hover:border-stone-300",
    violet: "bg-stone-100 text-stone-700 group-hover:border-stone-300",
  }[tone];

  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-sm"
    >
      <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-transparent text-sm font-bold transition ${toneClasses}`}>
        {accent}
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </Link>
  );
}

export default function AdminPortalPage() {
  const hour = new Date().getHours();

  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const message =
    hour < 12
      ? "Start your day by reviewing today's operations."
      : hour < 17
        ? "12 service cases are currently active."
        : "3 repairs are awaiting quality check.";

  return (
    <AdminLayout>
      <div className="space-y-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-stone-50 p-8 shadow-sm">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white">
                Welfo Admin Dashboard
              </div>

              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-slate-800 lg:text-5xl">
                  {greeting}
                </h1>
                <p className="mt-3 text-lg leading-8 text-slate-500">
                  {message}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <StatusBadge label="Operations Live" tone="emerald" />
                <StatusBadge label="Quality Monitoring" tone="violet" />
                <StatusBadge label="Customer Service" tone="amber" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <LiveClock />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-xl font-semibold text-slate-800">Attention Required</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                There are urgent operational tasks requiring immediate review.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Critical Tickets</p>
                <h3 className="mt-2 text-3xl font-semibold text-slate-800">3</h3>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">QC Failed</p>
                <h3 className="mt-2 text-3xl font-semibold text-slate-700">2</h3>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Invoice Overdue</p>
                <h3 className="mt-2 text-3xl font-semibold text-slate-800">1</h3>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-800">Operational Overview</h2>
            <p className="mt-1 text-slate-500">Current operational status across the organization.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Active Service Cases"
              value={41}
              note="↑ 12% from yesterday"
              accent="SC"
              trend="+12%"
              tone="emerald"
            />
            <MetricCard
              title="Pending Quotes"
              value={9}
              note="Awaiting customer approval"
              accent="PQ"
              trend="Pending"
              tone="amber"
            />
            <MetricCard
              title="Dispatch Today"
              value={6}
              note="2 delivered successfully"
              accent="DT"
              trend="Today"
              tone="blue"
            />
            <MetricCard
              title="Low Stock Items"
              value={3}
              note="Immediate restocking required"
              accent="LS"
              trend="Critical"
              tone="rose"
            />
          </div>
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Today's Snapshot</h2>
            <p className="mt-1 text-slate-500">A quick summary of today's operational activity.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-sm font-bold text-slate-700 ring-1 ring-slate-200">NT</div>
              <p className="text-sm text-slate-500">New Tickets</p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-800">8</p>
              <p className="mt-2 text-sm text-slate-600">+2 compared to yesterday</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100">RC</div>
              <p className="text-sm text-slate-500">Repairs Completed</p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-800">5</p>
              <p className="mt-2 text-sm text-teal-700">Devices ready for dispatch</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-700 ring-1 ring-slate-200">DP</div>
              <p className="text-sm text-slate-500">Dispatches</p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-800">3</p>
              <p className="mt-2 text-sm text-slate-600">Out for delivery</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-sm font-bold text-slate-700 ring-1 ring-slate-200">IV</div>
              <p className="text-sm text-slate-500">Invoices Generated</p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-800">2</p>
              <p className="mt-2 text-sm text-slate-600">Awaiting payment</p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-800">Quick Actions</h2>
            <p className="mt-1 text-slate-500">Frequently used operations for managing Welfo.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <ActionCard href="/tickets" title="Create Ticket" description="Register a new customer service request." accent="TK" tone="emerald" />
            <ActionCard href="/products" title="Register Product" description="Add a new device to the product registry." accent="PR" tone="blue" />
            <ActionCard href="/organizations" title="Add Organization" description="Register a new customer organization." accent="OR" tone="amber" />
            <ActionCard href="/quotes" title="Create Quote" description="Generate a quotation for a repair or spare." accent="QT" tone="amber" />
            <ActionCard href="/invoices" title="Create Invoice" description="Issue an invoice for an approved service." accent="IN" tone="blue" />
            <ActionCard href="/service-cases" title="View Service Cases" description="Open and manage active repair cases." accent="SC" tone="emerald" />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-800">Repair Pipeline</h2>
                <p className="mt-1 text-slate-500">Live movement across the repair workflow.</p>
              </div>
              <StatusBadge label="Live" tone="emerald" />
            </div>

            <div className="space-y-4">
              {[
                { label: "Incoming", count: 12, tone: "emerald" },
                { label: "Diagnosis", count: 8, tone: "blue" },
                { label: "Awaiting Parts", count: 4, tone: "violet" },
                { label: "Quality Check", count: 3, tone: "violet" },
              ].map((stage, index) => (
                <div key={stage.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-800">{stage.label}</p>
                      <p className="text-sm text-slate-500">Stage {index + 1} in the repair flow</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                      {stage.count}
                    </span>
                  </div>

                  <div className="mt-4 h-2 rounded-full bg-slate-200">
                    <div
                      className={`h-2 rounded-full ${stage.tone === "emerald" ? "bg-teal-500" : stage.tone === "blue" ? "bg-slate-500" : "bg-stone-500"}`}
                      style={{ width: `${65 - index * 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-800">Recent Activity</h2>
                <p className="mt-1 text-slate-500">Latest operational events across the platform.</p>
              </div>

              <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                View All
              </button>
            </div>

            <div className="space-y-4">
              {[
                { title: "Quote Approved", detail: "Quote #QT-1024 was approved by Apollo Hospital.", time: "10:43 AM", accent: "QA", tone: "emerald" },
                { title: "Service Case Assigned", detail: "Case #SC-2041 assigned to Technician Rahul Sharma.", time: "10:18 AM", accent: "SA", tone: "blue" },
                { title: "Product Registered", detail: "Olympus GIF-H190 Endoscope added to inventory.", time: "09:57 AM", accent: "PR", tone: "violet" },
                { title: "Invoice Generated", detail: "Invoice #INV-3218 generated for Max Healthcare.", time: "09:21 AM", accent: "IG", tone: "blue" },
              ].map((item, index) => (
                <div key={item.title} className={`flex items-start gap-4 rounded-2xl border border-slate-100 p-4 ${index < 3 ? "border-b" : ""}`}>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold ring-1 ${item.tone === "emerald" ? "bg-teal-50 text-teal-800 ring-teal-100" : item.tone === "blue" ? "bg-slate-50 text-slate-700 ring-slate-100" : item.tone === "violet" ? "bg-stone-100 text-stone-700 ring-stone-100" : "bg-stone-100 text-stone-700 ring-stone-100"}`}>
                    {item.accent}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{item.detail}</p>
                  </div>

                  <span className="text-sm text-slate-400">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}