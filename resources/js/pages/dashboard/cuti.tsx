import { useState, useEffect } from "react"
import axios from "axios"
import DashboardLayout from "@/layout/dashboard-layout"

interface object_sss {
    usr?: string,
    acs?: string
}

interface DashboardPageProps {
    sss?: object_sss | null
}

interface Cuti {
    id: string
    tanggal_mulai: string
    tanggal_selesai: string
    catatan: string | null
    acc: boolean
    pegawai_id: string
    created_at?: string
    updated_at?: string
    pegawai?: {
        id: string
        nama: string
        akun?: {
            id: string
            email: string
        }
    }
}

type TabType = 'upcoming' | 'active' | 'past'
type FilterType = 'all' | 'waiting' | 'processed'

const CutiPage = ({ sss }: DashboardPageProps) => {
    const [activeTab, setActiveTab] = useState<TabType>('upcoming')
    const [upcomingCuti, setUpcomingCuti] = useState<Cuti[]>([])
    const [activeCuti, setActiveCuti] = useState<Cuti[]>([])
    const [pastCuti, setPastCuti] = useState<Cuti[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingActive, setLoadingActive] = useState(false)
    const [loadingPast, setLoadingPast] = useState(false)
    const [upcomingFilter, setUpcomingFilter] = useState<FilterType>('all')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalPast, setTotalPast] = useState(0)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const fetchUpcomingCuti = async () => {
        setLoading(true)
        try {
            const resp = await axios.get('/api/cuti?type=upcoming&filter=' + upcomingFilter)
            if (resp.data?.status === 'success') {
                setUpcomingCuti(resp.data.data.cutis || [])
            }
        } catch (err: any) {
            console.error(err)
            setMessage({ type: 'error', text: 'Gagal memuat data cuti mendatang' })
        } finally {
            setLoading(false)
        }
    }

    const fetchActiveCuti = async () => {
        setLoadingActive(true)
        try {
            const resp = await axios.get('/api/cuti?type=active')
            if (resp.data?.status === 'success') {
                setActiveCuti(resp.data.data.cutis || [])
            }
        } catch (err: any) {
            console.error(err)
            setMessage({ type: 'error', text: 'Gagal memuat data cuti aktif' })
        } finally {
            setLoadingActive(false)
        }
    }

    const fetchPastCuti = async () => {
        setLoadingPast(true)
        try {
            const resp = axios.get('/api/cuti?type=past&page=' + page)
            const res = await resp
            if (res.data?.status === 'success') {
                setPastCuti(res.data.data.cutis || [])
                setTotalPages(res.data.data.last_page || 1)
                setTotalPast(res.data.data.total || 0)
            }
        } catch (err: any) {
            console.error(err)
            setMessage({ type: 'error', text: 'Gagal memuat data cuti terlewat' })
        } finally {
            setLoadingPast(false)
        }
    }

    useEffect(() => {
        fetchUpcomingCuti()
    }, [upcomingFilter])

    useEffect(() => {
        fetchActiveCuti()
    }, [activeTab])

    useEffect(() => {
        if (activeTab === 'past') {
            fetchPastCuti()
        }
    }, [activeTab, page])

    const handleApprove = async (id: string, acc: boolean) => {
        try {
            const resp = await axios.post('/api/cuti/' + id + '/approve', { acc })
            if (resp.data?.status === 'success') {
                setMessage({ 
                    type: 'success', 
                    text: acc ? 'Cuti berhasil disetujui' : 'Cuti berhasil ditolak' 
                })
                fetchUpcomingCuti()
                fetchActiveCuti()
                if (activeTab === 'past') {
                    fetchPastCuti()
                }
            } else {
                setMessage({ type: 'error', text: resp.data?.message || 'Gagal memproses cuti' })
            }
        } catch (err: any) {
            console.error(err)
            setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal memproses cuti' })
        }
    }

    const formatTanggal = (tanggal: string) => {
        try {
            const date = new Date(tanggal)
            return date.toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        } catch {
            return tanggal
        }
    }

    const hitungHari = (mulai: string, selesai: string) => {
        try {
            const start = new Date(mulai)
            const end = new Date(selesai)
            const diffTime = Math.abs(end.getTime() - start.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
            return diffDays
        } catch {
            return 0
        }
    }

    const getStatusBadge = (acc: boolean, created_at?: string, updated_at?: string) => {
        // Jika created_at === updated_at, berarti belum ada aksi dari admin = Menunggu
        if (created_at !== updated_at) {
            if (acc === true) {
                return (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                        Disetujui
                    </span>
                )
            } else if (acc === false) {
                return (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                        Ditolak
                    </span>
                )
            }
        }
        return (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                Menunggu
            </span>
        )
    }

    const renderCutiCard = (cuti: Cuti, showActions: boolean = true) => (
        <div key={cuti.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-800">
                                {cuti.pegawai?.nama || 'Pegawai tidak ditemukan'}
                            </span>
                            {getStatusBadge(cuti.acc, cuti.created_at, cuti.updated_at)}
                        </div>
                        
                        <div className="text-sm text-gray-500 mb-2">
                            {cuti.pegawai?.akun?.email || '-'}
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-gray-700">
                                {formatTanggal(cuti.tanggal_mulai)}
                            </span>
                            {cuti.tanggal_mulai !== cuti.tanggal_selesai && (
                                <>
                                    <span className="text-gray-400">→</span>
                                    <span className="text-gray-700">
                                        {formatTanggal(cuti.tanggal_selesai)}
                                    </span>
                                </>
                            )}
                        </div>

                        <p className="text-sm text-gray-600">
                            {hitungHari(cuti.tanggal_mulai, cuti.tanggal_selesai)} hari kerja
                        </p>

                        {cuti.catatan && (
                            <p className="text-sm text-gray-600 mt-3 bg-gray-50 p-3 rounded-lg">
                                {cuti.catatan}
                            </p>
                        )}
                    </div>

                    {showActions && cuti.created_at === cuti.updated_at && (
                        <div className="flex gap-2 sm:flex-col">
                            <button
                                onClick={() => handleApprove(cuti.id, true)}
                                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition cursor-pointer"
                            >
                                Setuju
                            </button>
                            <button
                                onClick={() => handleApprove(cuti.id, false)}
                                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition cursor-pointer"
                            >
                                Tolak
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

    return (
        <DashboardLayout sss={sss} now="Cuti">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Kelola Cuti Pegawai</h1>
                <p className="text-gray-500 text-sm mt-1">Review dan approve pengajuan cuti dari pegawai</p>
            </div>

            {message && (
                <div className={`mb-4 p-4 rounded-lg ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => { setActiveTab('upcoming'); setPage(1); }}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                        activeTab === 'upcoming' 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    Pengajuan Mendatang
                    <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-xs">
                        {upcomingCuti.length}
                    </span>
                </button>
                <button
                    onClick={() => { setActiveTab('active'); setPage(1); }}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                        activeTab === 'active' 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    Riwayat Aktif
                    <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-xs">
                        {activeCuti.length}
                    </span>
                </button>
                <button
                    onClick={() => { setActiveTab('past'); setPage(1); }}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                        activeTab === 'past' 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    Riwayat Terlewat
                    <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-xs">
                        {totalPast}
                    </span>
                </button>
            </div>

            {activeTab === 'upcoming' && (
                <div>
                    {/* Filter Dropdown */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tampilkan
                        </label>
                        <select
                            value={upcomingFilter}
                            onChange={(e) => setUpcomingFilter(e.target.value as FilterType)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                            <option value="all">Semua</option>
                            <option value="waiting">Hanya yang menunggu</option>
                            <option value="processed">Hanya yang telah diterima (disetujui/ditolak)</option>
                        </select>
                    </div>

                    {/* Summary Cards for Upcoming */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500">Total Pengajuan</p>
                            <p className="text-2xl font-bold text-gray-800">{upcomingCuti.length}</p>
                        </div>
                        <div className="bg-white routunded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500">Menunggu</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {upcomingCuti.filter(c => c.created_at === c.updated_at).length}
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500">Diproses</p>
                            <p className="text-2xl font-bold text-green-600">
                                {upcomingCuti.filter(c => c.created_at !== c.updated_at).length}
                            </p>
                        </div>
                    </div>

                    {/* Upcoming Cuti List */}
                    {loading ? (
                        <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                            Memuat data...
                        </div>
                    ) : upcomingCuti.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                            <p>Tidak ada pengajuan cuti mendatang</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {upcomingCuti.map((cuti) => renderCutiCard(cuti))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'active' && (
                <div>
                    {/* Summary Cards for Active */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500">Total Cuti Aktif</p>
                            <p className="text-2xl font-bold text-gray-800">{activeCuti.length}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500">Disetujui</p>
                            <p className="text-2xl font-bold text-green-600">
                                {activeCuti.filter(c => c.acc === true).length}
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500">Ditolak</p>
                            <p className="text-2xl font-bold text-red-600">
                                {activeCuti.filter(c => c.acc === false).length}
                            </p>
                        </div>
                    </div>

                    {/* Active Cuti List */}
                    {loadingActive ? (
                        <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                            Memuat data...
                        </div>
                    ) : activeCuti.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                            <p>Tidak ada cuti aktif hari ini</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeCuti.map((cuti) => renderCutiCard(cuti, false))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'past' && (
                <div>
                    {/* Summary Cards for Past */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500">Total Riwayat</p>
                            <p className="text-2xl font-bold text-gray-800">{totalPast}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500">Disetujui</p>
                            <p className="text-2xl font-bold text-green-600">
                                {pastCuti.filter(c => c.acc === true).length}
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500">Ditolak</p>
                            <p className="text-2xl font-bold text-red-600">
                                {pastCuti.filter(c => c.acc === false).length}
                            </p>
                        </div>
                    </div>

                    {/* Past Cuti List */}
                    {loadingPast ? (
                        <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                            Memuat data...
                        </div>
                    ) : pastCuti.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
                            <p>Tidak ada riwayat cuti terlewat</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {pastCuti.map((cuti) => renderCutiCard(cuti, false))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-6">
                                    <button
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-4 py-2 text-gray-600">
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(page + 1)}
                                        disabled={page === totalPages}
                                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </DashboardLayout>
    )
}

export default CutiPage

