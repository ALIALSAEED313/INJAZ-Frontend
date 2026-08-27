import { useState, useEffect } from "react"
import { getMyProfile } from "../../services/profile.Service"
import ProfileHeader from "../../components/MyProfile/ProfileHeader"
import EditProfileForm from "../../components/MyProfile/EditProfileForm"

function MyProfilePage() {
    const [profile, setProfile] = useState(null)
    const [isEditing, setIsEditing] = useState(false)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchMyProfile() {
            try {
                const profile = await getMyProfile()
                setProfile(profile)
            } catch (err) {
                console.error("Error fetching my profile:", err)
                setError(err)
            } finally {
                setLoading(false)
            }
        }

        fetchMyProfile()
    }, [])

    if (loading) {
        return <p>Loading...</p>
    }

    if (error) {
        return <p>Failed to load profile</p>
    }

    if (!profile) {
        return <p>Profile not found</p>
    }

    return (
        <>
            <ProfileHeader
                profile={profile}
                onEdit={() => setIsEditing(true)}
            />

            {isEditing && (
                <EditProfileForm
                    profile={profile}
                    onClose={() => setIsEditing(false)}
                    onUpdated={(updatedProfile) => {
                        setProfile(updatedProfile)
                        setIsEditing(false)
                    }}
                />
            )}
        </>
    )
}

export default MyProfilePage