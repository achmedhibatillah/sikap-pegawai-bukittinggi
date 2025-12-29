import DashboardLayout from "@/layout/dashboard-layout"
import { useState, useEffect } from "react"
import Button from "@/component/button"
import PopUpRight from "@/component/popup-right"
import { useFormik } from "formik"
import * as Yup from "yup";
import axios from "axios"
import PegawaiAdd from "@/section/pegawai-add"
import InputText from "@/component/input-text"
import ProfilePicture from "@/component/profile-picture"
import JenisKelamin from "@/component/jenis-kelamin"
import { IoMdPersonAdd } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { MdMail } from "react-icons/md";

interface object_sss {
    usr?: string,
    acs?: string
}

interface DashboardPageProps {
    sss?: object_sss | null
}

const PegawaiPage = ({ sss }: DashboardPageProps) =>{
    const [openAddMenu, setOpenAddMenu] = useState(false)
    const [q, setQ] = useState('')
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [items, setItems] = useState<Array<any>>([])
    const [meta, setMeta] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, perPage])

    const fetchData = async (overridePage?: number) => {
        setLoading(true)
        try {
            const resp = await axios.get('/api/pegawai', { params: { page: overridePage ?? page, per_page: perPage, q } })
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
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout sss={sss} now="Pegawai">
            <div className={`relative min-h-full`}>
                <div className="flex items-center gap-3 mb-4">
                    <Button color="main"
                        onClick={(e: any) => {
                            e.stopPropagation()
                            setOpenAddMenu(true)
                        }}
                    >Tambah pegawai <IoMdPersonAdd className="inline mb-1" /></Button>

                    <div className="flex items-center gap-2">
                        <InputText placeholder="Cari nama pegawai" value={q} onChange={(e: any) => setQ(e.target.value)} />
                        <Button color="secondary" onClick={() => { setPage(1); fetchData(1) }}><FaSearch className="inline my-1 shadow" /></Button>
                        <select className="border rounded p-2" value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1) }}>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                        </select>
                    </div>
                </div>
                {openAddMenu && (
                    <PopUpRight name="Tambah pegawai baru" state={openAddMenu} setState={setOpenAddMenu} dangerWhenClose={true}>
                        <>
                            <PegawaiAdd />
                        </>
                    </PopUpRight>
                )}

                <div className="mt-4">
                    <div className="space-y-3">
                        {loading && <div>Loading...</div>}
                        {!loading && items.length === 0 && <div>Tidak ada data</div>}
                        {!loading && items.map((p: any) => (
                            <div key={p.id} className="rounded bg-white p-3 shadow flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <ProfilePicture className={`h-[60px] w-[60px]`} classNameBlank={`text-[35px]`} image={p.foto ?? null} />
                                    <div>
                                        <div className="font-semibold text-xl leading-5 mb-2">{p.nama}</div>
                                        <div className="text-sm text-gray-500"><JenisKelamin jenis_kelamin={p.jenis_kelamin} /></div>
                                        <div className="text-sm text-gray-500"><MdMail className="inline me-1" />{p.akun?.email ?? ''}</div>
                                    </div>
                                </div>
                                <div>
                                    <Button onClick={() => window.location.href = '/pegawai/' + p.id}>Lihat</Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {meta && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-gray-400 text-sm">
                                <div className="">Menampilkan halaman {meta.current_page} dari {meta.last_page}.</div>
                                <div className="">Total: {meta.total} item.</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button disabled={meta.current_page <= 1} onClick={() => setPage(Math.max(1, meta.current_page - 1))}>Prev</Button>
                                <Button disabled={meta.current_page >= meta.last_page} onClick={() => setPage(Math.min(meta.last_page, meta.current_page + 1))}>Next</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}

export default PegawaiPage