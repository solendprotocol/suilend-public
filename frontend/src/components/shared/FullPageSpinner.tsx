import Spinner from "@/components/shared/Spinner";

export default function FullPageSpinner() {
  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 flex flex-row items-center justify-center">
      <Spinner />
    </div>
  );
}
