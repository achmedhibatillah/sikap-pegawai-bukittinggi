import DashboardLayout from "@/layout/dashboard-layout"
import { useState, useEffect } from "react"
import axios from "axios"
import PegawaiDetailPage, { PegawaiDetail } from "./pegawai-detail"

interface object_sss {
    usr?: string
    acs?: string
}

interface DashboardPageProps {
    sss?: object_sss | null
}

interface FileInfo {
    id: string
    type: string
    path: string
}

interface JabatanItem {
    id: string
    nama: string
    tingkatan: number
    mulai: string
    selesai: string | null
    is_current: boolean
}

interface Pegawai {
    id: string
    nama: string
    jenis_kelamin: string
    tempat_lahir?: string | null
    tanggal_lahir?: string | null
    alamat?: string | null
    agama: string
    pendidikan: string
    foto?: string | null
    ktp?: string | null
    npwp?: string | null
    akun_id: string
    foto_file?: FileInfo | null
    ktp_file?: FileInfo | null
    npwp_file?: FileInfo | null
    akun?: {
        id: string
        email: string
        telp: string
        role: string
        created_at: string
        updated_at: string
    } | null
    current_jabatan?: {
        id: string
        nama: string
        tingkatan: number
        mulai: string
    } | null
    jabatan_history?: JabatanItem[]
}

const PgProfilPage = ({ sss }: DashboardPageProps) => {
    const [pegawai, setPegawai] = useState<Pegawai | null>(null)
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState<"identitas" | "akun" | "dokumen">("identitas")

    useEffect(() => {
        const fetchPegawai = async () => {
            try {
                const response = await axios.get("/pg/api/me")
                // Struktur API baru: { data: { ...semua field pegawai lengkap } }
                if (response.data?.data) {
                    setPegawai(response.data.data)
                }
            } catch (e: any) {
                console.error("Error fetching profile:", e)
            } finally {
                setLoading(false)
            }
        }

        fetchPegawai()
    }, [])

    if (loading) {
        return (
            <DashboardLayout sss={sss} now="Profil Saya">
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Memuat data...</div>
                </div>
            </DashboardLayout>
        )
    }

    if (!pegawai) {
        return (
            <DashboardLayout sss={sss} now="Profil Saya">
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Data tidak ditemukan</div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout sss={sss} now="Profil Saya">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Profil Saya</h1>
                <p className="text-gray-500 text-sm mt-1">Lihat data profil Anda</p>
            </div>

            {/* Panggil komponen PegawaiDetail yang sudah ada */}
            <PegawaiDetail 
                pegawai={pegawai} 
                open={open} 
                setOpen={setOpen}
                akun={pegawai?.akun}
            />
        </DashboardLayout>
    )
}

export default PgProfilPage

