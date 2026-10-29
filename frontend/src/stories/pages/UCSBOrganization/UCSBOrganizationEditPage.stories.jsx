import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";
import { http, HttpResponse } from "msw";

import UCSBOrganizationEditPage from "main/pages/UCSBOrganization/UCSBOrganizationEditPage";

export default {
  title: "pages/UCSBOrganization/UCSBOrganizationEditPage",
  component: UCSBOrganizationEditPage,
};

const Template = () => <UCSBOrganizationEditPage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.get("/api/ucsborganization", () => {
      return HttpResponse.json(ucsbOrganizationFixtures.threeOrganizations[0], {
        status: 200,
      });
    }),
    http.put("/api/ucsborganization", () => {
      return HttpResponse.json(
        {
          orgCode: "ZPR",
          orgTranslationShort: "ZPR EDITED",
          orgTranslation: "ZETA PHI RHO EDITED",
          inactive: false,
        },
        { status: 200 },
      );
    }),
  ],
};
