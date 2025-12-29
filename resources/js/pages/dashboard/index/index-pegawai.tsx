import axios from "axios"
import { useEffect, useState } from "react"

const IndexPegawaiPage = ({
    akun_id
}: {
    akun_id?: string | null
}) => {
    const [pegawaiId, setPegawaiId] = useState<string | null>(null)

    useEffect(() => {
        if (!akun_id) return

        const fetchPegawai = async () => {
            try {
                const { data } = await axios.get(
                `/api/pegawai-by-akun/${akun_id}`
                )

                setPegawaiId(data?.pegawai_id ?? null)
            } catch (error) {
                console.error("Gagal mengambil pegawai:", error)
            }
        }

        fetchPegawai()
    }, [akun_id])

    return (
        <>
            <div>Isinya adalah presensi.</div>
            {pegawaiId && (
                <div className="text-sm text-gray-500">
                Pegawai ID: {pegawaiId}
                </div>
            )}
        </>
    )
}

export default IndexPegawaiPage
