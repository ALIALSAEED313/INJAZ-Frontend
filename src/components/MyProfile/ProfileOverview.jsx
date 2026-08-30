function ProfileOverview({ profile, onEdit }) {
  return (
    <div>
      <div>
        <h2>Overview</h2>
        <button onClick={onEdit}>Edit</button>
      </div>

      <div>
        <p>
          {profile.isSeller
            ? "Freelancer"
            : "Client"}
        </p>
      </div>

      {profile.bio && (
        <div>
          <h3>About me</h3>
          <p>{profile.bio}</p>
        </div>
      )}

      {profile.country && (
        <div>
          <h3>Country</h3>
          <p>{profile.country}</p>
        </div>
      )}

      {profile.languages?.length > 0 && (
        <div>
          <h3>Languages</h3>

          {profile.languages.map((language) => (
            <span key={language}>
              {language}
            </span>
          ))}
        </div>
      )}

      {profile.skills?.length > 0 && (
        <div>
          <h3>Skills</h3>

          {profile.skills.map((skill) => (
            <span key={skill}>
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProfileOverview