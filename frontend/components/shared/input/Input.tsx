"use client";

import clsx from "clsx";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
  value?: string;
  extended?: boolean;
}

export default function Input({
  label,
  type,
  error,
  name,
  value,
  onChange,
  onBlur,
  maxLength,
  defaultValue,
  extended,
}: Props) {
  return (
    <>
      <label
        className={clsx(
          "relative flex flex-col group outline-1 outline-border rounded-sm focus-within:outline-2",
          {
            "outline-error": error,
            "h-[120px]": extended,

            "focus-within:outline-blue": !error,
          },
        )}
      >
        <div
          className={clsx(
            "absolute text-muted text-lg group-focus-within:top-1 group-focus-within:left-2 group-focus-within:text-sm duration-200",
            {
              "top-3 left-2": !value,
              "left-2 top-1 text-sm": value,
              "group-focus-within:text-blue": !error,
              "group-focus-within:text-error": error,
            },
          )}
        >
          {label}
        </div>
        <input
          type={type}
          className="pb-2 pt-6 px-2 outline-none"
          maxLength={maxLength}
          name={name}
          onChange={onChange}
          onBlur={onBlur}
          defaultValue={defaultValue}
        />
        {maxLength && value && (
          <div className="absolute right-1 top-1 text-muted text-sm">
            {value.length} / {maxLength}
          </div>
        )}
      </label>
      {error ? (
        <div className="ml-2 text-error text-sm min-h-[1.25rem]">{error}</div>
      ) : (
        <div className="ml-2 text-sm min-h-[1.25rem] invisible">
          placeholder
        </div>
      )}
    </>
  );
}
