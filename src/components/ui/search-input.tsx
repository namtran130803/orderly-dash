import { useState, useCallback, useEffect, type ChangeEvent } from "react"
import { MagnifyingGlassIcon } from "@phosphor-icons/react"

import { useDebounce } from "@/hooks/useDebounce"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type SearchInputProps = Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> & {
  initialValue?: string
  debounceMs?: number
  onDebouncedChange?: (value: string) => void
}

export function SearchInput({
  initialValue = "",
  debounceMs = 300,
  onDebouncedChange,
  className,
  ...props
}: SearchInputProps) {
  const [value, setValue] = useState(initialValue)
  const debouncedValue = useDebounce(value, debounceMs)

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value)
    },
    [],
  )

  useEffect(() => {
    onDebouncedChange?.(debouncedValue)
  }, [debouncedValue, onDebouncedChange])

  return (
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
      <Input className={cn("pl-8", className)} value={value} onChange={handleChange} {...props} />
    </div>
  )
}
