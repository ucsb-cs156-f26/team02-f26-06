const menuItemReviewFixtures = {
  oneMenuItemReview: {
    id: 1,
    itemId: 27,
    reviewerEmail: "cgaucho@ucsb.edu",
    stars: 5,
    dateReviewed: "2022-01-02T12:00:00",
    comments: "Best pasta I have had in the dining commons",
  },
  threeMenuItemReviews: [
    {
      id: 1,
      itemId: 27,
      reviewerEmail: "cgaucho@ucsb.edu",
      stars: 5,
      dateReviewed: "2022-01-02T12:00:00",
      comments: "Best pasta I have had in the dining commons",
    },
    {
      id: 2,
      itemId: 31,
      reviewerEmail: "ldelplaya@ucsb.edu",
      stars: 3,
      dateReviewed: "2022-04-03T12:00:00",
      comments: "Fine, but a little bland",
    },
    {
      id: 3,
      itemId: 42,
      reviewerEmail: "phtcho@ucsb.edu",
      stars: 1,
      dateReviewed: "2022-07-04T12:00:00",
      comments: "Cold by the time I got to it",
    },
  ],
};

export { menuItemReviewFixtures };
