import { useState, useEffect } from "react"
import axios from "axios"
import DashboardLayout from "@/layout/dashboard-layout"
import PopUpRight from "@/component/popup-right"

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
    pegawai_id: string
    jabatan_lama_id: string | null
    jabatan_baru_id: string
    alasan: string | null
    status: 'pending' | 'diterima' | 'ditolak'
    acc_by: string | null
    acc_at: string | null
    catatan_acc: string | null
    created_at: string
    updated_at: string
    pegawai?: { id: string; nama: string } | null
    jabatan_lama?: Jabatan | null
    jabatan_baru: Jabatan
    acc_by_user?: { id: string; nama: string } | null
}

const JabatanAjuanPage = ({ sss }: DashboardPageProps) => {
    const [ajuanList, setAjuanList] = useState<JabatanAjuan[]>([])
    const [loading, setLoading] = useState(false)
    const [showApprovePopup, setShowApprovePopup] = useState(false)
    const [showRejectPopup, setShowRejectPopup] = useState(false)
    const [selectedAjuan, setSelectedAjuan] = useState<JabatanAjuan | null>(null)
    const [filterStatus, setFilterStatus] = useState<string>('')
    const [catatanAcc, setCatatanAcc] = useState('')
    const [submitLoading, setSubmitLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const fetchAjuan = async () => {
        setLoading(true)
        try {
            const params: any = {}
            if (filterStatus) params.status = filterStatus
            const resp = await axios.get('/api/jabatan-ajuan', { params })
            if (resp.data?.status === 'success') {
                setAjuanList(resp.data.data.items || [])
            }
        } catch (err: any) {
            console.error(err)
            setMessage({ type: 'error', text: 'Gagal memuat data pengajuan' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchAjuan() }, [filterStatus])

    const openApprovePopup = (ajuan: JabatanAjuan) => {
        setSelectedAjuan(ajuan)
        setCatatanAcc('')
        setShowApprovePopup(true)
    }

    const openRejectPopup = (ajuan: JabatanAjuan) => {
        setSelectedAjuan(ajuan)
        setCatatanAcc('')
        setShowRejectPopup(true)
    }

    const handleApprove = async () => {
        if (!selectedAjuan) return
        setSubmitLoading(true)
        try {
            const resp = await axios.post(`/api/jabatan-ajuan/${selectedAjuan.id}/approve`, { catatan_acc: catatanAcc })
            if (resp.data?.status === 'success') {
                setMessage({ type: 'success', text: 'Pengajuan jabatan telah disetujui' })
                setShowApprovePopup(false)
                setSelectedAjuan(null)
                fetchAjuan()
            } else {
                setMessage({ type: 'error', text: resp.data?.message || 'Gagal menyetujui' })
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal menyetujui' })
        } finally {
            setSubmitLoading(false)
        }
    }

    const handleReject = async () => {
        if (!selectedAjuan) return
        setSubmitLoading(true)
        try {
            const resp = await axios.post(`/api/jabatan-ajuan/${selectedAjuan.id}/reject`, { catatan_acc: catatanAcc })
            if (resp.data?.status === 'success') {
                setMessage({ type: 'success', text: 'Pengajuan jabatan telah ditolak' })
                setShowRejectPopup(false)
                setSelectedAjuan(null)
                fetchAjuan()
            } else {
                setMessage({ type: 'error', text: resp.data?.message || 'Gagal menolak' })
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal menolak' })
        } finally {
            setSubmitLoading(false)
        }
    }

    const formatTanggal = (tanggal: string) => {
        try {
            const date = new Date(tanggal)
            return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        } catch { return tanggal }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'diterima': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Disetujui</span>
            case 'ditolak': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Ditolak</span>
            default: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">Menunggu</span>
        }
    }

    const getTingkatBadge = (tingkat: number) => {
        const colors: Record<number, string> = { 1: 'bg-blue-100 text-blue-700', 2: 'bg-purple-100 text-purple-700', 3: 'bg-gray-100 text-gray-700' }
        const labels: Record<number, string> = { 1: 'Struktural', 2: 'Fungsional', 3: 'Pelaksana' }
        const color = colors[tingkat] || 'bg-gray-100 text-gray-700'
        return <span className={`px-2 py-0.5 text-xs rounded ${color}`}>{labels[tingkat] || 'Lainnya'}</span>
    }

    const pendingCount = ajuanList.filter(a => a.status === 'pending').length

    return (
        <DashboardLayout sss={sss} now="Jabatan Ajuan">
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Pengajuan Jabatan</h1>
                        <p className="text-gray-500 text-sm mt-1">Kelola pengajuan kenaikan/pindah jabatan</p>
                    </div>
                </div>
            </div>

            {message && (
                <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Total Pengajuan</p>
                    <p className="text-2xl font-bold text-gray-800">{ajuanList.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Menunggu</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Disetujui</p>
                    <p className="text-2xl font-bold text-green-600">{ajuanList.filter(a => a.status === 'diterima').length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Ditolak</p>
                    <p className="text-2xl font-bold text-red-600">{ajuanList.filter(a => a.status === 'ditolak').length}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                    <option value="">Semua Status</option>
                    <option value="pending">Menunggu</option>
                    <option value="diterima">Disetujui</option>
                    <option value="ditolak">Ditolak</option>
                </select>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Memuat data...</div>
                ) : ajuanList.length === 0 ? (
                    <div className="p-8 text-center text-gray-500"><div className="text-4xl mb-2">📋</div><p>Tidak ada pengajuan jabatan</p></div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {ajuanList.map((ajuan) => (
                            <div key={ajuan.id} className="p-4 hover:bg-gray-50 transition">
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                                <span className="text-emerald-700 font-medium text-sm">{ajuan.pegawai?.nama?.charAt(0) || '?'}</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{ajuan.pegawai?.nama || 'Pegawai'}</p>
                                                <p className="text-xs text-gray-500">ID: {ajuan.pegawai_id.slice(0, 8)}...</p>
                                            </div>
                                        </div>
                                        <div className="ml-10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm text-gray-600">{ajuan.jabatan_lama ? ajuan.jabatan_lama.nama : <span className="italic text-gray-400">Tanpa Jabatan</span>}</span>
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                                <span className="font-semibold text-gray-800">{ajuan.jabatan_baru.nama}</span>
                                                {getTingkatBadge(ajuan.jabatan_baru.tingkatan)}
                                            </div>
                                            {ajuan.alasan && <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-2">{ajuan.alasan}</p>}
                                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                                <span>Diajukan: {formatTanggal(ajuan.created_at)}</span>
                                                {ajuan.acc_at && <span>Diproses: {formatTanggal(ajuan.acc_at)}</span>}
                                                {ajuan.acc_by_user && <span>Oleh: {ajuan.acc_by_user.nama}</span>}
                                                {getStatusBadge(ajuan.status)}
                                            </div>
                                            {ajuan.catatan_acc && (
                                                <p className="text-sm text-gray-600 mt-2 bg-yellow-50 p-2 rounded border border-yellow-200">
                                                    <span className="font-medium">Catatan: </span>{ajuan.catatan_acc}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {ajuan.status === 'pending' && (
                                        <div className="flex gap-2 lg:flex-col">
                                            <button onClick={() => openApprovePopup(ajuan)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium cursor-pointer">Setujui</button>
                                            <button onClick={() => openRejectPopup(ajuan)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium cursor-pointer">Tolak</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <PopUpRight name="Setujui Pengajuan" state={showApprovePopup} setState={setShowApprovePopup}>
                {selectedAjuan && (
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-medium text-green-800 mb-2">Konfirmasi Persetujuan</h4>
                            <div className="text-sm text-green-700 space-y-1">
                                <p><span className="font-medium">Pegawai:</span> {selectedAjuan.pegawai?.nama}</p>
                                <p><span className="font-medium">Jabatan Lama:</span> {selectedAjuan.jabatan_lama?.nama || 'Tanpa Jabatan'}</p>
                                <p><span className="font-medium">Jabatan Baru:</span> {selectedAjuan.jabatan_baru.nama}</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (opsional)</label>
                            <textarea value={catatanAcc} onChange={(e) => setCatatanAcc(e.target.value)} placeholder="Tambahkan catatan..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" rows={3} />
                        </div>
                        <div className="pt-4 flex gap-3">
                            <button onClick={() => setShowApprovePopup(false)} className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition cursor-pointer">Batal</button>
                            <button onClick={handleApprove} disabled={submitLoading}
                                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 cursor-pointer">
                                {submitLoading ? 'Memproses...' : 'Setujui'}
                            </button>
                        </div>
                    </div>
                )}
            </PopUpRight>

            <PopUpRight name="Tolak Pengajuan" state={showRejectPopup} setState={setShowRejectPopup}>
                {selectedAjuan && (
                    <div className="space-y-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="font-medium text-red-800 mb-2">Konfirmasi Penolakan</h4>
                            <div className="text-sm text-red-700 space-y-1">
                                <p><span className="font-medium">Pegawai:</span> {selectedAjuan.pegawai?.nama}</p>
                                <p><span className="font-medium">Jabatan Lama:</span> {selectedAjuan.jabatan_lama?.nama || 'Tanpa Jabatan'}</p>
                                <p><span className="font-medium">Jabatan Baru:</span> {selectedAjuan.jabatan_baru.nama}</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Penolakan <span className="text-red-500">*</span></label>
                            <textarea value={catatanAcc} onChange={(e) => setCatatanAcc(e.target.value)} placeholder="Jelaskan alasan penolakan..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" rows={3} />
                        </div>
                        <div className="pt-4 flex gap-3">
                            <button onClick={() => setShowRejectPopup(false)} className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition cursor-pointer">Batal</button>
                            <button onClick={handleReject} disabled={submitLoading || !catatanAcc.trim()}
                                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 cursor-pointer">
                                {submitLoading ? 'Memproses...' : 'Tolak'}
                            </button>
                        </div>
                    </div>
                )}
            </PopUpRight>
        </DashboardLayout>
    )
}

export default JabatanAjuanPage

