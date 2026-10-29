import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import UCSBDiningCommonsMenuItemForm from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemForm";
import { Navigate } from "react-router";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function UCSBDiningCommonsMenuItemCreatePage({
  storybook = false,
}) {
  const objectToAxiosParams = (menuItem) => ({
    url: "/api/UCSBDiningCommonsMenuItem/post",
    method: "POST",
    params: {
      diningCommonsCode: menuItem.diningCommonsCode,
      name: menuItem.name,
      station: menuItem.station,
    },
  });

  const onSuccess = (menuItem) => {
    toast(
      `New UCSBDiningCommonsMenuItem Created - id: ${menuItem.id} name: ${menuItem.name}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    ["/api/UCSBDiningCommonsMenuItem/all"],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/diningcommonsmenuitem" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Create New UCSBDiningCommonsMenuItem</h1>

        <UCSBDiningCommonsMenuItemForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}
