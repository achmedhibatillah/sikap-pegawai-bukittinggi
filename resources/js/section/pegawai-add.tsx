import { useState } from "react";
import { useFormik } from "formik";
import axios from "axios";
import * as Yup from "yup";
import InputText from "@/component/input-text";
import ErrorInput from "@/component/error-input";
import Button from "@/component/button";
import { GrFormNextLink } from "react-icons/gr";
import { TbArrowBack } from "react-icons/tb";
import InputDropdown from "@/component/input-dropdown";

const PegawaiAdd = () => {
    const [akunAdded, setAkunAdded] = useState(false);
    const [akunData, setAkunData] = useState({
        email: "",
        telp: "",
        password: "123456",
    });
    const [showConfirm, setShowConfirm] = useState(false)

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

    
    const addAkunFormik = useFormik({
        enableReinitialize: true,
        initialValues: akunData,
        validationSchema: Yup.object({
            email: Yup.string()
                .required("Email wajib diisi.")
                .email("Format email harus benar."),
            telp: Yup.string()
                .required("Nomor telepon wajib diisi.")
                .matches(/^\d{8,12}$/, "Nomor telepon harus 8-12 digit"),
            password: Yup.string()
                .required("Password wajib diisi.")
                .min(6, "Password wajib mengandung 6-15 karakter.")
                .max(15, "Password wajib mengandung 6-15 karakter."),
        }),
        onSubmit: (values) => {
            setAkunData(values);
            setAkunAdded(true);
        },
    });

    const addPegawaiFormik = useFormik({
        enableReinitialize: true,
        initialValues: {
            email: addAkunFormik.values.email,
            telp: addAkunFormik.values.telp,
            password: addAkunFormik.values.password,
            nama: "",
            jenis_kelamin: "",
            tempat_lahir: "",
            tanggal_lahir: "",
            alamat: "",
            agama: "",
            pendidikan: "",
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
            setShowConfirm(true)
        },
    });

    const handleFinalSubmit = async () => {
        try {
            const values = { ...addAkunFormik.values, ...addPegawaiFormik.values };
            const { data } = await axios.post("/api/pegawai/add", values);
            if (data.status === "success") {
                alert("Data berhasil disimpan!");
                setAkunAdded(false);
                addAkunFormik.resetForm();
                addPegawaiFormik.resetForm();
                setShowConfirm(false);

                const pegawai_id = data.id
                window.location.href = "/pegawai/" +  pegawai_id
            }
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="">
            {!akunAdded ? (
                <div>
                    <div className="text-gray-500 mb-4">* Masukkan data akun pegawai</div>
                    <form onSubmit={addAkunFormik.handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-5">
                            <div className="mb-3">
                                <div className="text-sm mb-1">Email</div>
                                <InputText
                                    type="text"
                                    id="email"
                                    placeholder="Email"
                                    value={addAkunFormik.values.email}
                                    onChange={addAkunFormik.handleChange}
                                    onBlur={addAkunFormik.handleBlur}
                                />
                                {addAkunFormik.touched.email && addAkunFormik.errors.email && (
                                <ErrorInput className="mt-2">{addAkunFormik.errors.email}</ErrorInput>
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
                                            value={addAkunFormik.values.telp}
                                            onChange={addAkunFormik.handleChange}
                                            onBlur={addAkunFormik.handleBlur}
                                        />
                                        {addAkunFormik.touched.telp && addAkunFormik.errors.telp && (
                                            <ErrorInput className="mt-2">{addAkunFormik.errors.telp}</ErrorInput>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mb-3">
                            <div className="text-sm mb-1">Password</div>
                            <InputText
                                type="password"
                                id="password"
                                placeholder="*****"
                                value={addAkunFormik.values.password}
                                onChange={addAkunFormik.handleChange}
                                onBlur={addAkunFormik.handleBlur}
                            />
                            {addAkunFormik.touched.password && addAkunFormik.errors.password && (
                                <ErrorInput className="mt-2">{addAkunFormik.errors.password}</ErrorInput>
                            )}
                        </div>
                        <Button className="mt-5" type="submit">
                            <div className="flex items-center gap-2">
                                Lanjut <GrFormNextLink />
                            </div>
                        </Button>
                    </form>
                </div>
            ) : (
                <div>
                    <div className="text-gray-500 mb-4">* Masukkan data identitas pegawai</div>
                    <form onSubmit={addPegawaiFormik.handleSubmit}>
                        <div className="mb-3">
                            <div className="text-sm mb-1">Nama lengkap *</div>
                            <InputText
                                type="text"
                                id="nama"
                                placeholder="Muhammad Saleh"
                                value={addPegawaiFormik.values.nama}
                                onChange={addPegawaiFormik.handleChange}
                                onBlur={addPegawaiFormik.handleBlur}
                            />
                            {addPegawaiFormik.touched.nama && addPegawaiFormik.errors.nama && (
                                <ErrorInput className="mt-2">{addPegawaiFormik.errors.nama}</ErrorInput>
                            )}
                        </div>
                        <div className="mb-3">
                            <div className="text-sm mb-1">Jenis kelamin *</div>
                            <InputDropdown 
                                options={jenisKelaminOptions}
                                placeholder="Pilih jenis kelamin"
                                value={
                                    jenisKelaminOptions.find(o => o.value === addPegawaiFormik.values.jenis_kelamin) ?? null
                                }
                                onChange={(opt) => addPegawaiFormik.setFieldValue('jenis_kelamin', opt ? opt.value : '')}
                            />
                            {addPegawaiFormik.touched.jenis_kelamin && addPegawaiFormik.errors.jenis_kelamin && (
                                <ErrorInput className="mt-2">{addPegawaiFormik.errors.jenis_kelamin}</ErrorInput>
                            )}
                        </div>
                        <div className="mb-3 grid grid-cols-2">
                            <div className="me-1">
                                <div className="text-sm mb-1">Tempat lahir</div>
                                <InputText
                                    type="text"
                                    id="tempat_lahir"
                                    placeholder="Masukkan kota"
                                    value={addPegawaiFormik.values.tempat_lahir}
                                    onChange={addPegawaiFormik.handleChange}
                                    onBlur={addPegawaiFormik.handleBlur}
                                />
                                {addPegawaiFormik.touched.tempat_lahir && addPegawaiFormik.errors.tempat_lahir && (
                                    <ErrorInput className="mt-2">{addPegawaiFormik.errors.tempat_lahir}</ErrorInput>
                                )}
                            </div>
                            <div className="ms-1">
                                <div className="text-sm mb-1">Tanggal lahir</div>
                                <InputText
                                    type="date"
                                    id="tanggal_lahir"
                                    placeholder="Masukkan tanggal lahir"
                                    value={addPegawaiFormik.values.tanggal_lahir}
                                    onChange={addPegawaiFormik.handleChange}
                                    onBlur={addPegawaiFormik.handleBlur}
                                />
                                {addPegawaiFormik.touched.tanggal_lahir && addPegawaiFormik.errors.tanggal_lahir && (
                                    <ErrorInput className="mt-2">{addPegawaiFormik.errors.tanggal_lahir}</ErrorInput>
                                )}
                            </div>
                        </div>
                        <div className="mb-3">
                            <div className="text-sm mb-1">Alamat lengkap</div>
                            <InputText
                                type="text"
                                id="alamat"
                                placeholder="Jl. MT Haryono, Ketawanggede, Lowokwaru, Malang"
                                value={addPegawaiFormik.values.alamat}
                                onChange={addPegawaiFormik.handleChange}
                                onBlur={addPegawaiFormik.handleBlur}
                            />
                            {addPegawaiFormik.touched.alamat && addPegawaiFormik.errors.alamat && (
                                <ErrorInput className="mt-2">{addPegawaiFormik.errors.alamat}</ErrorInput>
                            )}
                        </div>
                        <div className="mb-3">
                            <div className="text-sm mb-1">Agama</div>
                            <InputDropdown 
                                options={agamaOptions}
                                placeholder="Pilih agama"
                                value={agamaOptions.find(o => o.value === addPegawaiFormik.values.agama) ?? null}
                                onChange={(opt) => addPegawaiFormik.setFieldValue('agama', opt ? opt.value : '')}
                            />
                            {addPegawaiFormik.touched.agama && addPegawaiFormik.errors.agama && (
                                <ErrorInput className="mt-2">{addPegawaiFormik.errors.agama}</ErrorInput>
                            )}
                        </div>
                        <div className="mb-3">
                            <div className="text-sm mb-1">Pendidikan terakhir</div>
                            <InputDropdown 
                                options={pendidikanOptions}
                                placeholder="Pilih jenjang pendidikan"
                                value={pendidikanOptions.find(o => o.value === addPegawaiFormik.values.pendidikan) ?? null}
                                onChange={(opt) => addPegawaiFormik.setFieldValue('pendidikan', opt ? opt.value : '')}
                            />
                            {addPegawaiFormik.touched.pendidikan && addPegawaiFormik.errors.pendidikan && (
                                <ErrorInput className="mt-2">{addPegawaiFormik.errors.pendidikan}</ErrorInput>
                            )}
                        </div>

                        <div className="mt-5 flex items-center gap-2">
                            <Button
                                type="button"
                                color="secondary"
                                onClick={() => {
                                    setAkunAdded(false);
                                    addAkunFormik.setValues(akunData);
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    Kembali <TbArrowBack />
                                </div>
                            </Button>
                            <Button type="submit">Simpan</Button>
                        </div>
                    </form>
                </div>
            )}

            {showConfirm && (
                <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
                        <h2 className="text-2xl font-bold mb-8 text-center">Konfirmasi Data Pegawai</h2>

                        <div className="grid grid-cols-3 gap-3 mb-3">
                            <div className="font-semibold">Email</div>
                            <div className="bg-gray-100 p-2 rounded col-span-2">{addAkunFormik.values.email || "-"}</div>

                            <div className="font-semibold">Telp</div>
                            <div className="bg-gray-100 p-2 rounded col-span-2">+62 {addAkunFormik.values.telp || "-"}</div>

                            <div className="font-semibold">Nama lengkap</div>
                            <div className="bg-gray-100 p-2 rounded col-span-2">{addPegawaiFormik.values.nama || "-"}</div>

                            <div className="font-semibold">Jenis kelamin</div>
                            <div className="bg-gray-100 p-2 rounded col-span-2">
                            {jenisKelaminOptions.find(o => o.value === addPegawaiFormik.values.jenis_kelamin)?.label || "-"}
                            </div>

                            <div className="font-semibold">Tempat lahir</div>
                            <div className="bg-gray-100 p-2 rounded col-span-2">{addPegawaiFormik.values.tempat_lahir || "-"}</div>

                            <div className="font-semibold">Tanggal lahir</div>
                            <div className="bg-gray-100 p-2 rounded col-span-2">{addPegawaiFormik.values.tanggal_lahir || "-"}</div>

                            <div className="font-semibold">Agama</div>
                            <div className="bg-gray-100 p-2 rounded col-span-2">
                            {agamaOptions.find(o => o.value === addPegawaiFormik.values.agama)?.label || "-"}
                            </div>

                            <div className="font-semibold">Pendidikan terakhir</div>
                            <div className="bg-gray-100 p-2 rounded col-span-2">
                            {pendidikanOptions.find(o => o.value === addPegawaiFormik.values.pendidikan)?.label || "-"}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-5">
                            <Button color="secondary" onClick={() => setShowConfirm(false)}>
                            Edit Kembali
                            </Button>
                            <Button onClick={handleFinalSubmit}>Simpan</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PegawaiAdd;
