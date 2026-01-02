import DashboardLayout from "@/layout/dashboard-layout"
import { useState, useEffect } from "react"
import Button from "@/component/button"
import PopUpRight from "@/component/popup-right"
import { useFormik } from "formik"
import * as Yup from "yup";
import axios from "axios"
import PegawaiAdd from "@/section/pegawai-add"
import { MdEditSquare } from "react-icons/md";
import ProfilePicture from "@/component/profile-picture"
import JenisKelamin from "@/component/jenis-kelamin"
import { FaEdit } from "react-icons/fa";
import InputText from "@/component/input-text"
import ErrorInput from "@/component/error-input"
import InputDropdown from "@/component/input-dropdown"
import formatTanggal from "@/utils/format-tanggal"
import formatTanggalInput from "@/utils/format-tanggal-input"
import { IoIosSave } from "react-icons/io";
import DocumentPicture from "@/component/document-picture"

interface object_sss {
    usr?: string,
    acs?: string
}

interface DashboardPageProps {
    sss?: object_sss | null
    id?: string
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
}

const PegawaiDetailPage = ({ sss, id }: DashboardPageProps) =>{
    const [open, setOpen] = useState<"identitas" | "akun" | "dokumen">("identitas")

    const [openEditAkunMenu, setOpenEditAkunMenu] = useState(false)

    const [pegawai, setPegawai] = useState<{ data: Pegawai } | null>(null)

    useEffect(() => {
        const fetchPegawai = async () => {
            try {
                const response = await axios.get("/api/pegawai/" + id)
                setPegawai(response.data)
            } catch (e: any) {
                if (e.response?.status === 404) {
                    window.location.href = "/pegawai"
                }
            }
        }

        fetchPegawai()
    }, [id])

    return (
        <DashboardLayout sss={sss} now="Pegawai">
            <div className={`relative min-h-full`}>
                <div className="">
                    <div className="mb-3">
                        <div className="text-3xl font-bold mb-1">Detail Pegawai</div>
                    </div>
                    {/* <div className="flex items-center gap-2">
                        
                        <Button color="main"
                            onClick={(e: any) => {
                                e.stopPropagation()
                                setOpenEditAkunMenu(true)
                        }}>Edit data pegawai <MdEditSquare className="inline"/></Button>
                    </div> */}
                    <div className="mt-5">
                        <PegawaiDetail open={open} setOpen={setOpen} pegawai={pegawai?.data} />
                    </div>
                </div>

                {openEditAkunMenu && (
                    <PopUpRight name="Edit data pegawai" state={openEditAkunMenu} setState={setOpenEditAkunMenu} dangerWhenClose={true}>
                        <>
                            
                        </>
                    </PopUpRight>
                )}
            </div>
        </DashboardLayout>
    )
}

export default PegawaiDetailPage

interface PegawaiDetailProps {
    pegawai?: Pegawai
    open: "identitas" | "akun" | "dokumen"
    setOpen: React.Dispatch<React.SetStateAction<"identitas" | "akun" | "dokumen">>
}


export const PegawaiDetail = ({ pegawai, open, setOpen, akun }: PegawaiDetailProps & { akun?: any }) => {
    const [openEditMenu, setOpenEditMenu] = useState(false)
    const [openEditPhoto, setOpenEditPhoto] = useState(false)
    const [photoFile, setPhotoFile] = useState<File | null>(null)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    const [openEditKtp, setOpenEditKtp] = useState(false)
    const [ktpFile, setKtpFile] = useState<File | null>(null)
    const [ktpPreview, setKtpPreview] = useState<string | null>(null)
    const [openEditNpwp, setOpenEditNpwp] = useState(false)
    const [npwpFile, setNpwpFile] = useState<File | null>(null)
    const [npwpPreview, setNpwpPreview] = useState<string | null>(null)
    const [openEditAkun, setOpenEditAkun] = useState(false)

    // Fallback untuk akun: gunakan props akun atau pegawai.akun
    const currentAkun = akun ?? (pegawai as any)?.akun

    const jenisKelaminOptions = [
        { value: 'Laki-laki', label: 'Laki-laki' },
        { value: 'Perempuan', label: 'Perempuan' }
    ]
    const agamaOptions = [
        { value: "Islam", label: "Islam" },
        { value: "Kristen", label: "Kristen" },
        { value: "Katolik", label: "Katolik" },
        { value: "Hindu", label: "Hindu" },
        { value: "Buddha", label: "Buddha" },
        { value: "Konghucu", label: "Konghucu" },
        { value: "Lainnya", label: "Lainnya" }
    ];
    const pendidikanOptions = [
        { value: "SD", label: "SD" },
        { value: "SMP", label: "SMP" },
        { value: "SMA/SMK", label: "SMA/SMK" },
        { value: "S1", label: "S1" },
        { value: "S2", label: "S2" },
        { value: "S3", label: "S3" },
        { value: 'Lainnya', label: 'Lainnya' }
    ];

    const editIdentitasFormik = useFormik({
        enableReinitialize: true,
        initialValues: {
            id: pegawai?.id ?? '',
            nama: pegawai?.nama ?? '',
            jenis_kelamin: pegawai?.jenis_kelamin ?? '',
            tempat_lahir: pegawai?.tempat_lahir ?? '',
            tanggal_lahir: pegawai?.tanggal_lahir ?? '',
            alamat: pegawai?.alamat ?? '',
            agama: pegawai?.agama ?? '',
            pendidikan: pegawai?.pendidikan ?? '',
        },
        validationSchema: Yup.object({
            nama: Yup.string()
                .required("Nama lengkap wajib diisi.")
                .min(3, "Nama lengkap minimal 3 karakter")
                .max(255, "Nama lengkap maksimal 255 karakter."),
            jenis_kelamin: Yup.string().required("Jenis kelamin wajib diisi."),
            tempat_lahir: Yup.string()
                .min(3, "Tempat lahir minimal 3 karakter")
                .max(20, "Tempat lahir maksimal 20 karakter."),
            tanggal_lahir: Yup.date(),
            alamat: Yup.string()
                .max(255, "Maksimal alamat lengkap 255 karakter."),
            agama: Yup.string()
                .required("Agama tidak boleh kosong. Isi \"lainnya\" jika belum ingin diisi."),
            pendidikan: Yup.string()
                .required("Jenjang pendidikan terakhir tidak boleh kosong. Isi \"lainnya\" jika belum ingin diisi."),
        }),
        onSubmit: async (values) => {

            try {
                const resp = await axios.post(`/api/pegawai/${values.id}/update`, values)
                if (resp.data?.status === 'success') {
                    alert('Data identitas berhasil disimpan')
                    setOpenEditMenu(false)
                    window.location.reload()
                } else {
                    console.error('Unexpected response', resp.data)
                    alert('Gagal menyimpan data')
                }
            } catch (err) {
                console.error(err)
                alert('Terjadi kesalahan saat menyimpan')
            }
        }
    })

    const editAkunFormik = useFormik({
        enableReinitialize: true,
        initialValues: {
            id: pegawai?.akun_id ?? '',
            email: currentAkun?.email ?? '',
            telp: currentAkun?.telp ?? '',
            password: ''
        },
        validationSchema: Yup.object({
            email: Yup.string().required('Email wajib diisi').email('Email tidak valid'),
            telp: Yup.string().nullable(),
            password: Yup.string().nullable().min(6, 'Password minimal 6 karakter')
        }),
        onSubmit: async (values) => {
            try {
                const resp = await axios.post(`/api/akun/${values.id}/update`, values)
                if (resp.data?.status === 'success') {
                    alert('Akun berhasil diperbarui')
                    setOpenEditAkun(false)
                    // refresh page to fetch latest akun data
                    window.location.reload()
                } else {
                    console.error('Unexpected response', resp.data)
                    alert('Gagal menyimpan akun')
                }
            } catch (err) {
                console.error(err)
                alert('Terjadi kesalahan saat menyimpan akun')
            }
        }
    })

    return (
        <div className="grid lg:grid-cols-3 gap-3">
            <div className="">
                <div className="rounded-md bg-white shadow p-5">
                    {/* {JSON.stringify(pegawai)} */}
                    <div className="w-full bg-amber-200 h-[100px] relative rounded-md mb-12 grid">
                        <div className="absolute -translate-1/2 -bottom-[80px] left-1/2">
                            <ProfilePicture className={`h-[100px] w-[100px]`} classNameBlank={`text-[45px]`} image={pegawai?.foto} />
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{pegawai?.nama}</div>
                        <div className="text-xs text-gray-400">{pegawai?.id}</div>
                        <div className="mt-3"><JenisKelamin className="text-sm" jenis_kelamin={pegawai?.jenis_kelamin} /></div>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-2">
                <div className="flex items-center gap-1">
                    <Button className={`${open === 'identitas' && 'border border-blue-700'}`} onClick={() => setOpen("identitas")}>Identitas</Button>
                    <Button className={`${open === 'akun' && 'border border-blue-700'}`} onClick={() => setOpen("akun")}>Akun</Button>
                    <Button className={`${open === 'dokumen' && 'border border-blue-700'}`} onClick={() => setOpen("dokumen")}>Dokumen</Button>
                </div>
                <div className="bg-white rounded-md shadow mt-3 p-3">
                    {open === "identitas" ? (
                        <div className="">
                            <div className="mb-7 flex items-center gap-2">
                                <Button className="text-xs" color="middle" onClick={(e: any) => {
                                    e.stopPropagation()
                                    setOpenEditMenu(true)
                                }}>Edit identitas <FaEdit className="inline mb-1" /></Button>
                                <Button className="text-xs" color="middle" onClick={() => setOpenEditPhoto(true)}>Edit foto profil <FaEdit className="inline mb-1" /></Button>
                            </div>
                            <div className="grid grid-cols-4 mb-3">
                                <div className="text-gray-600">Nama lengkap</div>
                                <div className="col-span-3 rounded bg-gray-100 p-3">{pegawai?.nama}</div>
                            </div>
                            <div className="grid grid-cols-4 mb-3">
                                <div className="text-gray-600">Jenis kelamin</div>
                                <div className="col-span-3 rounded bg-gray-100 p-3"><JenisKelamin jenis_kelamin={pegawai?.jenis_kelamin} /></div>
                            </div>
                            <div className="grid grid-cols-4 mb-3">
                                <div className="text-gray-600">Tempat lahir</div>
                                <div className="col-span-3 rounded bg-gray-100 p-3">{pegawai?.tempat_lahir ?? "-"}</div>
                            </div>
                            <div className="grid grid-cols-4 mb-3">
                                <div className="text-gray-600">Tanggal lahir</div>
                                <div className="col-span-3 rounded bg-gray-100 p-3">{formatTanggal(pegawai?.tanggal_lahir) ?? "-"}</div>
                            </div>
                            <div className="grid grid-cols-4 mb-3">
                                <div className="text-gray-600">Alamat lengkap</div>
                                <div className="col-span-3 rounded bg-gray-100 p-3">{pegawai?.alamat ?? "-"}</div>
                            </div>
                            <div className="grid grid-cols-4 mb-3">
                                <div className="text-gray-600">Agama</div>
                                <div className="col-span-3 rounded bg-gray-100 p-3">{pegawai?.agama ?? "-"}</div>
                            </div>
                            <div className="grid grid-cols-4">
                                <div className="text-gray-600">Pendidikan terakhir</div>
                                <div className="col-span-3 rounded bg-gray-100 p-3">{pegawai?.pendidikan ?? "-"}</div>
                            </div>
                        </div>
                    ) : open === "akun" ? (
                        <div className="">
                            <div className="">
                                <div className="flex items-center mb-7">
                                    <Button className="text-xs" color="middle" onClick={() => setOpenEditAkun(true)}>Edit Akun <FaEdit className="inline mb-1" /></Button>
                                </div>
                                <div className="grid grid-cols-4 mb-3">
                                    <div className="text-gray-600">Email</div>
                                    <div className="col-span-3 rounded bg-gray-100 p-3">{currentAkun?.email ?? '-'}</div>
                                </div>
                                <div className="grid grid-cols-4 mb-3">
                                    <div className="text-gray-600">Nomor telepon</div>
                                    <div className="col-span-3 rounded bg-gray-100 p-3">+62{currentAkun?.telp ?? '-'}</div>
                                </div>
                                <div className="grid grid-cols-4">
                                    <div className="text-gray-600">Password</div>
                                    <div className="col-span-3 rounded bg-gray-100 text-gray-500 p-3">••••••••</div>
                                </div>
                            </div>
                        </div>
                    ) : open === "dokumen" ? (
                        <div className="grid lg:grid-cols-2 gap-4">
                            <div className="rounded bg-gray-50 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="font-semibold">KTP</div>
                                    <Button className="text-xs" color="middle" onClick={() => setOpenEditKtp(true)}>Edit <FaEdit className="inline mb-1" /></Button>
                                </div>
                                <div className="">
                                    <DocumentPicture image={ktpPreview ?? pegawai?.ktp ?? null} />
                                </div>
                            </div>
                            <div className="rounded bg-gray-50 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="font-semibold">NPWP</div>
                                    <Button className="text-xs" color="middle" onClick={() => setOpenEditNpwp(true)}>Edit <FaEdit className="inline mb-1" /></Button>
                                </div>
                                <div className="">
                                    <DocumentPicture image={npwpPreview ?? pegawai?.npwp ?? null} />
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
            {openEditMenu && (
                <PopUpRight name="Edit pegawai" state={openEditMenu} setState={setOpenEditMenu} dangerWhenClose={true}>
                    <>
                    <form onSubmit={editIdentitasFormik.handleSubmit}>
                        <div className="mb-3">
                            <div className="text-sm mb-1">Nama lengkap *</div>
                            <InputText
                                type="text"
                                id="nama"
                                placeholder="Muhammad Saleh"
                                value={editIdentitasFormik.values.nama}
                                onChange={editIdentitasFormik.handleChange}
                                onBlur={editIdentitasFormik.handleBlur}
                            />
                            {editIdentitasFormik.touched.nama && editIdentitasFormik.errors.nama && (
                                <ErrorInput className="mt-2">{editIdentitasFormik.errors.nama}</ErrorInput>
                            )}
                        </div>
                        <div className="mb-3">
                            <div className="text-sm mb-1">Jenis kelamin *</div>
                            <InputDropdown 
                                options={jenisKelaminOptions}
                                placeholder="Pilih jenis kelamin"
                                value={
                                    jenisKelaminOptions.find(o => o.value === editIdentitasFormik.values.jenis_kelamin) ?? null
                                }
                                onChange={(opt) => editIdentitasFormik.setFieldValue('jenis_kelamin', opt ? opt.value : '')}
                            />
                            {editIdentitasFormik.touched.jenis_kelamin && editIdentitasFormik.errors.jenis_kelamin && (
                                <ErrorInput className="mt-2">{editIdentitasFormik.errors.jenis_kelamin}</ErrorInput>
                            )}
                        </div>
                        <div className="mb-3 grid grid-cols-2">
                            <div className="me-1">
                                <div className="text-sm mb-1">Tempat lahir</div>
                                <InputText
                                    type="text"
                                    id="tempat_lahir"
                                    placeholder="Masukkan kota"
                                    value={editIdentitasFormik.values.tempat_lahir}
                                    onChange={editIdentitasFormik.handleChange}
                                    onBlur={editIdentitasFormik.handleBlur}
                                />
                                {editIdentitasFormik.touched.tempat_lahir && editIdentitasFormik.errors.tempat_lahir && (
                                    <ErrorInput className="mt-2">{editIdentitasFormik.errors.tempat_lahir}</ErrorInput>
                                )}
                            </div>
                            <div className="ms-1">
                                <div className="text-sm mb-1">Tanggal lahir</div>
                                <InputText
                                    type="date"
                                    id="tanggal_lahir"
                                    placeholder="Masukkan tanggal lahir"
                                    value={formatTanggalInput(editIdentitasFormik.values.tanggal_lahir)}
                                    onChange={editIdentitasFormik.handleChange}
                                    onBlur={editIdentitasFormik.handleBlur}
                                />
                                {editIdentitasFormik.touched.tanggal_lahir && editIdentitasFormik.errors.tanggal_lahir && (
                                    <ErrorInput className="mt-2">{editIdentitasFormik.errors.tanggal_lahir}</ErrorInput>
                                )}
                            </div>
                        </div>
                        <div className="mb-3">
                            <div className="text-sm mb-1">Alamat lengkap</div>
                            <InputText
                                type="text"
                                id="alamat"
                                placeholder="Jl. MT Haryono, Ketawanggede, Lowokwaru, Malang"
                                value={editIdentitasFormik.values.alamat}
                                onChange={editIdentitasFormik.handleChange}
                                onBlur={editIdentitasFormik.handleBlur}
                            />
                            {editIdentitasFormik.touched.alamat && editIdentitasFormik.errors.alamat && (
                                <ErrorInput className="mt-2">{editIdentitasFormik.errors.alamat}</ErrorInput>
                            )}
                        </div>
                        <div className="mb-3">
                            <div className="text-sm mb-1">Agama</div>
                            <InputDropdown 
                                options={agamaOptions}
                                placeholder="Pilih agama"
                                value={agamaOptions.find(o => o.value === editIdentitasFormik.values.agama) ?? null}
                                onChange={(opt) => editIdentitasFormik.setFieldValue('agama', opt ? opt.value : '')}
                            />
                            {editIdentitasFormik.touched.agama && editIdentitasFormik.errors.agama && (
                                <ErrorInput className="mt-2">{editIdentitasFormik.errors.agama}</ErrorInput>
                            )}
                        </div>
                        <div className="mb-3">
                            <div className="text-sm mb-1">Pendidikan terakhir</div>
                            <InputDropdown 
                                options={pendidikanOptions}
                                placeholder="Pilih jenjang pendidikan"
                                value={pendidikanOptions.find(o => o.value === editIdentitasFormik.values.pendidikan) ?? null}
                                onChange={(opt) => editIdentitasFormik.setFieldValue('pendidikan', opt ? opt.value : '')}
                            />
                            {editIdentitasFormik.touched.pendidikan && editIdentitasFormik.errors.pendidikan && (
                                <ErrorInput className="mt-2">{editIdentitasFormik.errors.pendidikan}</ErrorInput>
                            )}
                        </div>

                        <div className="mt-5 flex items-center gap-2">
                            <Button type="submit">Simpan <IoIosSave className="inline" /></Button>
                        </div>
                    </form>
                    </>
                </PopUpRight>
            )}

            {openEditPhoto && (
                <PopUpRight name="Edit foto profil" state={openEditPhoto} setState={setOpenEditPhoto} dangerWhenClose={true}>
                    <>
                    <div className="mb-3 flex flex-col items-center">
                        <div className="text-sm mb-1">Preview</div>
                        <div className="mb-4">
                            <ProfilePicture className="h-[180px] w-[180px]" classNameBlank={`text-[75px]`} image={photoPreview ?? pegawai?.foto} />
                        </div>
                        <input
                            className="bg-gray-200 p-3 rounded-md cursor-pointer"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const f = e.target.files ? e.target.files[0] : null
                                // revoke previous blob URL if present
                                if (photoPreview && photoPreview.startsWith('blob:')) {
                                    try { URL.revokeObjectURL(photoPreview) } catch (err) { /* ignore */ }
                                }
                                setPhotoFile(f)
                                if (f) setPhotoPreview(URL.createObjectURL(f))
                                else setPhotoPreview(null)
                            }}
                        />
                    </div>
                    <div className="flex justify-center gap-3 mt-5">
                        <Button color="secondary" onClick={() => {
                            if (photoPreview && photoPreview.startsWith('blob:')) {
                                try { URL.revokeObjectURL(photoPreview) } catch (err) { /* ignore */ }
                            }
                            setOpenEditPhoto(false); setPhotoFile(null); setPhotoPreview(null);
                        }}>Batal</Button>
                        <Button onClick={async () => {
                            if (! photoFile) { alert('Pilih file terlebih dahulu'); return }
                            try {
                                const form = new FormData()
                                form.append('photo', photoFile)
                                const resp = await axios.post(`/api/pegawai/${pegawai?.id}/photo`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
                                if (resp.data?.status === 'success') {
                                    alert('Foto berhasil diperbarui')
                                    // revoke preview object URL
                                    if (photoPreview && photoPreview.startsWith('blob:')) {
                                        try { URL.revokeObjectURL(photoPreview) } catch (err) { /* ignore */ }
                                    }
                                    setOpenEditPhoto(false)
                                    setPhotoFile(null)
                                    setPhotoPreview(null)
                                    // refresh page to load new image path
                                    window.location.reload()
                                } else {
                                    console.error('Unexpected response', resp.data)
                                    alert('Gagal mengunggah foto')
                                }
                            } catch (err) {
                                console.error(err)
                                alert('Terjadi kesalahan saat upload')
                            }
                        }}>Upload</Button>
                    </div>
                    </>
                </PopUpRight>
            )}
            {openEditAkun && (
                <PopUpRight name="Edit Akun" state={openEditAkun} setState={setOpenEditAkun} dangerWhenClose={true}>
                    <>
                    <form onSubmit={editAkunFormik.handleSubmit}>
                        <div className="mb-3">
                            <div className="text-sm mb-1">Email *</div>
                            <InputText
                                type="email"
                                id="email"
                                placeholder="name@example.com"
                                value={editAkunFormik.values.email}
                                onChange={editAkunFormik.handleChange}
                                onBlur={editAkunFormik.handleBlur}
                            />
                            {editAkunFormik.touched.email && editAkunFormik.errors.email && (
                                <ErrorInput className="mt-2">{String(editAkunFormik.errors.email)}</ErrorInput>
                            )}
                        </div>
                        <div className="mb-3">
                                <div className="text-sm mb-1">No telepon</div>
                                <div className="flex gap-2">
                                    <span className="mt-2">+62</span>
                                    <div className="w-full">
                                        <InputText
                                            type="text"
                                            id="telp"
                                            placeholder="00000000000"
                                            className="w-full"
                                            value={editAkunFormik.values.telp}
                                            onChange={editAkunFormik.handleChange}
                                            onBlur={editAkunFormik.handleBlur}
                                        />
                                        {editAkunFormik.touched.telp && editAkunFormik.errors.telp && (
                                            <ErrorInput className="mt-2">{String(editAkunFormik.errors.telp)}</ErrorInput>
                                        )}
                                    </div>
                                </div>
                            </div>
                        <div className="mb-3">
                            <div className="text-sm mb-1">Password (kosongkan jika tidak ingin mengganti)</div>
                            <InputText
                                type="password"
                                id="password"
                                placeholder="••••••••"
                                value={editAkunFormik.values.password}
                                onChange={editAkunFormik.handleChange}
                                onBlur={editAkunFormik.handleBlur}
                            />
                            {editAkunFormik.touched.password && editAkunFormik.errors.password && (
                                <ErrorInput className="mt-2">{String(editAkunFormik.errors.password)}</ErrorInput>
                            )}
                        </div>

                        <div className="mt-5 flex items-center gap-2">
                            <Button type="submit">Simpan <IoIosSave className="inline" /></Button>
                        </div>
                    </form>
                    </>
                </PopUpRight>
            )}
            {openEditKtp && (
                <PopUpRight name="Edit KTP" state={openEditKtp} setState={setOpenEditKtp} dangerWhenClose={true}>
                    <>
                    <div className="mb-3 flex flex-col items-center">
                        <div className="text-sm mb-1">Preview KTP</div>
                        <div className="mb-4 w-full aspect-[16/9]">
                            <DocumentPicture image={ktpPreview ?? pegawai?.ktp ?? null} />
                        </div>
                        <input
                            className="bg-gray-200 p-3 rounded-md cursor-pointer"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const f = e.target.files ? e.target.files[0] : null
                                if (ktpPreview && ktpPreview.startsWith('blob:')) {
                                    try { URL.revokeObjectURL(ktpPreview) } catch (err) { /* ignore */ }
                                }
                                setKtpFile(f)
                                if (f) setKtpPreview(URL.createObjectURL(f))
                                else setKtpPreview(null)
                            }}
                        />
                    </div>
                    <div className="flex justify-center gap-3 mt-5">
                        <Button color="secondary" onClick={() => { if (ktpPreview && ktpPreview.startsWith('blob:')) try { URL.revokeObjectURL(ktpPreview) } catch (err) {} setOpenEditKtp(false); setKtpFile(null); setKtpPreview(null); }}>Batal</Button>
                        <Button onClick={async () => {
                            if (! ktpFile) { alert('Pilih file terlebih dahulu'); return }
                            try {
                                const form = new FormData()
                                form.append('ktp', ktpFile)
                                const resp = await axios.post(`/api/pegawai/${pegawai?.id}/ktp`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
                                if (resp.data?.status === 'success') {
                                    alert('KTP berhasil diperbarui')
                                    // refresh page to show updated document
                                    if (ktpPreview && ktpPreview.startsWith('blob:')) try { URL.revokeObjectURL(ktpPreview) } catch (err) {}
                                    setOpenEditKtp(false); setKtpFile(null); setKtpPreview(null)
                                    window.location.reload()
                                } else { console.error('Unexpected response', resp.data); alert('Gagal mengunggah KTP') }
                            } catch (err) { console.error(err); alert('Terjadi kesalahan saat upload') }
                        }}>Upload</Button>
                    </div>
                    </>
                </PopUpRight>
            )}

            {openEditNpwp && (
                <PopUpRight name="Edit NPWP" state={openEditNpwp} setState={setOpenEditNpwp} dangerWhenClose={true}>
                    <>
                    <div className="mb-3 flex flex-col items-center">
                        <div className="text-sm mb-1">Preview NPWP</div>
                        <div className="mb-4 w-full aspect-[16/9]">
                            <DocumentPicture image={npwpPreview ?? pegawai?.npwp ?? null} />
                        </div>
                        <input
                            className="bg-gray-200 p-3 rounded-md cursor-pointer"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const f = e.target.files ? e.target.files[0] : null
                                if (npwpPreview && npwpPreview.startsWith('blob:')) {
                                    try { URL.revokeObjectURL(npwpPreview) } catch (err) { /* ignore */ }
                                }
                                setNpwpFile(f)
                                if (f) setNpwpPreview(URL.createObjectURL(f))
                                else setNpwpPreview(null)
                            }}
                        />
                    </div>
                    <div className="flex justify-center gap-3 mt-5">
                        <Button color="secondary" onClick={() => { if (npwpPreview && npwpPreview.startsWith('blob:')) try { URL.revokeObjectURL(npwpPreview) } catch (err) {} setOpenEditNpwp(false); setNpwpFile(null); setNpwpPreview(null); }}>Batal</Button>
                        <Button onClick={async () => {
                            if (! npwpFile) { alert('Pilih file terlebih dahulu'); return }
                            try {
                                const form = new FormData()
                                form.append('npwp', npwpFile)
                                const resp = await axios.post(`/api/pegawai/${pegawai?.id}/npwp`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
                                if (resp.data?.status === 'success') {
                                    alert('NPWP berhasil diperbarui')
                                    if (npwpPreview && npwpPreview.startsWith('blob:')) try { URL.revokeObjectURL(npwpPreview) } catch (err) {}
                                    setOpenEditNpwp(false); setNpwpFile(null); setNpwpPreview(null)
                                    window.location.reload()
                                } else { console.error('Unexpected response', resp.data); alert('Gagal mengunggah NPWP') }
                            } catch (err) { console.error(err); alert('Terjadi kesalahan saat upload') }
                        }}>Upload</Button>
                    </div>
                    </>
                </PopUpRight>
            )}
        </div>
    )
}