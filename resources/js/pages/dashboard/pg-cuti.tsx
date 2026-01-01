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

interface Cuti {
    id: string
    tanggal_mulai: string
    tanggal_selesai: string
    catatan: string | null
    acc: boolean
    pegawai_id: string
    created_at?: string
    updated_at?: string
}

const PgCutiPage = ({ sss }: DashboardPageProps) => {
    const [cutis, setCuti] = useState<Cuti[]>([])
    const [loading, setLoading] = useState(false)
    const [showAddPopup, setShowAddPopup] = useState(false)
    const [tanggalMulai, setTanggalMulai] = useState('')
    const [tanggalSelesai, setTanggalSelesai] = useState('')
    const [catatan, setCatatan] = useState('')
    const [submitLoading, setSubmitLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const fetchCuti = async () => {
        setLoading(true)
        try {
            const resp = await axios.get('/pg/api/cuti/my')
            if (resp.data?.status === 'success') {
                setCuti(resp.data.data.cutis || [])
            }
        } catch (err: any) {
            console.error(err)
            setMessage({ type: 'error', text: 'Gagal memuat data cuti' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCuti()
    }, [])

    const handleAddCuti = async () => {
        if (!tanggalMulai || !tanggalSelesai) {
            setMessage({ type: 'error', text: 'Tanggal mulai dan selesai wajib diisi' })
            return
        }

        setSubmitLoading(true)
        try {
            const resp = await axios.post('/pg/api/cuti/add', {
                tanggal_mulai: tanggalMulai,
                tanggal_selesai: tanggalSelesai,
                catatan
            })
            if (resp.data?.status === 'success') {
                setMessage({ type: 'success', text: 'Pengajuan cuti berhasil dikirim' })
                setShowAddPopup(false)
                setTanggalMulai('')
                setTanggalSelesai('')
                setCatatan('')
                fetchCuti()
            } else {
                setMessage({ type: 'error', text: resp.data?.message || 'Gagal mengajukan cuti' })
            }
        } catch (err: any) {
            console.error(err)
            setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal mengajukan cuti' })
        } finally {
            setSubmitLoading(false)
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

    const getStatusBadge = (acc, created_at, updated_at) => {
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

    return (
        <DashboardLayout sss={sss} now="Cuti">
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Riwayat Cuti</h1>
                        <p className="text-gray-500 text-sm mt-1">Kelola pengajuan dan riwayat cuti Anda</p>
                    </div>
                    <button
                        onClick={() => setShowAddPopup(true)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-sm cursor-pointer"
                    >
                        + Ajukan Cuti
                    </button>
                </div>
            </div>

            {message && (
                <div className={`mb-4 p-4 rounded-lg ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Total Pengajuan</p>
                    <p className="text-2xl font-bold text-gray-800">{cutis.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Disetujui</p>
                    <p className="text-2xl font-bold text-green-600">
                        {cutis.filter(c => c.acc === true).length}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Menunggu</p>
                    <p className="text-2xl font-bold text-yellow-600">
                        {cutis.filter(c => c.created_at === c.updated_at).length}
                    </p>
                </div>
            </div>

            {/* Cuti List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">
                        Memuat data...
                    </div>
                ) : cutis.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <div className="text-4xl mb-2">��</div>
                        <p>Belum ada pengajuan cuti</p>
                        <button
                            onClick={() => setShowAddPopup(true)}
                            className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm cursor-pointer"
                        >
                            Ajukan Cuti Pertama
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {cutis.map((cuti) => (
                            <div key={cuti.id} className="p-4 hover:bg-gray-50 transition">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-gray-800">
                                                {formatTanggal(cuti.tanggal_mulai)}
                                            </span>
                                            {cuti.tanggal_mulai !== cuti.tanggal_selesai && (
                                                <>
                                                    <span className="text-gray-400">→</span>
                                                    <span className="font-semibold text-gray-800">
                                                        {formatTanggal(cuti.tanggal_selesai)}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {hitungHari(cuti.tanggal_mulai, cuti.tanggal_selesai)} hari kerja
                                        </p>
                                        {cuti.catatan && (
                                            <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                                                {cuti.catatan}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(cuti.acc, cuti.created_at, cuti.updated_at)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Cuti Popup */}
            <PopUpRight
                name="Ajukan Cuti"
                state={showAddPopup}
                setState={setShowAddPopup}
            >
                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-700">
                            Pengajuan cuti akan menunggu persetujuan dari admin sebelum dikonfirmasi.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tanggal Mulai <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            type="date"
                            value={tanggalMulai}
                            onChange={(e: any) => setTanggalMulai(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tanggal Selesai <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            type="date"
                            value={tanggalSelesai}
                            onChange={(e: any) => setTanggalSelesai(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Alasan Cuti (opsional)
                        </label>
                        <textarea
                            value={catatan}
                            onChange={(e: any) => setCatatan(e.target.value)}
                            placeholder="Tuliskan alasan cuti Anda..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                            rows={3}
                        />
                    </div>

                    {tanggalMulai && tanggalSelesai && (
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-600">
                                Total: <span className="font-semibold">{hitungHari(tanggalMulai, tanggalSelesai)} hari</span>
                            </p>
                        </div>
                    )}

                    <div className="pt-4 flex gap-3">
                        <button
                            onClick={() => setShowAddPopup(false)}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleAddCuti}
                            disabled={submitLoading || !tanggalMulai || !tanggalSelesai}
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

export default PgCutiPage
