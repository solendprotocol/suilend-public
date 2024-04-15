import { useMediaQuery } from "react-responsive";

const useIsTouchscreen = () =>
  useMediaQuery({
    query: "(pointer: coarse)",
  });

export default useIsTouchscreen;
