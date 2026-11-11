"use client";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#2d1b75] via-[#3b2295] to-[#4a29c4] flex items-center justify-center px-8 py-12">
      <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-16 items-center">
        {/* LEFT */}

        <div className="text-white max-w-xl">
          <span className="uppercase tracking-[5px] text-sm text-purple-200 font-semibold">
            Welfo Endovision
          </span>

          <h1 className="text-6xl font-bold mt-5 leading-tight">
            Welcome to the
            <br />
            Customer Portal
          </h1>

          <p className="mt-8 text-lg text-purple-100 leading-8">
            Register your organization to securely manage your medical
            equipment, service requests, warranties, invoices and repair
            history—all from one centralized dashboard.
          </p>

          <div className="mt-12 space-y-5">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                ✓
              </div>
              <span className="text-lg">
                Track service requests in real time
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                ✓
              </div>
              <span className="text-lg">View equipment repair history</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                ✓
              </div>
              <span className="text-lg">
                Download invoices & warranty details
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                ✓
              </div>
              <span className="text-lg">Manage all registered products</span>
            </div>
          </div>

          <div className="mt-14 border-t border-white/20 pt-8">
            <h3 className="text-xl font-semibold mb-3">Need Help?</h3>

            <p className="text-purple-100">welfofiber86@gmail.com</p>

            <p className="text-purple-100 mt-2">+91 9557870167</p>
          </div>
        </div>

        {/* RIGHT */}

        <div className="bg-white rounded-3xl shadow-2xl p-10">
          <h2 className="text-4xl font-bold text-gray-900">Create Account</h2>

          <p className="text-gray-500 mt-2 mb-8">
            Register your organization to access the customer portal.
          </p>

          {/* Organization */}

          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Organization Details
          </h3>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name *
              </label>

              <input
                type="text"
                placeholder="Endovision Hospital"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Type *
              </label>

              <select className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-600">
                <option>Hospital</option>
                <option>Clinic</option>
                <option>Distributor</option>
                <option>Dealer</option>
                <option>Service Partner</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Number
              </label>

              <input
                type="text"
                placeholder="22AAAAA0000A1Z5"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PAN Number
              </label>

              <input
                type="text"
                placeholder="ABCDE1234F"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-600"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>

            <input
              type="text"
              placeholder="https://www.example.com"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-600"
            />
          </div>
          <hr className="my-10 border-gray-200" />

          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Primary Contact
          </h3>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>

              <input
                type="text"
                placeholder="Dr. John Doe"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designation
              </label>

              <input
                type="text"
                placeholder="Director"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-600"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-5 mt-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>

              <input
                type="email"
                placeholder="doctor@hospital.com"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>

              <input
                type="tel"
                placeholder="+91 9876543210"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-600"
              />
            </div>
          </div>
          <hr className="my-10 border-gray-200" />

          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Account Security
          </h3>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>

              <input
                type="password"
                placeholder="Enter password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>

              <input
                type="password"
                placeholder="Confirm password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-600"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
