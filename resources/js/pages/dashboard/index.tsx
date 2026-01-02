import DashboardLayout from "@/layout/dashboard-layout"
import AdminDashboard from "./index/admin-dashboard"
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
                <AdminDashboard />
            ) : (sss?.acs === "pegawai") ? (
                <IndexPegawaiPage akun_id={sss?.usr} />
            ) : (sss?.acs === "kepala") ? (
                <div className="text-gray-500">Halaman kepala</div>
            ) : null}
        </DashboardLayout>
    )
}

export default IndexDashboardPage
