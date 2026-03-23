import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import banks from "@/data/banks.json";

interface BankSearchSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  onOtherSelected?: (isOther: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const BankSearchSelect = ({
  value,
  onValueChange,
  onOtherSelected,
  disabled = false,
  placeholder = "Select bank",
}: BankSearchSelectProps) => {
  const [open, setOpen] = useState(false);

  const selectedBank = banks.find((bank) => bank.code === value);
  const isOther = value === "OTHER";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedBank ? (
            <div className="flex items-center gap-2">
              <img
                src={selectedBank.logo}
                alt={selectedBank.name}
                className="h-5 w-5 object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <span>{selectedBank.name}</span>
            </div>
          ) : isOther ? (
            <span className="text-muted-foreground">Other</span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search bank..." />
          <CommandList>
            <CommandEmpty>No bank found.</CommandEmpty>
            <CommandGroup>
              {banks.map((bank) => (
                <CommandItem
                  key={bank.code}
                  value={bank.name}
                  onSelect={() => {
                    onValueChange(bank.code);
                    onOtherSelected?.(false);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === bank.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <img
                    src={bank.logo}
                    alt={bank.name}
                    className="h-5 w-5 object-contain mr-2"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <span>{bank.name}</span>
                </CommandItem>
              ))}
              {/* Other option for unknown banks */}
              <CommandItem
                value="Other"
                onSelect={() => {
                  onValueChange("OTHER");
                  onOtherSelected?.(true);
                  setOpen(false);
                }}
                className="border-t mt-2 pt-2"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "OTHER" ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="font-semibold">Other</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
