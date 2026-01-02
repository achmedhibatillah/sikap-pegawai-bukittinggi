import { Head, Link } from "@inertiajs/react";

export default function IndexPage() {
    const features = [
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            title: "Keamanan Terjamin",
            description: "Sistem dengan autentikasi yang aman untuk melindungi data kepegawaian Anda"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: "Presensi Pintar",
            description: "Kelola kehadiran karyawan dengan sistem presensi yang terintegrasi dan akurat"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            title: "Pengajuan Cuti Online",
            description: "Proses pengajuan cuti yang mudah dan transparan dengan persetujuan berjenjang"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            title: "Manajemen Jabatan",
            description: "Kelola struktur organisasi dan pengajuan jabatan dengan sistem yang terstruktur"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
            ),
            title: "Laporan Kegiatan",
            description: "Pantau dan dokumentasikan kegiatan perusahaan secara realtime"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            title: "Dashboard Admin",
            description: "Visualisasi data yang lengkap untuk pengambilan keputusan yang tepat"
        }
    ];

    return (
        <>
            <Head title="SIKAP - Sistem Kepegawaian">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FFFCF7]/80 backdrop-blur-md border-b border-[#C2D8B9]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#C2D8B9] to-[#A3C49A] rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">S</span>
                            </div>
                            <span className="text-xl font-bold text-[#2D5016]">SIKAP</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/login"
                                className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#2D5016] to-[#3D6B1E] rounded-lg hover:from-[#1D3009] hover:to-[#2D5016] transition-all shadow-lg shadow-green-500/25"
                            >
                                Login sekarang
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FFFCF7] to-[#E4F0D0]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C2D8B9]/50 rounded-full text-[#2D5016] text-sm font-medium mb-8">
                            <span className="w-2 h-2 bg-[#2D5016] rounded-full animate-pulse"></span>
                            Sistem Kepegawaian Modern
                        </div>
                        <h1 className="text-5xl sm:text-6xl font-bold text-[#1D3009] mb-6 leading-tight">
                            Kelola Kepegawaian
                            <span className="bg-gradient-to-r from-[#2D5016] to-[#4A8022] bg-clip-text text-transparent"> Lebih Mudah</span>
                        </h1>
                        <p className="text-xl text-[#3D4D2A] mb-10 max-w-2xl mx-auto leading-relaxed">
                            SIKAP adalah sistem kepegawaian terintegrasi yang membantu organisasi 
                            mengelola presensi, cuti, jabatan, dan kegiatan dengan efisien.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/login"
                                className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-[#2D5016] to-[#3D6B1E] rounded-xl hover:from-[#1D3009] hover:to-[#2D5016] transition-all shadow-xl shadow-green-500/25 flex items-center justify-center gap-2"
                            >
                                Login Sekarang
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                            <a
                                href="#features"
                                className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-[#2D5016] bg-white border-2 border-[#C2D8B9] rounded-xl hover:border-[#A3C49A] hover:bg-[#E4F0D0]/50 transition-all flex items-center justify-center"
                            >
                                Pelajari Lebih Lanjut
                            </a>
                        </div>
                    </div>

                    {/* Dashboard Preview */}
                    <div className="mt-20 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#FFFCF7] via-transparent to-transparent z-10 pointer-events-none"></div>
                        <div className="bg-gradient-to-br from-[#2D5016] to-[#1D3009] rounded-2xl shadow-2xl overflow-hidden border border-[#C2D8B9]">
                            <div className="flex items-center gap-2 px-4 py-3 bg-[#1D3009]/50 border-b border-[#C2D8B9]/30">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-4 gap-4 mb-6">
                                    <div className="bg-[#C2D8B9]/20 rounded-xl p-4 border border-[#C2D8B9]/30">
                                        <p className="text-[#A3C49A] text-sm">Total Pegawai</p>
                                        <p className="text-3xl font-bold text-white mt-1">128</p>
                                    </div>
                                    <div className="bg-[#C2D8B9]/20 rounded-xl p-4 border border-[#C2D8B9]/30">
                                        <p className="text-[#A3C49A] text-sm">Hadir Hari Ini</p>
                                        <p className="text-3xl font-bold text-white mt-1">124</p>
                                    </div>
                                    <div className="bg-[#C2D8B9]/20 rounded-xl p-4 border border-[#C2D8B9]/30">
                                        <p className="text-[#A3C49A] text-sm">Cuti Pending</p>
                                        <p className="text-3xl font-bold text-white mt-1">8</p>
                                    </div>
                                    <div className="bg-[#C2D8B9]/20 rounded-xl p-4 border border-[#C2D8B9]/30">
                                        <p className="text-[#A3C49A] text-sm">Kegiatan Aktif</p>
                                        <p className="text-3xl font-bold text-white mt-1">3</p>
                                    </div>
                                </div>
                                <div className="h-48 bg-[#1D3009]/50 rounded-xl flex items-center justify-center">
                                    <p className="text-[#A3C49A]">Dashboard Preview</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-[#1D3009] mb-4">
                            Fitur Lengkap & Modern
                        </h2>
                        <p className="text-lg text-[#3D4D2A] max-w-2xl mx-auto">
                            SIKAP menyediakan berbagai fitur yang dibutuhkan untuk mengelola 
                            kepegawaian secara efektif dan efisien
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group p-8 bg-[#FFFCF7] rounded-2xl border border-[#C2D8B9] hover:border-[#A3C49A] hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300"
                            >
                                <div className="w-14 h-14 bg-gradient-to-br from-[#E4F0D0] to-[#C2D8B9] rounded-xl flex items-center justify-center text-[#2D5016] mb-6 group-hover:from-[#C2D8B9] group-hover:to-[#A3C49A] group-hover:text-white transition-all duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-[#1D3009] mb-3">{feature.title}</h3>
                                <p className="text-[#3D4D2A] leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#2D5016] to-[#4A8022]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { value: "500+", label: "Pegawai Terdaftar" },
                            { value: "10K+", label: "Data Presensi" },
                            { value: "99.9%", label: "Uptime System" },
                            { value: "24/7", label: "Dukungan Sistem" }
                        ].map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">{stat.value}</div>
                                <div className="text-[#E4F0D0]">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#E4F0D0]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-[#1D3009] mb-6">
                        Siap Mengoptimalkan Sistem Kepegawaian?
                    </h2>
                    <p className="text-lg text-[#3D4D2A] mb-10">
                        Bergabunglah dengan SIKAP dan rasakan kemudahan mengelola kepegawaian 
                        dalam satu sistem yang terintegrasi.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-[#2D5016] to-[#3D6B1E] rounded-xl hover:from-[#1D3009] hover:to-[#2D5016] transition-all shadow-xl shadow-green-500/25"
                    >
                        Mulai Menggunakan SIKAP
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#1D3009] text-[#A3C49A] py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#C2D8B9] to-[#A3C49A] rounded-xl flex items-center justify-center">
                                <span className="text-[#1D3009] font-bold text-lg">S</span>
                            </div>
                            <span className="text-xl font-bold text-white">SIKAP</span>
                        </div>
                        <p className="text-sm">
                            &copy; {new Date().getFullYear()} SIKAP. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <a href="#" className="text-sm hover:text-white transition-colors">Tentang</a>
                            <a href="#" className="text-sm hover:text-white transition-colors">Fitur</a>
                            <a href="#" className="text-sm hover:text-white transition-colors">Kontak</a>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}

