import { IoIosMan, IoIosWoman } from "react-icons/io";

const JenisKelamin = ({
    jenis_kelamin,
    className
}: {
    jenis_kelamin?: String | "Laki-laki" | "Perempuan" | null
    className?: string
}) => {
    return (
        <>
            {jenis_kelamin === "Laki-laki" ? (
                <div className={`inline-flex items-center gap-1 text-blue-500 ${className}`}><IoIosMan /> Laki-laki</div>
            ) : (
                <div className={`inline-flex items-center gap-1 text-pink-500 ${className}`}><IoIosWoman /> Perempuan</div>
            )}
        </>
    )
}

export default JenisKelamin