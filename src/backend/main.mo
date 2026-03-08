import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  // Authorization system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Track if any admin has been assigned
  var hasAdminAssigned = false;

  // ========== User Profiles ==========
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // ========== Site Content ==========
  let siteContent = Map.empty<Text, Text>();

  // ========== Membership Tiers ==========
  type MembershipTier = {
    id : Nat;
    name : Text;
    price : Text;
    benefits : [Text];
    displayOrder : Nat;
  };

  module MembershipTier {
    public func compare(a : MembershipTier, b : MembershipTier) : Order.Order {
      Nat.compare(a.displayOrder, b.displayOrder);
    };
  };

  let membershipTiers = Map.empty<Nat, MembershipTier>();
  var nextTierId = 1;

  // ========== Staff Members ==========
  type StaffMember = {
    id : Nat;
    name : Text;
    role : Text;
    bio : Text;
    displayOrder : Nat;
  };

  module StaffMember {
    public func compare(a : StaffMember, b : StaffMember) : Order.Order {
      Nat.compare(a.displayOrder, b.displayOrder);
    };
  };

  let staffMembers = Map.empty<Nat, StaffMember>();
  var nextStaffId = 1;

  // ========== Announcements ==========
  type Announcement = {
    id : Nat;
    title : Text;
    body : Text;
    createdAt : Int;
    published : Bool;
  };

  module Announcement {
    public func compare(a : Announcement, b : Announcement) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };
  };

  let announcements = Map.empty<Nat, Announcement>();
  var nextAnnouncementId = 1;

  var isInitialized = false;

  // ========== First Admin Claim ==========
  public shared ({ caller }) func claimFirstAdmin() : async Bool {
    // Anonymous callers cannot claim admin
    if (caller.isAnonymous()) {
      return false;
    };

    // If admin already assigned, return false
    if (hasAdminAssigned) {
      return false;
    };

    // Assign caller as admin directly without using assignRole
    accessControlState.userRoles.add(caller, #admin);
    hasAdminAssigned := true;
    true;
  };

  public query func hasAnyAdmin() : async Bool {
    hasAdminAssigned;
  };

  // ========== User Profile Management ==========
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    switch (accessControlState.userRoles.get(caller)) {
      case (?role) {
        switch (role) {
          case (#user or #admin) { userProfiles.get(caller) };
          case (#guest) { Runtime.trap("Unauthorized: Only users can access profiles") };
        };
      };
      case (null) { Runtime.trap("Unauthorized: Only users can access profiles") };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller == user) {
      return userProfiles.get(user);
    };
    // Only allow admins to fetch other users' profiles
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) { userProfiles.get(user) };
      case (?_) { Runtime.trap("Unauthorized: Only admins can fetch other users' profiles") };
      case (null) { Runtime.trap("Unauthorized: Only admins can fetch other users' profiles") };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    switch (accessControlState.userRoles.get(caller)) {
      case (?role) {
        switch (role) {
          case (#user or #admin) { userProfiles.add(caller, profile) };
          case (#guest) { Runtime.trap("Unauthorized: Only users can save profiles") };
        };
      };
      case (null) { Runtime.trap("Unauthorized: Only users can save profiles") };
    };
  };

  // ========== Initialization & Helpers ==========
  public shared ({ caller }) func initDefaultContent() : async () {
    if (isInitialized) { return Runtime.trap("Already initialized") };
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) {};
      case (?_) { Runtime.trap("Unauthorized: Only admins can perform this action") };
      case (null) { Runtime.trap("Unauthorized: Only admins can perform this action") };
    };

    // Site Content
    siteContent.add("landing_hero", "Welcome to The Manhattan Racquet Club - NYC's Premier Tennis Destination! Experience world-class courts, expert coaching, and a vibrant tennis community in the heart of Manhattan.");
    siteContent.add(
      "about",
      "The Manhattan Racquet Club has served New York's tennis enthusiasts for over 30 years. Our state-of-the-art facilities, diverse membership options, and nationally recognized coaching staff make us the city's top choice for players of all skill levels."
    );
    siteContent.add("contact_email", "info@manhattanracquetclub.com");
    siteContent.add("address", "123 Tennis Lane, New York, NY 10001");

    // Membership Tiers
    let junior : MembershipTier = {
      id = nextTierId;
      name = "Junior Membership";
      price = "$49/mo";
      benefits = [
        "Access to all courts during off-peak hours",
        "Group lessons included",
        "Members-only tournaments",
      ];
      displayOrder = 1;
    };
    membershipTiers.add(junior.id, junior);
    nextTierId += 1;

    let adult : MembershipTier = {
      id = nextTierId;
      name = "Adult Membership";
      price = "$99/mo";
      benefits = [
        "Unlimited court access",
        "Discounted private lessons",
        "Members-only events",
      ];
      displayOrder = 2;
    };
    membershipTiers.add(adult.id, adult);
    nextTierId += 1;

    let family : MembershipTier = {
      id = nextTierId;
      name = "Family Membership";
      price = "$149/mo";
      benefits = [
        "Full club access for up to 4 family members",
        "Free weekend clinics",
        "Priority event registration",
      ];
      displayOrder = 3;
    };
    membershipTiers.add(family.id, family);
    nextTierId += 1;

    // Staff Members
    let coach1 : StaffMember = {
      id = nextStaffId;
      name = "Sarah Williams";
      role = "Head Coach";
      bio = "Former NCAA champion with 15+ years of coaching experience. Specializes in advanced player development.";
      displayOrder = 1;
    };
    staffMembers.add(coach1.id, coach1);
    nextStaffId += 1;

    let coach2 : StaffMember = {
      id = nextStaffId;
      name = "Carlos Ramirez";
      role = "Junior Program Director";
      bio = "USTA certified instructor focused on youth development and beginner training programs.";
      displayOrder = 2;
    };
    staffMembers.add(coach2.id, coach2);
    nextStaffId += 1;

    let coach3 : StaffMember = {
      id = nextStaffId;
      name = "Emily Chen";
      role = "Fitness Trainer";
      bio = "NSCA certified fitness expert integrating strength and conditioning into tennis training.";
      displayOrder = 3;
    };
    staffMembers.add(coach3.id, coach3);
    nextStaffId += 1;

    // Announcements
    let announcement1 : Announcement = {
      id = nextAnnouncementId;
      title = "Grand Opening of New Indoor Courts";
      body = "We're excited to announce the opening of our brand new indoor courts, available year-round for all members!";
      createdAt = Time.now();
      published = true;
    };
    announcements.add(announcement1.id, announcement1);
    nextAnnouncementId += 1;

    let announcement2 : Announcement = {
      id = nextAnnouncementId;
      title = "Summer Tennis Camp Registration Now Open";
      body = "Sign up for our popular summer camp program, open to juniors of all skill levels. Spaces are limited!";
      createdAt = Time.now();
      published = true;
    };
    announcements.add(announcement2.id, announcement2);
    nextAnnouncementId += 1;

    isInitialized := true;
  };

  // ========== Site Content ==========
  public query func getContentByKey(key : Text) : async Text {
    switch (siteContent.get(key)) {
      case (null) { Runtime.trap("Content not found") };
      case (?content) { content };
    };
  };

  public shared ({ caller }) func setContentByKey(key : Text, content : Text) : async () {
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) { siteContent.add(key, content) };
      case (?_) { Runtime.trap("Unauthorized: Only admins can perform this action") };
      case (null) { Runtime.trap("Unauthorized: Only admins can perform this action") };
    };
  };

  public query ({ caller }) func getAllContent() : async [(Text, Text)] {
    siteContent.toArray();
  };

  // ========== Membership Tiers ==========
  public query func getMembershipTier(id : Nat) : async MembershipTier {
    switch (membershipTiers.get(id)) {
      case (null) { Runtime.trap("Tier not found") };
      case (?tier) { tier };
    };
  };

  public query func getAllMembershipTiers() : async [MembershipTier] {
    membershipTiers.values().toArray().sort();
  };

  public shared ({ caller }) func createMembershipTier(name : Text, price : Text, benefits : [Text], displayOrder : Nat) : async Nat {
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) {};
      case (?_) { Runtime.trap("Unauthorized: Only admins can perform this action") };
      case (null) { Runtime.trap("Unauthorized: Only admins can perform this action") };
    };

    let tier : MembershipTier = {
      id = nextTierId;
      name;
      price;
      benefits;
      displayOrder;
    };
    membershipTiers.add(nextTierId, tier);
    nextTierId += 1;
    tier.id;
  };

  public shared ({ caller }) func updateMembershipTier(id : Nat, name : Text, price : Text, benefits : [Text], displayOrder : Nat) : async () {
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) {};
      case (?_) { Runtime.trap("Unauthorized: Only admins can perform this action") };
      case (null) { Runtime.trap("Unauthorized: Only admins can perform this action") };
    };
    switch (membershipTiers.get(id)) {
      case (null) { Runtime.trap("Tier not found") };
      case (?_) {
        let updated : MembershipTier = {
          id;
          name;
          price;
          benefits;
          displayOrder;
        };
        membershipTiers.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteMembershipTier(id : Nat) : async () {
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) {};
      case (?_) { Runtime.trap("Unauthorized: Only admins can perform this action") };
      case (null) { Runtime.trap("Unauthorized: Only admins can perform this action") };
    };
    if (not membershipTiers.containsKey(id)) {
      Runtime.trap("Tier not found");
    };
    membershipTiers.remove(id);
  };

  // ========== Staff Members ==========
  public query func getStaffMember(id : Nat) : async StaffMember {
    switch (staffMembers.get(id)) {
      case (null) { Runtime.trap("Staff member not found") };
      case (?member) { member };
    };
  };

  public query func getAllStaffMembers() : async [StaffMember] {
    staffMembers.values().toArray().sort();
  };

  public shared ({ caller }) func createStaffMember(name : Text, role : Text, bio : Text, displayOrder : Nat) : async Nat {
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) {};
      case (?_) { Runtime.trap("Unauthorized: Only admins can perform this action") };
      case (null) { Runtime.trap("Unauthorized: Only admins can perform this action") };
    };

    let staff : StaffMember = {
      id = nextStaffId;
      name;
      role;
      bio;
      displayOrder;
    };
    staffMembers.add(nextStaffId, staff);
    nextStaffId += 1;
    staff.id;
  };

  public shared ({ caller }) func updateStaffMember(id : Nat, name : Text, role : Text, bio : Text, displayOrder : Nat) : async () {
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) {};
      case (?_) { Runtime.trap("Unauthorized: Only admins can perform this action") };
      case (null) { Runtime.trap("Unauthorized: Only admins can perform this action") };
    };
    switch (staffMembers.get(id)) {
      case (null) { Runtime.trap("Staff member not found") };
      case (?_) {
        let updated : StaffMember = { id; name; role; bio; displayOrder };
        staffMembers.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteStaffMember(id : Nat) : async () {
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) {};
      case (?_) { Runtime.trap("Unauthorized: Only admins can perform this action") };
      case (null) { Runtime.trap("Unauthorized: Only admins can perform this action") };
    };
    if (not staffMembers.containsKey(id)) {
      Runtime.trap("Staff member not found");
    };
    staffMembers.remove(id);
  };

  // ========== Announcements ==========
  public query func getAnnouncement(id : Nat) : async Announcement {
    switch (announcements.get(id)) {
      case (null) { Runtime.trap("Announcement not found") };
      case (?announcement) { announcement };
    };
  };

  public query ({ caller }) func getAllAnnouncements() : async [Announcement] {
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) {};
      case (?_) { Runtime.trap("Unauthorized: Only admins can view all announcements") };
      case (null) { Runtime.trap("Unauthorized: Only admins can view all announcements") };
    };
    announcements.values().toArray().sort();
  };

  public query ({ caller }) func getPublishedAnnouncements() : async [Announcement] {
    announcements.values().filter(func(a) { a.published }).toArray().sort();
  };

  public shared ({ caller }) func createAnnouncement(title : Text, body : Text) : async Nat {
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) {};
      case (?_) { Runtime.trap("Unauthorized: Only admins can perform this action") };
      case (null) { Runtime.trap("Unauthorized: Only admins can perform this action") };
    };

    let announcement : Announcement = {
      id = nextAnnouncementId;
      title;
      body;
      createdAt = Time.now();
      published = false;
    };
    announcements.add(nextAnnouncementId, announcement);
    nextAnnouncementId += 1;
    announcement.id;
  };

  public shared ({ caller }) func updateAnnouncement(id : Nat, title : Text, body : Text) : async () {
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) {};
      case (?_) { Runtime.trap("Unauthorized: Only admins can perform this action") };
      case (null) { Runtime.trap("Unauthorized: Only admins can perform this action") };
    };
    switch (announcements.get(id)) {
      case (null) { Runtime.trap("Announcement not found") };
      case (?existing) {
        let updated : Announcement = {
          id;
          title;
          body;
          createdAt = existing.createdAt;
          published = existing.published;
        };
        announcements.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func setAnnouncementPublished(id : Nat, published : Bool) : async () {
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) {};
      case (?_) { Runtime.trap("Unauthorized: Only admins can perform this action") };
      case (null) { Runtime.trap("Unauthorized: Only admins can perform this action") };
    };
    switch (announcements.get(id)) {
      case (null) { Runtime.trap("Announcement not found") };
      case (?existing) {
        let updated : Announcement = {
          id;
          title = existing.title;
          body = existing.body;
          createdAt = existing.createdAt;
          published;
        };
        announcements.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteAnnouncement(id : Nat) : async () {
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) {};
      case (?_) { Runtime.trap("Unauthorized: Only admins can perform this action") };
      case (null) { Runtime.trap("Unauthorized: Only admins can perform this action") };
    };
    if (not announcements.containsKey(id)) {
      Runtime.trap("Announcement not found");
    };
    announcements.remove(id);
  };
};
