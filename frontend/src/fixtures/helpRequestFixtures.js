const helpRequestFixtures = {
    oneHelpRequest: {
        id: 1,
        requesterEmail: "student1@ucsb.edu",
        teamId: "s22-5pm",
        tableOrBreakoutRoom: "1",
        requestTime: "2022-01-02T12:00:00",
        explanation: "Need help with Swagger-ui",
        solved: false,
    },
    threeHelpRequests: [
      {
        id: 1,
        requesterEmail: "student1@ucsb.edu",
        teamId: "s21-5pm",
        tableOrBreakoutRoom: "1",
        requestTime: "2022-01-02T12:00:00",
        explanation: "Need help with Swagger-ui",
        solved: false,
      },
      {
        id: 2,
        requesterEmail: "student2@ucsb.edu",
        teamId: "s21-5pm",
        tableOrBreakoutRoom: "2",
        requestTime: "2022-01-02T12:00:00",
        explanation: "Need help with Swagger-ui",
        solved: false,
      },
      {
        id: 3,
        requesterEmail: "student3@ucsb.edu",
        teamId: "s20-5pm",
        tableOrBreakoutRoom: "3",
        requestTime: "2022-01-02T12:00:00",
        explanation: "Need help with Swagger-ui",
        solved: false,
      },
    ],
  };
  
  export { helpRequestFixtures };