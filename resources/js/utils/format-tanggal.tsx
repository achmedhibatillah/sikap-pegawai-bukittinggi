const formatTanggal = (isoDate?: string | null) => {
    if (!isoDate) return "-";

    return new Date(isoDate).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

export default formatTanggal