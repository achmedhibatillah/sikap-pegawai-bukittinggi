
import { useState, useEffect, useMemo } from "react"
import axios from "axios"
import DashboardLayout from "@/layout/dashboard-layout"
import { FiChevronLeft, FiChevronRight, FiCalendar, FiClock } from "react-icons/fi"

interface object_sss {
    usr?: string
    acs?: string
}

interface DashboardPageProps {
    sss?: object_sss | null
}

interface Kegiatan {
    id: string
    nama: string
    deskripsi: string | null
    tanggal: string
    jam_mulai: string | null
    jam_selesai: string | null
    is_fullday: boolean
    warna: 'merah' | 'kuning' | 'hijau' | 'biru'
}

const PgKegiatanPage = ({ sss }: DashboardPageProps) => {
    const [kegiatans, setKegiatans] = useState<Kegiatan[]>([])
    const [loading, setLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedKegiatan, setSelectedKegiatan] = useState<Kegiatan | null>(null)

    const tahun = currentDate.getFullYear()
    const bulan = currentDate.getMonth() + 1

    const fetchKegiatans = async () => {
        setLoading(true)
        try {
            const response = await axios.get(`/pg/api/kegiatan?bulan=${bulan}&tahun=${tahun}`)
            if (response.data?.status === 'success') {
                setKegiatans(response.data.data.kegiatans || [])
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchKegiatans()
    }, [tahun, bulan])

    const getKegiatanForDate = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`
        
        return kegiatans.filter(k => {
            const kegiatanDate = k.tanggal.split('T')[0]
            return kegiatanDate === dateStr
        })
    }

    const getWarnaClass = (warna: Kegiatan['warna']) => {
        switch (warna) {
            case 'merah': return 'bg-red-500 border-red-600'
            case 'kuning': return 'bg-yellow-500 border-yellow-600'
            case 'hijau': return 'bg-green-500 border-green-600'
            case 'biru': return 'bg-blue-500 border-blue-600'
            default: return 'bg-gray-500 border-gray-600'
        }
    }

    const getWarnaBg = (warna: Kegiatan['warna']) => {
        switch (warna) {
            case 'merah': return 'bg-red-50 border-red-200 text-red-700'
            case 'kuning': return 'bg-yellow-50 border-yellow-200 text-yellow-700'
            case 'hijau': return 'bg-green-50 border-green-200 text-green-700'
            case 'biru': return 'bg-blue-50 border-blue-200 text-blue-700'
            default: return 'bg-gray-50 border-gray-200 text-gray-700'
        }
    }

    const formatTime = (time: string | null) => {
        if (!time) return ''
        return time.substring(0, 5)
    }

    const isToday = (date: Date) => {
        const today = new Date()
        return date.toDateString() === today.toDateString()
    }

    const isSelectedDate = (date: Date) => {
        return selectedDate && date.toDateString() === selectedDate.toDateString()
    }

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        
        const days = []
        
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push({ date: null })
        }
        
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day)
            days.push({
                date,
                kegiatans: getKegiatanForDate(date)
            })
        }
        
        const remainingCells = 42 - days.length
        for (let i = 0; i < remainingCells; i++) {
            days.push({ date: null })
        }
        
        return days
    }, [currentDate, kegiatans])

    // Get activities for current month
    const thisMonthActivities = useMemo(() => {
        return kegiatans.filter(k => {
            const kegiatanDate = new Date(k.tanggal)
            return kegiatanDate.getMonth() === currentDate.getMonth() &&
                   kegiatanDate.getFullYear() === currentDate.getFullYear()
        }).sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
    }, [kegiatans, currentDate])

    return (
        <DashboardLayout sss={sss} now="Kegiatan">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Jadwal Kegiatan</h1>
                <p className="text-gray-500 text-sm mt-1">Lihat jadwal kegiatan organisasi</p>
            </div>

            <div className="grid lg:grid-cols-4 gap-4">
                {/* Calendar */}
                <div className="lg:col-span-3 bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between mb-4">
                        <button 
                            className="p-2 rounded hover:bg-gray-100 cursor-pointer"
                            onClick={() => setCurrentDate(new Date(tahun, bulan - 2, 1))}
                        >
                            <FiChevronLeft />
                        </button>
                        <div className="text-xl font-semibold">
                            {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                        </div>
                        <button 
                            className="p-2 rounded hover:bg-gray-100 cursor-pointer"
                            onClick={() => setCurrentDate(new Date(tahun, bulan, 1))}
                        >
                            <FiChevronRight />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(hari => (
                            <div key={hari} className="text-center text-sm font-medium text-gray-500 py-2">
                                {hari}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => (
                            <div
                                key={index}
                                onClick={() => {
                                    if (day.date) {
                                        if (selectedDate && selectedDate.toDateString() !== day.date.toDateString()) {
                                            setSelectedKegiatan(null)
                                        }
                                        setSelectedDate(day.date)
                                    }
                                }}
                                className={`
                                    min-h-[100px] p-2 border rounded cursor-pointer transition
                                    ${day.date ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'}
                                    ${day.date && isToday(day.date!) ? 'ring-2 ring-green-500 ring-inset' : ''}
                                    ${day.date && isSelectedDate(day.date!) ? 'ring-2 ring-blue-500 ring-inset bg-blue-50' : ''}
                                `}
                            >
                                {day.date && (
                                    <>
                                        <div className={`
                                            text-sm font-medium mb-1
                                            ${isToday(day.date) ? 'text-green-600' : 'text-gray-700'}
                                        `}>
                                            {day.date.getDate()}
                                        </div>
                                        <div className="space-y-1">
                                            {day.kegiatans?.slice(0, 3).map((k, i) => (
                                                <div
                                                    key={i}
                                                    className={`
                                                        text-xs p-1 rounded truncate
                                                        ${getWarnaClass(k.warna)} text-white
                                                    `}
                                                >
                                                    {k.nama}
                                                </div>
                                            ))}
                                            {day.kegiatans && day.kegiatans.length > 3 && (
                                                <div className="text-xs text-gray-500 pl-1">
                                                    +{day.kegiatans.length - 3} lagi
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Selected Date Info */}
                    {selectedDate && (
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <FiCalendar className="text-green-600" />
                                <div className="font-semibold">
                                    {selectedDate.toLocaleDateString('id-ID', { 
                                        weekday: 'long', 
                                        day: 'numeric', 
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Today's Activities */}
                    {selectedDate && (
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="font-semibold mb-3">Kegiatan Hari Ini</div>
                            {getKegiatanForDate(selectedDate).length > 0 ? (
                                <div className="space-y-2">
                                    {getKegiatanForDate(selectedDate).map((k) => (
                                        <div
                                            key={k.id}
                                            className={`
                                                p-3 rounded-lg border cursor-pointer transition
                                                ${getWarnaBg(k.warna)}
                                                ${selectedKegiatan?.id === k.id ? 'ring-2 ring-blue-500' : ''}
                                            `}
                                            onClick={() => setSelectedKegiatan(k)}
                                        >
                                            <div className="font-medium">{k.nama}</div>
                                            <div className="text-sm flex items-center gap-1 mt-1">
                                                <FiClock />
                                                {k.is_fullday ? 'Seharian' : `${formatTime(k.jam_mulai)} - ${formatTime(k.jam_selesai)}`}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500 text-sm">Tidak ada kegiatan</div>
                            )}
                        </div>
                    )}

                    {/* Detail Kegiatan - only from "Kegiatan Hari Ini" click */}
                    {selectedKegiatan && (
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="font-semibold mb-3">Detail Kegiatan</div>
                            <div className={`
                                p-3 rounded-lg border mb-3
                                ${getWarnaBg(selectedKegiatan.warna)}
                            `}>
                                <div className="font-medium text-lg">{selectedKegiatan.nama}</div>
                                {selectedKegiatan.deskripsi && (
                                    <div className="text-sm mt-2 opacity-80">{selectedKegiatan.deskripsi}</div>
                                )}
                                <div className="flex items-center gap-2 mt-2 text-sm">
                                    <FiCalendar />
                                    {new Date(selectedKegiatan.tanggal).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </div>
                                {!selectedKegiatan.is_fullday && (
                                    <div className="flex items-center gap-2 mt-1 text-sm">
                                        <FiClock />
                                        {formatTime(selectedKegiatan.jam_mulai)} - {formatTime(selectedKegiatan.jam_selesai)}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}

export default PgKegiatanPage

