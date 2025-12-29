import { LuUserRound } from "react-icons/lu";

const ProfilePicture = ({
    image,
    className,
    classNameBlank
}: {
    image?: string | null
    className?: string | null
    classNameBlank?: string | null
}) => {
    const renderImage = () => {
        if (!image) return null

        if (image.startsWith('http') || image.startsWith('blob:') || image.startsWith('/')) {
            return <img src={image} alt="profile" className="h-full w-full rounded-full object-cover" />
        }

        return <img src={"/storage/" + image} alt="profile" className="h-full w-full rounded-full object-cover" />
    }

    return (
        <div className={`bg-amber-50 rounded-full shadow-md flex justify-center items-center ${className}`}>
            {image ? renderImage() : <LuUserRound className={`text-amber-500 ${classNameBlank}`} />}
        </div>
    )
}

export default ProfilePicture