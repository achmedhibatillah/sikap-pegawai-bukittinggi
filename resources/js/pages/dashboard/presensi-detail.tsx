import { useEffect, useState } from "react"
import axios from "axios"
import DashboardLayout from "@/layout/dashboard-layout"
import ProfilePicture from "@/component/profile-picture"
import SimpleDropdown from "@/component/simple-dropdown"
import InputText from "@/component/input-text"
import Button from "@/component/button"

interface Props {
    id: string
    sss?: any
}

interface Option {
    value: string | number
    label: string
    [key: string]: any
}

interface PegawaiRow {
    id: string
    nama: string
    foto?: string | null
    pivot: {
        status: string | null
        masuk?: string | null
        keluar?: string | null
        catatan?: string | null
    }
    _edit: {
        status: string | null
        masuk: string | null
        keluar: string | null
        catatan: string | null
        saving: boolean
    }
}

interface PresensiData {
    id: string
    tanggal: string
    jam_mulai: string
    jam_selesai: string
    catatan?: string | null
}

const statusOptions: { value: string; label: string }[] = [
    { value: "Hadir", label: "Hadir" },
    { value: "Hadir (Telat)", label: "Hadir (Telat)" },
    { value: "Izin", label: "Izin" },
    { value: "Cuti", label: "Cuti" },
    { value: "Alpa", label: "Alpa" },
]

const PresensiDetail = ({ id, sss }: Props) => {
    const [loading, setLoading] = useState(false)
    const [presensi, setPresensi] = useState<PresensiData | null>(null)
    const [pegawais, setPegawais] = useState<PegawaiRow[]>([])
    const [savingId, setSavingId] = useState<string | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const resp = await axios.get("/api/presensi/" + id)
            if (resp.data?.status === "success") {
                setPresensi(resp.data.data.presensi)
                const rows = resp.data.data.pegawais.map((p: any) => ({
                    ...p,
                    _edit: {
                        status: p.pivot.status,
                        masuk: p.pivot.masuk,
                        keluar: p.pivot.keluar,
                        catatan: p.pivot.catatan,
                        saving: false,
                    },
                }))
                setPegawais(rows)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (pegawaiId: string, index: number) => {
        const row = pegawais[index]
        if (!row) return

        setSavingId(pegawaiId)

        const payload = {
            status: row._edit.status,
            masuk: row._edit.masuk,
            keluar: row._edit.keluar,
            catatan: row._edit.catatan,
        }

        try {
            await axios.post(`/api/presensi/${id}/pegawai/${pegawaiId}/update`, payload)
            const updated = [...pegawais]
            updated[index] = {
                ...row,
                pivot: {
                    status: row._edit.status,
                    masuk: row._edit.masuk,
                    keluar: row._edit.keluar,
                    catatan: row._edit.catatan,
                },
            }
            setPegawais(updated)
        } catch (err) {
            console.error(err)
        } finally {
            setSavingId(null)
        }
    }

    const formatTanggal = (tanggal: string) => {
        const date = new Date(tanggal)
        return date.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        })
    }

    const formatTime = (time: string) => {
        return time?.slice(0, 5) || ""
    }

    const getStatusColor = (status: string | null) => {
        if (!status) return "bg-gray-100 text-gray-700"
        switch (status) {
            case "Hadir":
                return "bg-emerald-100 text-emerald-700"
            case "Hadir (Telat)":
                return "bg-amber-100 text-amber-700"
            case "Izin":
                return "bg-sky-100 text-sky-700"
            case "Cuti":
                return "bg-purple-100 text-purple-700"
            case "Alpa":
                return "bg-red-100 text-red-700"
            default:
                return "bg-gray-100 text-gray-700"
        }
    }

    const StatusBadge = ({ status }: { status: string | null }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {status || "-"}
        </span>
    )

    return (
        <DashboardLayout
            sss={sss}
            now="Presensi"
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Detail Presensi
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Kelola kehadiran karyawan pada sesi presensi
                        </p>
                        <Button className="mt-3" onClick={() => window.location.href = "/presensi"}>Kembali ke halaman presensi</Button>
                    </div>
                    <Button
                        onClick={() => (window.location.href = "/presensi")}
                        className="flex items-center gap-2"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Kembali
                    </Button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="relative">
                            <div className="h-12 w-12 rounded-full border-4 border-gray-200"></div>
                            <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-gray-500 mt-4">Memuat data...</p>
                    </div>
                )}

                {/* Presensi Info Card */}
                {presensi && !loading && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                            {/* Left - Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-14 w-14 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <svg
                                            className="w-7 h-7 text-emerald-600"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            {formatTanggal(presensi.tanggal)}
                                        </h2>
                                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <span>
                                                {formatTime(presensi.jam_mulai)} -{" "}
                                                {formatTime(presensi.jam_selesai)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {presensi.catatan && (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg">
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                            />
                                        </svg>
                                        <span>{presensi.catatan}</span>
                                    </div>
                                )}
                            </div>

                            {/* Right - Summary Stats */}
                            <div className="flex flex-wrap gap-3">
                                {(() => {
                                    const totals = pegawais.reduce(
                                        (acc, p) => {
                                            const status = p.pivot.status
                                            if (status === "Hadir") acc.hadir++
                                            else if (status === "Hadir (Telat)")
                                                acc.telat++
                                            else if (status === "Izin") acc.izin++
                                            else if (status === "Cuti") acc.cuti++
                                            else if (status === "Alpa") acc.alpa++
                                            return acc
                                        },
                                        {
                                            hadir: 0,
                                            telat: 0,
                                            izin: 0,
                                            cuti: 0,
                                            alpa: 0,
                                        }
                                    )
                                    return (
                                        <>
                                            <div className="bg-emerald-100 text-emerald-700 rounded-lg px-4 py-2 text-center">
                                                <div className="text-lg font-bold">
                                                    {totals.hadir}
                                                </div>
                                                <div className="text-xs">Hadir</div>
                                            </div>
                                            <div className="bg-amber-100 text-amber-700 rounded-lg px-4 py-2 text-center">
                                                <div className="text-lg font-bold">
                                                    {totals.telat}
                                                </div>
                                                <div className="text-xs">Telat</div>
                                            </div>
                                            <div className="bg-sky-100 text-sky-700 rounded-lg px-4 py-2 text-center">
                                                <div className="text-lg font-bold">
                                                    {totals.izin}
                                                </div>
                                                <div className="text-xs">Izin</div>
                                            </div>
                                            <div className="bg-purple-100 text-purple-700 rounded-lg px-4 py-2 text-center">
                                                <div className="text-lg font-bold">
                                                    {totals.cuti}
                                                </div>
                                                <div className="text-xs">Cuti</div>
                                            </div>
                                            <div className="bg-red-100 text-red-700 rounded-lg px-4 py-2 text-center">
                                                <div className="text-lg font-bold">
                                                    {totals.alpa}
                                                </div>
                                                <div className="text-xs">Alpa</div>
                                            </div>
                                            <div className="bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-center">
                                                <div className="text-lg font-bold">
                                                    {pegawais.length}
                                                </div>
                                                <div className="text-xs">Total</div>
                                            </div>
                                        </>
                                    )
                                })()}
                            </div>
                        </div>
                    </div>
                )}

                {/* Pegawai List */}
                {presensi && !loading && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        {/* Table Header */}
                        <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <div className="lg:col-span-3">Karyawan</div>
                            <div className="lg:col-span-2">Status</div>
                            <div className="lg:col-span-2">Masuk</div>
                            <div className="lg:col-span-2">Keluar</div>
                            <div className="lg:col-span-2">Catatan</div>
                            <div className="lg:col-span-1 text-right">Aksi</div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-gray-100">
                            {pegawais.map((p, idx) => (
                                <div
                                    key={p.id}
                                    className="p-4 lg:p-0"
                                >
                                    {/* Mobile View */}
                                    <div className="lg:hidden space-y-3">
                                        <div className="flex items-center gap-3">
                                            <ProfilePicture
                                                image={p.foto ?? null}
                                                className="w-12 h-12 rounded-full"
                                            />
                                            <div>
                                                <div className="font-semibold text-gray-900">
                                                    {p.nama}
                                                </div>
                                                <StatusBadge status={p.pivot.status} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-xs text-gray-500">
                                                    Status
                                                </label>
                                                <SimpleDropdown
                                                    options={statusOptions}
                                                    value={
                                                        statusOptions.find(
                                                            (o) =>
                                                                o.value ===
                                                                p._edit.status
                                                        ) ?? null
                                                    }
                                                    onChange={(sel: Option | null) => {
                                                        const copy = [...pegawais]
                                                        copy[idx] = {
                                                            ...p,
                                                            _edit: {
                                                                ...p._edit,
                                                                status:
                                                                    sel?.value ??
                                                                    null,
                                                            },
                                                        }
                                                        setPegawais(copy)
                                                    }}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">
                                                    Catatan
                                                </label>
                                                <InputText
                                                    value={p._edit.catatan ?? ""}
                                                    onChange={(e: any) => {
                                                        const copy = [...pegawais]
                                                        copy[idx] = {
                                                            ...p,
                                                            _edit: {
                                                                ...p._edit,
                                                                catatan:
                                                                    e.target.value,
                                                            },
                                                        }
                                                        setPegawais(copy)
                                                    }}
                                                    className="w-full"
                                                    placeholder="Catatan..."
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-xs text-gray-500">
                                                    Jam Masuk
                                                </label>
                                                <InputText
                                                    type="time"
                                                    value={p._edit.masuk ?? ""}
                                                    onChange={(e: any) => {
                                                        const copy = [...pegawais]
                                                        copy[idx] = {
                                                            ...p,
                                                            _edit: {
                                                                ...p._edit,
                                                                masuk: e.target.value,
                                                            },
                                                        }
                                                        setPegawais(copy)
                                                    }}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">
                                                    Jam Keluar
                                                </label>
                                                <InputText
                                                    type="time"
                                                    value={p._edit.keluar ?? ""}
                                                    onChange={(e: any) => {
                                                        const copy = [...pegawais]
                                                        copy[idx] = {
                                                            ...p,
                                                            _edit: {
                                                                ...p._edit,
                                                                keluar: e.target.value,
                                                            },
                                                        }
                                                        setPegawais(copy)
                                                    }}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            disabled={savingId === p.id}
                                            onClick={() => handleSave(p.id, idx)}
                                            className="w-full"
                                        >
                                            {savingId === p.id
                                                ? "Menyimpan..."
                                                : "Simpan"}
                                        </Button>
                                    </div>

                                    {/* Desktop View */}
                                    <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-gray-50 transition-colors">
                                        <div className="lg:col-span-3 flex items-center gap-3">
                                            <ProfilePicture
                                                image={p.foto ?? null}
                                                className="w-10 h-10 rounded-full"
                                            />
                                            <span className="font-medium text-gray-900">
                                                {p.nama}
                                            </span>
                                        </div>
                                        <div className="lg:col-span-2">
                                            <SimpleDropdown
                                                options={statusOptions}
                                                value={
                                                    statusOptions.find(
                                                        (o) => o.value === p._edit.status
                                                    ) ?? null
                                                }
                                                onChange={(sel: Option | null) => {
                                                    const copy = [...pegawais]
                                                    copy[idx] = {
                                                        ...p,
                                                        _edit: {
                                                            ...p._edit,
                                                            status: sel?.value ?? null,
                                                        },
                                                    }
                                                    setPegawais(copy)
                                                }}
                                                className="w-full"
                                                placeholder="Pilih status"
                                            />
                                        </div>
                                        <div className="lg:col-span-2">
                                            <InputText
                                                type="time"
                                                value={p._edit.masuk ?? ""}
                                                onChange={(e: any) => {
                                                    const copy = [...pegawais]
                                                    copy[idx] = {
                                                        ...p,
                                                        _edit: {
                                                            ...p._edit,
                                                            masuk: e.target.value,
                                                        },
                                                    }
                                                    setPegawais(copy)
                                                }}
                                                className="w-full"
                                                placeholder="--:--"
                                            />
                                        </div>
                                        <div className="lg:col-span-2">
                                            <InputText
                                                type="time"
                                                value={p._edit.keluar ?? ""}
                                                onChange={(e: any) => {
                                                    const copy = [...pegawais]
                                                    copy[idx] = {
                                                        ...p,
                                                        _edit: {
                                                            ...p._edit,
                                                            keluar: e.target.value,
                                                        },
                                                    }
                                                    setPegawais(copy)
                                                }}
                                                className="w-full"
                                                placeholder="--:--"
                                            />
                                        </div>
                                        <div className="lg:col-span-2">
                                            <InputText
                                                value={p._edit.catatan ?? ""}
                                                onChange={(e: any) => {
                                                    const copy = [...pegawais]
                                                    copy[idx] = {
                                                        ...p,
                                                        _edit: {
                                                            ...p._edit,
                                                            catatan: e.target.value,
                                                        },
                                                    }
                                                    setPegawais(copy)
                                                }}
                                                className="w-full"
                                                placeholder="Catatan..."
                                            />
                                        </div>
                                        <div className="lg:col-span-1 text-right">
                                            <Button
                                                disabled={savingId === p.id}
                                                onClick={() => handleSave(p.id, idx)}
                                                className="text-sm"
                                            >
                                                {savingId === p.id
                                                    ? "..."
                                                    : "Simpan"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {pegawais.length === 0 && (
                            <div className="p-12 text-center">
                                <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                                    <svg
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Tidak Ada Karyawan
                                </h3>
                                <p className="text-gray-500">
                                    Tidak ada karyawan yang terdaftar pada sesi
                                    presensi ini.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default PresensiDetail

