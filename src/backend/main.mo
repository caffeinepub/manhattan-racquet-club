import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinObjectStorage "object-storage/Mixin";



actor {
  // Authorization system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinObjectStorage();

  // Two-tier admin state
  stable var hasAdminAssigned = false;
  stable var stableSuperAdmins : [(Principal, Bool)] = [];
  stable var stableUserRoles : [(Principal, AccessControl.UserRole)] = [];
  let superAdmins = Map.empty<Principal, Bool>();

  public type AdminEntry = {
    principal : Principal;
    isSuperAdmin : Bool;
  };

  // ========== User Profiles ==========
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  stable var stableUserProfilesArr : [(Principal, UserProfile)] = [];

  // ========== Site Content ==========
  let siteContent = Map.empty<Text, Text>();
  stable var stableSiteContent : [(Text, Text)] = [];

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
  stable var stableMembershipTiersArr : [(Nat, MembershipTier)] = [];
  stable var stableNextTierId = 1;
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
  stable var stableStaffMembersArr : [(Nat, StaffMember)] = [];
  stable var stableNextStaffId = 1;
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
  stable var stableAnnouncementsArr : [(Nat, Announcement)] = [];
  stable var stableNextAnnouncementId = 1;
  var nextAnnouncementId = 1;
  stable var stableIsInitialized = false;
  var isInitialized = false;

  // ========== Enquiries ==========
  public type Enquiry = {
    id : Text;
    name : Text;
    email : Text;
    phone : Text;
    tierId : Text;
    message : Text;
    createdAt : Int;
    status : Text;
  };

  module Enquiry {
    public func compare(a : Enquiry, b : Enquiry) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };
  };

  let enquiries = Map.empty<Text, Enquiry>();
  stable var stableEnquiriesArr : [(Text, Enquiry)] = [];
  stable var stableNextEnquirySeq = 0;
  var nextEnquirySeq = 0;

  // ========== Bookings ==========
  public type Booking = {
    id : Text;
    name : Text;
    email : Text;
    date : Text;
    timeSlot : Text;
    courtType : Text;
    notes : Text;
    createdAt : Int;
    status : Text;
  };

  module Booking {
    public func compare(a : Booking, b : Booking) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };
  };

  let bookings = Map.empty<Text, Booking>();
  stable var stableBookingsArr : [(Text, Booking)] = [];
  stable var stableNextBookingSeq = 0;
  var nextBookingSeq = 0;

  // ========== Activity Log ==========
  public type ActivityLogEntry = {
    id : Text;
    principalText : Text;
    adminName : Text;
    action : Text;
    details : Text;
    timestamp : Int;
  };

  module ActivityLogEntry {
    public func compare(a : ActivityLogEntry, b : ActivityLogEntry) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  let activityLog = Map.empty<Text, ActivityLogEntry>();
  stable var stableActivityLogArr : [(Text, ActivityLogEntry)] = [];
  stable var stableNextActivitySeq = 0;
  var nextActivitySeq = 0;

  // ========== Gallery Images ==========
  public type GalleryImage = {
    id : Text;
    storageKey : Text;
    altText : Text;
    displayOrder : Nat;
    createdAt : Int;
  };

  module GalleryImage {
    public func compare(a : GalleryImage, b : GalleryImage) : Order.Order {
      Nat.compare(a.displayOrder, b.displayOrder);
    };
  };

  let galleryImages = Map.empty<Text, GalleryImage>();
  stable var stableGalleryImagesArr : [(Text, GalleryImage)] = [];
  stable var stableNextGallerySeq = 0;
  var nextGallerySeq = 0;

  // ========== Helper function to check if caller is superadmin ==========
  func isCallerSuperAdminInternal(caller : Principal) : Bool {
    switch (accessControlState.userRoles.get(caller)) {
      case (?#admin) { superAdmins.containsKey(caller) };
      case (_) { false };
    };
  };

  // ========== Helper: any admin in the roles map? ==========
  func hasAdminInMap() : Bool {
    for ((_, role) in accessControlState.userRoles.entries()) {
      if (role == #admin) { return true };
    };
    false;
  };

  // ========== Helper: generate a simple ID from timestamp + sequence ==========
  func makeId(prefix : Text, seq : Nat) : Text {
    prefix # "-" # Time.now().toText() # "-" # seq.toText();
  };

  // ========== Helper: log an activity entry ==========
  func logActivity(caller : Principal, action : Text, details : Text) {
    let adminName = switch (userProfiles.get(caller)) {
      case (?p) { p.name };
      case null { caller.toText() };
    };
    let seq = nextActivitySeq;
    nextActivitySeq += 1;
    let id = makeId("act", seq);
    let entry : ActivityLogEntry = {
      id;
      principalText = caller.toText();
      adminName;
      action;
      details;
      timestamp = Time.now();
    };
    activityLog.add(id, entry);
  };

  // ========== Upgrade hooks ==========
  system func preupgrade() {
    stableSuperAdmins := superAdmins.toArray();
    stableUserRoles := accessControlState.userRoles.toArray();
    stableSiteContent := siteContent.toArray();
    stableMembershipTiersArr := membershipTiers.toArray();
    stableStaffMembersArr := staffMembers.toArray();
    stableAnnouncementsArr := announcements.toArray();
    stableUserProfilesArr := userProfiles.toArray();
    stableNextTierId := nextTierId;
    stableNextStaffId := nextStaffId;
    stableNextAnnouncementId := nextAnnouncementId;
    stableIsInitialized := isInitialized;
    stableEnquiriesArr := enquiries.toArray();
    stableNextEnquirySeq := nextEnquirySeq;
    stableBookingsArr := bookings.toArray();
    stableNextBookingSeq := nextBookingSeq;
    stableActivityLogArr := activityLog.toArray();
    stableNextActivitySeq := nextActivitySeq;
    stableGalleryImagesArr := galleryImages.toArray();
    stableNextGallerySeq := nextGallerySeq;
  };

  system func postupgrade() {
    for ((k, v) in stableUserRoles.vals()) { accessControlState.userRoles.add(k, v) };
    for ((k, v) in stableSuperAdmins.vals()) { superAdmins.add(k, v) };
    for ((k, v) in stableSiteContent.vals()) { siteContent.add(k, v) };
    for ((k, v) in stableMembershipTiersArr.vals()) { membershipTiers.add(k, v) };
    for ((k, v) in stableStaffMembersArr.vals()) { staffMembers.add(k, v) };
    for ((k, v) in stableAnnouncementsArr.vals()) { announcements.add(k, v) };
    for ((k, v) in stableUserProfilesArr.vals()) { userProfiles.add(k, v) };
    nextTierId := stableNextTierId;
    nextStaffId := stableNextStaffId;
    nextAnnouncementId := stableNextAnnouncementId;
    isInitialized := stableIsInitialized;
    for ((k, v) in stableEnquiriesArr.vals()) { enquiries.add(k, v) };
    nextEnquirySeq := stableNextEnquirySeq;
    for ((k, v) in stableBookingsArr.vals()) { bookings.add(k, v) };
    nextBookingSeq := stableNextBookingSeq;
    for ((k, v) in stableActivityLogArr.vals()) { activityLog.add(k, v) };
    nextActivitySeq := stableNextActivitySeq;
    for ((k, v) in stableGalleryImagesArr.vals()) { galleryImages.add(k, v) };
    nextGallerySeq := stableNextGallerySeq;

    // Migration guard: if no superadmins were persisted, promote all existing admins
    if (superAdmins.size() == 0) {
      for ((principal, role) in accessControlState.userRoles.entries()) {
        if (role == #admin) {
          superAdmins.add(principal, true);
        };
      };
    };
  };

  // ========== Two-Tier Admin System ==========
  // Allows claiming if no admin is assigned OR if the admin flag is set but
  // the roles map is empty (state-corruption recovery after a bad redeploy).
  public shared ({ caller }) func claimFirstAdmin() : async Bool {
    if (caller.isAnonymous()) { return false };
    // If an admin is assigned AND the map contains at least one admin, reject.
    if (hasAdminAssigned and hasAdminInMap()) { return false };
    accessControlState.userRoles.add(caller, #admin);
    superAdmins.add(caller, true);
    hasAdminAssigned := true;
    true;
  };

  public query func hasAnyAdmin() : async Bool {
    hasAdminAssigned;
  };

  public query ({ caller }) func isCallerSuperAdmin() : async Bool {
    isCallerSuperAdminInternal(caller);
  };

  public query ({ caller }) func getAllAdmins() : async [AdminEntry] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    accessControlState.userRoles.entries().filter(func(entry) { entry.1 == #admin }).map(func(entry) {
      { principal = entry.0; isSuperAdmin = superAdmins.containsKey(entry.0) };
    }).toArray();
  };

  public shared ({ caller }) func setSuperAdmin(user : Principal, promote : Bool) : async () {
    if (not isCallerSuperAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Only super admins can perform this action");
    };
    switch (accessControlState.userRoles.get(user)) {
      case (?#admin) {};
      case (_) { Runtime.trap("User must already be an admin") };
    };
    if (promote) { 
      superAdmins.add(user, true);
    } else {
      let countSuperAdmins = superAdmins.size();
      if (countSuperAdmins <= 1 and superAdmins.containsKey(user)) {
        Runtime.trap("Cannot demote: at least one Superadmin must always exist");
      };
      superAdmins.remove(user);
    };
  };

  public shared ({ caller }) func assignCallerUserRoleWithSuperAdminCheck(user : Principal, role : AccessControl.UserRole) : async () {
    if (not isCallerSuperAdminInternal(caller)) {
      Runtime.trap("Unauthorized: Only super admins can perform this action");
    };
    if (role == #guest) { Runtime.trap("Cannot assign guest role explicitly") };
    switch (accessControlState.userRoles.get(user)) {
      case (?#admin) {
        if (role == #user) {
          let countSuperAdmins = superAdmins.size();
          if (countSuperAdmins <= 1 and superAdmins.containsKey(user)) {
            Runtime.trap("Cannot remove the last Superadmin");
          };
          superAdmins.remove(user);
        };
      };
      case (_) {};
    };
    accessControlState.userRoles.add(user, role);
  };

  // ========== User Profile Management ==========
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller == user) { return userProfiles.get(user) };
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can fetch other users' profiles");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ========== Initialization ==========
  public shared ({ caller }) func initDefaultContent() : async () {
    if (isInitialized) { Runtime.trap("Already initialized") };
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    siteContent.add("landing_hero", "Welcome to The Manhattan Racquet Club - NYC's Premier Tennis Destination! Experience world-class courts, expert coaching, and a vibrant tennis community in the heart of Manhattan.");
    siteContent.add("about", "The Manhattan Racquet Club has served New York's tennis enthusiasts for over 30 years. Our state-of-the-art facilities, diverse membership options, and nationally recognized coaching staff make us the city's top choice for players of all skill levels.");
    siteContent.add("contact_email", "info@manhattanracquetclub.com");
    siteContent.add("address", "123 Tennis Lane, New York, NY 10001");

    let junior : MembershipTier = { id = nextTierId; name = "Junior Membership"; price = "$49/mo"; benefits = ["Access to all courts during off-peak hours", "Group lessons included", "Members-only tournaments"]; displayOrder = 1 };
    membershipTiers.add(junior.id, junior); nextTierId += 1;

    let adult : MembershipTier = { id = nextTierId; name = "Adult Membership"; price = "$99/mo"; benefits = ["Unlimited court access", "Discounted private lessons", "Members-only events"]; displayOrder = 2 };
    membershipTiers.add(adult.id, adult); nextTierId += 1;

    let family : MembershipTier = { id = nextTierId; name = "Family Membership"; price = "$149/mo"; benefits = ["Full club access for up to 4 family members", "Free weekend clinics", "Priority event registration"]; displayOrder = 3 };
    membershipTiers.add(family.id, family); nextTierId += 1;

    let c1 : StaffMember = { id = nextStaffId; name = "Sarah Williams"; role = "Head Coach"; bio = "Former NCAA champion with 15+ years of coaching experience. Specializes in advanced player development."; displayOrder = 1 };
    staffMembers.add(c1.id, c1); nextStaffId += 1;

    let c2 : StaffMember = { id = nextStaffId; name = "Carlos Ramirez"; role = "Junior Program Director"; bio = "USTA certified instructor focused on youth development and beginner training programs."; displayOrder = 2 };
    staffMembers.add(c2.id, c2); nextStaffId += 1;

    let c3 : StaffMember = { id = nextStaffId; name = "Emily Chen"; role = "Fitness Trainer"; bio = "NSCA certified fitness expert integrating strength and conditioning into tennis training."; displayOrder = 3 };
    staffMembers.add(c3.id, c3); nextStaffId += 1;

    let a1 : Announcement = { id = nextAnnouncementId; title = "Grand Opening of New Indoor Courts"; body = "We're excited to announce the opening of our brand new indoor courts, available year-round for all members!"; createdAt = Time.now(); published = true };
    announcements.add(a1.id, a1); nextAnnouncementId += 1;

    let a2 : Announcement = { id = nextAnnouncementId; title = "Summer Tennis Camp Registration Now Open"; body = "Sign up for our popular summer camp program, open to juniors of all skill levels. Spaces are limited!"; createdAt = Time.now(); published = true };
    announcements.add(a2.id, a2); nextAnnouncementId += 1;

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
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    siteContent.add(key, content);
    logActivity(caller, "setContentByKey", "key=" # key);
  };

  public query func getAllContent() : async [(Text, Text)] {
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
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let tier : MembershipTier = { id = nextTierId; name; price; benefits; displayOrder };
    membershipTiers.add(nextTierId, tier); nextTierId += 1;
    logActivity(caller, "createMembershipTier", "name=" # name);
    tier.id;
  };

  public shared ({ caller }) func updateMembershipTier(id : Nat, name : Text, price : Text, benefits : [Text], displayOrder : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (membershipTiers.get(id)) {
      case (null) { Runtime.trap("Tier not found") };
      case (?_) {
        membershipTiers.add(id, { id; name; price; benefits; displayOrder });
        logActivity(caller, "updateMembershipTier", "id=" # id.toText());
      };
    };
  };

  public shared ({ caller }) func deleteMembershipTier(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not membershipTiers.containsKey(id)) { Runtime.trap("Tier not found") };
    membershipTiers.remove(id);
    logActivity(caller, "deleteMembershipTier", "id=" # id.toText());
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
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let staff : StaffMember = { id = nextStaffId; name; role; bio; displayOrder };
    staffMembers.add(nextStaffId, staff); nextStaffId += 1;
    logActivity(caller, "createStaffMember", "name=" # name);
    staff.id;
  };

  public shared ({ caller }) func updateStaffMember(id : Nat, name : Text, role : Text, bio : Text, displayOrder : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (staffMembers.get(id)) {
      case (null) { Runtime.trap("Staff member not found") };
      case (?_) {
        staffMembers.add(id, { id; name; role; bio; displayOrder });
        logActivity(caller, "updateStaffMember", "id=" # id.toText());
      };
    };
  };

  public shared ({ caller }) func deleteStaffMember(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not staffMembers.containsKey(id)) { Runtime.trap("Staff member not found") };
    staffMembers.remove(id);
    logActivity(caller, "deleteStaffMember", "id=" # id.toText());
  };

  // ========== Announcements ==========
  public query func getAnnouncement(id : Nat) : async Announcement {
    switch (announcements.get(id)) {
      case (null) { Runtime.trap("Announcement not found") };
      case (?announcement) { announcement };
    };
  };

  public query ({ caller }) func getAllAnnouncements() : async [Announcement] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all announcements");
    };
    announcements.values().toArray().sort();
  };

  public query func getPublishedAnnouncements() : async [Announcement] {
    announcements.values().filter(func(a) { a.published }).toArray().sort();
  };

  public shared ({ caller }) func createAnnouncement(title : Text, body : Text) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let announcement : Announcement = { id = nextAnnouncementId; title; body; createdAt = Time.now(); published = false };
    announcements.add(nextAnnouncementId, announcement); nextAnnouncementId += 1;
    logActivity(caller, "createAnnouncement", "title=" # title);
    announcement.id;
  };

  public shared ({ caller }) func updateAnnouncement(id : Nat, title : Text, body : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (announcements.get(id)) {
      case (null) { Runtime.trap("Announcement not found") };
      case (?existing) {
        announcements.add(id, { id; title; body; createdAt = existing.createdAt; published = existing.published });
        logActivity(caller, "updateAnnouncement", "id=" # id.toText());
      };
    };
  };

  public shared ({ caller }) func setAnnouncementPublished(id : Nat, published : Bool) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (announcements.get(id)) {
      case (null) { Runtime.trap("Announcement not found") };
      case (?existing) {
        announcements.add(id, { id; title = existing.title; body = existing.body; createdAt = existing.createdAt; published });
        logActivity(caller, "setAnnouncementPublished", "id=" # id.toText() # " published=" # (if published "true" else "false"));
      };
    };
  };

  public shared ({ caller }) func deleteAnnouncement(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not announcements.containsKey(id)) { Runtime.trap("Announcement not found") };
    announcements.remove(id);
    logActivity(caller, "deleteAnnouncement", "id=" # id.toText());
  };

  // ========== Enquiries ==========
  public shared func submitEnquiry(name : Text, email : Text, phone : Text, tierId : Text, message : Text) : async { #ok : Text; #err : Text } {
    let seq = nextEnquirySeq;
    nextEnquirySeq += 1;
    let id = makeId("enq", seq);
    let enquiry : Enquiry = { id; name; email; phone; tierId; message; createdAt = Time.now(); status = "pending" };
    enquiries.add(id, enquiry);
    #ok id;
  };

  public query ({ caller }) func getAllEnquiries() : async [Enquiry] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view enquiries");
    };
    enquiries.values().toArray().sort();
  };

  public shared ({ caller }) func updateEnquiryStatus(id : Text, status : Text) : async { #ok : Text; #err : Text } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err "Unauthorized: Only admins can update enquiry status";
    };
    if (status != "pending" and status != "contacted" and status != "resolved" and status != "archived") {
      return #err "Invalid status. Must be one of: pending, contacted, resolved, archived";
    };
    switch (enquiries.get(id)) {
      case (null) { #err "Enquiry not found" };
      case (?existing) {
        enquiries.add(id, { existing with status });
        #ok id;
      };
    };
  };

  // ========== Bookings ==========
  public shared func submitBooking(name : Text, email : Text, date : Text, timeSlot : Text, courtType : Text, notes : Text) : async { #ok : Text; #err : Text } {
    let seq = nextBookingSeq;
    nextBookingSeq += 1;
    let id = makeId("bkg", seq);
    let booking : Booking = { id; name; email; date; timeSlot; courtType; notes; createdAt = Time.now(); status = "pending" };
    bookings.add(id, booking);
    #ok id;
  };

  public query ({ caller }) func getAllBookings() : async [Booking] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view bookings");
    };
    bookings.values().toArray().sort();
  };

  public shared ({ caller }) func updateBookingStatus(id : Text, status : Text) : async { #ok : Text; #err : Text } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err "Unauthorized: Only admins can update booking status";
    };
    if (status != "pending" and status != "confirmed" and status != "cancelled") {
      return #err "Invalid status. Must be one of: pending, confirmed, cancelled";
    };
    switch (bookings.get(id)) {
      case (null) { #err "Booking not found" };
      case (?existing) {
        bookings.add(id, { existing with status });
        #ok id;
      };
    };
  };

  // ========== Activity Log ==========
  public query ({ caller }) func getActivityLog(limit : Nat) : async [ActivityLogEntry] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view the activity log");
    };
    let all = activityLog.values().toArray().sort();
    if (limit == 0 or limit >= all.size()) { all }
    else { all.sliceToArray(0, limit) };
  };

  // ========== Gallery Images ==========
  public shared ({ caller }) func addGalleryImage(storageKey : Text, altText : Text, displayOrder : Nat) : async { #ok : Text; #err : Text } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err "Unauthorized: Only admins can add gallery images";
    };
    let seq = nextGallerySeq;
    nextGallerySeq += 1;
    let id = makeId("img", seq);
    let image : GalleryImage = { id; storageKey; altText; displayOrder; createdAt = Time.now() };
    galleryImages.add(id, image);
    #ok id;
  };

  public shared ({ caller }) func updateGalleryImage(id : Text, altText : Text, displayOrder : Nat) : async { #ok : Text; #err : Text } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err "Unauthorized: Only admins can update gallery images";
    };
    switch (galleryImages.get(id)) {
      case (null) { #err "Image not found" };
      case (?existing) {
        galleryImages.add(id, { existing with altText; displayOrder });
        #ok id;
      };
    };
  };

  public shared ({ caller }) func deleteGalleryImage(id : Text) : async { #ok : Text; #err : Text } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err "Unauthorized: Only admins can delete gallery images";
    };
    switch (galleryImages.get(id)) {
      case (null) { #err "Image not found" };
      case (?_) {
        galleryImages.remove(id);
        #ok id;
      };
    };
  };

  public query func getAllGalleryImages() : async [GalleryImage] {
    galleryImages.values().toArray().sort();
  };

  public shared ({ caller }) func reorderGalleryImages(ids : [Text]) : async { #ok : Text; #err : Text } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err "Unauthorized: Only admins can reorder gallery images";
    };
    var idx = 0;
    for (id in ids.vals()) {
      switch (galleryImages.get(id)) {
        case (?existing) {
          galleryImages.add(id, { existing with displayOrder = idx });
        };
        case (null) {};
      };
      idx += 1;
    };
    #ok "reordered";
  };
};
