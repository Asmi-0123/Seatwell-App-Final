"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react"
import type { Game, Ticket } from "@shared/schema"

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 2,
  }).format(amount / 100)

interface EnhancedSeatSelectionProps {
  isOpen: boolean
  onClose: () => void
  game: Game | null
  onAction: (payload: any[]) => void
  mode: "buyer" | "seller"
}

interface Seat {
  id: string
  price: number
  available: boolean
  ticketId?: number
  section: string
  row: number
  seatNumber: number
}

export function EnhancedSeatSelection({ isOpen, onClose, game, onAction, mode }: EnhancedSeatSelectionProps) {
  const [realTickets, setRealTickets] = useState<Ticket[]>([])
  const [seats, setSeats] = useState<Seat[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [expandedRow, setExpandedRow] = useState<number | null>(null) 

  useEffect(() => {
    if (game) {
      axios
        .get<Ticket[]>(`/api/tickets/game/${game.id}`)
        .then((res) => {
          setRealTickets(res.data)
          setSeats(generateArenaLayout(res.data))
        })
        .catch((err) => {
          console.error("Failed to fetch tickets:", err)
        })
    }
  }, [game])

  const generateArenaLayout = (tickets: Ticket[]): Seat[] => {
    const layout: Seat[] = []
    const getDefaultPrice = (section: string) => {
      const sectionNum = Number.parseInt(section)
      if (sectionNum >= 101 && sectionNum <= 140) return 9500
      if (sectionNum >= 201 && sectionNum <= 240) return 7500
      return 6000
    }

    const allSections = [
      ...Array.from({ length: 40 }, (_, i) => ({
        name: (101 + i).toString(),
        rows: 15,
        seatsPerRow: 20,
        tier: "lower",
      })),
      ...Array.from({ length: 40 }, (_, i) => ({
        name: (201 + i).toString(),
        rows: 12,
        seatsPerRow: 16,
        tier: "upper",
      })),
    ]

    allSections.forEach((section) => {
      for (let row = 1; row <= section.rows; row++) {
        for (let seat = 1; seat <= section.seatsPerRow; seat++) {
          const seatId = `${section.name}-${row}-${seat}`
          const ticket = tickets.find((t) => t.seatNumber === seatId)
          let available = false
          let price = getDefaultPrice(section.name)
          let ticketId: number | undefined = undefined

          if (ticket) {
            price = ticket.price
          }

          if (mode === "buyer") {
            if (ticket && ticket.status === "available") {
              available = true
              ticketId = ticket.id
            }
          } else {
            if (!ticket || ticket.status !== "available") {
              available = true
            }
          }

          layout.push({
            id: seatId,
            price,
            available,
            ticketId,
            section: section.name,
            row,
            seatNumber: seat,
          })
        }
      }
    })

    return layout
  }

  const toggleSeat = (seatId: string) => {
    const newSet = new Set(selected)
    if (newSet.has(seatId)) {
      newSet.delete(seatId)
    } else {
      newSet.add(seatId)
    }
    setSelected(newSet)
  }

  const getTotalPrice = () => {
    return Array.from(selected).reduce((sum, seatId) => {
      const seat = seats.find((s) => s.id === seatId)
      return sum + (seat?.price ?? 0)
    }, 0)
  }

  const getSectionType = (sectionNum: number) => {
    if (sectionNum >= 101 && sectionNum <= 105) return "front-row"
    if (sectionNum >= 106 && sectionNum <= 120) return "preferred"
    if (sectionNum >= 121 && sectionNum <= 140) return "club"
    if (sectionNum >= 201 && sectionNum <= 240) return "upper"
    return "preferred"
  }

  const getSectionColor = (sectionType: string, hasAvailable: boolean, isSelected: boolean) => {
    if (!hasAvailable) return "bg-gray-300 text-gray-600 cursor-not-allowed border-gray-400"
    if (isSelected) return "bg-blue-600 text-white border-blue-800"

    
    return "bg-green-600 text-white hover:bg-green-700 border-green-800"
  }

  const renderArenaSection = (sectionName: string, angle: number, radius: number, isUpper = false) => {
  const sectionNum = Number.parseInt(sectionName)
  const sectionSeats = seats.filter((s) => s.section === sectionName)
  const sectionType = getSectionType(sectionNum)


  const x = 50 + Math.cos(angle) * radius
  const y = 50 + Math.sin(angle) * radius

  const availableCount = sectionSeats.filter((s) => s.available).length
  const selectedCount = sectionSeats.filter((s) => selected.has(s.id)).length
  const hasAvailable = availableCount > 0
  const isSectionSelected = selectedSection === sectionName


  const sectionBgClass = () => {
    if (!hasAvailable) return "bg-gray-300 text-gray-600 cursor-not-allowed border-gray-400"
    if (isSectionSelected) return "bg-blue-600 text-white border-blue-800"
    return "bg-green-600 text-white hover:bg-green-700 border-green-800"
  }

  return (
    <div
      key={sectionName}
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-105 text-white font-bold shadow-lg border-2 ${sectionBgClass()}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) rotate(${angle * (180 / Math.PI) + 90}deg)`,
        transformOrigin: "center center",
        borderRadius: "8px",
        padding: "8px 6px",
        fontSize: "12px",
        boxShadow: `0 0 0 1px rgba(255,255,255,0.2) inset, 0 2px 4px rgba(0,0,0,0.2)`,
      }}
      onClick={() => {
        if (hasAvailable) {
          setSelectedSection(sectionName)
          setExpandedRow(null)
        }
      }}
      title={`Section ${sectionName} - ${availableCount} available seats`}
    >
      <div className="text-center" style={{ transform: `rotate(-${angle * (180 / Math.PI) + 90}deg)` }}>
        {selectedCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border border-white">
            {selectedCount}
          </div>
        )}
        {sectionName}
      </div>
    </div>
  )
}


  const renderIceRink = () => {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative bg-white border-4 border-red-600 shadow-lg"
          style={{
            width: "380px",
            height: "200px",
            borderRadius: "100px",
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        >
          
          <div className="absolute inset-2 bg-blue-50 overflow-hidden" style={{ borderRadius: "90px" }}>
            
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-red-500 transform -translate-x-1/2"></div>

            
            <div className="absolute left-1/2 top-1/2 w-20 h-20 border-2 border-blue-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

            
            <div className="absolute left-1/4 top-1/3 w-8 h-8 border-2 border-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute right-1/4 top-1/3 w-8 h-8 border-2 border-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute left-1/4 bottom-1/3 w-8 h-8 border-2 border-red-500 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
            <div className="absolute right-1/4 bottom-1/3 w-8 h-8 border-2 border-red-500 rounded-full transform translate-x-1/2 translate-y-1/2"></div>

            
            <div className="absolute left-2 top-1/2 w-8 h-16 border-2 border-red-500 rounded-r-lg transform -translate-y-1/2"></div>
            <div className="absolute right-2 top-1/2 w-8 h-16 border-2 border-red-500 rounded-l-lg transform -translate-y-1/2"></div>

            
            <div className="absolute left-1/2 top-1/2 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 border-2 border-gray-400">
              <span className="text-sm font-bold">🏒</span>
            </div>
            
            <div className="absolute bottom-4 left-1/4 text-xs font-bold text-gray-700">Away</div>
            <div className="absolute bottom-4 right-1/4 text-xs font-bold text-gray-700">Home</div>
          </div>
        </div>
      </div>
    )
  }

  const renderSectionDetail = () => {
    if (!selectedSection) return null

    const sectionSeats = seats.filter((s) => s.section === selectedSection)
    const sectionRows = Array.from(new Set(sectionSeats.map((s) => s.row))).sort((a, b) => a - b)

    return (
      <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedSection(null)
                setExpandedRow(null)
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to arena
            </Button>
            <h3 className="text-lg font-bold">Section {selectedSection}</h3>
          </div>
          <div className="text-sm text-gray-600">{sectionSeats.filter((s) => s.available).length} available seats</div>
        </div>

        <div className="space-y-3">
          {sectionRows.map((rowNum) => {
            const rowSeats = seats.filter((s) => s.section === selectedSection && s.row === rowNum)
            const availableInRow = rowSeats.filter((s) => s.available).length
            const selectedInRow = rowSeats.filter((s) => selected.has(s.id)).length
            const isRowExpanded = expandedRow === rowNum

            return (
              <div key={rowNum} className="border rounded-md overflow-hidden">
                <div
                  className={`flex items-center justify-between p-3 cursor-pointer ${
                    availableInRow === 0 ? "bg-gray-100 text-gray-500" : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    if (availableInRow > 0) {
                      setExpandedRow(isRowExpanded ? null : rowNum)
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm w-12">Row {rowNum}</span>
                    <span className="text-xs text-gray-600">
                      {availableInRow} available seat{availableInRow !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedInRow > 0 && (
                      <Badge variant="secondary" className="text-xs bg-blue-500 text-white">
                        {selectedInRow} selected
                      </Badge>
                    )}
                    {availableInRow > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation() 
                          const newSelected = new Set(selected)
                          const currentAvailableRowSeats = rowSeats.filter((s) => s.available)
                          if (selectedInRow === availableInRow) {
                            currentAvailableRowSeats.forEach((s) => newSelected.delete(s.id))
                          } else {
                            currentAvailableRowSeats.forEach((s) => newSelected.add(s.id))
                          }
                          setSelected(newSelected)
                        }}
                      >
                        {selectedInRow === availableInRow ? "Deselect all" : "Select all"}
                      </Button>
                    )}
                    {availableInRow > 0 &&
                      (isRowExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ))}
                  </div>
                </div>
                {isRowExpanded && (
                  <div className="p-3 border-t bg-white">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {rowSeats
                        .sort((a, b) => a.seatNumber - b.seatNumber)
                        .map((seat) => (
                          <button
                            key={seat.id}
                            className={`w-8 h-8 text-xs font-bold rounded border-2 transition-all ${
                              selected.has(seat.id)
                                ? "bg-blue-500 text-white border-blue-700" 
                                : seat.available
                                  ? "bg-green-500 text-white border-green-700 hover:bg-green-600" 
                                  : "bg-red-500 text-white border-red-700 cursor-not-allowed opacity-70" 
                            }`}
                            onClick={() => seat.available && toggleSeat(seat.id)}
                            title={`Seat ${seat.seatNumber} - ${formatPrice(seat.price)}`}
                            disabled={!seat.available}
                          >
                            {seat.seatNumber}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (!game) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {game.homeTeam} vs {game.awayTeam} - Vaudoise Arena
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!selectedSection ? (
            <>
              
              <div
                className="relative mx-auto bg-gray-800 border-4 border-gray-900 shadow-2xl"
                style={{
                  width: "900px",
                  height: "650px",
                  borderRadius: "45%",
                  background: "linear-gradient(135deg, #333 0%, #222 100%)",
                  boxShadow: "0 15px 30px rgba(0,0,0,0.4), 0 8px 8px rgba(0,0,0,0.3)",
                }}
              >
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="relative bg-white border-4 border-red-600 shadow-lg"
                    style={{
                      width: "380px",
                      height: "200px",
                      borderRadius: "100px",
                      background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    
                    <div className="absolute inset-2 bg-blue-50 overflow-hidden" style={{ borderRadius: "90px" }}>
                      
                      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-red-500 transform -translate-x-1/2"></div>

                      
                      <div className="absolute left-1/2 top-1/2 w-20 h-20 border-2 border-blue-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

                      
                      <div className="absolute left-1/4 top-1/3 w-8 h-8 border-2 border-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                      <div className="absolute right-1/4 top-1/3 w-8 h-8 border-2 border-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
                      <div className="absolute left-1/4 bottom-1/3 w-8 h-8 border-2 border-red-500 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
                      <div className="absolute right-1/4 bottom-1/3 w-8 h-8 border-2 border-red-500 rounded-full transform translate-x-1/2 translate-y-1/2"></div>

                      
                      <div className="absolute left-2 top-1/2 w-8 h-16 border-2 border-red-500 rounded-r-lg transform -translate-y-1/2"></div>
                      <div className="absolute right-2 top-1/2 w-8 h-16 border-2 border-red-500 rounded-l-lg transform -translate-y-1/2"></div>

                      
                      <div className="absolute left-1/2 top-1/2 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 border-2 border-gray-400">
                        <span className="text-sm font-bold">🏒</span>
                      </div>
                      
                      <div className="absolute bottom-4 left-1/4 text-xs font-bold text-gray-700">Away</div>
                      <div className="absolute bottom-4 right-1/4 text-xs font-bold text-gray-700">Home</div>
                    </div>
                  </div>
                </div>

                
                {Array.from({ length: 40 }, (_, i) => {
                  const sectionNum = 101 + i
                  const angle = (i / 40) * 2 * Math.PI - Math.PI / 2
                  return renderArenaSection(sectionNum.toString(), angle, 32, false)
                })}

                
                {Array.from({ length: 40 }, (_, i) => {
                  const sectionNum = 201 + i
                  const angle = (i / 40) * 2 * Math.PI - Math.PI / 2
                  return renderArenaSection(sectionNum.toString(), angle, 45, true)
                })}
              </div>

              
              <div className="text-center text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border">
                <p className="font-medium mb-2">How to select seats:</p>
                <p>Click on any section number to view available seats and select individual seats or entire rows.</p>
              </div>
            </>
          ) : (
            renderSectionDetail()
          )}

          
          {selected.size > 0 && (
            <div className="bg-gray-50 p-5 rounded-lg border shadow-sm">
              <h4 className="font-semibold mb-3 text-lg">Selected Seats ({selected.size})</h4>

              
              {Object.entries(
                Array.from(selected).reduce(
                  (acc, seatId) => {
                    const seat = seats.find((s) => s.id === seatId)
                    if (seat) {
                      if (!acc[seat.section]) acc[seat.section] = []
                      acc[seat.section].push(seat)
                    }
                    return acc
                  },
                  {} as Record<string, typeof seats>,
                ),
              ).map(([section, sectionSeats]) => (
                <div key={section} className="mb-3">
                  <h5 className="font-medium text-sm text-gray-600 mb-2">Section {section}</h5>
                  <div className="flex flex-wrap gap-2">
                    {sectionSeats.map((seat) => (
                      <Badge
                        key={seat.id}
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => toggleSeat(seat.id)}
                      >
                        Row {seat.row}, Seat {seat.seatNumber} – {formatPrice(seat.price)}
                        <span className="ml-1 text-red-500">×</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-xl font-bold text-green-600">Total: {formatPrice(getTotalPrice())}</div>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                  onClick={() => {
                    onAction(Array.from(selected))
                    setSelected(new Set())
                    setSelectedSection(null)
                  }}
                >
                  {mode === "buyer"
                    ? `Purchase ${selected.size} Ticket${selected.size > 1 ? "s" : ""}`
                    : `Select ${selected.size} Seat${selected.size > 1 ? "s" : ""}`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
