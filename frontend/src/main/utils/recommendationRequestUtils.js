import { toast } from "react-toastify";

// the backend responds with { message: "..." }; toast needs the string itself
export function onDeleteSuccess(response) {
  console.log(response);
  toast(response.message);
}

export function cellToAxiosParamsDelete(cell) {
  return {
    url: "/api/RecommendationRequest",
    method: "DELETE",
    params: {
      id: cell.row.original.id,
    },
  };
}
