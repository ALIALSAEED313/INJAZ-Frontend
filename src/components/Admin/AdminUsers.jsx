function AdminUsers({
  users,
  filteredUsers,
  userSearch,
  setUserSearch,
  userRoleFilter,
  setUserRoleFilter,
  currentUser,
  handleRoleChange,
  setDeleteConfirm,
}) {
  return (
    <section>
      <h2>Users</h2>

      <p>
        Showing: {filteredUsers.length} of {users.length}
      </p>

      <input
        type="text"
        placeholder="Search users..."
        value={userSearch}
        onChange={(event) => setUserSearch(event.target.value)}
      />

      <select
        value={userRoleFilter}
        onChange={(event) => setUserRoleFilter(event.target.value)}
      >
        <option value="all">All Roles</option>
        <option value="user">Users</option>
        <option value="admin">Admins</option>
      </select>

      {filteredUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        filteredUsers.map((user) => (
          <div key={user._id}>
            <p>
              <strong>Name:</strong> {user.name || user.username}
            </p>

            <p>
              <strong>Username:</strong> @{user.username}
            </p>

            <p>
              <strong>Email:</strong> {user.email}
            </p>

            <p>
              <strong>Freelancer:</strong> {user.isSeller ? "Yes" : "No"}
            </p>

            <p>
              <strong>Role:</strong> {user.role}
            </p>

            {currentUser?._id === user._id ? (
              <p>This is your admin account</p>
            ) : (
              <>
                <select
                  value={user.role}
                  onChange={(event) =>
                    handleRoleChange(user._id, event.target.value)
                  }
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>

                <button
                  type="button"
                  onClick={() =>
                    setDeleteConfirm({
                      type: "user",
                      id: user._id,
                      name: user.name || user.username,
                    })
                  }
                >
                  Delete User
                </button>
              </>
            )}

            <hr />
          </div>
        ))
      )}
    </section>
  );
}

export default AdminUsers;
