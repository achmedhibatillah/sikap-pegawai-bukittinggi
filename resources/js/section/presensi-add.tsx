import { useState } from "react"
import axios from "axios"
import { useFormik } from "formik"
import * as Yup from "yup"
import InputText from "@/component/input-text"
import ErrorInput from "@/component/error-input"
import Button from "@/component/button"

const PresensiAdd = () => {
    const [createdId, setCreatedId] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const presensiAddFormik = useFormik({
        initialValues: {
            tanggal: "",
            jam_mulai: "",
            jam_selesai: "",
            catatan: ""
        },
        validationSchema: Yup.object({
            tanggal: Yup.date()
                .required("Tanggal harus diisi."),
            jam_mulai: Yup.string()
                .required("Jam mulai harus diisi."),
            jam_selesai: Yup.string()
                .required("Jam selesai harus diisi.")
                .test(
                "is-after-start",
                "Jam selesai harus setelah jam mulai.",
                function (value) {
                    const { jam_mulai } = this.parent

                    if (!value || !jam_mulai) return true

                    const toMinutes = (time: string) => {
                        const [h, m] = time.split(":").map(Number)
                        return h * 60 + m
                    }

                    return toMinutes(value) > toMinutes(jam_mulai)
                }
            ),
            catatan: Yup.string()
                .max(255, "Maksimal 255 karakter.")
        }),
        onSubmit: async (values) => {
            setSubmitting(true)
            try {
                const resp = await axios.post("/api/presensi/add", values)
                if (resp.data?.status === 'success') {
                    const id = resp.data.data.id ?? resp.data.data.id
                    setCreatedId(id)
                } else {
                    alert('Gagal membuat sesi presensi')
                }
            } catch (err) {
                console.error(err)
                alert('Terjadi kesalahan saat membuat sesi presensi')
            } finally {
                setSubmitting(false)
            }
        }
    })

    if (createdId) {
        return (
            <div>
                <div className="text-lg font-semibold mb-3">Sesi presensi berhasil dibuat</div>
                <div className="mb-2">ID Presensi: {createdId}</div>
                <div className="mb-2">Semua pegawai otomatis ditandai sebagai <strong>Alpa</strong> untuk sesi ini.</div>
                <div className="flex justify-end">
                    <Button onClick={() => window.location.reload()}>Tutup</Button>
                </div>
            </div>
        )
    }

    return (
        <>
            <form onSubmit={presensiAddFormik.handleSubmit}>
                <div className="mb-3">
                    <div className="text-sm mb-1">Tanggal</div>
                    <InputText
                        type="date"
                        id="tanggal"
                        value={presensiAddFormik.values.tanggal}
                        onChange={presensiAddFormik.handleChange}
                        onBlur={presensiAddFormik.handleBlur}
                    />
                    {presensiAddFormik.touched.tanggal && presensiAddFormik.errors.tanggal && (
                    <ErrorInput className="mt-2">{presensiAddFormik.errors.tanggal}</ErrorInput>
                    )}
                </div>
                <div className="grid grid-cols-2">
                    <div className="mb-3 me-1">
                        <div className="text-sm mb-1">Jam mulai</div>
                        <InputText
                            type="time"
                            id="jam_mulai"
                            value={presensiAddFormik.values.jam_mulai}
                            onChange={presensiAddFormik.handleChange}
                            onBlur={presensiAddFormik.handleBlur}
                        />
                        {presensiAddFormik.touched.jam_mulai && presensiAddFormik.errors.jam_mulai && (
                        <ErrorInput className="mt-2">{presensiAddFormik.errors.jam_mulai}</ErrorInput>
                        )}
                    </div>
                    <div className="mb-3 ms-1">
                        <div className="text-sm mb-1">Jam selesai</div>
                        <InputText
                            type="time"
                            id="jam_selesai"
                            value={presensiAddFormik.values.jam_selesai}
                            onChange={presensiAddFormik.handleChange}
                            onBlur={presensiAddFormik.handleBlur}
                        />
                        {presensiAddFormik.touched.jam_selesai && presensiAddFormik.errors.jam_selesai && (
                        <ErrorInput className="mt-2">{presensiAddFormik.errors.jam_selesai}</ErrorInput>
                        )}
                    </div>
                </div>
                <div className="mb-3 me-1">
                    <div className="text-sm mb-1">Catatan (opsional)</div>
                    <InputText
                        type="text"
                        id="catatan"
                        placeholder="Isi catatan untuk sesi presensi kali ini..."
                        value={presensiAddFormik.values.catatan}
                        onChange={presensiAddFormik.handleChange}
                        onBlur={presensiAddFormik.handleBlur}
                    />
                    {presensiAddFormik.touched.catatan && presensiAddFormik.errors.catatan && (
                    <ErrorInput className="mt-2">{presensiAddFormik.errors.catatan}</ErrorInput>
                    )}
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="submit" disabled={submitting}>{submitting ? 'Membuat...' : 'Buat Sesi Presensi'}</Button>
                </div>
            </form>
        </>
    )
}

export default PresensiAdd