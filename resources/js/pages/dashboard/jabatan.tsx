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
    jabatan_tingkatan_id: string
    nama: string
    deskripsi: string
    aktif: boolean
    tingkat?: JabatanTingkat | null
}

interface JabatanTingkat {
    id: number
    tingkat: number
    nama: string
    deskripsi: string
    aktif: boolean
}

const JabatanPage = ({ sss }: DashboardPageProps) => {
    const [jabatanList, setJabatanList] = useState<Jabatan[]>([])
    const [tingkatList, setTingkatList] = useState<JabatanTingkat[]>([])
    const [loading, setLoading] = useState(false)
    const [showAddPopup, setShowAddPopup] = useState(false)
    const [showEditPopup, setShowEditPopup] = useState(false)
    const [editingJabatan, setEditingJabatan] = useState<Jabatan | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterAktif, setFilterAktif] = useState<string>('')
    const [activeTab, setActiveTab] = useState<'jabatan' | 'tingkat'>('jabatan')

    // Form states
    const [nama, setNama] = useState('')
    const [jabatan_tingkatan_id, setJabatanTingkatId] = useState<string>('')
    const [deskripsi, setDeskripsi] = useState('')
    const [aktif, setAktif] = useState(true)

    // Tingkat form states
    const [showAddTingkatPopup, setShowAddTingkatPopup] = useState(false)
    const [showEditTingkatPopup, setShowEditTingkatPopup] = useState(false)
    const [editingTingkat, setEditingTingkat] = useState<JabatanTingkat | null>(null)
    const [tingkatForm, setTingkatForm] = useState({ tingkat: 1, nama: '', deskripsi: '' })
    const [tingkatAktif, setTingkatAktif] = useState(true)
    const [tingkatSearch, setTingkatSearch] = useState('')
    const [tingkatFilterAktif, setTingkatFilterAktif] = useState<string>('')

    const [submitLoading, setSubmitLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const fetchTingkatList = async () => {
        try {
            const params: any = {}
            if (tingkatSearch) params.search = tingkatSearch
            if (tingkatFilterAktif !== '') params.aktif = tingkatFilterAktif

            const resp = await axios.get('/api/jabatan-tingkat', { params })
            if (resp.data?.status === 'success') {
                setTingkatList(resp.data.data.items || [])
            }
        } catch (err: any) {
            console.error(err)
        }
    }

    const fetchActiveTingkat = async () => {
        try {
            const resp = await axios.get('/api/jabatan-tingkat/all-active')
            if (resp.data?.status === 'success') {
                const tingkatans = resp.data.data || []
                // Set default jabatan_tingkatan_id to first one if available
                if (tingkatans.length > 0 && !jabatan_tingkatan_id) {
                    setJabatanTingkatId(tingkatans[0].id)
                }
            }
        } catch (err: any) {
            console.error(err)
        }
    }

    const fetchJabatan = async () => {
        setLoading(true)
        try {
            const params: any = {}
            if (searchTerm) params.search = searchTerm
            if (filterAktif !== '') params.aktif = filterAktif

            const resp = await axios.get('/api/jabatan', { params })
            if (resp.data?.status === 'success') {
                setJabatanList(resp.data.data.items || [])
            }
        } catch (err: any) {
            console.error(err)
            setMessage({ type: 'error', text: 'Gagal memuat data jabatan' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Fetch tingkat list first for dropdown options
        fetchTingkatList()

        if (activeTab === 'jabatan') {
            fetchJabatan()
        } else {
            fetchTingkatList()
        }
    }, [activeTab, searchTerm, filterAktif, tingkatSearch, tingkatFilterAktif])

    useEffect(() => {
        fetchActiveTingkat()
    }, [])

    const resetForm = () => {
        setNama('')
        setJabatanTingkatId('')
        setDeskripsi('')
        setAktif(true)
        setEditingJabatan(null)
    }

    const resetTingkatForm = () => {
        setTingkatForm({ tingkat: 1, nama: '', deskripsi: '' })
        setTingkatAktif(true)
        setEditingTingkat(null)
    }

    const openAddPopup = () => {
        resetForm()
        setShowAddPopup(true)
    }

    const openEditPopup = (jabatan: Jabatan) => {
        setEditingJabatan(jabatan)
        setNama(jabatan.nama)
        setJabatanTingkatId(jabatan.jabatan_tingkatan_id)
        setDeskripsi(jabatan.deskripsi)
        setAktif(jabatan.aktif)
        setShowEditPopup(true)
    }

    const openAddTingkatPopup = () => {
        resetTingkatForm()
        setShowAddTingkatPopup(true)
    }

    const openEditTingkatPopup = (tingkat: JabatanTingkat) => {
        setEditingTingkat(tingkat)
        setTingkatForm({ tingkat: tingkat.tingkat, nama: tingkat.nama, deskripsi: tingkat.deskripsi || '' })
        setTingkatAktif(tingkat.aktif)
        setShowEditTingkatPopup(true)
    }

    // ============ JABATAN CRUD ============

    const handleAdd = async () => {
        if (!nama) {
            setMessage({ type: 'error', text: 'Nama jabatan wajib diisi' })
            return
        }
        if (!jabatan_tingkatan_id) {
            setMessage({ type: 'error', text: 'Tingkat jabatan wajib dipilih' })
            return
        }

        setSubmitLoading(true)
        try {
            const resp = await axios.post('/api/jabatan/add', {
                nama,
                jabatan_tingkatan_id,
                deskripsi
            })
            if (resp.data?.status === 'success') {
                setMessage({ type: 'success', text: 'Jabatan berhasil ditambahkan' })
                setShowAddPopup(false)
                resetForm()
                fetchJabatan()
            } else {
                setMessage({ type: 'error', text: resp.data?.message || 'Gagal menambahkan jabatan' })
            }
        } catch (err: any) {
            console.error(err)
            setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal menambahkan jabatan' })
        } finally {
            setSubmitLoading(false)
        }
    }

    const handleUpdate = async () => {
        if (!editingJabatan || !nama) return

        setSubmitLoading(true)
        try {
            const resp = await axios.post(`/api/jabatan/${editingJabatan.id}/update`, {
                nama,
                jabatan_tingkatan_id,
                deskripsi,
                aktif
            })
            if (resp.data?.status === 'success') {
                setMessage({ type: 'success', text: 'Jabatan berhasil diperbarui' })
                setShowEditPopup(false)
                resetForm()
                fetchJabatan()
            } else {
                setMessage({ type: 'error', text: resp.data?.message || 'Gagal memperbarui jabatan' })
            }
        } catch (err: any) {
            console.error(err)
            setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal memperbarui jabatan' })
        } finally {
            setSubmitLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menonaktifkan jabatan ini?')) return

        try {
            const resp = await axios.delete(`/api/jabatan/${id}`)
            if (resp.data?.status === 'success') {
                setMessage({ type: 'success', text: 'Jabatan berhasil dinonaktifkan' })
                fetchJabatan()
            } else {
                setMessage({ type: 'error', text: resp.data?.message || 'Gagal menonaktifkan jabatan' })
            }
        } catch (err: any) {
            console.error(err)
            setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal menonaktifkan jabatan' })
        }
    }

    const handleRestore = async (id: string) => {
        try {
            const resp = await axios.post(`/api/jabatan/${id}/restore`)
            if (resp.data?.status === 'success') {
                setMessage({ type: 'success', text: 'Jabatan berhasil diaktifkan kembali' })
                fetchJabatan()
            } else {
                setMessage({ type: 'error', text: resp.data?.message || 'Gagal mengaktifkan jabatan' })
            }
        } catch (err: any) {
            console.error(err)
            setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal mengaktifkan jabatan' })
        }
    }

    // ============ TINGKAT CRUD ============

    const handleAddTingkat = async () => {
        if (!tingkatForm.nama) {
            setMessage({ type: 'error', text: 'Nama tingkat wajib diisi' })
            return
        }

        setSubmitLoading(true)
        try {
            const resp = await axios.post('/api/jabatan-tingkat/add', tingkatForm)
            if (resp.data?.status === 'success') {
                setMessage({ type: 'success', text: 'Tingkat berhasil ditambahkan' })
                setShowAddTingkatPopup(false)
                resetTingkatForm()
                fetchTingkatList()
            } else {
                setMessage({ type: 'error', text: resp.data?.message || 'Gagal menambahkan tingkat' })
            }
        } catch (err: any) {
            console.error(err)
            setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal menambahkan tingkat' })
        } finally {
            setSubmitLoading(false)
        }
    }

    const handleUpdateTingkat = async () => {
        if (!editingTingkat) return

        setSubmitLoading(true)
        try {
            const resp = await axios.post(`/api/jabatan-tingkat/${editingTingkat.id}/update`, {
                ...tingkatForm,
                aktif: tingkatAktif
            })
            if (resp.data?.status === 'success') {
                setMessage({ type: 'success', text: 'Tingkat berhasil diperbarui' })
                setShowEditTingkatPopup(false)
                resetTingkatForm()
                fetchTingkatList()
            } else {
                setMessage({ type: 'error', text: resp.data?.message || 'Gagal memperbarui tingkat' })
            }
        } catch (err: any) {
            console.error(err)
            setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal memperbarui tingkat' })
        } finally {
            setSubmitLoading(false)
        }
    }

    const handleDeleteTingkat = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menonaktifkan tingkat ini?')) return

        try {
            const resp = await axios.delete(`/api/jabatan-tingkat/${id}`)
            if (resp.data?.status === 'success') {
                setMessage({ type: 'success', text: 'Tingkat berhasil dinonaktifkan' })
                fetchTingkatList()
            } else {
                setMessage({ type: 'error', text: resp.data?.message || 'Gagal menonaktifkan tingkat' })
            }
        } catch (err: any) {
            console.error(err)
            setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal menonaktifkan tingkat' })
        }
    }

    const handleRestoreTingkat = async (id: string) => {
        try {
            const resp = await axios.post(`/api/jabatan-tingkat/${id}/restore`)
            if (resp.data?.status === 'success') {
                setMessage({ type: 'success', text: 'Tingkat berhasil diaktifkan kembali' })
                fetchTingkatList()
            } else {
                setMessage({ type: 'error', text: resp.data?.message || 'Gagal mengaktifkan tingkat' })
            }
        } catch (err: any) {
            console.error(err)
            setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal mengaktifkan tingkat' })
        }
    }

    const getTingkatInfo = (tingkat: number) => {
        // Find tingkat info from list
        const tingkatData = tingkatList.find(t => t.tingkat === tingkat)
        if (tingkatData) {
            return {
                color: getColorByTingkat(tingkat),
                bg: getBgByTingkat(tingkat),
                border: getBorderByTingkat(tingkat),
                nama: tingkatData.nama
            }
        }

        // Default styles
        const info: Record<number, { color: string; bg: string; border: string; nama: string }> = {
            1: { color: 'text-amber-800', bg: 'bg-amber-100', border: 'border-amber-300', nama: 'Eselon I' },
            2: { color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-300', nama: 'Eselon II' },
            3: { color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-300', nama: 'Eselon III' },
            4: { color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-300', nama: 'Eselon IV' },
            5: { color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', nama: 'Staf' },
        }
        return info[tingkat] || info[5]
    }

    const getColorByTingkat = (tingkat: number): string => {
        const colors: Record<number, string> = {
            1: 'text-amber-800',
            2: 'text-blue-700',
            3: 'text-green-700',
            4: 'text-gray-700',
            5: 'text-gray-500',
        }
        return colors[tingkat] || 'text-gray-500'
    }

    const getBgByTingkat = (tingkat: number): string => {
        const bgs: Record<number, string> = {
            1: 'bg-amber-100',
            2: 'bg-blue-100',
            3: 'bg-green-100',
            4: 'bg-gray-100',
            5: 'bg-gray-50',
        }
        return bgs[tingkat] || 'bg-gray-50'
    }

    const getBorderByTingkat = (tingkat: number): string => {
        const borders: Record<number, string> = {
            1: 'border-amber-300',
            2: 'border-blue-300',
            3: 'border-green-300',
            4: 'border-gray-300',
            5: 'border-gray-200',
        }
        return borders[tingkat] || 'border-gray-200'
    }

    const getActiveTingkatOptions = () => {
        return tingkatList.filter(t => t.aktif).sort((a, b) => a.tingkat - b.tingkat)
    }

    // Generate dropdown options from actual Tingkat Jabatan data
    const tingkatOptions = getActiveTingkatOptions().map(t => ({
        value: t.id.toString(),
        label: `Tingkat ${t.tingkat} - ${t.nama || 'Eselon ' + t.tingkat}`
    }))

    // Helper to determine which content to show based on active tab
    const renderTabs = () => (
        <div className="flex gap-2 mb-6">
            <button
                onClick={() => { setActiveTab('jabatan'); setMessage(null); }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                    activeTab === 'jabatan'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
            >
                Jabatan
            </button>
            <button
                onClick={() => { setActiveTab('tingkat'); setMessage(null); }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition cursor-pointer ${
                    activeTab === 'tingkat'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
            >
                Tingkat Jabatan
            </button>
        </div>
    )

    return (
        <DashboardLayout sss={sss} now="Jabatan">
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Manajemen Jabatan</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {activeTab === 'jabatan'
                                ? 'Kelola jabatan berdasarkan urutan/hierarki (semakin kecil angka, semakin tinggi)'
                                : 'Kelola tingkat/eselon jabatan'}
                        </p>
                    </div>
                    <button
                        onClick={activeTab === 'jabatan' ? openAddPopup : openAddTingkatPopup}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-sm cursor-pointer"
                    >
                        + {activeTab === 'jabatan' ? 'Tambah Jabatan' : 'Tambah Tingkat'}
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

            {/* Tabs */}
            {renderTabs()}

            {/* TINGKAT TAB */}
            {activeTab === 'tingkat' && (
                <>
                    {/* Filters Tingkat */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <InputText
                                    placeholder="Cari tingkat..."
                                    value={tingkatSearch}
                                    onChange={(e: any) => setTingkatSearch(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div className="w-full sm:w-48">
                                <select
                                    value={tingkatFilterAktif}
                                    onChange={(e) => setTingkatFilterAktif(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="true">Aktif</option>
                                    <option value="false">Nonaktif</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Stats Tingkat */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500">Total Tingkat</p>
                            <p className="text-2xl font-bold text-gray-800">{tingkatList.length}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500">Aktif</p>
                            <p className="text-2xl font-bold text-green-600">{tingkatList.filter(t => t.aktif).length}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500">Nonaktif</p>
                            <p className="text-2xl font-bold text-gray-400">{tingkatList.filter(t => !t.aktif).length}</p>
                        </div>
                    </div>

                    {/* Tingkat List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Memuat data...</div>
                        ) : tingkatList.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <div className="text-4xl mb-2">📊</div>
                                <p>Tidak ada tingkat ditemukan</p>
                                <button onClick={openAddTingkatPopup} className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm cursor-pointer">
                                    Tambah Tingkat Pertama
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tingkat</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Deskripsi</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {tingkatList.map((tingkat, index) => {
                                            const styles = getTingkatInfo(tingkat.tingkat)
                                            return (
                                                <tr key={tingkat.id} className="hover:bg-gray-50 transition">
                                                    <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded border ${styles.bg} ${styles.color} ${styles.border}`}>
                                                            Tingkat {tingkat.tingkat}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium text-gray-800">{tingkat.nama}</p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="text-sm text-gray-600 max-w-xs truncate">{tingkat.deskripsi || '-'}</p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {tingkat.aktif ? (
                                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Aktif</span>
                                                        ) : (
                                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-500">Nonaktif</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => openEditTingkatPopup(tingkat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer" title="Edit">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            {tingkat.aktif ? (
                                                                <button onClick={() => handleDeleteTingkat(tingkat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer" title="Nonaktifkan">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            ) : (
                                                                <button onClick={() => handleRestoreTingkat(tingkat.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition cursor-pointer" title="Aktifkan">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* JABATAN TAB */}
            {activeTab === 'jabatan' && (
                <>
                    {/* Filters Jabatan */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <InputText
                                    placeholder="Cari jabatan..."
                                    value={searchTerm}
                                    onChange={(e: any) => setSearchTerm(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div className="w-full sm:w-48">
                                <select
                                    value={filterAktif}
                                    onChange={(e) => setFilterAktif(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="true">Aktif</option>
                                    <option value="false">Nonaktif</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Stats Jabatan */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500">Total Jabatan</p>
                            <p className="text-2xl font-bold text-gray-800">{jabatanList.length}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500">Aktif</p>
                            <p className="text-2xl font-bold text-green-600">{jabatanList.filter(j => j.aktif).length}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500">Nonaktif</p>
                            <p className="text-2xl font-bold text-gray-400">{jabatanList.filter(j => !j.aktif).length}</p>
                        </div>
                    </div>

                    {/* Jabatan List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Memuat data...</div>
                        ) : jabatanList.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <div className="text-4xl mb-2">💼</div>
                                <p>Tidak ada jabatan ditemukan</p>
                                <button onClick={openAddPopup} className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm cursor-pointer">
                                    Tambah Jabatan Pertama
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Jabatan</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tingkat</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Deskripsi</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {jabatanList.map((jabatan, index) => {
                                            const tingkatValue = jabatan.tingkat?.tingkat || 5
                                            const styles = getTingkatInfo(tingkatValue)
                                            return (
                                                <tr key={jabatan.id} className="hover:bg-gray-50 transition">
                                                    <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium text-gray-800">{jabatan.nama}</p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded border ${styles.bg} ${styles.color} ${styles.border}`}>
                                                            Tingkat {tingkatValue}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="text-sm text-gray-600 max-w-xs truncate">{jabatan.deskripsi}</p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {jabatan.aktif ? (
                                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Aktif</span>
                                                        ) : (
                                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-500">Nonaktif</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => openEditPopup(jabatan)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer" title="Edit">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            {jabatan.aktif ? (
                                                                <button onClick={() => handleDelete(jabatan.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer" title="Nonaktifkan">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            ) : (
                                                                <button onClick={() => handleRestore(jabatan.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition cursor-pointer" title="Aktifkan">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Add Popup */}
            <PopUpRight
                name="Tambah Jabatan"
                state={showAddPopup}
                setState={setShowAddPopup}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Jabatan <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            value={nama}
                            onChange={(e: any) => setNama(e.target.value)}
                            placeholder="Contoh: Kepala Sekolah"
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tingkat Jabatan <span className="text-red-500">*</span>
                            <span className="text-gray-400 font-normal ml-1">(semakin kecil angka, semakin tinggi jabatannya)</span>
                        </label>
                        <select
                            value={jabatan_tingkatan_id}
                            onChange={(e) => setJabatanTingkatId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="">Pilih Tingkat...</option>
                            {tingkatOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Deskripsi
                        </label>
                        <textarea
                            value={deskripsi}
                            onChange={(e) => setDeskripsi(e.target.value)}
                            placeholder="Jelaskan tugas dan tanggung jawab..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                            rows={3}
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
                            onClick={handleAdd}
                            disabled={submitLoading}
                            className="flex-1 py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer"
                        >
                            {submitLoading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </div>
            </PopUpRight>

            {/* Edit Popup */}
            <PopUpRight
                name="Edit Jabatan"
                state={showEditPopup}
                setState={setShowEditPopup}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Jabatan <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            value={nama}
                            onChange={(e: any) => setNama(e.target.value)}
                            placeholder="Contoh: Kepala Sekolah"
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tingkat Jabatan <span className="text-red-500">*</span>
                            <span className="text-gray-400 font-normal ml-1">(semakin kecil angka, semakin tinggi jabatannya)</span>
                        </label>
                        <select
                            value={jabatan_tingkatan_id}
                            onChange={(e) => setJabatanTingkatId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="">Pilih Tingkat...</option>
                            {tingkatOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Deskripsi
                        </label>
                        <textarea
                            value={deskripsi}
                            onChange={(e) => setDeskripsi(e.target.value)}
                            placeholder="Jelaskan tugas dan tanggung jawab..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            value={aktif ? 'true' : 'false'}
                            onChange={(e) => setAktif(e.target.value === 'true')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="true">Aktif</option>
                            <option value="false">Nonaktif</option>
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            onClick={() => setShowEditPopup(false)}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleUpdate}
                            disabled={submitLoading}
                            className="flex-1 py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer"
                        >
                            {submitLoading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </div>
            </PopUpRight>

            {/* Add Tingkat Popup */}
            <PopUpRight
                name="Tambah Tingkat"
                state={showAddTingkatPopup}
                setState={setShowAddTingkatPopup}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tingkat <span className="text-red-500">*</span>
                            <span className="text-gray-400 font-normal ml-1">(angka urutan/eselon)</span>
                        </label>
                        <InputText
                            type="number"
                            value={tingkatForm.tingkat}
                            onChange={(e: any) => setTingkatForm({ ...tingkatForm, tingkat: parseInt(e.target.value) || 1 })}
                            placeholder="Contoh: 1"
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Tingkat <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            value={tingkatForm.nama}
                            onChange={(e: any) => setTingkatForm({ ...tingkatForm, nama: e.target.value })}
                            placeholder="Contoh: Eselon I"
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Deskripsi
                        </label>
                        <textarea
                            value={tingkatForm.deskripsi}
                            onChange={(e) => setTingkatForm({ ...tingkatForm, deskripsi: e.target.value })}
                            placeholder="Jelaskan tingkat/eselon ini..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                            rows={3}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            onClick={() => setShowAddTingkatPopup(false)}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleAddTingkat}
                            disabled={submitLoading}
                            className="flex-1 py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer"
                        >
                            {submitLoading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </div>
            </PopUpRight>

            {/* Edit Tingkat Popup */}
            <PopUpRight
                name="Edit Tingkat"
                state={showEditTingkatPopup}
                setState={setShowEditTingkatPopup}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tingkat <span className="text-red-500">*</span>
                            <span className="text-gray-400 font-normal ml-1">(angka urutan/eselon)</span>
                        </label>
                        <InputText
                            type="number"
                            value={tingkatForm.tingkat}
                            onChange={(e: any) => setTingkatForm({ ...tingkatForm, tingkat: parseInt(e.target.value) || 1 })}
                            placeholder="Contoh: 1"
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Tingkat <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            value={tingkatForm.nama}
                            onChange={(e: any) => setTingkatForm({ ...tingkatForm, nama: e.target.value })}
                            placeholder="Contoh: Eselon I"
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Deskripsi
                        </label>
                        <textarea
                            value={tingkatForm.deskripsi}
                            onChange={(e) => setTingkatForm({ ...tingkatForm, deskripsi: e.target.value })}
                            placeholder="Jelaskan tingkat/eselon ini..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            value={tingkatAktif ? 'true' : 'false'}
                            onChange={(e) => setTingkatAktif(e.target.value === 'true')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="true">Aktif</option>
                            <option value="false">Nonaktif</option>
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            onClick={() => setShowEditTingkatPopup(false)}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleUpdateTingkat}
                            disabled={submitLoading}
                            className="flex-1 py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer"
                        >
                            {submitLoading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </div>
            </PopUpRight>
        </DashboardLayout>
    )
}

export default JabatanPage

