'use client'

import { useTranslation } from '@/lib/vet-clinic-hooks'
import { useState, useMemo } from 'react'
import {
  Search,
  Package,
  AlertTriangle,
  Clock,
  TrendingDown,
  DollarSign,
  PackageX,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Topbar } from '@/components/vet/topbar'
import { cn } from '@/lib/utils'
import { useInventory } from '@/lib/vet-hooks'
import { formatCurrency, formatDate, daysUntil } from '@/lib/vet-data'
import { NewInventoryItemDialog } from '@/components/vet/new-entity-dialogs'

const CATEGORIES = ['Todos', 'Medicamento', 'Alimento', 'Insumo médico', 'Accesorio', 'Higiene'] as const

const CATEGORY_STYLES: Record<string, string> = {
  'Medicamento': 'bg-rose-100 text-rose-700 border-rose-200',
  'Alimento': 'bg-amber-100 text-amber-700 border-amber-200',
  'Insumo médico': 'bg-sky-100 text-sky-700 border-sky-200',
  'Accesorio': 'bg-violet-100 text-violet-700 border-violet-200',
  'Higiene': 'bg-teal-100 text-teal-700 border-teal-200',
}

export function InventoryView() {
  const { data: inventory = [], isLoading } = useInventory(); const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('Todos')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)
  const [showNewItem, setShowNewItem] = useState(false)

  const filtered = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.supplier.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'Todos' || item.category === category
      const matchesLowStock = !showLowStockOnly || item.stock <= item.minStock
      return matchesSearch && matchesCategory && matchesLowStock
    })
  }, [inventory, search, category, showLowStockOnly])

  const totalValue = inventory.reduce((sum, i) => sum + i.stock * i.price, 0)
  const lowStockCount = inventory.filter(i => i.stock <= i.minStock).length
  const expiringCount = inventory.filter(
    i => i.expiryDate && daysUntil(i.expiryDate) <= 90 && daysUntil(i.expiryDate) > 0
  ).length
  const expiredCount = inventory.filter(
    i => i.expiryDate && daysUntil(i.expiryDate) < 0
  ).length

  const stats = [
    { label: 'Productos totales', value: inventory.length, icon: Package, color: 'emerald' },
    { label: 'Valor del stock', value: formatCurrency(totalValue), icon: DollarSign, color: 'amber' },
    { label: 'Stock bajo', value: lowStockCount, icon: TrendingDown, color: 'rose', action: () => setShowLowStockOnly(true) },
    { label: 'Por vencer (90d)', value: expiringCount, icon: Clock, color: 'orange' },
  ]

  const statStyles: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
    orange: 'bg-orange-50 text-orange-700 ring-orange-200',
  }

  if (isLoading) {
    return (
      <div>
        <Topbar title="Inventario" subtitle="Cargando..." />
        <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Card key={i}><CardContent className="h-32 bg-muted animate-pulse" /></Card>)}
        </div>
      </div>
    )
  }

  return (
    <div>
      <Topbar moduleKey="inventory" title="Inventario" subtitle={t("inv.subtitle")} actionLabel="Nuevo producto" onAction={() => setShowNewItem(true)} />

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(stat => {
            const Icon = stat.icon
            return (
              <Card
                key={stat.label}
                className={cn(stat.action && 'cursor-pointer hover:shadow-md transition-shadow')}
                onClick={stat.action}
              >
                <CardContent className="p-4">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg ring-1 mb-3', statStyles[stat.color])}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-[12px] text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {expiredCount > 0 && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 flex items-center gap-3">
            <PackageX className="h-5 w-5 text-rose-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-rose-700">
                {expiredCount} producto(s) vencido(s) detectado(s)
              </p>
              <p className="text-[12px] text-rose-600">Revisa y retira del stock</p>
            </div>
          </div>
        )}

        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("inv.searchByName")}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={showLowStockOnly ? 'default' : 'outline'}
                className={cn('h-8', showLowStockOnly && 'bg-rose-600 hover:bg-rose-700')}
                onClick={() => setShowLowStockOnly(s => !s)}
              >
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                Solo stock bajo
              </Button>
              {CATEGORIES.map(c => (
                <Button
                  key={c}
                  size="sm"
                  variant={category === c ? 'default' : 'outline'}
                  className={cn('h-8', category === c && 'bg-emerald-600 hover:bg-emerald-700')}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-[11px] uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Producto</th>
                    <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Categoría</th>
                    <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Proveedor</th>
                    <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Lote</th>
                    <th className="px-4 py-3 text-center font-medium">Stock</th>
                    <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Vencimiento</th>
                    <th className="px-4 py-3 text-right font-medium">Valor</th>
                    <th className="px-4 py-3 text-right font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
                        No se encontraron productos
                      </td>
                    </tr>
                  ) : (
                    filtered.map(item => {
                      const stockPct = (item.stock / (item.minStock * 3)) * 100
                      const isLow = item.stock <= item.minStock
                      const expDays = item.expiryDate ? daysUntil(item.expiryDate) : null
                      const isExpired = expDays !== null && expDays < 0
                      const isExpiringSoon = expDays !== null && expDays >= 0 && expDays <= 90
                      const totalValue = item.stock * item.price
                      return (
                        <tr key={item.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-foreground">{item.name}</p>
                              <p className="text-[11px] text-muted-foreground">{item.unit}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <Badge variant="outline" className={cn('text-[10px]', CATEGORY_STYLES[item.category])}>
                              {item.category}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell text-[12px] text-muted-foreground">
                            {item.supplier}
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell text-[12px] font-mono text-muted-foreground">
                            {item.lot}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="inline-block min-w-[60px]">
                              <p className={cn('font-semibold', isLow ? 'text-rose-600' : 'text-foreground')}>
                                {item.stock}
                              </p>
                              <Progress
                                value={Math.min(stockPct, 100)}
                                className={cn('h-1.5 mt-1', isLow && '[&>div]:bg-rose-500')}
                              />
                              <p className="text-[10px] text-muted-foreground mt-0.5">min: {item.minStock}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {item.expiryDate ? (
                              <div>
                                <p className="text-[12px] text-foreground">{formatDate(item.expiryDate)}</p>
                                {isExpired ? (
                                  <Badge variant="destructive" className="text-[10px] mt-0.5">Vencido</Badge>
                                ) : isExpiringSoon ? (
                                  <Badge variant="outline" className="text-[10px] mt-0.5 bg-amber-50 text-amber-700 border-amber-200">
                                    {expDays}d
                                  </Badge>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground">{expDays}d</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="font-medium text-foreground">{formatCurrency(totalValue)}</p>
                            <p className="text-[10px] text-muted-foreground">{formatCurrency(item.price)}/u</p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {isLow ? (
                              <Badge variant="destructive" className="text-[10px]">Reponer</Badge>
                            ) : isExpired ? (
                              <Badge variant="destructive" className="text-[10px]">Vencido</Badge>
                            ) : isExpiringSoon ? (
                              <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                                <Clock className="h-3 w-3 mr-1" /> Próximo
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                                OK
                              </Badge>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <NewInventoryItemDialog open={showNewItem} onOpenChange={setShowNewItem} />
    </div>
  )
}
