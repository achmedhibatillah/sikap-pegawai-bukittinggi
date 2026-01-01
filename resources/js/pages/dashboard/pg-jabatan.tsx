import { useState, useEffect } from "react"
import axios from "axios"
import DashboardLayout from "@/layout/dashboard-layout"
import PopUpRight from "@/component/popup-right"
import InputText from "@/component/input-text"

interface object_sss {
    usr?: string,
    acs?: string
}

interface DashboardPageProps {
    sss?: object_sss | null
}

interface Jabatan {
    id: string
    tingkatan: number
    nama: string
    deskripsi: string
    aktif: boolean
}

interface JabatanAjuan {
    id: string
    jabatan_lama_id: string | null
    jabatan_baru_id: string
    alasan: string | null
    status: 'pending' | 'diterima' | 'ditolak'
    acc_by: string | null
    acc_at: string | null
    catatan_acc: string | null
    created_at: string
    updated_at: string
    jabatan_lama?: Jabatan | null
    jabatan_baru: Jabatan
    acc_by_user?: { nama: string } | null
}

const PgJabatanPage = ({ sss }: DashboardPageProps) => {
    const [ajuans, setAjuans] = useState<JabatanAjuan[]>([])
    const [jabatanList, setJabatanList] = useState<Jabatan[]>([])
    const [loading, setLoading] = useState(false)
    const [showAddPopup, setShowAddPopup] = useState(false)
    const [selectedJabatanBaru, setSelectedJabatanBaru] = useState('')
    const [alasan, setAlasan] = useState('')
    const [submitLoading, setSubmitLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const fetchData = async () => {
        setLoading(true)
        try {
            const [ajuanRes, jabatanRes] = await Promise.all([
                axios.get('/pg/api/jabatan/my-ajuan'),
                axios.get('/pg/api/jabatan/all-active')
            ])

            if (ajuanRes.data?.status === 'success') {
                setAjuans(ajuanRes.data.data || [])
            }
            if (jabatanRes.data?.status === 'success') {
                setJabatanList(jabatanRes.data.data || [])
            }
        } catch (err: any) {
            console.error(err)
            setMessage({ type: 'error', text: 'Gagal memuat data' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleAjukan = async () => {
        if (!selectedJabatanBaru) {
            setMessage({ type: 'error', text: 'Pilih jabatan baru terlebih dahulu' })
            return
        }

        setSubmitLoading(true)
        try {
            const resp = await axios.post('/pg/api/jabatan/ajuan', {
                jabatan_baru_id: selectedJabatanBaru,
                alasan
            })
            if (resp.data?.status === 'success') {
                setMessage({ type: 'success', text: 'Pengajuan jabatan berhasil dikirim' })
                setShowAddPopup(false)
                setSelectedJabatanBaru('')
                setAlasan('')
                fetchData()
            } else {
                setMessage({ type: 'error', text: resp.data?.message || 'Gagal mengajukan' })
            }
        } catch (err: any) {
            console.error(err)
            setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal mengajukan' })
        } finally {
            setSubmitLoading(false)
        }
    }

    const formatTanggal = (tanggal: string) => {
        try {
            const date = new Date(tanggal)
            return date.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch {
            return tanggal
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'diterima':
                return (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                        Disetujui
                    </span>
                )
            case 'ditolak':
                return (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                        Ditolak
                    </span>
                )
            default:
                return (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                        Menunggu
                    </span>
                )
        }
    }

    const getJabatanTingkat = (jabatan: Jabatan) => {
        const tingkatMap: Record<number, { label: string; color: string; bg: string; border: string }> = {
            1: { label: 'Tingkat 1', color: 'text-amber-800', bg: 'bg-amber-100', border: 'border-amber-300' },
            2: { label: 'Tingkat 2', color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-300' },
            3: { label: 'Tingkat 3', color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-300' },
            4: { label: 'Tingkat 4', color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-300' },
            5: { label: 'Tingkat 5', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' },
        }
        const tingkat = tingkatMap[jabatan.tingkatan] || { label: `Tingkat ${jabatan.tingkatan}`, color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-300' }
        return (
            <span className={`px-2 py-0.5 text-xs rounded border ${tingkat.bg} ${tingkat.color} ${tingkat.border}`}>
                {tingkat.label}
            </span>
        )
    }

    const hasPending = ajuans.some(a => a.status === 'pending')

    return (
        <DashboardLayout sss={sss} now="Jabatan">
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Pengajuan Jabatan</h1>
                        <p className="text-gray-500 text-sm mt-1">Ajukan kenaikan atau pindah jabatan</p>
                    </div>
                    {!hasPending && (
                        <button
                            onClick={() => setShowAddPopup(true)}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-sm cursor-pointer"
                        >
                            + Ajukan Jabatan
                        </button>
                    )}
                </div>
            </div>

            {message && (
                <div className={`mb-4 p-4 rounded-lg ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    {message.text}
                </div>
            )}

            {hasPending && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-yellow-700">
                        Anda memiliki pengajuan yang masih menunggu persetujuan. Anda tidak dapat mengajukan jabatan baru sampai pengajuan sebelumnya diproses.
                    </p>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Total Pengajuan</p>
                    <p className="text-2xl font-bold text-gray-800">{ajuans.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Disetujui</p>
                    <p className="text-2xl font-bold text-green-600">
                        {ajuans.filter(a => a.status === 'diterima').length}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Menunggu</p>
                    <p className="text-2xl font-bold text-yellow-600">
                        {ajuans.filter(a => a.status === 'pending').length}
                    </p>
                </div>
            </div>

            {/* Available Positions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Jabatan Tersedia</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {jabatanList.map((jabatan) => (
                        <div key={jabatan.id} className="border border-gray-200 rounded-lg p-3 hover:border-emerald-300 transition">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h4 className="font-medium text-gray-800">{jabatan.nama}</h4>
                                    {getJabatanTingkat(jabatan)}
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2">{jabatan.deskripsi}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ajuan List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-800">Riwayat Pengajuan</h3>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">
                        Memuat data...
                    </div>
                ) : ajuans.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <div className="text-4xl mb-2">📋</div>
                        <p>Belum ada pengajuan jabatan</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {ajuans.map((ajuan) => (
                            <div key={ajuan.id} className="p-4 hover:bg-gray-50 transition">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm text-gray-500">
                                                {ajuan.jabatan_lama ? ajuan.jabatan_lama.nama : 'Tanpa Jabatan'}
                                            </span>
                                            <span className="text-gray-400">→</span>
                                            <span className="font-semibold text-gray-800">
                                                {ajuan.jabatan_baru.nama}
                                            </span>
                                            {getStatusBadge(ajuan.status)}
                                        </div>
                                        {ajuan.alasan && (
                                            <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                                                {ajuan.alasan}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                            <span>Diajukan: {formatTanggal(ajuan.created_at)}</span>
                                            {ajuan.acc_at && (
                                                <span>Diproses: {formatTanggal(ajuan.acc_at)}</span>
                                            )}
                                        </div>
                                        {ajuan.catatan_acc && (
                                            <p className="text-sm text-gray-600 mt-2 bg-yellow-50 p-2 rounded border border-yellow-200">
                                                <span className="font-medium">Catatan: </span>
                                                {ajuan.catatan_acc}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Ajuan Popup */}
            <PopUpRight
                name="Ajukan Jabatan"
                state={showAddPopup}
                setState={setShowAddPopup}
            >
                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-700">
                            Pengajuan jabatan akan diproses oleh kepala. Pastikan alasan Anda jelas dan lengkap.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Jabatan Baru <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedJabatanBaru}
                            onChange={(e) => setSelectedJabatanBaru(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                        >
                            <option value="">-- Pilih Jabatan --</option>
                            {jabatanList.map((j) => (
                                <option key={j.id} value={j.id}>
                                    {j.nama} (Tingkat {j.tingkatan})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Alasan Pengajuan (opsional)
                        </label>
                        <textarea
                            value={alasan}
                            onChange={(e) => setAlasan(e.target.value)}
                            placeholder="Jelaskan alasan Anda mengajukan jabatan ini..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                            rows={4}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            onClick={() => setShowAddPopup(false)}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleAjukan}
                            disabled={submitLoading || !selectedJabatanBaru}
                            className="flex-1 py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {submitLoading ? 'Mengirim...' : 'Kirim Pengajuan'}
                        </button>
                    </div>
                </div>
            </PopUpRight>
        </DashboardLayout>
    )
}

export default PgJabatanPage

