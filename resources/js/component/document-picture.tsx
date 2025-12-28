import { CiImageOn } from "react-icons/ci";

const DocumentPicture = ({
    image,
    label = "Dokumen",
    className
}: {
    image?: string | null
    label?: string
    className?: string
}) => {
    const src = image
        ? image.startsWith("http") || image.startsWith("blob:") || image.startsWith("/")
            ? image
            : `/storage/${image}`
        : null

    return (
        <div
            className={`relative w-full aspect-[16/9] bg-gray-100 
            border-2 border-dashed border-gray-400 rounded-md 
            shadow-sm overflow-hidden group ${className}`}
        >
            {src ? (
                <>
                    <img
                        src={src}
                        alt={label}
                        className="h-full w-full object-cover transition-transform duration-200"
                    />

                    {/* overlay label */}
                    <div className="absolute bottom-0 w-full bg-black/50 text-white text-xs px-2 py-1">
                        {label}
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <CiImageOn className="text-4xl" />
                    <span className="text-xs mt-1">{label}</span>
                </div>
            )}
        </div>
    )
}

export default DocumentPicture
