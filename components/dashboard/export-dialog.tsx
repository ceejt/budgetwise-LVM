"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileSpreadsheet, FileText, File } from "lucide-react"
import type { ExportFormat } from "@/lib/types"

interface ExportDialogProps {
  onExport: (format: ExportFormat, options: ExportOptions) => void
  trigger?: React.ReactNode
  exportType?: "transactions" | "categories" | "goals" | "bills" | "complete"
}

interface ExportOptions {
  includeFilters?: boolean
  includeMetadata?: boolean
}

export function ExportDialog({
  onExport,
  trigger,
  exportType = "transactions",
}: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [format, setFormat] = useState<ExportFormat>("csv")
  const [includeFilters, setIncludeFilters] = useState(true)
  const [includeMetadata, setIncludeMetadata] = useState(true)

  const handleExport = () => {
    onExport(format, {
      includeFilters,
      includeMetadata,
    })
    setOpen(false)
  }

  const getFormatIcon = (formatType: ExportFormat) => {
    switch (formatType) {
      case "csv":
        return <File className="h-5 w-5" />
      case "xlsx":
        return <FileSpreadsheet className="h-5 w-5" />
      case "pdf":
        return <FileText className="h-5 w-5" />
    }
  }

  const getFormatDescription = (formatType: ExportFormat) => {
    switch (formatType) {
      case "csv":
        return "Comma-separated values - Compatible with Excel, Google Sheets, and most tools"
      case "xlsx":
        return "Excel workbook - Multiple sheets with formatted data and formulas"
      case "pdf":
        return "PDF document - Professional formatted report with tables and charts"
    }
  }

  const getExportTitle = () => {
    switch (exportType) {
      case "transactions":
        return "Export Transactions"
      case "categories":
        return "Export Categories"
      case "goals":
        return "Export Goals"
      case "bills":
        return "Export Bills"
      case "complete":
        return "Export Complete Financial Report"
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getExportTitle()}</DialogTitle>
          <DialogDescription>
            Choose your preferred export format and options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
              {["csv", "xlsx", "pdf"].map((formatOption) => (
                <div
                  key={formatOption}
                  className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => setFormat(formatOption as ExportFormat)}
                >
                  <RadioGroupItem value={formatOption} id={formatOption} className="mt-1" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {getFormatIcon(formatOption as ExportFormat)}
                      <Label htmlFor={formatOption} className="font-semibold cursor-pointer">
                        {formatOption.toUpperCase()}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getFormatDescription(formatOption as ExportFormat)}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <Label>Export Options</Label>
            <div className="space-y-3">
              {exportType === "transactions" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeFilters"
                    checked={includeFilters}
                    onCheckedChange={(checked) => setIncludeFilters(checked as boolean)}
                  />
                  <Label htmlFor="includeFilters" className="text-sm font-normal cursor-pointer">
                    Apply current filters to export
                  </Label>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeMetadata"
                  checked={includeMetadata}
                  onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
                />
                <Label htmlFor="includeMetadata" className="text-sm font-normal cursor-pointer">
                  Include metadata (generated date, totals, etc.)
                </Label>
              </div>
            </div>
          </div>

          {/* Preview info */}
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-start gap-2">
              <Download className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Ready to export</p>
                <p className="text-xs text-muted-foreground">
                  {format === "csv" && "File will be downloaded as a CSV file compatible with spreadsheet applications."}
                  {format === "xlsx" && exportType === "complete" && "File will contain multiple sheets with all your financial data."}
                  {format === "xlsx" && exportType !== "complete" && "File will be downloaded as an Excel workbook with formatted data."}
                  {format === "pdf" && "File will be downloaded as a professionally formatted PDF report."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export {format.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
