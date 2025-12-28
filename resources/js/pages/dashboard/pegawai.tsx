import DashboardLayout from "@/layout/dashboard-layout"
import { useState } from "react"
import Button from "@/component/button"
import PopUpRight from "@/component/popup-right"
import { useFormik } from "formik"
import * as Yup from "yup";
import axios from "axios"
import PegawaiAdd from "@/section/pegawai-add"

interface object_sss {
    usr?: string,
    acs?: string
}

interface DashboardPageProps {
    sss?: object_sss | null
}

const PegawaiPage = ({ sss }: DashboardPageProps) =>{
    const [openAddMenu, setOpenAddMenu] = useState(false)

    return (
        <DashboardLayout sss={sss} now="Pegawai">
            <div className={`relative min-h-full`}>
                <Button color="main"
                    onClick={(e: any) => {
                        e.stopPropagation()
                        setOpenAddMenu(true)
                    }}
                >Tambah pegawai</Button>
                {openAddMenu && (
                    <PopUpRight name="Tambah pegawai baru" state={openAddMenu} setState={setOpenAddMenu} dangerWhenClose={true}>
                        <>
                            <PegawaiAdd />
                        </>
                    </PopUpRight>
                )}
            </div>
        </DashboardLayout>
    )
}

export default PegawaiPage