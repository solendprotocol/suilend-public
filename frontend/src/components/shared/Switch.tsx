import { TLabelSans } from "@/components/shared/Typography";
import { Switch as SwitchComponent } from "@/components/ui/switch";

export const getSwitchId = (id: string) => `switch.${id}`;

interface SwitchProps {
  label?: string;
  id: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export default function Switch({ label, id, value, onChange }: SwitchProps) {
  const switchId = getSwitchId(id);

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={switchId} className="w-fit">
          <TLabelSans>{label}</TLabelSans>
        </label>
      )}
      <div className="w-full">
        <SwitchComponent
          id={switchId}
          checked={value}
          onCheckedChange={onChange}
        />
      </div>
    </div>
  );
}
