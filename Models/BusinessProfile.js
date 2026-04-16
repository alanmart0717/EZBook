class BusinessProfile {
  constructor({ id, userId, businessName, bio, contactInfo, category }) {
    this.id = id;
    this.userId = userId;
    this.businessName = businessName;
    this.bio = bio;
    this.contactInfo = contactInfo;
    this.category = category;
  }
}

module.exports = BusinessProfile;