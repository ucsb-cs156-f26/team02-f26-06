import {
  onDeleteSuccess,
  cellToAxiosParamsDelete,
} from "main/utils/helpRequestUtils";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

describe("helpRequestUtils tests", () => {
  describe("onDeleteSuccess", () => {
    test("It puts the message on console.log and in a toast", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      onDeleteSuccess("abc");

      expect(mockToast).toHaveBeenCalledWith("abc");
      expect(consoleSpy).toHaveBeenCalledWith("abc");
      consoleSpy.mockRestore();
    });
  });

  describe("cellToAxiosParamsDelete", () => {
    test("It returns the correct params", () => {
      const cell = { row: { original: { id: 17 } } };

      const result = cellToAxiosParamsDelete(cell);

      expect(result).toEqual({
        url: "/api/helprequest",
        method: "DELETE",
        params: { id: 17 },
      });
    });
  });
});
