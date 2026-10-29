import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import { Navigate } from "react-router";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function RecommendationRequestEditPage({ storybook = false }) {
  let { id } = useParams();

  const {
    data: recommendationRequest,
    _error,
    _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/RecommendationRequest?id=${id}`],
    {
      // Stryker disable next-line all : GET is the default, so mutating this to "" doesn't introduce a bug
      method: "GET",
      url: `/api/RecommendationRequest`,
      params: {
        id,
      },
    },
  );

  const objectToAxiosPutParams = (recommendationRequest) => ({
    url: "/api/RecommendationRequest",
    method: "PUT",
    params: {
      id: recommendationRequest.id,
    },
    data: {
      requesterEmail: recommendationRequest.requesterEmail,
      professorEmail: recommendationRequest.professorEmail,
      explanation: recommendationRequest.explanation,
      dateRequested: recommendationRequest.dateRequested,
      dateNeeded: recommendationRequest.dateNeeded,
      done: recommendationRequest.done,
    },
  });

  const onSuccess = (recommendationRequest) => {
    toast(
      `RecommendationRequest Updated - id: ${recommendationRequest.id} requesterEmail: ${recommendationRequest.requesterEmail}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [`/api/RecommendationRequest?id=${id}`],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/recommendationrequest" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit RecommendationRequest</h1>
        {recommendationRequest && (
          <RecommendationRequestForm
            submitAction={onSubmit}
            buttonLabel={"Update"}
            initialContents={recommendationRequest}
          />
        )}
      </div>
    </BasicLayout>
  );
}
