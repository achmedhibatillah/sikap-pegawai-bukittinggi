import { useEffect, useState } from "react";
import DashboardLayout from "@/layout/dashboard-layout";
import axios from "axios";
import ProfilePicture from "@/component/profile-picture";
import InputDropdown from "@/component/input-dropdown";
import InputText from "@/component/input-text";
import Button from "@/component/button";
import formatTanggal from "@/utils/format-tanggal";

interface Props {
    id: string;
    sss?: any;
}

const statusOptions = [
    { value: 'Hadir', label: 'Hadir' },
    { value: 'Hadir (Telat)', label: 'Hadir (Telat)' },
    { value: 'Izin', label: 'Izin' },
    { value: 'Cuti', label: 'Cuti' },
    { value: 'Alpa', label: 'Alpa' },
];

const PresensiDetail = ({ id, sss }: Props) => {
    const [loading, setLoading] = useState(false);
    const [presensi, setPresensi] = useState<any | null>(null);
    const [pegawais, setPegawais] = useState<Array<any>>([]);

    useEffect(() => { fetchData() }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const resp = await axios.get('/api/presensi/' + id);
            if (resp.data?.status === 'success') {
                setPresensi(resp.data.data.presensi);
                // map pegawais to include editable fields
                const rows = resp.data.data.pegawais.map((p:any) => ({
                    ...p,
                    _edit: {
                        status: p.pivot.status,
                        masuk: p.pivot.masuk,
                        keluar: p.pivot.keluar,
                        catatan: p.pivot.catatan,
                        saving: false,
                    }
                }));
                setPegawais(rows);
            }
        } catch (err) {
            console.error(err);
        } finally { setLoading(false) }
    }

    const handleSave = async (pegawaiId:string, index:number) => {
        const row = pegawais[index];
        if (!row) return;

        const payload:any = {
            status: row._edit.status,
            masuk: row._edit.masuk,
            keluar: row._edit.keluar,
            catatan: row._edit.catatan,
        };

        // set saving
        const newRows = [...pegawais];
        newRows[index] = { ...row, _edit: { ...row._edit, saving: true } };
        setPegawais(newRows);

        try {
            await axios.post(`/api/presensi/${id}/pegawai/${pegawaiId}/update`, payload);
            // reflect saved state
            const updated = [...newRows];
            updated[index] = { ...row, pivot: { status: row._edit.status, masuk: row._edit.masuk, keluar: row._edit.keluar, catatan: row._edit.catatan }, _edit: { ...row._edit, saving: false } };
            setPegawais(updated);
        } catch (err) {
            console.error(err);
            const reverted = [...newRows];
            reverted[index] = { ...row, _edit: { ...row._edit, saving: false } };
            setPegawais(reverted);
        }
    }

    return (
        <DashboardLayout sss={sss} now={presensi ? `Presensi ${formatTanggal(presensi.tanggal)}` : 'Presensi'}>
            <div className="mb-4">
                <Button onClick={() => window.location.href = '/presensi'}>Kembali ke daftar</Button>
            </div>

            {loading && <div>Loading...</div>}

            {presensi && (
                <div className="rounded bg-white p-4 shadow">
                    <div className="mb-4">
                        <div className="font-semibold">{formatTanggal(presensi.tanggal)}</div>
                        <div className="text-sm text-gray-500">{presensi.jam_mulai} - {presensi.jam_selesai}</div>
                        {presensi.catatan && <div className="text-sm text-gray-500">{presensi.catatan}</div>}
                    </div>

                    <div className="space-y-3">
                        {pegawais.map((p, idx) => (
                            <div key={p.id} className="flex items-center gap-3 p-2 border rounded">
                                <div className="w-14">
                                    <ProfilePicture image={p.foto ?? null} className="w-12 h-12 rounded-full" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold">{p.nama}</div>
                                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-4 gap-2">
                                        <div className="sm:col-span-1">
                                            <InputDropdown
                                                options={statusOptions}
                                                value={statusOptions.find(o => o.value === p._edit.status) ?? null}
                                                onChange={(sel:any) => {
                                                    const copy = [...pegawais];
                                                    copy[idx] = { ...p, _edit: { ...p._edit, status: sel?.value ?? null } };
                                                    setPegawais(copy);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <InputText type="time" value={p._edit.masuk ?? ''} onChange={(e:any) => { const copy=[...pegawais]; copy[idx] = { ...p, _edit: { ...p._edit, masuk: e.target.value } }; setPegawais(copy); }} />
                                        </div>
                                        <div>
                                            <InputText type="time" value={p._edit.keluar ?? ''} onChange={(e:any) => { const copy=[...pegawais]; copy[idx] = { ...p, _edit: { ...p._edit, keluar: e.target.value } }; setPegawais(copy); }} />
                                        </div>
                                        <div>
                                            <InputText value={p._edit.catatan ?? ''} onChange={(e:any) => { const copy=[...pegawais]; copy[idx] = { ...p, _edit: { ...p._edit, catatan: e.target.value } }; setPegawais(copy); }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="w-32 text-right">
                                    <Button disabled={p._edit.saving} onClick={() => handleSave(p.id, idx)}>{p._edit.saving ? 'Menyimpan...' : 'Simpan'}</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}

export default PresensiDetail;
