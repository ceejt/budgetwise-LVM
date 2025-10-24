"use client"

import { useState, useEffect } from "react"
import { Filter, X, Search, Calendar, DollarSign, Tag, Wallet as WalletIcon, Save, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import type { TransactionFilters, TransactionSort, Category, EWallet, FilterPreset, SortField } from "@/lib/types"
import { countActiveFilters, getFilterDescriptions, DATE_PRESETS } from "@/lib/utils/filter-builder"

interface TransactionFiltersProps {
  userId: string
  filters: TransactionFilters
  sort: TransactionSort
  onFiltersChange: (filters: TransactionFilters) => void
  onSortChange: (sort: TransactionSort) => void
  totalCount?: number
  filteredCount?: number
}

export function TransactionFiltersComponent({
  userId,
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  totalCount,
  filteredCount,
}: TransactionFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [wallets, setWallets] = useState<EWallet[]>([])
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([])
  const [presetName, setPresetName] = useState("")
  const [showPresetInput, setShowPresetInput] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()

  // Local state for filter inputs
  const [localFilters, setLocalFilters] = useState<TransactionFilters>(filters)
  const [amountRange, setAmountRange] = useState<[number, number]>([
    filters.amountMin ?? 0,
    filters.amountMax ?? 10000,
  ])

  useEffect(() => {
    fetchCategories()
    fetchWallets()
    fetchFilterPresets()
  }, [userId])

  useEffect(() => {
    setLocalFilters(filters)
    setAmountRange([filters.amountMin ?? 0, filters.amountMax ?? 10000])
  }, [filters])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("name")

    if (data) setCategories(data)
  }

  const fetchWallets = async () => {
    const { data } = await supabase.from("ewallets").select("*").eq("user_id", userId).order("is_primary", { ascending: false })

    if (data) setWallets(data)
  }

  const fetchFilterPresets = async () => {
    const { data } = await supabase
      .from("filter_presets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (data) setFilterPresets(data)
  }

  const applyFilters = () => {
    onFiltersChange({
      ...localFilters,
      amountMin: amountRange[0] > 0 ? amountRange[0] : null,
      amountMax: amountRange[1] < 10000 ? amountRange[1] : null,
    })
    setIsOpen(false)
  }

  const clearFilters = () => {
    const emptyFilters: TransactionFilters = {
      dateFrom: null,
      dateTo: null,
      categoryIds: [],
      amountMin: null,
      amountMax: null,
      walletIds: [],
      searchQuery: null,
    }
    setLocalFilters(emptyFilters)
    setAmountRange([0, 10000])
    onFiltersChange(emptyFilters)
    setIsOpen(false)
  }

  const applyDatePreset = (presetKey: keyof typeof DATE_PRESETS) => {
    const range = DATE_PRESETS[presetKey].getRange()
    setLocalFilters({ ...localFilters, ...range })
  }

  const toggleCategory = (categoryId: string) => {
    const currentIds = localFilters.categoryIds || []
    const newIds = currentIds.includes(categoryId)
      ? currentIds.filter((id) => id !== categoryId)
      : [...currentIds, categoryId]
    setLocalFilters({ ...localFilters, categoryIds: newIds })
  }

  const toggleWallet = (walletId: string) => {
    const currentIds = localFilters.walletIds || []
    const newIds = currentIds.includes(walletId) ? currentIds.filter((id) => id !== walletId) : [...currentIds, walletId]
    setLocalFilters({ ...localFilters, walletIds: newIds })
  }

  const savePreset = async () => {
    if (!presetName.trim()) return

    const { error } = await supabase.from("filter_presets").insert({
      user_id: userId,
      name: presetName.trim(),
      filters: localFilters,
      sort,
    })

    if (!error) {
      setPresetName("")
      setShowPresetInput(false)
      fetchFilterPresets()
    }
  }

  const loadPreset = (preset: FilterPreset) => {
    setLocalFilters(preset.filters)
    if (preset.sort) {
      onSortChange(preset.sort)
    }
    onFiltersChange(preset.filters)
    setIsOpen(false)
  }

  const deletePreset = async (presetId: string) => {
    if (!confirm("Delete this filter preset?")) return

    const { error } = await supabase.from("filter_presets").delete().eq("id", presetId)

    if (!error) {
      fetchFilterPresets()
    }
  }

  const activeFilterCount = countActiveFilters(filters)
  const filterDescriptions = getFilterDescriptions(filters)

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search transactions..."
          value={filters.searchQuery || ""}
          onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value || null })}
          className="pl-10 rounded-full"
          style={{ borderColor: "#E0E0E0" }}
        />
      </div>

      {/* Sort Dropdown */}
      <Select
        value={`${sort.field}-${sort.order}`}
        onValueChange={(value) => {
          const [field, order] = value.split("-") as [SortField, "asc" | "desc"]
          onSortChange({ field, order })
        }}
      >
        <SelectTrigger className="w-[180px] rounded-full" style={{ backgroundColor: "#F5F5F5", borderColor: "#E0E0E0" }}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date-desc">Date: Newest First</SelectItem>
          <SelectItem value="date-asc">Date: Oldest First</SelectItem>
          <SelectItem value="amount-desc">Amount: High to Low</SelectItem>
          <SelectItem value="amount-asc">Amount: Low to High</SelectItem>
          <SelectItem value="category-asc">Category: A-Z</SelectItem>
          <SelectItem value="category-desc">Category: Z-A</SelectItem>
        </SelectContent>
      </Select>

      {/* Filter Button with Popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="rounded-full relative"
            style={{ backgroundColor: "#F5F5F5", borderColor: "#E0E0E0", color: "#293F55" }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge
                className="ml-2 rounded-full h-5 w-5 flex items-center justify-center p-0"
                style={{ backgroundColor: "#72ADFD", color: "white" }}
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] max-h-[600px] overflow-y-auto" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg" style={{ color: "#293F55" }}>
                Filter Transactions
              </h3>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm">
                  Clear All
                </Button>
              )}
            </div>

            <Separator />

            {/* Filter Presets */}
            {filterPresets.length > 0 && (
              <>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Saved Filters</Label>
                  <div className="space-y-2">
                    {filterPresets.map((preset) => (
                      <div key={preset.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadPreset(preset)}
                          className="flex-1 justify-start"
                        >
                          {preset.name}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deletePreset(preset.id)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Date Range */}
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Range
              </Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {Object.entries(DATE_PRESETS).map(([key, preset]) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => applyDatePreset(key as keyof typeof DATE_PRESETS)}
                    className="text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-500">From</Label>
                  <Input
                    type="date"
                    value={localFilters.dateFrom || ""}
                    onChange={(e) => setLocalFilters({ ...localFilters, dateFrom: e.target.value || null })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">To</Label>
                  <Input
                    type="date"
                    value={localFilters.dateTo || ""}
                    onChange={(e) => setLocalFilters({ ...localFilters, dateTo: e.target.value || null })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Categories */}
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Categories
              </Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={localFilters.categoryIds?.includes(category.id) || false}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {category.icon} {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Amount Range */}
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Amount Range
              </Label>
              <div className="space-y-3">
                <Slider
                  min={0}
                  max={10000}
                  step={100}
                  value={amountRange}
                  onValueChange={setAmountRange}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>₱{amountRange[0]}</span>
                  <span>₱{amountRange[1]}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Wallets */}
            {wallets.length > 0 && (
              <>
                <div>
                  <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <WalletIcon className="h-4 w-4" />
                    E-Wallets
                  </Label>
                  <div className="space-y-2">
                    {wallets.map((wallet) => (
                      <div key={wallet.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`wallet-${wallet.id}`}
                          checked={localFilters.walletIds?.includes(wallet.id) || false}
                          onCheckedChange={() => toggleWallet(wallet.id)}
                        />
                        <label
                          htmlFor={`wallet-${wallet.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {wallet.wallet_type.toUpperCase()} - {wallet.account_name}
                          {wallet.is_primary && <Badge className="ml-2 text-xs">Primary</Badge>}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Save Preset */}
            <div>
              {!showPresetInput ? (
                <Button variant="outline" size="sm" onClick={() => setShowPresetInput(true)} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Current Filters
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Preset name..."
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && savePreset()}
                  />
                  <Button onClick={savePreset} size="sm">
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowPresetInput(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Apply Button */}
            <Button onClick={applyFilters} className="w-full" style={{ backgroundColor: "#72ADFD" }}>
              Apply Filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Badges */}
      {filterDescriptions.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap w-full">
          {filterDescriptions.map((desc, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: "#E8F4FF", color: "#293F55" }}
            >
              {desc}
            </Badge>
          ))}
        </div>
      )}

      {/* Result Count */}
      {totalCount !== undefined && filteredCount !== undefined && (
        <div className="text-sm text-gray-500 w-full">
          Showing {filteredCount} of {totalCount} transactions
        </div>
      )}
    </div>
  )
}
