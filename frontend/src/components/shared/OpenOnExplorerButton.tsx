import OpenURLButton from "@/components/shared/OpenURLButton";
import { useAppContext } from "@/contexts/AppContext";

interface OpenOnExplorerButtonProps {
  url: string;
}

export default function OpenOnExplorerButton({
  url,
}: OpenOnExplorerButtonProps) {
  const { explorer } = useAppContext();

  return <OpenURLButton url={url}>Open on {explorer.name}</OpenURLButton>;
}
