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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, FileText, TrendingUp, Target, Receipt } from "lucide-react"
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns"
import type { ReportType, ReportPeriod, ExportFormat } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ReportBuilderDialogProps {
  onGenerateReport: (options: ReportBuilderOptions) => void
  trigger?: React.ReactNode
}

interface ReportBuilderOptions {
  reportType: ReportType
  period: ReportPeriod
  format: ExportFormat
  customDateRange?: {
    from: string
    to: string
  }
  includeCharts: boolean
  includeInsights: boolean
}

export function ReportBuilderDialog({ onGenerateReport, trigger }: ReportBuilderDialogProps) {
  const [open, setOpen] = useState(false)
  const [reportType, setReportType] = useState<ReportType>("monthly_summary")
  const [period, setPeriod] = useState<ReportPeriod>("this_month")
  const [format, setFormat] = useState<ExportFormat>("pdf")
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeInsights, setIncludeInsights] = useState(true)
  const [customDateFrom, setCustomDateFrom] = useState<Date>()
  const [customDateTo, setCustomDateTo] = useState<Date>()

  const handleGenerate = () => {
    const options: ReportBuilderOptions = {
      reportType,
      period,
      format,
      includeCharts,
      includeInsights,
    }

    if (period === "custom" && customDateFrom && customDateTo) {
      options.customDateRange = {
        from: format(customDateFrom, "yyyy-MM-dd"),
        to: format(customDateTo, "yyyy-MM-dd"),
      }
    }

    onGenerateReport(options)
    setOpen(false)
  }

  const getReportIcon = (type: ReportType) => {
    switch (type) {
      case "monthly_summary":
        return <FileText className="h-5 w-5" />
      case "category_analysis":
        return <TrendingUp className="h-5 w-5" />
      case "goal_progress":
        return <Target className="h-5 w-5" />
      case "tax_report":
        return <Receipt className="h-5 w-5" />
      case "transactions":
        return <FileText className="h-5 w-5" />
    }
  }

  const getReportDescription = (type: ReportType) => {
    switch (type) {
      case "monthly_summary":
        return "Overview of income, expenses, savings, and top categories"
      case "category_analysis":
        return "Detailed breakdown of spending trends by category"
      case "goal_progress":
        return "Progress tracking for all your financial goals"
      case "tax_report":
        return "Income sources and deductible expenses for tax preparation"
      case "transactions":
        return "Complete list of all transactions with filters"
    }
  }

  const reportTypes: ReportType[] = [
    "monthly_summary",
    "category_analysis",
    "goal_progress",
    "tax_report",
    "transactions",
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Builder</DialogTitle>
          <DialogDescription>
            Create custom financial reports with your preferred data and format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Report Type Selection */}
          <div className="space-y-3">
            <Label>Report Type</Label>
            <RadioGroup
              value={reportType}
              onValueChange={(value) => setReportType(value as ReportType)}
            >
              {reportTypes.map((type) => (
                <div
                  key={type}
                  className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => setReportType(type)}
                >
                  <RadioGroupItem value={type} id={type} className="mt-1" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {getReportIcon(type)}
                      <Label htmlFor={type} className="font-semibold cursor-pointer capitalize">
                        {type.replace(/_/g, " ")}
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">{getReportDescription(type)}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Period Selection */}
          <div className="space-y-3">
            <Label>Time Period</Label>
            <Select value={period} onValueChange={(value) => setPeriod(value as ReportPeriod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
                <SelectItem value="last_year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {/* Custom Date Range */}
            {period === "custom" && (
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="space-y-2">
                  <Label className="text-sm">From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !customDateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customDateFrom ? format(customDateFrom, "MMM dd, yyyy") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={customDateFrom}
                        onSelect={setCustomDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !customDateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customDateTo ? format(customDateTo, "MMM dd, yyyy") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={customDateTo}
                        onSelect={setCustomDateTo}
                        initialFocus
                        disabled={(date) => customDateFrom ? date < customDateFrom : false}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <Select value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF - Formatted Report</SelectItem>
                <SelectItem value="xlsx">Excel - Multi-sheet Workbook</SelectItem>
                <SelectItem value="csv">CSV - Simple Data Export</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Report Options */}
          <div className="space-y-3">
            <Label>Report Options</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCharts"
                  checked={includeCharts}
                  onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                  disabled={format === "csv"}
                />
                <Label
                  htmlFor="includeCharts"
                  className={cn(
                    "text-sm font-normal cursor-pointer",
                    format === "csv" && "text-muted-foreground"
                  )}
                >
                  Include charts and visualizations {format === "csv" && "(Not available for CSV)"}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeInsights"
                  checked={includeInsights}
                  onCheckedChange={(checked) => setIncludeInsights(checked as boolean)}
                />
                <Label htmlFor="includeInsights" className="text-sm font-normal cursor-pointer">
                  Include AI-powered insights and recommendations
                </Label>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">Report Preview</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Report: {reportType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</p>
              <p>
                • Period:{" "}
                {period === "custom" && customDateFrom && customDateTo
                  ? `${format(customDateFrom, "MMM dd, yyyy")} - ${format(customDateTo, "MMM dd, yyyy")}`
                  : period.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </p>
              <p>• Format: {format.toUpperCase()}</p>
              <p>
                • Options: {includeCharts && format !== "csv" ? "Charts" : ""}
                {includeCharts && format !== "csv" && includeInsights ? ", " : ""}
                {includeInsights ? "Insights" : ""}
                {!includeCharts && !includeInsights ? "Basic report only" : ""}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate}>
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
