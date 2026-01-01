// <parameter name="content">
import { useState, useEffect } from "react"
import axios from "axios"
import DashboardLayout from "@/layout/dashboard-layout"
import Button from "@/component/button"
import PopUpRight from "@/component/popup-right"
import PresensiAdd from "@/section/presensi-add"
import InputText from "@/component/input-text"

interface object_sss {
    usr?: string
    acs?: string
}

interface DashboardPageProps {
    sss?: object_sss | null
}

interface PresensiItem {
    id: string
    tanggal: string
    jam_mulai: string
    jam_selesai: string
    catatan?: string | null
    totals: {
        total: number
        hadir: number
        telat: number
        izin: number
        cuti: number
        alpa: number
    }
}

interface Meta {
    current_page: number
    last_page: number
    per_page: number
    total: number
}

const PresensiPage = ({ sss }: DashboardPageProps) => {
    const [openAddMenu, setOpenAddMenu] = useState(false)
    const [from, setFrom] = useState<string>("")
    const [to, setTo] = useState<string>("")
    const [page, setPage] = useState(1)
    const [perPage] = useState(10)
    const [items, setItems] = useState<PresensiItem[]>([])
    const [meta, setMeta] = useState<Meta | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchData()
    }, [page])

    const fetchData = async (overridePage?: number) => {
        setLoading(true)
        try {
            const resp = await axios.get("/api/presensi", {
                params: {
                    page: overridePage ?? page,
                    per_page: perPage,
                    from: from || null,
                    to: to || null,
                },
            })
            if (resp.data?.status === "success") {
                setItems(resp.data.data.items)
                setMeta(resp.data.data.meta)
            } else {
                setItems([])
                setMeta(null)
            }
        } catch (err) {
            console.error(err)
            setItems([])
            setMeta(null)
        } finally {
            setLoading(false)
        }
    }

    const handleFilter = () => {
        setPage(1)
        fetchData(1)
    }

    const handleClearFilter = () => {
        setFrom("")
        setTo("")
        setPage(1)
        fetchData(1)
    }

    const formatTanggal = (tanggal: string) => {
        const date = new Date(tanggal)
        return date.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        })
    }

    const formatTime = (time: string) => {
        return time.slice(0, 5)
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, { bg: string; text: string }> = {
            hadir: { bg: "bg-emerald-100", text: "text-emerald-700" },
            telat: { bg: "bg-amber-100", text: "text-amber-700" },
            izin: { bg: "bg-sky-100", text: "text-sky-700" },
            cuti: { bg: "bg-purple-100", text: "text-purple-700" },
            alpa: { bg: "bg-red-100", text: "text-red-700" },
            total: { bg: "bg-gray-100", text: "text-gray-700" },
        }
        return colors[status.toLowerCase()] || colors.total
    }

    const StatCard = ({
        label,
        value,
        status,
    }: {
        label: string
        value: number
        status: string
    }) => {
        const color = getStatusColor(status)
        return (
            <div
                className={`${color.bg} ${color.text} rounded-lg p-3 text-center min-w-[80px]`}
            >
                <div className="text-xs font-medium opacity-80">{label}</div>
                <div className="text-xl font-bold mt-0.5">{value}</div>
        )
    }

    return (
        <DashboardLayout sss={sss} now="Presensi">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Kelola Presensi
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Kelola sesi presensi dan lihat rekap kehadiran
                            karyawan
                        </p>
                    </div>
                    <Button
                        onClick={() => setOpenAddMenu(true)}
                        className="flex items-center gap-2"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        Tambah Sesi
                    </Button>
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Tanggal Awal
                                </label>
                                <InputText
                                    type="date"
                                    value={from}
                                    onChange={(e: any) => setFrom(e.target.value)}
                                    className="w-full"
                                    placeholder="Pilih tanggal"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Tanggal Akhir
                                </label>
                                <InputText
                                    type="date"
                                    value={to}
                                    onChange={(e: any) => setTo(e.target.value)}
                                    className="w-full"
                                    placeholder="Pilih tanggal"
                                />
                            </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleFilter}
                                className="flex items-center gap-2"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                Cari
                            </Button>
                            <Button
                                onClick={handleClearFilter}
                                className="bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 flex items-center gap-2"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                                Reset
                            </Button>
                        </div>
                </div>

                {/* Add Presensi Modal */}
                {openAddMenu && (
                    <PopUpRight
                        name="Tambah sesi presensi baru"
                        state={openAddMenu}
                        setState={setOpenAddMenu}
                        dangerWhenClose={true}
                    >
                        <PresensiAdd />
                    </PopUpRight>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="relative">
                            <div className="h-12 w-12 rounded-full border-4 border-gray-200"></div>
                            <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                        <p className="text-gray-500 mt-4">Memuat data...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && items.length === 0 && (
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
                        <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                            <svg
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Tidak Ada Sesi Presensi
                        </h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            {from || to
                                ? "Tidak ada hasil yang cocok dengan filter yang dipilih."
                                : "Belum ada sesi presensi yang dibuat. Klik tombol Tambah Sesi untuk membuat yang pertama."}
                        </p>
                        {(from || to) && (
                            <Button
                                onClick={handleClearFilter}
                                className="mt-4"
                            >
                                Hapus Filter
                            </Button>
                        )}
                    </div>
                )}

                {/* Presensi List */}
                {!loading && items.length > 0 && (
                    <div className="space-y-4">
                        {items.map((s) => (
                            <div
                                key={s.id}
                                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                            >
                                <div className="p-5">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        {/* Left Side - Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                    <svg
                                                        className="w-5 h-5 text-emerald-600"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {formatTanggal(s.tanggal)}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <svg
                                                                className="w-4 h-4"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                />
                                                            </svg>
                                                            {formatTime(
                                                                s.jam_mulai
                                                            )}{" "}
                                                            -{" "}
                                                            {formatTime(
                                                                s.jam_selesai
                                                            )}
                                                        </span>
                                                    </div>
                                            </div>
                                            {s.catatan && (
                                                <div className="mt-2 ml-13 pl-13 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-sm rounded-lg">
                                                    <svg
                                                        className="w-4 h-4 flex-shrink-0"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                                        />
                                                    </svg>
                                                    <span className="truncate max-w-md">
                                                        {s.catatan}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Side - Stats & Action */}
                                        <div className="flex flex-col sm:flex-row lg:items-center gap-4">
                                            <div className="flex gap-2">
                                                <StatCard
                                                    label="Hadir"
                                                    value={s.totals.hadir}
                                                    status="hadir"
                                                />
                                                <StatCard
                                                    label="Telat"
                                                    value={s.totals.telat}
                                                    status="telat"
                                                />
                                                <StatCard
                                                    label="Izin"
                                                    value={s.totals.izin}
                                                    status="izin"
                                                />
                                                <StatCard
                                                    label="Cuti"
                                                    value={s.totals.cuti}
                                                    status="cuti"
                                                />
                                                <StatCard
                                                    label="Alpa"
                                                    value={s.totals.alpa}
                                                    status="alpa"
                                                />
                                                <div className="bg-gray-100 text-gray-700 rounded-lg p-3 text-center min-w-[80px]">
                                                    <div className="text-xs font-medium opacity-80">
                                                        Total
                                                    </div>
                                                    <div className="text-xl font-bold mt-0.5">
                                                        {s.totals.total}
                                                    </div>
                                            </div>
                                            <Button
                                                onClick={() =>
                                                    (window.location.href =
                                                        "/presensi/" + s.id)
                                                }
                                                className="flex items-center gap-2 whitespace-nowrap"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                    />
                                                </svg>
                                                Lihat Detail
                                            </Button>
                                        </div>
                                </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="text-sm text-gray-600">
                                Menampilkan{" "}
                                <span className="font-medium">
                                    {(meta.current_page - 1) * meta.per_page + 1}
                                </span>{" "}
                                sampai{" "}
                                <span className="font-medium">
                                    {Math.min(
                                        meta.current_page * meta.per_page,
                                        meta.total
                                    )}
                                </span>{" "}
                                dari{" "}
                                <span className="font-medium">{meta.total}</span>{" "}
                                hasil
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() =>
                                        setPage(Math.max(1, meta.current_page - 1))
                                    }
                                    disabled={meta.current_page <= 1}
                                    className="flex items-center gap-1"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>
                                    Prev
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from(
                                        { length: meta.last_page },
                                        (_, i) => i + 1
                                    )
                                        .filter(
                                            (p) =>
                                                p === 1 ||
                                                p === meta.last_page ||
                                                Math.abs(p - meta.current_page) <=
                                                    1
                                        )
                                        .map((p, idx, arr) => (
                                            <div key={p} className="flex items-center">
                                                {idx > 0 &&
                                                    arr[idx - 1] !== p - 1 && (
                                                        <span className="px-2 text-gray-400">
                                                            ...
                                                        </span>
                                                    )}
                                                <button
                                                    onClick={() => setPage(p)}
                                                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                                                        p === meta.current_page
                                                            ? "bg-emerald-600 text-white"
                                                            : "text-gray-600 hover:bg-gray-100"
                                                    }`}
                                                >
                                                    {p}
                                                </button>
                                            </div>
                                        ))}
                                </div>
                                <Button
                                    onClick={() =>
                                        setPage(
                                            Math.min(meta.last_page, meta.current_page + 1)
                                        )
                                    }
                                    disabled={meta.current_page >= meta.last_page}
                                    className="flex items-center gap-1"
                                >
                                    Next
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </Button>
                            </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default PresensiPage
</parameter>
