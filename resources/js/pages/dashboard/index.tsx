import DashboardLayout from "@/layout/dashboard-layout"
import AdminDashboard from "./index/admin-dashboard"
import IndexPegawaiPage from "./index/index-pegawai"
import KepalaDashboard from "./index/kepala-dashboard"

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
                <AdminDashboard />
            ) : (sss?.acs === "pegawai") ? (
                <IndexPegawaiPage akun_id={sss?.usr} />
            ) : (sss?.acs === "kepala") ? (
                <KepalaDashboard />
            ) : null}
        </DashboardLayout>
    )
}

export default IndexDashboardPage
