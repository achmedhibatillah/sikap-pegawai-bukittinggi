import DashboardLayout from "@/layout/dashboard-layout"

import IndexPegawaiPage from "./index/index-pegawai"

interface object_sss {
    usr?: string,
    acs?: string
}

interface IndexDashboardPageProps {
    sss?: object_sss | null
}

const IndexDashboardPage = ({sss}: IndexDashboardPageProps) => {
    return (
        <DashboardLayout sss={sss} now="Dashboard">
            {(sss?.acs === "admin") ? (
                <></>
            ) : (sss?.acs === "pegawai") ? (
                <IndexPegawaiPage akun_id={sss?.usr} />
            ) : (sss?.acs === "kepala") ? (
                <></>
            ) : null}
        </DashboardLayout>
    )
}

export default IndexDashboardPage