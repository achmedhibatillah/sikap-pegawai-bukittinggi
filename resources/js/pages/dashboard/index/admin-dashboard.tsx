import { useState, useEffect } from "react"
import axios from "axios"
import { Link } from "@inertiajs/react"

interface StatCardProps {
    title: string
    value: string | number
    icon: React.ReactNode
    color: "blue" | "green" | "yellow" | "red" | "purple"
    description?: string
}

const StatCard = ({ title, value, icon, color, description }: StatCardProps) => {
    const colorClasses = {
        blue: "bg-gradient-to-br from-blue-500 to-blue-600",
        green: "bg-gradient-to-br from-emerald-500 to-emerald-600",
        yellow: "bg-gradient-to-br from-amber-500 to-amber-600",
        red: "bg-gradient-to-br from-red-500 to-red-600",
        purple: "bg-gradient-to-br from-purple-500 to-purple-600"
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className={`${colorClasses[color]} p-4 text-white`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-blue-100 text-sm font-medium">{title}</p>
                        <p className="text-3xl font-bold mt-1">{value}</p>
                    </div>
                    <div className="bg-white/20 rounded-full p-3">
                        {icon}
                    </div>
                </div>
            </div>
            {description && (
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs text-gray-500">{description}</p>
                </div>
            )}
        </div>
    )
}

interface QuickActionProps {
    title: string
    description: string
    href: string
    icon: React.ReactNode
    color: string
}

const QuickAction = ({ title, description, href, icon, color }: QuickActionProps) => (
    <Link
        href={href}
        className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 group"
    >
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-300`}>
            {icon}
        </div>
        <div className="flex-1">
            <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{title}</p>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className="text-gray-300 group-hover:translate-x-1 transition-transform duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </div>
    </Link>
)

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        total_pegawai: 0,
        total_cuti_pending: 0,
        total_jabatan_ajuan: 0,
        total_kegiatan_aktif: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get("/api/dashboard/stats")
                if (response.data?.data) {
                    setStats({
                        total_pegawai: response.data.data.total_pegawai || 0,
                        total_cuti_pending: response.data.data.total_cuti_pending || 0,
                        total_jabatan_ajuan: response.data.data.total_jabatan_ajuan || 0,
                        total_kegiatan_aktif: response.data.data.total_kegiatan_aktif || 0
                    })
                }
            } catch (e) {
                console.error("Error fetching stats:", e)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    const formatTanggal = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            })
        } catch {
            return dateStr
        }
    }

    const currentDate = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
                    <p className="text-gray-500 text-sm mt-1">{currentDate}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-sm text-gray-500">Sistem Aktif</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Pegawai"
                    value={loading ? "..." : stats.total_pegawai}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    }
                    color="blue"
                    description="Terdaftar dalam sistem"
                />
                <StatCard
                    title="Cuti Menunggu"
                    value={loading ? "..." : stats.total_cuti_pending}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    }
                    color="yellow"
                    description="Perlu persetujuan"
                />
                <StatCard
                    title="Ajuan Jabatan"
                    value={loading ? "..." : stats.total_jabatan_ajuan}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    }
                    color="purple"
                    description="Pending approval"
                />
                <StatCard
                    title="Kegiatan Aktif"
                    value={loading ? "..." : stats.total_kegiatan_aktif}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                    }
                    color="green"
                    description="Sedang berlangsung"
                />
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Aksi Cepat</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <QuickAction
                        title="Kelola Pegawai"
                        description="Tambah, edit, atau hapus data pegawai"
                        href="/pegawai"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        }
                        color="bg-blue-500"
                    />
                    <QuickAction
                        title="Kelola Presensi"
                        description="Lihat dan kelola data presensi"
                        href="/presensi"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        color="bg-emerald-500"
                    />
                    <QuickAction
                        title="Kelola Cuti"
                        description="Approve atau reject pengajuan cuti"
                        href="/cuti"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        }
                        color="bg-amber-500"
                    />
                    <QuickAction
                        title="Kelola Kegiatan"
                        description="Buat dan kelola kegiatan"
                        href="/kegiatan"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        }
                        color="bg-purple-500"
                    />
                    <QuickAction
                        title="Kelola Jabatan"
                        description="Kelola struktur jabatan"
                        href="/jabatan"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        }
                        color="bg-indigo-500"
                    />
                    <QuickAction
                        title="Ajuan Jabatan"
                        description="Review perubahan jabatan"
                        href="/jabatan-ajuan"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        color="bg-rose-500"
                    />
                </div>
            </div>

            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold">Selamat Datang, Admin!</h3>
                        <p className="text-blue-100 mt-1">Kelola sistem SKAP dengan mudah melalui dashboard ini.</p>
                    </div>
                    <div className="hidden lg:block">
                        <div className="bg-white/10 rounded-lg p-4">
                            <svg className="w-16 h-16 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard

