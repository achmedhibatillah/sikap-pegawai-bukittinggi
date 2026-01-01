import axios from "axios"
import { useEffect, useState } from "react"
import PresensiPegawaiCard from "./presensi-pegawai-card"

interface PivotData {
    status: string
    masuk?: string
    keluar?: string
    catatan?: string
}

interface PresensiSession {
    id: string
    tanggal: string
    jam_mulai: string
    jam_selesai: string
    catatan?: string | null
    pivot?: PivotData | null
    within_now?: boolean
    is_open?: boolean
}

interface IndexPegawaiPageProps {
    akun_id?: string | null
}

const IndexPegawaiPage = ({ akun_id }: IndexPegawaiPageProps) => {
    const [pegawaiId, setPegawaiId] = useState<string | null>(null)
    const [presensiSessions, setPresensiSessions] = useState<PresensiSession[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch current presensi sessions (all active sessions for today)
    const fetchCurrentPresensi = async () => {
        if (!pegawaiId) return
        try {
            setLoading(true)
            setError(null)
            const resp = await axios.get('/api/presensi/current', { 
                params: { pegawai_id: pegawaiId } 
            })
            
            if (resp.data?.status === 'success') {
                // Endpoint sekarang mengembalikan array dari semua presensi hari ini
                const presensiList = resp.data.data || []
                
                if (presensiList.length > 0) {
                    setPresensiSessions(presensiList.map((item: any) => ({
                        ...item.presensi,
                        pivot: item.pivot,
                        within_now: item.within_now,
                        is_open: item.is_open
                    })))
                } else {
                    setPresensiSessions([])
                }
            } else {
                setPresensiSessions([])
            }
        } catch (err: any) {
            console.error("Gagal mengambil presensi:", err)
            setError(err.response?.data?.message || 'Gagal mengambil data presensi')
            setPresensiSessions([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!akun_id) return

        const fetchPegawai = async () => {
            try {
                const { data } = await axios.get(`/api/pegawai-by-akun/${akun_id}`)
                setPegawaiId(data?.pegawai_id ?? null)
            } catch (error) {
                console.error("Gagal mengambil pegawai:", error)
                setPegawaiId(null)
            }
        }

        fetchPegawai()
    }, [akun_id])

    useEffect(() => {
        if (!pegawaiId) return
        fetchCurrentPresensi()
        
        // Refresh setiap 30 detik untuk update status window
        const interval = setInterval(fetchCurrentPresensi, 30000)
        return () => clearInterval(interval)
    }, [pegawaiId])

    const handleUpdate = () => {
        fetchCurrentPresensi()
    }

    // Cek apakah ada sesi aktif (dalam window 30 menit sebelum jam_mulai)
    const hasActiveSession = () => {
        const now = new Date()
        return presensiSessions.some(session => {
            try {
                const startWindow = new Date(session.tanggal + 'T' + session.jam_mulai)
                startWindow.setMinutes(startWindow.getMinutes() - 30)
                const end = new Date(session.tanggal + 'T' + session.jam_selesai)
                return now >= startWindow && now <= end
            } catch {
                return false
            }
        })
    }

    // Cek apakah sudah ada yang melakukan presensi masuk
    const hasMasuk = () => {
        return presensiSessions.some(session => session.pivot?.masuk)
    }

    // Format tanggal untuk tampilan
    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr)
            return date.toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })
        } catch {
            return dateStr
        }
    }

    return (
        <>
            <div className="space-y-4">
                <div className="text-lg font-semibold">Presensi</div>
                
                {!pegawaiId && (
                    <div className="text-sm text-gray-500">
                        Silakan login untuk melihat presensi.
                    </div>
                )}

                {pegawaiId && error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {loading && !presensiSessions.length && (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <p className="text-sm text-gray-500 mt-2">Memuat data presensi...</p>
                    </div>
                )}

                {/* Presensi Sessions Cards */}
                {presensiSessions.length > 0 && (
                    <div className="space-y-4">
                        {presensiSessions.map((session) => (
                            <PresensiPegawaiCard
                                key={session.id}
                                presensi={{
                                    id: session.id,
                                    tanggal: session.tanggal,
                                    jam_mulai: session.jam_mulai,
                                    jam_selesai: session.jam_selesai,
                                    catatan: session.catatan ?? undefined
                                }}
                                pivot={session.pivot || null}
                                within_now={session.within_now}
                                is_open={session.is_open}
                                pegawaiId={pegawaiId || ''}
                                onUpdate={handleUpdate}
                            />
                        ))}
                    </div>
                )}

                {/* No Active Session Message */}
                {!loading && !error && presensiSessions.length === 0 && (
                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
                        <div className="text-gray-400 mb-2">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 font-medium">Tidak Ada Sesi Presensi Aktif</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Saat ini tidak ada sesi presensi yang terbuka untuk tanggal hari ini.
                        </p>
                        <p className="text-xs text-gray-400 mt-4">
                            Sesi presensi dibuka 30 menit sebelum jam kerja dimulai.
                        </p>
                    </div>
                )}

                {/* Already Presensi Today */}
                {!loading && hasMasuk() && !hasActiveSession() && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-700 text-sm">
                            ✓ Anda sudah melakukan presensi masuk hari ini.
                        </p>
                    </div>
                )}

                {/* Info Section */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">Informasi Presensi</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Presensi dibuka 30 menit sebelum jam kerja dimulai</li>
                        <li>• Masuk dalam waktu 30 menit sebelum jam kerja = <strong>Hadir</strong></li>
                        <li>• Masuk setelah jam kerja = <strong>Hadir (Telat)</strong></li>
                        <li>• Pilih <strong>Izin</strong> jika tidak dapat hadir</li>
                        <li>• Tombol Keluar aktif setelah Anda melakukan presensi Masuk</li>
                    </ul>
                </div>
            </div>
        </>
    )
}

export default IndexPegawaiPage

