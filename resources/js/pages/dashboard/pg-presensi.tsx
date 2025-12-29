import DashboardLayout from "@/layout/dashboard-layout"

interface object_sss {
    usr?: string,
    acs?: string
}

interface IndexDashboardPageProps {
    sss?: object_sss | null
}

const PgPresensiPage = ({sss}: IndexDashboardPageProps) => {
    return (
        <DashboardLayout sss={sss} now="Presensi">
            lorem
        </DashboardLayout>
    )
}

export default PgPresensiPage 