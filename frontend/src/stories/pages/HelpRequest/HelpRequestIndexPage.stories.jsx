import React from "react";
import HelpRequestIndexPage from "main/pages/HelpRequest/HelpRequestIndexPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "pages/HelpRequest/HelpRequestIndexPage",
  component: HelpRequestIndexPage,
};

const Template = () => <HelpRequestIndexPage />;

export const Empty = Template.bind({});
Empty.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly);
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither);
    }),
    http.get("/api/helprequest/all", () => {
      return HttpResponse.json([]);
    }),
  ],
};

export const ThreeHelpRequests = Template.bind({});
ThreeHelpRequests.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.adminUser);
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither);
    }),
    http.get("/api/helprequest/all", () => {
      return HttpResponse.json(helpRequestFixtures.threeHelpRequests);
    }),
    http.delete("/api/helprequest", () => {
      return HttpResponse.json("HelpRequest with id 1 was deleted");
    }),
  ],
};
