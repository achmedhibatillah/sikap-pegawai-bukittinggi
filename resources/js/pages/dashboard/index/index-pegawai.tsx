import axios from "axios"
import { useEffect, useState } from "react"

const IndexPegawaiPage = ({
    akun_id
}: {
    akun_id?: string | null
}) => {
    const [pegawaiId, setPegawaiId] = useState<string | null>(null)
    const [presensi, setPresensi] = useState<any | null>(null)
    const [pivot, setPivot] = useState<any | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!pegawaiId) return
        // fetch today's presensi and pivot for this pegawai
        const fetchCurrent = async () => {
            try {
                setLoading(true)
                const resp = await axios.get('/api/presensi/current', { params: { pegawai_id: pegawaiId } })
                if (resp.data?.status === 'success') {
                    setPresensi(resp.data.data.presensi ?? null)
                    setPivot(resp.data.data.pivot ?? null)
                } else {
                    setPresensi(null)
                    setPivot(null)
                }
            } catch (err) {
                console.error(err)
                setPresensi(null)
                setPivot(null)
            } finally { setLoading(false) }
        }

        fetchCurrent()
    }, [pegawaiId])

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

    const nowWithin = () => {
        if (!presensi) return false
        return !!(respWithinFlag(presensi))
    }

    // helper: use presensi and server-provided within_now flag if present
    const respWithinFlag = (p: any) => {
        // if server returned within_now include it
        if ((p as any).within_now !== undefined) return (p as any).within_now
        // fallback: compute on client
        try {
            const now = new Date()
            const start = new Date(p.tanggal + 'T' + p.jam_mulai)
            const end = new Date(p.tanggal + 'T' + p.jam_selesai)
            return now >= start && now <= end
        } catch (e) {
            return false
        }
    }

    const handleMasuk = async () => {
        if (!presensi || !pegawaiId) return
        try {
            // determine Hadir or Hadir (Telat)
            const now = new Date()
            const start = new Date(presensi.tanggal + 'T' + presensi.jam_mulai)
            const status = now > start ? 'Hadir (Telat)' : 'Hadir'
            const masuk = now.toTimeString().slice(0,8)
            setLoading(true)
            const resp = await axios.post(`/api/presensi/${presensi.id}/pegawai/${pegawaiId}/update`, { masuk, status })
            if (resp.data?.status === 'success') {
                // refresh pivot
                const cur = await axios.get('/api/presensi/current', { params: { pegawai_id: pegawaiId } })
                setPresensi(cur.data.data.presensi ?? null)
                setPivot(cur.data.data.pivot ?? null)
            }
        } catch (e) {
            console.error(e)
        } finally { setLoading(false) }
    }

    const handleKeluar = async () => {
        if (!presensi || !pegawaiId) return
        try {
            const now = new Date()
            const keluar = now.toTimeString().slice(0,8)
            setLoading(true)
            const resp = await axios.post(`/api/presensi/${presensi.id}/pegawai/${pegawaiId}/update`, { keluar })
            if (resp.data?.status === 'success') {
                const cur = await axios.get('/api/presensi/current', { params: { pegawai_id: pegawaiId } })
                setPresensi(cur.data.data.presensi ?? null)
                setPivot(cur.data.data.pivot ?? null)
            }
        } catch (e) {
            console.error(e)
        } finally { setLoading(false) }
    }

    const handleIzin = async () => {
        if (!presensi || !pegawaiId) return
        const note = window.prompt('Alasan izin (opsional):')
        try {
            setLoading(true)
            // set status Izin and keep default times
            const resp = await axios.post(`/api/presensi/${presensi.id}/pegawai/${pegawaiId}/update`, { status: 'Izin', catatan: note ?? '' })
            if (resp.data?.status === 'success') {
                const cur = await axios.get('/api/presensi/current', { params: { pegawai_id: pegawaiId } })
                setPresensi(cur.data.data.presensi ?? null)
                setPivot(cur.data.data.pivot ?? null)
            }
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    return (
        <>
            <div className="space-y-2">
                <div className="text-lg font-semibold">Presensi</div>
                {!pegawaiId && <div className="text-sm text-gray-500">Silakan login untuk melihat presensi.</div>}
                {pegawaiId && (
                    <div className="text-sm text-gray-500">Pegawai ID: {pegawaiId}</div>
                )}

                {loading && <div>Loading...</div>}

                {presensi ? (
                    <div className="mt-2 p-3 bg-white rounded shadow">
                        <div className="font-medium">Sesi {presensi.tanggal} — {presensi.jam_mulai} / {presensi.jam_selesai}</div>
                        <div className="text-sm text-gray-600 mt-1">{presensi.catatan}</div>
                        <div className="mt-3 flex items-center gap-2">
                            <button className="px-3 py-1 bg-green-500 text-white rounded" onClick={handleMasuk} disabled={!respWithinFlag(presensi) || !!(pivot && pivot.masuk) || loading}>Masuk</button>
                            <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={handleIzin} disabled={!respWithinFlag(presensi) || !!(pivot && pivot.masuk) || loading}>Izin</button>
                            <button className="px-3 py-1 bg-gray-700 text-white rounded" onClick={handleKeluar} disabled={!(pivot && pivot.masuk) || !!(pivot && pivot.keluar) || loading}>Keluar</button>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">Status sekarang: {pivot?.status ?? '—' } | Masuk: {pivot?.masuk ?? '—'} | Keluar: {pivot?.keluar ?? '—'}</div>
                    </div>
                ) : (
                    <div className="mt-2 text-sm text-gray-500">Tidak ada sesi presensi hari ini.</div>
                )}
            </div>
        </>
    )
}

export default IndexPegawaiPage
