const ucsbOrganizationFixtures = {
  oneOrganization: {
    orgCode: "ITS",
    orgTranslationShort: "INFORMATION TECHNOLOGY SERVICES",
    orgTranslation: "INFORMATION TECHNOLOGY SERVICES",
    inactive: false,
  },
  threeOrganizations: [
    {
      orgCode: "ITS",
      orgTranslationShort: "INFORMATION TECHNOLOGY SERVICES",
      orgTranslation: "INFORMATION TECHNOLOGY SERVICES",
      inactive: false,
    },
    {
      orgCode: "SKY",
      orgTranslationShort: "SKYDIVING CLUB",
      orgTranslation: "SKYDIVING CLUB AT UCSB",
      inactive: false,
    },
    {
      orgCode: "OSLI",
      orgTranslationShort: "STUDENT LIFE",
      orgTranslation: "OFFICE OF STUDENT LIFE",
      inactive: true,
    },
  ],
};

export { ucsbOrganizationFixtures };
