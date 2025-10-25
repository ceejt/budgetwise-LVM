'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import type { Transaction, TransactionFilters, TransactionSort, ExportFormat } from '@/lib/types'
import { TransactionFiltersComponent } from './transaction-filters'
import { buildTransactionQuery } from '@/lib/utils/filter-builder'
import { format } from 'date-fns'

// Lazy load dialogs - only loaded when user interacts
const AddTransactionDialog = dynamic(
  () => import('./add-transaction-dialog').then((mod) => ({ default: mod.AddTransactionDialog })),
  { ssr: false }
)
const ExportDialog = dynamic(
  () => import('./export-dialog').then((mod) => ({ default: mod.ExportDialog })),
  { ssr: false }
)

interface IncomeSectionProps {
  userId: string
}

export function IncomeSection({ userId }: IncomeSectionProps) {
  const [income, setIncome] = useState<Transaction[]>([])
  const [filteredIncome, setFilteredIncome] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [filteredTotal, setFilteredTotal] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [filters, setFilters] = useState<TransactionFilters>({
    dateFrom: null,
    dateTo: null,
    categoryIds: [],
    amountMin: null,
    amountMax: null,
    walletIds: [],
    searchQuery: null,
  })
  const [sort, setSort] = useState<TransactionSort>({
    field: 'date',
    order: 'desc',
  })
  const supabase = createClient()

  useEffect(() => {
    fetchIncome()
    fetchTotalCount()
  }, [userId])

  useEffect(() => {
    fetchFilteredIncome()
  }, [userId, filters, sort])

  const fetchIncome = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'income')

    if (data) {
      setIncome(data)
      const sum = data.reduce((acc, curr) => acc + Number(curr.amount), 0)
      setTotal(sum)
    }
  }

  const fetchFilteredIncome = async () => {
    const query = buildTransactionQuery(supabase, userId, 'income', filters, sort)

    const { data } = await query

    if (data) {
      setFilteredIncome(data)
      const sum = data.reduce((acc, curr) => acc + Number(curr.amount), 0)
      setFilteredTotal(sum)
    }
  }

  const fetchTotalCount = async () => {
    const { count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('type', 'income')

    if (count !== null) setTotalCount(count)
  }

  const handleExport = async (
    exportFormat: ExportFormat,
    options: { includeFilters?: boolean; includeMetadata?: boolean }
  ) => {
    // Fetch all income (or filtered) for export
    const exportQuery = buildTransactionQuery(
      supabase,
      userId,
      'income',
      options.includeFilters ? filters : {},
      sort,
      undefined // No limit for export
    )

    const { data } = await exportQuery
    if (!data || data.length === 0) {
      alert('No income to export')
      return
    }

    const filename = `income_${format(new Date(), 'yyyy-MM-dd')}`

    // Lazy load export utilities - only when user actually exports
    switch (exportFormat) {
      case 'csv': {
        const { exportTransactionsToCSV } = await import('@/lib/utils/export-csv')
        exportTransactionsToCSV(data, filename)
        break
      }
      case 'xlsx': {
        const { exportTransactionsToExcel } = await import('@/lib/utils/export-xlsx')
        exportTransactionsToExcel(data, filename)
        break
      }
      case 'pdf': {
        const { exportTransactionsToPDF } = await import('@/lib/utils/export-pdf')
        const dateRange = filters.dateFrom && filters.dateTo
          ? { from: filters.dateFrom, to: filters.dateTo }
          : undefined
        exportTransactionsToPDF(data, {
          title: 'Income Report',
          dateRange,
          includeMetadata: options.includeMetadata,
        })
        break
      }
    }
  }

  const scholarshipAmount = income.find((i) => i.category_name === 'Scholarship')?.amount || 0
  const allowanceAmount = income.find((i) => i.category_name === 'Allowance')?.amount || 0
  const otherAmount = total - scholarshipAmount - allowanceAmount

  const scholarshipPercent = total > 0 ? (scholarshipAmount / total) * 100 : 0
  const allowancePercent = total > 0 ? (allowanceAmount / total) * 100 : 0

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold" style={{ color: '#293F55' }}>
          Cash Inflow
        </h2>
        <div className="flex gap-2">
          <ExportDialog onExport={handleExport} exportType="transactions" />
          <AddTransactionDialog
            userId={userId}
            type="income"
            onSuccess={() => {
              fetchIncome()
              fetchFilteredIncome()
            }}
          />
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="mb-4">
        <TransactionFiltersComponent
          userId={userId}
          filters={filters}
          sort={sort}
          onFiltersChange={setFilters}
          onSortChange={setSort}
          totalCount={totalCount}
          filteredCount={filteredIncome.length}
        />
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-1">
          {filters.dateFrom ||
          filters.dateTo ||
          (filters.categoryIds && filters.categoryIds.length > 0)
            ? 'Filtered Total'
            : 'Total'}
        </div>
        <div className="text-3xl font-bold" style={{ color: '#293F55' }}>
          ₱ {filteredTotal.toFixed(0)}
        </div>
        {(filters.dateFrom ||
          filters.dateTo ||
          (filters.categoryIds && filters.categoryIds.length > 0)) && (
          <div className="text-sm text-gray-400 mt-1">All-time total: ₱ {total.toFixed(0)}</div>
        )}
      </div>
      {total > 0 && (
        <>
          <div className="flex h-8 rounded-full overflow-hidden mb-4">
            {scholarshipAmount > 0 && (
              <div
                className="flex items-center justify-center text-white text-sm font-medium"
                style={{
                  width: `${scholarshipPercent}%`,
                  backgroundColor: '#72ADFD',
                }}
              >
                {scholarshipPercent.toFixed(0)}%
              </div>
            )}
            {allowanceAmount > 0 && (
              <div
                className="flex items-center justify-center text-white text-sm font-medium"
                style={{
                  width: `${allowancePercent}%`,
                  backgroundColor: '#293F55',
                }}
              >
                {allowancePercent.toFixed(0)}%
              </div>
            )}
          </div>
          <div className="space-y-2">
            {scholarshipAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Scholarship</span>
                <span className="font-semibold" style={{ color: '#293F55' }}>
                  ₱ {scholarshipAmount.toFixed(0)}
                </span>
              </div>
            )}
            {allowanceAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Allowance</span>
                <span className="font-semibold" style={{ color: '#293F55' }}>
                  ₱ {allowanceAmount.toFixed(0)}
                </span>
              </div>
            )}
            {otherAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Other</span>
                <span className="font-semibold" style={{ color: '#293F55' }}>
                  ₱ {otherAmount.toFixed(0)}
                </span>
              </div>
            )}
          </div>
        </>
      )}
      {total === 0 && (
        <div className="text-center py-4 text-gray-500">
          No cash inflow added yet. Click "Add Items" to get started!
        </div>
      )}
    </div>
  )
}
