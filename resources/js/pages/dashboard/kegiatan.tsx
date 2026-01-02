import DashboardLayout from "@/layout/dashboard-layout"
import { useState, useEffect } from "react"
import Button from "@/component/button"
import PopUpRight from "@/component/popup-right"
import { useFormik } from "formik"
import * as Yup from "yup"
import axios from "axios"
import { FiPlus, FiChevronLeft, FiChevronRight, FiCalendar, FiClock, FiTrash2, FiEdit2 } from "react-icons/fi"
import { IoIosSave } from "react-icons/io"
import InputText from "@/component/input-text"
import ErrorInput from "@/component/error-input"

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

const KegiatanPage = ({ sss }: DashboardPageProps) => {
    const [kegiatans, setKegiatans] = useState<Kegiatan[]>([])
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedKegiatan, setSelectedKegiatan] = useState<Kegiatan | null>(null)
    const [openAddMenu, setOpenAddMenu] = useState(false)
    const [openEditMenu, setOpenEditMenu] = useState(false)
    const [openDeleteMenu, setOpenDeleteMenu] = useState(false)

    const tahun = currentDate.getFullYear()
    const bulan = currentDate.getMonth() + 1

    useEffect(() => {
        fetchKegiatans()
    }, [tahun, bulan])

    const fetchKegiatans = async () => {
        try {
            const response = await axios.get(`/api/kegiatan?bulan=${bulan}&tahun=${tahun}`)
            if (response.data?.status === 'success') {
                setKegiatans(response.data.data.kegiatans)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const getKegiatanForDate = (date: Date) => {
        // Format date to YYYY-MM-DD using local timezone
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        return kegiatans.filter(k => {
            // Convert ISO date string to YYYY-MM-DD format
            const kegiatanDate = k.tanggal.split('T')[0];
            return kegiatanDate === dateStr;
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

    return (
        <DashboardLayout sss={sss} now="Kegiatan">
            <div className="min-h-full">
                <div className="mb-3">
                    <div className="text-3xl font-bold mb-1">Jadwal Kegiatan</div>
                    <div className="text-gray-500">Kelola jadwal kegiatan organisasi</div>
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
                            {generateCalendarDays(currentDate, getKegiatanForDate).map((day, index) => (
                                <div
                                    key={index}
                                    onClick={() => {
                                        if (day.date) {
                                            // Clear selected kegiatan when clicking a different date
                                            if (selectedDate && selectedDate.toDateString() !== day.date.toDateString()) {
                                                setSelectedKegiatan(null);
                                            }
                                            setSelectedDate(day.date);
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
                                <Button 
                                    color="secondary" 
                                    className="w-full"
                                    onClick={() => setOpenAddMenu(true)}
                                >
                                    <FiPlus className="inline mr-2" />
                                    Tambah Kegiatan
                                </Button>
                            </div>
                        )}

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
                                <div className="flex gap-2">
                                    <Button 
                                        color="secondary" 
                                        className="flex-1"
                                        onClick={() => {
                                            setOpenEditMenu(true)
                                        }}
                                    >
                                        <FiEdit2 className="inline mr-1" />
                                        Edit
                                    </Button>
                                    <Button 
                                        color="danger" 
                                        className="flex-1"
                                        onClick={() => setOpenDeleteMenu(true)}
                                    >
                                        <FiTrash2 className="inline mr-1" />
                                        Hapus
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {openAddMenu && selectedDate && (
                <AddKegiatanModal
                    selectedDate={selectedDate}
                    onClose={() => setOpenAddMenu(false)}
                    onSuccess={() => {
                        setOpenAddMenu(false)
                        fetchKegiatans()
                    }}
                />
            )}

            {/* Edit Modal */}
            {openEditMenu && selectedKegiatan && (
                <EditKegiatanModal
                    kegiatan={selectedKegiatan}
                    onClose={() => setOpenEditMenu(false)}
                    onSuccess={(updatedKegiatan) => {
                        setOpenEditMenu(false)
                        setSelectedKegiatan(updatedKegiatan)
                        fetchKegiatans()
                    }}
                />
            )}

            {/* Delete Modal */}
            {openDeleteMenu && selectedKegiatan && (
                <DeleteKegiatanModal
                    kegiatan={selectedKegiatan}
                    onClose={() => setOpenDeleteMenu(false)}
                    onSuccess={() => {
                        setOpenDeleteMenu(false)
                        setSelectedKegiatan(null)
                        fetchKegiatans()
                    }}
                />
            )}
        </DashboardLayout>
    )
}

// Generate calendar days
function generateCalendarDays(currentDate: Date, getKegiatan: (date: Date) => Kegiatan[]) {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const days = []
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay.getDay(); i++) {
        days.push({ date: null })
    }
    
    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day)
        days.push({
            date,
            kegiatans: getKegiatan(date)
        })
    }
    
    // Add empty cells for days after the last day of month
    const remainingCells = 42 - days.length
    for (let i = 0; i < remainingCells; i++) {
        days.push({ date: null })
    }
    
    return days
}

export default KegiatanPage

// Add Kegiatan Modal
interface AddKegiatanModalProps {
    selectedDate: Date
    onClose: () => void
    onSuccess: () => void
}

const AddKegiatanModal = ({ selectedDate, onClose, onSuccess }: AddKegiatanModalProps) => {
    const tanggal = selectedDate.toISOString().split('T')[0]
    
    const formik = useFormik({
        initialValues: {
            nama: '',
            deskripsi: '',
            tanggal: tanggal,
            jam_mulai: '',
            jam_selesai: '',
            is_fullday: true,
            warna: 'biru' as const
        },
        validationSchema: Yup.object({
            nama: Yup.string().required('Nama kegiatan wajib diisi').max(255),
            deskripsi: Yup.string().nullable(),
            tanggal: Yup.date().required(),
            jam_mulai: Yup.string().nullable(),
            jam_selesai: Yup.string().nullable().test('after-start', 'Jam selesai harus setelah jam mulai', function(value) {
                const { jam_mulai } = this.parent
                if (!value || !jam_mulai) return true
                return value > jam_mulai
            }),
            is_fullday: Yup.boolean(),
            warna: Yup.string().required().oneOf(['merah', 'kuning', 'hijau', 'biru'])
        }),
        onSubmit: async (values) => {
            try {
                const response = await axios.post('/api/kegiatan/add', values)
                if (response.data?.status === 'success') {
                    alert('Kegiatan berhasil ditambahkan')
                    onSuccess()
                } else {
                    alert('Gagal menambahkan kegiatan: ' + response.data?.message)
                }
            } catch (e) {
                console.error(e)
                alert('Terjadi kesalahan')
            }
        }
    })

    const warnaOptions = [
        { value: 'merah', label: 'Merah', bg: 'bg-red-500' },
        { value: 'kuning', label: 'Kuning', bg: 'bg-yellow-500' },
        { value: 'hijau', label: 'Hijau', bg: 'bg-green-500' },
        { value: 'biru', label: 'Biru', bg: 'bg-blue-500' }
    ]

    return (
        <PopUpRight name="Tambah Kegiatan" state={true} setState={onClose} dangerWhenClose={true}>
            <form onSubmit={formik.handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Nama Kegiatan *</label>
                    <InputText
                        type="text"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Rapat Koordinasi"
                        {...formik.getFieldProps('nama')}
                    />
                    {formik.touched.nama && formik.errors.nama && (
                        <ErrorInput className="mt-2">{formik.errors.nama}</ErrorInput>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Deskripsi</label>
                    <textarea
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Deskripsi kegiatan..."
                        rows={3}
                        {...formik.getFieldProps('deskripsi')}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Tanggal *</label>
                    <div className="p-2 bg-gray-100 rounded text-gray-700">
                        {selectedDate.toLocaleDateString('id-ID', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long',
                            year: 'numeric'
                        })}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formik.values.is_fullday}
                            onChange={(e) => formik.setFieldValue('is_fullday', e.target.checked)}
                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="text-sm">Seharian (tanpa jam)</span>
                    </label>
                </div>

                {!formik.values.is_fullday && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Jam Mulai</label>
                            <InputText
                                type="time"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                {...formik.getFieldProps('jam_mulai')}
                            />
                            {formik.touched.jam_mulai && formik.errors.jam_mulai && (
                                <ErrorInput className="mt-2">{formik.errors.jam_mulai}</ErrorInput>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Jam Selesai</label>
                            <InputText
                                type="time"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                {...formik.getFieldProps('jam_selesai')}
                            />
                            {formik.touched.jam_selesai && formik.errors.jam_selesai && (
                                <ErrorInput className="mt-2">{formik.errors.jam_selesai}</ErrorInput>
                            )}
                        </div>
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Warna *</label>
                    <div className="flex gap-2">
                        {warnaOptions.map(w => (
                            <label key={w.value} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="warna"
                                    value={w.value}
                                    checked={formik.values.warna === w.value}
                                    onChange={(e) => formik.setFieldValue('warna', e.target.value)}
                                    className="sr-only peer"
                                />
                                <div className={`
                                    w-8 h-8 rounded-full ${w.bg} cursor-pointer
                                    peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-gray-400
                                `} />
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2 mt-6">
                    <Button type="button" color="secondary" onClick={onClose} className="flex-1">
                        Batal
                    </Button>
                    <Button type="submit" className="flex-1">
                        <IoIosSave className="inline mr-1" />
                        Simpan
                    </Button>
                </div>
            </form>
        </PopUpRight>
    )
}

// Edit Kegiatan Modal
interface EditKegiatanModalProps {
    kegiatan: Kegiatan
    onClose: () => void
    onSuccess: (updatedKegiatan: Kegiatan) => void
}

const EditKegiatanModal = ({ kegiatan, onClose, onSuccess }: EditKegiatanModalProps) => {
    const formik = useFormik({
        initialValues: {
            id: kegiatan.id,
            nama: kegiatan.nama,
            deskripsi: kegiatan.deskripsi || '',
            tanggal: kegiatan.tanggal.split('T')[0],
            jam_mulai: kegiatan.jam_mulai ? kegiatan.jam_mulai.substring(0, 5) : '',
            jam_selesai: kegiatan.jam_selesai ? kegiatan.jam_selesai.substring(0, 5) : '',
            is_fullday: kegiatan.is_fullday,
            warna: kegiatan.warna
        },
        validationSchema: Yup.object({
            nama: Yup.string().required('Nama kegiatan wajib diisi').max(255),
            deskripsi: Yup.string().nullable(),
            jam_mulai: Yup.string().nullable(),
            jam_selesai: Yup.string().nullable().test('after-start', 'Jam selesai harus setelah jam mulai', function(value) {
                const { jam_mulai } = this.parent
                if (!value || !jam_mulai) return true
                return value > jam_mulai
            }),
            is_fullday: Yup.boolean(),
            warna: Yup.string().required().oneOf(['merah', 'kuning', 'hijau', 'biru'])
        }),
        onSubmit: async (values) => {
            try {
                const response = await axios.post(`/api/kegiatan/${values.id}/update`, values)
                if (response.data?.status === 'success') {
                    alert('Kegiatan berhasil diperbarui')
                    // Create updated kegiatan object with new values
                    const updatedKegiatan: Kegiatan = {
                        ...kegiatan,
                        nama: values.nama,
                        jam_mulai: values.is_fullday ? null : values.jam_mulai,
                        jam_selesai: values.is_fullday ? null : values.jam_selesai,
                        is_fullday: values.is_fullday,
                        warna: values.warna
                    }
                    onSuccess(updatedKegiatan)
                } else {
                    alert('Gagal memperbarui kegiatan: ' + response.data?.message)
                }
            } catch (e) {
                console.error(e)
                alert('Terjadi kesalahan')
            }
        }
    })

    const warnaOptions = [
        { value: 'merah', label: 'Merah', bg: 'bg-red-500' },
        { value: 'kuning', label: 'Kuning', bg: 'bg-yellow-500' },
        { value: 'hijau', label: 'Hijau', bg: 'bg-green-500' },
        { value: 'biru', label: 'Biru', bg: 'bg-blue-500' }
    ]

    // Format tanggal for display
    const formattedTanggal = new Date(kegiatan.tanggal).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    return (
        <PopUpRight name="Edit Kegiatan" state={true} setState={onClose} dangerWhenClose={true}>
            <form onSubmit={formik.handleSubmit}>
                <input type="hidden" {...formik.getFieldProps('id')} />

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Nama Kegiatan *</label>
                    <InputText
                        type="text"
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Rapat Koordinasi"
                        {...formik.getFieldProps('nama')}
                    />
                    {formik.touched.nama && formik.errors.nama && (
                        <ErrorInput className="mt-2">{formik.errors.nama}</ErrorInput>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Deskripsi</label>
                    <textarea
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Deskripsi kegiatan..."
                        rows={3}
                        {...formik.getFieldProps('deskripsi')}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Tanggal *</label>
                    <div className="p-2 bg-gray-100 rounded text-gray-700">
                        {formattedTanggal}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formik.values.is_fullday}
                            onChange={(e) => formik.setFieldValue('is_fullday', e.target.checked)}
                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="text-sm">Seharian (tanpa jam)</span>
                    </label>
                </div>

                {!formik.values.is_fullday && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Jam Mulai</label>
                            <InputText
                                type="time"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                {...formik.getFieldProps('jam_mulai')}
                            />
                            {formik.touched.jam_mulai && formik.errors.jam_mulai && (
                                <ErrorInput className="mt-2">{formik.errors.jam_mulai}</ErrorInput>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Jam Selesai</label>
                            <InputText
                                type="time"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                {...formik.getFieldProps('jam_selesai')}
                            />
                            {formik.touched.jam_selesai && formik.errors.jam_selesai && (
                                <ErrorInput className="mt-2">{formik.errors.jam_selesai}</ErrorInput>
                            )}
                        </div>
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Warna *</label>
                    <div className="flex gap-2">
                        {warnaOptions.map(w => (
                            <label key={w.value} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="warna"
                                    value={w.value}
                                    checked={formik.values.warna === w.value}
                                    onChange={(e) => formik.setFieldValue('warna', e.target.value)}
                                    className="sr-only peer"
                                />
                                <div className={`
                                    w-8 h-8 rounded-full ${w.bg} cursor-pointer
                                    peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-gray-400
                                `} />
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2 mt-6">
                    <Button type="button" color="secondary" onClick={onClose} className="flex-1">
                        Batal
                    </Button>
                    <Button type="submit" className="flex-1">
                        <IoIosSave className="inline mr-1" />
                        Simpan
                    </Button>
                </div>
            </form>
        </PopUpRight>
    )
}


// Delete Kegiatan Modal
interface DeleteKegiatanModalProps {
    kegiatan: Kegiatan
    onClose: () => void
    onSuccess: () => void
}

const DeleteKegiatanModal = ({ kegiatan, onClose, onSuccess }: DeleteKegiatanModalProps) => {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        setLoading(true)
        try {
            const response = await axios.delete(`/api/kegiatan/${kegiatan.id}`)
            if (response.data?.status === 'success') {
                alert('Kegiatan berhasil dihapus')
                onSuccess()
            } else {
                alert('Gagal menghapus kegiatan: ' + response.data?.message)
            }
        } catch (e) {
            console.error(e)
            alert('Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    return (
        <PopUpRight name="Hapus Kegiatan" state={true} setState={onClose} dangerWhenClose={true}>
            <div className="text-center py-4">
                <div className="text-5xl mb-4">⚠️</div>
                <div className="font-semibold mb-2">Apakah Anda yakin?</div>
                <div className="text-gray-600 mb-6">
                    Kegiatan <strong>{kegiatan.nama}</strong> pada tanggal{' '}
                    {new Date(kegiatan.tanggal).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })} akan dihapus.
                </div>
                <div className="flex gap-2">
                    <Button color="secondary" onClick={onClose} className="flex-1">
                        Batal
                    </Button>
                    <Button color="danger" onClick={handleDelete} className="flex-1" disabled={loading}>
                        {loading ? 'Menghapus...' : 'Hapus'}
                    </Button>
                </div>
            </div>
        </PopUpRight>
    )
}

