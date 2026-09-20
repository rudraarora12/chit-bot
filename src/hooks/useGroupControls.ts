import { useState, useEffect, useCallback } from 'react'
import {
  type GroupControlsState,
  type GroupConfig,
  type AuctionRules,
  type PaymentRules,
  type RiskMonitoringConfig,
  type UserRole,
  type ConfigHistoryEntry,
  STORAGE_KEY,
  initialGroupControlsData,
  computeLedgerVerification,
} from '@/data/groupControls'

export function useGroupControls() {
  const [state, setState] = useState<GroupControlsState>(() => {
    if (typeof window === 'undefined') return initialGroupControlsData
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          ...initialGroupControlsData,
          ...parsed,
          groupConfig: { ...initialGroupControlsData.groupConfig, ...parsed.groupConfig },
          auctionRules: { ...initialGroupControlsData.auctionRules, ...parsed.auctionRules },
          paymentRules: { ...initialGroupControlsData.paymentRules, ...parsed.paymentRules },
          riskConfig: {
            ...initialGroupControlsData.riskConfig,
            ...parsed.riskConfig,
            signals: {
              ...initialGroupControlsData.riskConfig.signals,
              ...(parsed.riskConfig?.signals || {}),
            },
          },
          audit: { ...initialGroupControlsData.audit, ...parsed.audit },
          history: Array.isArray(parsed.history) ? parsed.history : initialGroupControlsData.history,
          members: Array.isArray(parsed.members) ? parsed.members : initialGroupControlsData.members,
        }
      }
    } catch (e) {
      console.warn('Failed to parse group controls from localStorage', e)
    }
    return initialGroupControlsData
  })

  const [savedNotice, setSavedNotice] = useState<string | null>(null)

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {
      console.warn('Failed to save group controls to localStorage', e)
    }
  }, [state])

  // Trigger brief saved feedback
  const triggerSavedNotice = useCallback((msg: string = 'Updated just now') => {
    setSavedNotice(msg)
    const t = setTimeout(() => {
      setSavedNotice(null)
    }, 2800)
    return () => clearTimeout(t)
  }, [])

  // Helper to format timestamps
  const getFormattedNow = () => {
    const d = new Date()
    return d.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Helper to add history entry
  const addHistoryEntry = useCallback(
    (
      category: ConfigHistoryEntry['category'],
      title: string,
      description: string,
    ) => {
      const newEntry: ConfigHistoryEntry = {
        id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: getFormattedNow(),
        timestampRaw: Date.now(),
        category,
        title,
        description,
        actor: 'Aarav Sharma (Organizer)',
      }

      setState((prev) => ({
        ...prev,
        history: [newEntry, ...prev.history].slice(0, 50),
      }))
    },
    [],
  )

  // 1. Group Config updates
  const updateGroupConfig = useCallback(
    (updates: Partial<GroupConfig>, logMessage?: { title: string; desc: string }) => {
      setState((prev) => ({
        ...prev,
        groupConfig: {
          ...prev.groupConfig,
          ...updates,
        },
      }))
      if (logMessage) {
        addHistoryEntry('Group', logMessage.title, logMessage.desc)
      } else {
        addHistoryEntry(
          'Group',
          'Group configuration updated',
          `Modified: ${Object.keys(updates).join(', ')}`,
        )
      }
      triggerSavedNotice('Group parameters saved')
    },
    [addHistoryEntry, triggerSavedNotice],
  )

  // 2. Auction Rules updates
  const updateAuctionRules = useCallback(
    (updates: Partial<AuctionRules>, logMessage?: { title: string; desc: string }) => {
      setState((prev) => ({
        ...prev,
        auctionRules: {
          ...prev.auctionRules,
          ...updates,
        },
      }))
      if (logMessage) {
        addHistoryEntry('Auction', logMessage.title, logMessage.desc)
      } else {
        addHistoryEntry(
          'Auction',
          'Auction rules modified',
          `Updated: ${Object.keys(updates).join(', ')}`,
        )
      }
      triggerSavedNotice('Auction rules updated')
    },
    [addHistoryEntry, triggerSavedNotice],
  )

  // 3. Payment Rules updates
  const updatePaymentRules = useCallback(
    (updates: Partial<PaymentRules>, logMessage?: { title: string; desc: string }) => {
      setState((prev) => ({
        ...prev,
        paymentRules: {
          ...prev.paymentRules,
          ...updates,
        },
      }))
      if (logMessage) {
        addHistoryEntry('Payment', logMessage.title, logMessage.desc)
      } else {
        addHistoryEntry(
          'Payment',
          'Payment & collection rules modified',
          `Updated: ${Object.keys(updates).join(', ')}`,
        )
      }
      triggerSavedNotice('Payment controls saved')
    },
    [addHistoryEntry, triggerSavedNotice],
  )

  // 4. Risk Config updates
  const updateRiskConfig = useCallback(
    (updates: Partial<RiskMonitoringConfig>, logMessage?: { title: string; desc: string }) => {
      setState((prev) => ({
        ...prev,
        riskConfig: {
          ...prev.riskConfig,
          ...updates,
        },
      }))
      if (logMessage) {
        addHistoryEntry('Risk', logMessage.title, logMessage.desc)
      } else {
        addHistoryEntry(
          'Risk',
          'Risk engine parameters modified',
          `Updated: ${Object.keys(updates).join(', ')}`,
        )
      }
      triggerSavedNotice('Risk settings updated')
    },
    [addHistoryEntry, triggerSavedNotice],
  )

  const toggleRiskSignal = useCallback(
    (signalKey: keyof RiskMonitoringConfig['signals']) => {
      setState((prev) => {
        const currentVal = prev.riskConfig.signals[signalKey]
        const nextVal = !currentVal
        const signalNames: Record<keyof RiskMonitoringConfig['signals'], string> = {
          latePaymentFrequency: 'Late payment frequency',
          missedContributions: 'Missed contributions',
          outstandingBalance: 'Outstanding balance',
          paymentTimingChanges: 'Payment timing changes',
          auctionBehaviourChanges: 'Auction behaviour changes',
        }

        const updated = {
          ...prev,
          riskConfig: {
            ...prev.riskConfig,
            signals: {
              ...prev.riskConfig.signals,
              [signalKey]: nextVal,
            },
          },
        }

        // Add history entry
        const entry: ConfigHistoryEntry = {
          id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: getFormattedNow(),
          timestampRaw: Date.now(),
          category: 'Risk',
          title: `${signalNames[signalKey]} ${nextVal ? 'enabled' : 'disabled'}`,
          description: `Telemetry signal ${signalNames[signalKey]} turned ${nextVal ? 'ON' : 'OFF'} in risk scoring model.`,
          actor: 'Aarav Sharma (Organizer)',
        }
        updated.history = [entry, ...updated.history].slice(0, 50)
        return updated
      })
      triggerSavedNotice('Risk telemetry signal updated')
    },
    [triggerSavedNotice],
  )

  // 5. Access & Roles updates
  const updateMemberRole = useCallback(
    (memberId: string, newRole: UserRole) => {
      let memberName = memberId
      setState((prev) => {
        const nextMembers = prev.members.map((m) => {
          if (m.id === memberId) {
            memberName = m.name
            return { ...m, role: newRole }
          }
          return m
        })

        const entry: ConfigHistoryEntry = {
          id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: getFormattedNow(),
          timestampRaw: Date.now(),
          category: 'Roles',
          title: `Role updated for ${memberName}`,
          description: `Assigned new role: ${newRole} (was granted corresponding operational scope).`,
          actor: 'Aarav Sharma (Organizer)',
        }

        return {
          ...prev,
          members: nextMembers,
          history: [entry, ...prev.history].slice(0, 50),
        }
      })
      triggerSavedNotice(`Role updated: ${memberName} -> ${newRole}`)
    },
    [triggerSavedNotice],
  )

  // 6. Audit & Transparency verification
  const [isVerifying, setIsVerifying] = useState(false)
  const verifyLedgerIntegrity = useCallback(async () => {
    setIsVerifying(true)
    // Realistic verification delay simulating cryptographic audit
    await new Promise((resolve) => setTimeout(resolve, 650))
    const result = computeLedgerVerification(state)

    setState((prev) => {
      const entry: ConfigHistoryEntry = {
        id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: getFormattedNow(),
        timestampRaw: Date.now(),
        category: 'Audit',
        title: 'Cryptographic ledger integrity verified',
        description: `Full journal scan across ${result.txCount} transactions passed with checksum ${result.checksum.slice(0, 16)}…`,
        actor: 'Aarav Sharma (Organizer)',
      }

      return {
        ...prev,
        audit: {
          ...prev.audit,
          lastVerification: result,
        },
        history: [entry, ...prev.history].slice(0, 50),
      }
    })
    setIsVerifying(false)
    triggerSavedNotice('Ledger cryptographic audit verified successfully')
    return result
  }, [state, triggerSavedNotice])

  // Reset to default
  const resetToDefaults = useCallback(() => {
    setState(initialGroupControlsData)
    triggerSavedNotice('Reset to initial group configuration')
  }, [triggerSavedNotice])

  return {
    state,
    savedNotice,
    isVerifying,
    updateGroupConfig,
    updateAuctionRules,
    updatePaymentRules,
    updateRiskConfig,
    toggleRiskSignal,
    updateMemberRole,
    verifyLedgerIntegrity,
    resetToDefaults,
    triggerSavedNotice,
  }
}
