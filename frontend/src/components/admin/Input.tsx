import { ReactNode, forwardRef, useEffect, useRef } from "react";

import { mergeRefs } from "react-merge-refs";

import { TLabel, TLabelSans } from "@/components/shared/Typography";
import {
  Input as InputComponent,
  InputProps as InputComponentProps,
} from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const getInputId = (id: string) => `input.${id}`;

interface InputProps {
  label?: string;
  labelRight?: string | ReactNode;
  id: string;
  type?: "text" | "number";
  placeholder?: string;
  value: string | number;
  onChange: (value: string) => void;
  inputProps?: InputComponentProps;
  startDecorator?: string;
  endDecorator?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      labelRight,
      id,
      type = "text",
      placeholder,
      value,
      onChange,
      inputProps = {},
      startDecorator,
      endDecorator,
    },
    ref,
  ) => {
    const { className, autoFocus, ...restInputProps } = inputProps;

    const inputId = getInputId(id);

    const localRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
      if (autoFocus) setTimeout(() => localRef.current?.focus());
    }, [autoFocus]);

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <div className="flex flex-row justify-between">
            <label htmlFor={inputId}>
              <TLabelSans>{label}</TLabelSans>
            </label>
            {labelRight && <TLabelSans>{labelRight}</TLabelSans>}
          </div>
        )}
        <div className="relative w-full">
          {startDecorator && (
            <TLabel className="pointer-events-none absolute left-3 top-1/2 z-[2] -translate-y-2/4">
              {startDecorator}
            </TLabel>
          )}
          <InputComponent
            ref={mergeRefs([localRef, ref])}
            id={inputId}
            className={cn(
              "border-divider relative z-[1] flex-1 focus:border-input [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
              startDecorator && "pl-10",
              endDecorator && "pr-10",
              className,
            )}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onWheel={(e) => e.currentTarget.blur()}
            {...restInputProps}
          />
          {endDecorator && (
            <TLabel className="pointer-events-none absolute right-3 top-1/2 z-[2] -translate-y-2/4">
              {endDecorator}
            </TLabel>
          )}
        </div>
      </div>
    );
  },
);
Input.displayName = "Input";

export default Input;
