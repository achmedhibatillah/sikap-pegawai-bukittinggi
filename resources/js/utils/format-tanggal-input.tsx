const formatTanggalInput = (isoDate?: string | null) => {
    if (!isoDate) return "";

    return isoDate.split("T")[0];
};

export default formatTanggalInput