import { Combobox, TextInput, useCombobox } from '@mantine/core';
import { ChangeEvent } from 'react';

interface SelectCreatableProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  description?: string;
}

export function SelectCreatable({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  error,
  description
}: SelectCreatableProps) {
  const combobox = useCombobox();

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.currentTarget.value);
  };

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(value) => {
        onChange(value);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <TextInput
          label={label}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          rightSection={<Combobox.Chevron />}
          required={required}
          error={error}
          description={description}
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          {options.map((option) => (
            <Combobox.Option value={option} key={option}>
              {option}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}