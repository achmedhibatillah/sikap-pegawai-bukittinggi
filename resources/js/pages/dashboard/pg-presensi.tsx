import { useState, useEffect } from "react"
import axios from "axios"
import DashboardLayout from "@/layout/dashboard-layout"
import Button from "@/component/button"
import InputText from "@/component/input-text"

interface object_sss {
    usr?: string
    acs?: string
}

interface RiwayatItem {
    id: string
    tanggal: string
    tanggal_formatted: string
    jam_mulai: string
    jam_selesai: string
    catatan?: string | null
    pivot: {
        status: string
        masuk?: string | null
        keluar?: string | null
        catatan?: string | null
    } | null
}

interface RiwayatResponse {
    status: string
    data: {
        items: RiwayatItem[]
        meta: {
            current_page: number
            last_page: number
            per_page: number
            total: number
        }
        stats: {
            total: number
            hadir: number
            telat: number
            izin: number
            cuti: number
            alpa: number
        }
        bulan: string
    }
}

const PgPresensiPage = ({ sss }: { sss?: object_sss | null }) => {
    const [bulan, setBulan] = useState<string>(new Date().toISOString().slice(0, 7))
    const [page, setPage] = useState(1)
    const [perPage] = useState(10)
    const [items, setItems] = useState<RiwayatItem[]>([])
    const [meta, setMeta] = useState<any>(null)
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchData()
    }, [bulan, page])

    const fetchData = async () => {
        setLoading(true)
        try {
            const resp = await axios.get<RiwayatResponse>('/pg/api/presensi/riwayat', {
                params: { bulan, page, per_page: perPage }
            })

            if (resp.data?.status === 'success') {
                setItems(resp.data.data.items)
                setMeta(resp.data.data.meta)
                setStats(resp.data.data.stats)
            } else {
                setItems([])
                setMeta(null)
                setStats(null)
            }
        } catch (err) {
            console.error('Gagal mengambil riwayat presensi:', err)
            setItems([])
            setMeta(null)
            setStats(null)
        } finally {
            setLoading(false)
        }
    }

    const formatTime = (time?: string | null) => {
        if (!time) return '--:--'
        try {
            return time.slice(0, 5)
        } catch {
            return '--:--'
        }
    }

    const getStatusBadge = (status: string) => {
        const config: Record<string, { bg: string; text: string; label: string }> = {
            'Hadir': { bg: 'bg-emerald-100 text-emerald-700', text: 'Hadir', label: 'Hadir' },
            'Hadir (Telat)': { bg: 'bg-amber-100 text-amber-700', text: 'Telat', label: 'Telat' },
            'Izin': { bg: 'bg-sky-100 text-sky-700', text: 'Izin', label: 'Izin' },
            'Cuti': { bg: 'bg-purple-100 text-purple-700', text: 'Cuti', label: 'Cuti' },
            'Alpa': { bg: 'bg-red-100 text-red-700', text: 'Alpa', label: 'Alpa' },
        }
        return config[status] || { bg: 'bg-gray-100 text-gray-700', text: status, label: status }
    }

    const bulanOptions = Array.from({ length: 12 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const value = date.toISOString().slice(0, 7)
        const label = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
        return { value, label }
    })

    return (
        <DashboardLayout sss={sss} now="Riwayat Presensi">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Riwayat Presensi</h1>
                    <p className="text-gray-500 mt-1">Lihat riwayat kehadiran Anda</p>
                </div>

                {/* Filter Bulan */}
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pilih Bulan
                        </label>
                        <select
                            value={bulan}
                            onChange={(e) => {
                                setBulan(e.target.value)
                                setPage(1)
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                        >
                            {bulanOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Button
                        onClick={() => {
                            setBulan(new Date().toISOString().slice(0, 7))
                            setPage(1)
                        }}
                        className="bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                    >
                        Bulan Ini
                    </Button>
                </div>

                {/* Statistik */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                            </div>
                            <div className="text-2xl font-bold text-gray-900 mt-1">
                                {stats.total}
                            </div>
                        </div>
                        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 shadow-sm">
                            <div className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
                                Hadir
                            </div>
                            <div className="text-2xl font-bold text-emerald-700 mt-1">
                                {stats.hadir}
                            </div>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 shadow-sm">
                            <div className="text-xs font-medium text-amber-600 uppercase tracking-wider">
                                Telat
                            </div>
                            <div className="text-2xl font-bold text-amber-700 mt-1">
                                {stats.telat}
                            </div>
                        </div>
                        <div className="bg-sky-50 rounded-xl p-4 border border-sky-200 shadow-sm">
                            <div className="text-xs font-medium text-sky-600 uppercase tracking-wider">
                                Izin
                            </div>
                            <div className="text-2xl font-bold text-sky-700 mt-1">
                                {stats.izin}
                            </div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 shadow-sm">
                            <div className="text-xs font-medium text-purple-600 uppercase tracking-wider">
                                Cuti
                            </div>
                            <div className="text-2xl font-bold text-purple-700 mt-1">
                                {stats.cuti}
                            </div>
                        </div>
                        <div className="bg-red-50 rounded-xl p-4 border border-red-200 shadow-sm">
                            <div className="text-xs font-medium text-red-600 uppercase tracking-wider">
                                Alpa
                            </div>
                            <div className="text-2xl font-bold text-red-700 mt-1">
                                {stats.alpa}
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                        <p className="text-sm text-gray-500 mt-2">Memuat data...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && items.length === 0 && (
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
                        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Tidak Ada Data Presensi
                        </h3>
                        <p className="text-gray-500">
                            Tidak ada sesi presensi pada bulan yang dipilih.
                        </p>
                    </div>
                )}

                {/* Riwayat List */}
                {!loading && items.length > 0 && (
                    <div className="space-y-4">
                        {items.map((item) => {
                            const statusBadge = getStatusBadge(item.pivot?.status || 'Alpa')
                            return (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="p-5">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {item.tanggal_formatted}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.bg}`}>
                                                        {statusBadge.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {formatTime(item.jam_mulai)} - {formatTime(item.jam_selesai)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Waktu Cards */}
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            <div className={`rounded-lg p-3 ${
                                                item.pivot?.masuk 
                                                    ? 'bg-emerald-50 border border-emerald-200' 
                                                    : 'bg-gray-50 border border-gray-200'
                                            }`}>
                                                <div className="text-xs text-gray-500 mb-1">Jam Masuk</div>
                                                <div className={`text-lg font-semibold ${
                                                    item.pivot?.masuk ? 'text-emerald-700' : 'text-gray-400'
                                                }`}>
                                                    {formatTime(item.pivot?.masuk)}
                                                </div>
                                            </div>
                                            <div className={`rounded-lg p-3 ${
                                                item.pivot?.keluar 
                                                    ? 'bg-blue-50 border border-blue-200' 
                                                    : 'bg-gray-50 border border-gray-200'
                                            }`}>
                                                <div className="text-xs text-gray-500 mb-1">Jam Keluar</div>
                                                <div className={`text-lg font-semibold ${
                                                    item.pivot?.keluar ? 'text-blue-700' : 'text-gray-400'
                                                }`}>
                                                    {formatTime(item.pivot?.keluar)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Catatan */}
                                        {item.pivot?.catatan && (
                                            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                <p className="text-xs font-medium text-amber-700 uppercase mb-1">Catatan</p>
                                                <p className="text-sm text-amber-800">{item.pivot.catatan}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                            Halaman {meta.current_page} dari {meta.last_page} ({meta.total} data)
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                disabled={meta.current_page <= 1}
                                onClick={() => setPage(Math.max(1, meta.current_page - 1))}
                                className="bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                            >
                                Prev
                            </Button>
                            <Button
                                disabled={meta.current_page >= meta.last_page}
                                onClick={() => setPage(Math.min(meta.last_page, meta.current_page + 1))}
                                className="bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default PgPresensiPage

