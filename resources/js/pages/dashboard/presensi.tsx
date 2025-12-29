import { useState, useEffect } from "react"

import DashboardLayout from "@/layout/dashboard-layout"
import Button from "@/component/button"
import PopUpRight from "@/component/popup-right"
import PresensiAdd from "@/section/presensi-add"
import InputText from "@/component/input-text"
import axios from "axios"
import ProfilePicture from "@/component/profile-picture"
import formatTanggal from "@/utils/format-tanggal"
import { truncateText } from "@/utils/truncate-text"

interface object_sss {
    usr?: string,
    acs?: string
}

interface DashboardPageProps {
    sss?: object_sss | null
}

const PresensiPage = ({ sss }: DashboardPageProps) =>{
    const [openAddMenu, setOpenAddMenu] = useState(false)
    const [from, setFrom] = useState<string | null>(null)
    const [to, setTo] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [items, setItems] = useState<Array<any>>([])
    const [meta, setMeta] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => { fetchData() }, [page, perPage])

    const fetchData = async (overridePage?: number) => {
        setLoading(true)
        try {
            const resp = await axios.get('/api/presensi', { params: { page: overridePage ?? page, per_page: perPage, from, to } })
            if (resp.data?.status === 'success') {
                setItems(resp.data.data.items)
                setMeta(resp.data.data.meta)
            } else {
                setItems([])
                setMeta(null)
            }
        } catch (err) {
            console.error(err)
            setItems([])
            setMeta(null)
        } finally { setLoading(false) }
    }

    return (
        <DashboardLayout sss={sss} now="Presensi">
            <div className="grid gap-4 lg:grid-cols-2 items-start">
                <div>
                    <Button onClick={() => setOpenAddMenu(true)}>Tambah sesi presensi</Button>
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <span className="text-sm whitespace-nowrap">Dari</span>
                    <InputText
                        type="date"
                        value={from ?? ""}
                        onChange={(e: any) => setFrom(e.target.value)}
                        className="w-full sm:w-auto"
                    />
                    <span className="text-sm whitespace-nowrap">Sampai</span>
                    <InputText
                        type="date"
                        value={to ?? ""}
                        onChange={(e: any) => setTo(e.target.value)}
                        className="w-full sm:w-auto"
                    />
                    <Button
                    onClick={() => {
                        setPage(1)
                        fetchData(1)
                    }}
                    >
                    Filter
                    </Button>
                </div>
            </div>
            {openAddMenu && (
                <PopUpRight name="Tambah sesi presensi baru" state={openAddMenu} setState={setOpenAddMenu} dangerWhenClose={true}>
                    <PresensiAdd />
                </PopUpRight>
            )}

            <div className="mt-4">
                {loading && <div>Loading...</div>}
                {!loading && items.length === 0 && <div className="mt-2">Tidak ada sesi presensi</div>}
                {!loading && items.map((s:any) => (
                    <div key={s.id} className="rounded bg-white p-3 shadow mb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-semibold">{formatTanggal(s.tanggal)}</div>
                                <div className="text-sm text-gray-500">{s.jam_mulai} - {s.jam_selesai}</div>
                                <div className="text-sm text-gray-500">{truncateText(s.catatan, 20)}</div>
                            </div>
                            <div className="grid lg:grid-cols-12 gap-2">
                                <div className="lg:col-span-11 grid grid-cols-6">
                                    <div>
                                        <div className="text-xs rounded mx-0.5 flex justify-center text-center text-white bg-green-600">Hadir<br/>{s.totals.hadir}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs rounded mx-0.5 flex justify-center text-center text-white bg-yellow-600">Telat<br/>{s.totals.telat}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs rounded mx-0.5 flex justify-center text-center text-white bg-blue-600">Izin<br/>{s.totals.izin}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs rounded mx-0.5 flex justify-center text-center text-white bg-purple-600">Cuti<br/>{s.totals.cuti}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs rounded mx-0.5 flex justify-center text-center text-white bg-red-600">Alpa<br/>{s.totals.alpa}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs rounded mx-0.5 flex justify-center text-center text-white bg-black">Total<br/>{s.totals.total}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div><Button onClick={() => window.location.href = '/presensi/' + s.id}>Lihat</Button></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {meta && (
                    <div className="flex items-center justify-between mt-4">
                        <div>Halaman {meta.current_page} / {meta.last_page} — {meta.total} sesi</div>
                        <div className="flex items-center gap-2">
                            <Button disabled={meta.current_page <= 1} onClick={() => setPage(Math.max(1, meta.current_page - 1))}>Prev</Button>
                            <Button disabled={meta.current_page >= meta.last_page} onClick={() => setPage(Math.min(meta.last_page, meta.current_page + 1))}>Next</Button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default PresensiPage