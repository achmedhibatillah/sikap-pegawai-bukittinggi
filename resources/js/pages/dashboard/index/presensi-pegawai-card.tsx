import axios from "axios"
import { useState, useEffect } from "react"
import PopUpRight from "@/component/popup-right"
import SimpleDropdown from "@/component/simple-dropdown"
import InputText from "@/component/input-text"

type Option = {
    value: string | number;
    label: string;
    [key: string]: any;
};

interface PresensiPegawaiCardProps {
    presensi: {
        id: string
        tanggal: string
        jam_mulai: string
        jam_selesai: string
        catatan?: string | null
    }
    pivot: {
        status: string
        masuk?: string
        keluar?: string
        catatan?: string
    } | null
    within_now?: boolean
    is_open?: boolean
    pegawaiId: string
    onUpdate: () => void
}

const PresensiPegawaiCard = ({ presensi, pivot, within_now, is_open, pegawaiId, onUpdate }: PresensiPegawaiCardProps) => {
    const [showMasukPopup, setShowMasukPopup] = useState(false)
    const [showKeluarPopup, setShowKeluarPopup] = useState(false)
    const [loading, setLoading] = useState(false)
    const [mainActionMode, setMainActionMode] = useState<'presensi' | 'rekap'>('presensi')

    // Form state untuk masuk
    const [masukStatus, setMasukStatus] = useState<Option | null>({ value: 'Hadir', label: 'Hadir' })
    const [masukCatatan, setMasukCatatan] = useState('')

    // Hitung apakah waktu sekarang dalam window presensi (30 menit sebelum jam_mulai sampai jam_selesai)
    const isInWindow = () => {
        try {
            const now = new Date()
            const startWindow = new Date(presensi.tanggal + 'T' + presensi.jam_mulai)
            startWindow.setMinutes(startWindow.getMinutes() - 30) // 30 menit sebelum
            const end = new Date(presensi.tanggal + 'T' + presensi.jam_selesai)
            return now >= startWindow && now <= end
        } catch (e) {
            return false
        }
    }

    // Logika status opened/closed berdasarkan submit dan status:
    // - DIBUKA jika: Status Alpa/null (belum ada submit apapun)
    // - DITUTUP jika:
    //   - Sudah submit keluar (Hadir + jam_pulang terisi)
    //   - Sudah submit dengan status selain Alpa dan Cuti (seperti Izin)
    //   - Status Cuti juga ditutup
    // - KECUALI Hadir: harus ada jam_pulang terisi baru dianggap DITUTUP
    const isPresensiOpen = () => {
        const status = pivot?.status
        
        // Jika belum ada status (Alpa/null), dianggap DIBUKA
        if (!status || status === 'Alpa') {
            return true
        }
        
        // Jika Izin, dianggap DITUTUP (sudah submit)
        if (status === 'Izin') {
            return false
        }
        
        // Jika Cuti, dianggap DITUTUP
        if (status === 'Cuti') {
            return false
        }
        
        // Jika Hadir atau Hadir (Telat)
        if (['Hadir', 'Hadir (Telat)'].includes(status)) {
            // Khusus Hadir: harus ada jam_pulang terisi baru DITUTUP
            if (pivot?.keluar) {
                return false
            }
            return true
        }
        
        return false
    }

    const handleMasuk = async () => {
        if (!pegawaiId || !masukStatus) return
        setLoading(true)
        try {
            const now = new Date()
            const masuk = now.toTimeString().slice(0, 8)
            
            if (masukStatus.value === 'Izin') {
                await axios.post(`/api/presensi/${presensi.id}/pegawai/${pegawaiId}/update`, {
                    status: 'Izin',
                    catatan: masukCatatan,
                })
            } else {
                await axios.post(`/api/presensi/${presensi.id}/pegawai/${pegawaiId}/update`, {
                    status: 'Hadir',
                    masuk: masuk,
                    catatan: masukCatatan,
                })
            }
            
            setShowMasukPopup(false)
            setMasukCatatan('')
            onUpdate()
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleKeluar = async () => {
        if (!pegawaiId) return
        setLoading(true)
        try {
            const now = new Date()
            const keluar = now.toTimeString().slice(0, 8)
            
            await axios.post(`/api/presensi/${presensi.id}/pegawai/${pegawaiId}/update`, {
                keluar: keluar,
            })
            
            setShowKeluarPopup(false)
            onUpdate()
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    // Update mainActionMode based on pivot status
    useEffect(() => {
        if (['Hadir', 'Hadir (Telat)'].includes(pivot?.status || '') && !pivot?.keluar) {
            setMainActionMode('rekap')
        } else {
            setMainActionMode('presensi')
        }
    }, [pivot?.status, pivot?.keluar])

    // Kondisi untuk aktif/nonaktif tombol utama
    // Tombol "Masuk" aktif jika: belum ada status (Alpa/null) DAN dalam window presensi
    // Setelah absen (Hadir/Hadir Telat/Izin), tombol menjadi nonaktif
    const canInteract = (pivot?.status === 'Alpa' || !pivot?.status) && isInWindow()
    
    const canKeluar = !!pivot?.masuk && !pivot?.keluar

    // Teks tombol utama selalu "Masuk"
    const buttonText = 'Masuk'

    // Handler untuk tombol utama
    const handleMainAction = () => {
        // Jika Alpa/null, tampilkan popup masuk
        setShowMasukPopup(true)
    }

    // Format waktu HH:MM
    const formatTime = (time?: string) => {
        if (!time) return '--:--'
        try {
            return time.slice(0, 5)
        } catch {
            return time
        }
    }

    // Format tanggal lengkap: Kamis, 1 Januari 2026
    const formatFullDate = (dateStr: string) => {
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

    // Status configuration dengan warna yang lebih mencolok
    const statusConfig = {
        'Hadir': {
            bg: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
            text: 'text-white',
            icon: '✓',
            label: 'Hadir'
        },
        'Hadir (Telat)': {
            bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
            text: 'text-white',
            icon: '⏰',
            label: 'Telat'
        },
        'Izin': {
            bg: 'bg-gradient-to-r from-sky-500 to-blue-600',
            text: 'text-white',
            icon: '📌',
            label: 'Izin'
        },
        'Alpa': {
            bg: 'bg-gradient-to-r from-slate-400 to-slate-500',
            text: 'text-white',
            icon: '○',
            label: 'Alpa'
        },
    }

    const currentStatus = pivot?.status || 'Alpa'
    const statusStyle = statusConfig[currentStatus as keyof typeof statusConfig] || statusConfig['Alpa']

    // Handle dropdown change
    const handleStatusChange = (selected: Option | null) => {
        setMasukStatus(selected)
    }

    // Handle input text change
    const handleCatatanChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setMasukCatatan(e.target.value)
    }

    return (
        <>
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-gray-200">
                {/* Header dengan gradient subtle */}
                <div className="relative bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">
                                {formatFullDate(presensi.tanggal)}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm text-gray-600 font-medium">
                                    {formatTime(presensi.jam_mulai)} - {formatTime(presensi.jam_selesai)}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {/* Session Status Badge - menggunakan isPresensiOpen() untuk logika opened/closed */}
                            <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                                isPresensiOpen()
                                    ? 'bg-green-100 text-green-700 border border-green-200' 
                                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}>
                                <span className={`w-2 h-2 rounded-full ${
                                    isPresensiOpen() ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                                }`}></span>
                                {isPresensiOpen() ? 'Dibuka' : 'Ditutup'}
                            </div>
                            
                            {/* Status Badge */}
                            <div className={`${statusStyle.bg} ${statusStyle.text} px-4 py-2 rounded-xl shadow-md flex items-center gap-2`}>
                                <span className="text-sm">{statusStyle.icon}</span>
                                <span className="font-semibold text-sm">{statusStyle.label}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Waktu Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* Masuk Card */}
                        <div className={`relative overflow-hidden rounded-xl p-4 text-center transition-all duration-300 ${
                            pivot?.masuk 
                                ? 'bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 shadow-sm' 
                                : 'bg-gray-50 border border-gray-200'
                        }`}>
                            {/* Jadwal Asli */}
                            <div className="text-xs text-gray-400 mb-1 font-medium">
                                Jadwal: {formatTime(presensi.jam_mulai)}
                            </div>
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <svg className={`w-5 h-5 ${pivot?.masuk ? 'text-emerald-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                                <span className={`text-xs font-semibold uppercase tracking-wider ${pivot?.masuk ? 'text-emerald-700' : 'text-gray-500'}`}>
                                    Jam Masuk
                                </span>
                            </div>
                            <p className={`text-2xl font-bold ${pivot?.masuk ? 'text-emerald-700' : 'text-gray-400'}`}>
                                {formatTime(pivot?.masuk)}
                            </p>
                        </div>

                        {/* Keluar Card */}
                        <div className={`relative overflow-hidden rounded-xl p-4 text-center transition-all duration-300 ${
                            pivot?.keluar 
                                ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-sm' 
                                : 'bg-gray-50 border border-gray-200'
                        }`}>
                            {/* Jadwal Asli */}
                            <div className="text-xs text-gray-400 mb-1 font-medium">
                                Jadwal: {formatTime(presensi.jam_selesai)}
                            </div>
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <svg className={`w-5 h-5 ${pivot?.keluar ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className={`text-xs font-semibold uppercase tracking-wider ${pivot?.keluar ? 'text-blue-700' : 'text-gray-500'}`}>
                                    Jam Keluar
                                </span>
                            </div>
                            <p className={`text-2xl font-bold ${pivot?.keluar ? 'text-blue-700' : 'text-gray-400'}`}>
                                {formatTime(pivot?.keluar)}
                            </p>
                        </div>
                    </div>

                    {/* Catatan */}
                    {pivot?.catatan && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-xs font-medium text-amber-700 uppercase mb-1">Catatan</p>
                            <p className="text-sm text-amber-800">{pivot.catatan}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleMainAction}
                            disabled={!canInteract}
                            className={`rounded-xl py-3 px-4 text-sm font-semibold transition-all duration-200 ${
                                canInteract
                                    ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow cursor-pointer'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            <span>{buttonText}</span>
                        </button>

                        <button
                            onClick={() => setShowKeluarPopup(true)}
                            disabled={!canKeluar}
                            className={`rounded-xl py-3 px-4 text-sm font-semibold transition-all duration-200 ${
                                canKeluar
                                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow cursor-pointer'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            <span>Pulang</span>
                        </button>
                    </div>

                    {/* Info Text */}
                    {!isInWindow() && !pivot?.masuk && (
                        <p className="mt-3 text-xs text-center text-gray-400">
                            Presensi dibuka 30 menit sebelum jam mulai
                        </p>
                    )}
                </div>
            </div>

            {/* Popup Presensi Masuk */}
            <PopUpRight
                name="Presensi Masuk"
                state={showMasukPopup}
                setState={setShowMasukPopup}
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Silakan pilih status kehadiran Anda:
                    </p>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status Kehadiran</label>
                        <SimpleDropdown
                            value={masukStatus}
                            onChange={handleStatusChange}
                            options={[
                                { value: 'Hadir', label: 'Hadir' },
                                { value: 'Izin', label: 'Izin' },
                            ]}
                        />
                    </div>

                    {masukStatus?.value === 'Izin' ? (
                        <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded">
                            Jika memilih Izin, silakan menambahkan alasan perizinan dalam bagian catatan.
                        </p>
                    ) : (
                        <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
                            Jam masuk akan dicatat berdasarkan waktu sekarang.
                        </p>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (opsional)</label>
                        <InputText
                            value={masukCatatan}
                            onChange={handleCatatanChange}
                            placeholder="Tambahkan catatan jika perlu..."
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            onClick={() => setShowMasukPopup(false)}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleMasuk}
                            disabled={loading}
                            className="flex-1 py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? 'Memproses...' : 'Simpan'}
                        </button>
                    </div>
                </div>
            </PopUpRight>

            {/* Popup Presensi Keluar */}
            <PopUpRight
                name="Presensi Keluar"
                state={showKeluarPopup}
                setState={setShowKeluarPopup}
            >
                <div className="space-y-4">
                    <div className="text-center py-4">
                        <div className="text-3xl font-bold text-gray-900">
                            {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Waktu saat ini</p>
                    </div>

                    <p className="text-sm text-gray-600 text-center">
                        Apakah Anda ingin mencatat kepulangan pada pukul{' '}
                        <strong className="text-blue-600">
                            {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </strong>
                        ?
                    </p>

                    <div className="pt-4 flex gap-3">
                        <button
                            onClick={() => setShowKeluarPopup(false)}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleKeluar}
                            disabled={loading}
                            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Memproses...' : 'Ya, Pulang'}
                        </button>
                    </div>
                </div>
            </PopUpRight>
        </>
    )
}

export default PresensiPegawaiCard

