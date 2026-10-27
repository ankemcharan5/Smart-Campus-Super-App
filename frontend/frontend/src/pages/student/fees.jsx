import React, { useEffect, useState, useMemo } from "react";
import {
  CreditCard,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Search,
  Receipt,
  Download,
  ShieldCheck,
  Check,
} from "lucide-react";
import API from "../../api/axios";
import { StatCard } from "../../components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { TableSkeleton, StatCardSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Modal } from "../../components/ui/Modal";

export function Fees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Payment Modal State
  const [selectedFee, setSelectedFee] = useState(null);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const loadFees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/fees/");
      const data = response.data;

      if (Array.isArray(data)) {
        setFees(data);
      } else if (Array.isArray(data.fees)) {
        setFees(data.fees);
      } else {
        setFees([]);
      }
    } catch (err) {
      console.error("Failed to load fees:", err);
      setError(
        err.response?.data?.detail || "Unable to load fee records from campus server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, []);

  // Summary Metrics
  const totalAmount = useMemo(
    () => fees.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [fees]
  );

  const paidAmount = useMemo(
    () =>
      fees
        .filter((item) => item.status === "Paid")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [fees]
  );

  const dueAmount = totalAmount - paidAmount;
  const pendingCount = fees.filter((item) => item.status !== "Paid").length;
  const paidCount = fees.filter((item) => item.status === "Paid").length;

  // Filtered fee records
  const filteredFees = useMemo(() => {
    return fees.filter((item) => {
      const matchesSearch =
        item.fee_type?.toLowerCase().includes(search.toLowerCase()) ||
        item.due_date?.includes(search) ||
        String(item.semester || "").includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        item.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [fees, search, statusFilter]);

  const handlePayFee = async (e) => {
    e.preventDefault();
    if (!selectedFee) return;

    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        setSelectedFee(null);
        loadFees();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <CreditCard size={16} />
            <span>Finance & Accounts</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Fee Breakdown & Payments
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            View semester fees, examination dues, and payment records.
          </p>
        </div>

        <Button
          onClick={loadFees}
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
        >
          Refresh Dues
        </Button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Fees"
          value={`₹${totalAmount.toLocaleString()}`}
          subtitle={`${fees.length} total fee records`}
          icon={CreditCard}
          color="blue"
        />

        <StatCard
          title="Amount Paid"
          value={`₹${paidAmount.toLocaleString()}`}
          subtitle={`${paidCount} settled payment(s)`}
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="Amount Due"
          value={`₹${dueAmount.toLocaleString()}`}
          subtitle={`${pendingCount} pending payment(s)`}
          icon={IndianRupee}
          color={dueAmount > 0 ? "amber" : "emerald"}
          trend={dueAmount > 0 ? "Pending action" : "All cleared"}
          trendDirection={dueAmount > 0 ? "down" : "up"}
        />

        <StatCard
          title="Pending Records"
          value={pendingCount}
          subtitle="Action required before due date"
          icon={Clock}
          color={pendingCount > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
            <div>
              <CardTitle>Fee Statements</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Detailed record of current and upcoming university dues
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search fee type, due date..."
                  className="rounded-xl border border-white/10 bg-slate-950/60 pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center rounded-xl border border-white/10 bg-slate-950/60 p-1">
                {["all", "pending", "paid"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all ${
                      statusFilter === st
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={4} cols={6} />
            </div>
          ) : error ? (
            <div className="p-6">
              <ErrorState title="Could not load fees" message={error} onRetry={loadFees} />
            </div>
          ) : filteredFees.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={CreditCard}
                title="No fee records found"
                description={
                  search || statusFilter !== "all"
                    ? "No fee entries match your current search criteria."
                    : "You currently have no fee records in the university database."
                }
                actionText={search || statusFilter !== "all" ? "Reset Filters" : undefined}
                onAction={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.02] border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Fee Particulars</th>
                    <th className="px-6 py-4">Department & Sem</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {filteredFees.map((fee) => {
                    const isPaid = fee.status === "Paid";
                    const isOverdue =
                      !isPaid &&
                      fee.due_date &&
                      new Date(fee.due_date) < new Date();

                    return (
                      <tr
                        key={fee.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 font-bold">
                              ₹
                            </div>
                            <div>
                              <p className="font-semibold text-white">
                                {fee.fee_type}
                              </p>
                              <p className="text-xs text-slate-400">
                                ID: {fee.id?.slice(-6) || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-white">{fee.department || "CSE"}</p>
                          <p className="text-xs text-slate-400">
                            Semester {fee.semester || 3} • Year {fee.year || 2}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Clock size={14} className="text-slate-400" />
                            <span>{fee.due_date}</span>
                          </div>
                          {isOverdue && (
                            <span className="text-[10px] text-rose-400 font-semibold">
                              Past due date
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <span className="text-base font-extrabold text-white">
                            ₹{Number(fee.amount || 0).toLocaleString()}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <Badge variant={isPaid ? "paid" : "pending"}>
                            {fee.status}
                          </Badge>
                        </td>

                        <td className="px-6 py-4 text-right">
                          {isPaid ? (
                            <Button
                              onClick={() => {
                                setSelectedFee(fee);
                                setPaymentSuccess(true);
                              }}
                              variant="ghost"
                              size="sm"
                              icon={Receipt}
                              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                            >
                              Receipt
                            </Button>
                          ) : (
                            <Button
                              onClick={() => {
                                setPaymentSuccess(false);
                                setSelectedFee(fee);
                              }}
                              variant="primary"
                              size="sm"
                              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/20"
                            >
                              Pay Now
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment & Receipt Modal */}
      <Modal
        isOpen={Boolean(selectedFee)}
        onClose={() => {
          setSelectedFee(null);
          setPaymentSuccess(false);
        }}
        title={paymentSuccess ? "Payment Receipt" : "University Payment Gateway"}
        description={
          paymentSuccess
            ? "Official transaction receipt for your records"
            : "Complete your online fee payment securely"
        }
      >
        {selectedFee && (
          <div>
            {paymentSuccess ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-3 ring-8 ring-emerald-500/10">
                    <Check size={28} />
                  </div>
                  <h4 className="text-lg font-bold text-white">Payment Successful!</h4>
                  <p className="text-xs text-emerald-400 mt-1">
                    Transaction ID: TXN-{Date.now().toString().slice(-8)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Particulars:</span>
                    <span className="font-semibold text-white">{selectedFee.fee_type}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Amount Paid:</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      ₹{Number(selectedFee.amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Student ID:</span>
                    <span className="font-mono text-white">{selectedFee.student_id || "SC004"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Semester:</span>
                    <span className="text-white">Semester {selectedFee.semester}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Payment Date:</span>
                    <span className="text-white">{new Date().toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      alert("Receipt downloaded to your device.");
                      setSelectedFee(null);
                    }}
                    variant="primary"
                    size="md"
                    icon={Download}
                    className="w-full"
                  >
                    Download Receipt PDF
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePayFee} className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Fee Item:</span>
                    <span className="text-sm font-bold text-white">{selectedFee.fee_type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Due Date:</span>
                    <span className="text-xs text-amber-400">{selectedFee.due_date}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="text-xs font-semibold text-slate-300">Total Payable:</span>
                    <span className="text-xl font-extrabold text-amber-400">
                      ₹{Number(selectedFee.amount).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 rounded-xl border border-blue-500/40 bg-blue-500/10 p-3 cursor-pointer">
                      <input
                        type="radio"
                        name="payMethod"
                        defaultChecked
                        className="text-blue-600"
                      />
                      <span className="text-xs font-semibold text-white">UPI / NetBanking</span>
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 cursor-pointer">
                      <input type="radio" name="payMethod" className="text-blue-600" />
                      <span className="text-xs font-semibold text-slate-300">Debit / Credit Card</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                  <span>256-bit encrypted university payment gateway. Instant receipt issued.</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={() => setSelectedFee(null)}
                    variant="secondary"
                    className="w-1/2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={paying}
                    className="w-1/2 bg-gradient-to-r from-amber-600 to-orange-600 shadow-amber-600/25"
                  >
                    Confirm ₹{Number(selectedFee.amount).toLocaleString()}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Fees;