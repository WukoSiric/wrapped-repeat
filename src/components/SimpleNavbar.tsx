import { Button } from "./Button";
import Heading from "./Heading";

const SimpleNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-primary-surface shadow-md">
      <div className="flex-sp mx-auto flex h-14 items-center justify-between px-6">
        <Heading variant="2XL">
          Wrapped<span className="text-accent-surface">Repeat</span>
        </Heading>
        <div className="flex flex-row gap-2">
          <Button>Preview</Button>
          <Button>Present</Button>
        </div>
      </div>
    </nav>
  );
};

export default SimpleNavbar;
