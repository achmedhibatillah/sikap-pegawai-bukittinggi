import { LuUserRound } from "react-icons/lu";

const ProfilePicture = ({
    image,
    className
}: {
    image?: string | null
    className?: string | null
}) => {
    const renderImage = () => {
        if (!image) return null

        // if image is already a full URL (starts with http/https/blob/) or an absolute path, use it directly
        if (image.startsWith('http') || image.startsWith('blob:') || image.startsWith('/')) {
            return <img src={image} alt="profile" className="h-full w-full rounded-full object-cover" />
        }

        // otherwise assume it's a storage path and prefix with /storage/
        return <img src={"/storage/" + image} alt="profile" className="h-full w-full rounded-full object-cover" />
    }

    return (
        <div className={`h-[90px] w-[90px] bg-amber-50 rounded-full shadow-md flex justify-center items-center ${className}`}>
            {image ? renderImage() : <LuUserRound className="text-[50px] text-amber-500" />}
        </div>
    )
}

export default ProfilePicture