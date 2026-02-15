import { Button } from "./Button";
import Heading from "./Heading";
import { Icon } from "./Icon";

const SimpleNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-primary-surface shadow-md">
      <div className="flex-sp mx-auto flex h-14 items-center justify-between px-6">
        <Heading variant="2XL" className="select-none">
          <div className="flex flex-row items-center">
            <Icon name="fast_rewind" />
            Wrapped<span className="text-accent-surface">Repeat</span>
          </div>
        </Heading>
        <div className="flex flex-row gap-2">
          <Button leftIcon="preview">Preview</Button>
          <Button leftIcon="co_present">Present</Button>
        </div>
      </div>
    </nav>
  );
};

export default SimpleNavbar;
