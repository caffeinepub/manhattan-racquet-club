import AccessControl "./access-control";

mixin (accessControlState : AccessControl.AccessControlState) {
  // Complete no-op — does nothing, never traps.
  // The old env-var-reading implementation caused admin lockouts and has been removed.
  public shared func _initializeAccessControlWithSecret(_ : Text) : async () {
    // intentional no-op
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };
};
