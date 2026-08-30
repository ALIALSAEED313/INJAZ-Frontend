
function ProfileHeader({ profile, onEdit }) {
  return (
    <>
        <div className="profile-header-card" >
            <div>
                <div>
                    <div>
                        <img src={profile.avatarUrl} alt="profile avatar" />
                    </div>
                    <div>
                        <h2>
                            {profile.name || profile.username}
                        </h2>
                        <p>@{profile.username}</p>
                    </div>
                    <div>
                        <div>
                            <p>{profile.country}</p>
                        </div>
                        <div>
                            <p>
                                Joined in {new Date(profile.createdAt).toLocaleDateString("en-US", {
                                    month: "long",
                                    year: "numeric"
                                })}
                            </p>
                        </div>
                    </div>
                </div>
                <button onClick={onEdit}>Edit</button>
            </div>
        </div>
    </>
  )
}

export default ProfileHeader