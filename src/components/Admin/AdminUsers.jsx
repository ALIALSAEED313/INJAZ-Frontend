import { useTranslation } from "react-i18next";
function AdminUsers({
  users,
  filteredUsers,
  userSearch,
  setUserSearch,
  userRoleFilter,
  setUserRoleFilter,
  currentUser,
  handleRoleChange,
  setDeleteConfirm
}) {
  const {
    t
  } = useTranslation();
  return <section className="admin-management" aria-labelledby="users-title"><div className="admin-section-heading"><div><h2 id="users-title">{t("adminUsers.users")}</h2><p>{filteredUsers.length}{t("adminUsers.of")}{users.length}{t("adminUsers.users")}</p></div></div><div className="admin-toolbar"><label className="admin-search"><span>{t("adminUsers.searchUsers")}</span><input type="search" placeholder={t("adminUsers.nameUsernameOrEmail")} value={userSearch} onChange={e => setUserSearch(e.target.value)} /></label><label><span>{t("adminUsers.role")}</span><select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)}><option value="all">{t("adminUsers.allRoles")}</option><option value="user">{t("adminUsers.users")}</option><option value="admin">{t("adminUsers.admins")}</option></select></label></div>{filteredUsers.length === 0 ? <div className="admin-empty">{t("adminUsers.noUsersMatchTheseFilters")}</div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>{t("adminUsers.user")}</th><th>{t("adminUsers.username")}</th><th>{t("adminUsers.email")}</th><th>{t("adminUsers.seller")}</th><th>{t("adminUsers.role")}</th><th>{t("adminUsers.actions")}</th></tr></thead><tbody>{filteredUsers.map(user => {
            const isCurrent = currentUser?._id === user._id;
            return <tr key={user._id}><td data-label={t("adminUsers.user")}><strong>{user.name || user.username}</strong>{isCurrent && <span className="admin-current-badge">{t("adminUsers.you")}</span>}</td><td data-label={t("adminUsers.username")} dir="ltr">@{user.username}</td><td data-label={t("adminUsers.email")} dir="ltr">{user.email}</td><td data-label={t("adminUsers.seller")}>{user.isSeller ? t("adminUsers.yes") : t("adminUsers.no")}</td><td data-label={t("adminUsers.role")}><span className={`admin-badge ${user.role}`}>{user.role}</span></td><td data-label={t("adminUsers.actions")}><div className="admin-row-actions">{isCurrent ? <span className="admin-muted">{t("adminUsers.currentAccount")}</span> : <><select aria-label={`Change role for ${user.username}`} value={user.role} onChange={e => handleRoleChange(user._id, e.target.value)}><option value="user">{t("adminUsers.user")}</option><option value="admin">{t("adminUsers.admin")}</option></select><button type="button" className="admin-danger-button" onClick={() => setDeleteConfirm({
                      type: "user",
                      id: user._id,
                      name: user.name || user.username
                    })}>{t("adminUsers.delete")}</button></>}</div></td></tr>;
          })}</tbody></table></div>}</section>;
}
export default AdminUsers;
