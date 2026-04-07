import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";

module {
  // Old AccessControlState had an extra `adminAssigned` field that has been removed.
  // All other stable fields are structurally compatible with the new actor.
  type OldAccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, AccessControl.UserRole>;
  };

  type OldActor = {
    accessControlState : OldAccessControlState;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
  };

  // Drop `adminAssigned` from accessControlState; preserve userRoles.
  public func run(old : OldActor) : NewActor {
    {
      accessControlState = {
        userRoles = old.accessControlState.userRoles;
      };
    };
  };
};
