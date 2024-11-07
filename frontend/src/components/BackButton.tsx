import { Button } from "@/components/ui/button";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";

const BackButton = ({ overrideRedirect }: { overrideRedirect?: boolean }) => (
  <header>
    <Button
      className="m-2 flex gap-2 text-xl"
      onClick={() => {
        if (overrideRedirect) {
          window.location.href = "/project2/";
        } else window.history.back();
      }}
      variant="ghost"
    >
      <ArrowUturnLeftIcon className="size-6" />
      <p>Back</p>
    </Button>
  </header>
);
export default BackButton;