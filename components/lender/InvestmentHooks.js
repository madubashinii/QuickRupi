import { useMemo } from 'react';
import { STATUS_GROUPS } from './investmentUtils';

// Business Logic Hooks

/**
 * Hook to calculate investment metrics from a list of investments
 * @param {Array} investments - Array of investment objects
 * @returns {Object} Metrics object with active, pending, repaid counts and avgAPR
 */
export const useInvestmentMetrics = (investments) => {
  return useMemo(() => {
    const active = investments.filter(inv => STATUS_GROUPS.active.includes(inv.status));
    const pending = investments.filter(inv => STATUS_GROUPS.pending.includes(inv.status));
    const repaid = investments.filter(inv => STATUS_GROUPS.repaid.includes(inv.status));

    const avgAPR = active.length > 0 
      ? active.reduce((sum, inv) => sum + (inv.amount * inv.apr), 0) / 
        active.reduce((sum, inv) => sum + inv.amount, 0)
      : 0;

    return {
      active: active.length,
      pending: pending.length,
      repaid: repaid.length,
      avgAPR: avgAPR.toFixed(1)
    };
  }, [investments]);
};

/**
 * Hook to filter and sort ongoing investments
 * @param {Array} investments - Array of ongoing investment objects
 * @param {string} sortBy - Sort key ('nextDue', 'newest', 'oldest', 'apr')
 * @param {string} filterBy - Filter key ('all', 'dueThisWeek', 'overdue')
 * @returns {Array} Filtered and sorted investments
 */
export const useOngoingInvestments = (investments, sortBy, filterBy) => {
  return useMemo(() => {
    let filtered = [...investments];

    // Apply filters
    if (filterBy === 'dueThisWeek') {
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(inv => {
        const dueDate = new Date(inv.nextDueDate);
        return dueDate >= today && dueDate <= weekFromNow;
      });
    } else if (filterBy === 'overdue') {
      const today = new Date();
      filtered = filtered.filter(inv => {
        const dueDate = new Date(inv.nextDueDate);
        return dueDate < today;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'nextDue':
          return new Date(a.nextDueDate) - new Date(b.nextDueDate);
        case 'newest':
          return new Date(b.fundedDate) - new Date(a.fundedDate);
        case 'oldest':
          return new Date(a.fundedDate) - new Date(b.fundedDate);
        case 'apr':
          return b.apr - a.apr;
        default:
          return 0;
      }
    });

    return filtered;
  }, [investments, sortBy, filterBy]);
};

/**
 * Hook to filter and sort browse requests
 * @param {Array} requests - Array of loan request objects
 * @param {string} sortBy - Sort key ('newest', 'amount', 'term', 'apr')
 * @param {string} statusFilter - Status filter ('all', 'approved', 'underReview')
 * @param {Object} amountRange - Amount range filter {min, max}
 * @returns {Array} Filtered and sorted requests
 */
export const useBrowseRequests = (requests, sortBy, statusFilter, amountRange) => {
  return useMemo(() => {
    let filtered = [...requests];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Apply amount range filter
    if (amountRange.min > 0 || amountRange.max > 0) {
      filtered = filtered.filter(req => {
        const amount = req.amountRequested;
        return amount >= amountRange.min && (amountRange.max === 0 || amount <= amountRange.max);
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.requestDate) - new Date(a.requestDate);
        case 'amount':
          return b.amountRequested - a.amountRequested;
        case 'term':
          return a.termMonths - b.termMonths;
        case 'apr':
          return b.estAPR - a.estAPR;
        default:
          return 0;
      }
    });

    return filtered;
  }, [requests, sortBy, statusFilter, amountRange]);
};

/**
 * Hook to calculate summary statistics for finished investments
 * @param {Array} investments - Array of finished investment objects
 * @returns {Object} Summary object with totalPrincipal, totalInterest, avgAPR, totalReturn
 */
export const useFinishedInvestmentsSummary = (investments) => {
  return useMemo(() => {
    const totalPrincipal = investments.reduce((sum, inv) => sum + inv.principalAmount, 0);
    const totalInterest = investments.reduce((sum, inv) => sum + inv.interestEarned, 0);
    const avgAPR = investments.length > 0 
      ? investments.reduce((sum, inv) => sum + inv.actualAPR, 0) / investments.length
      : 0;

    return {
      totalPrincipal,
      totalInterest,
      avgAPR: avgAPR.toFixed(1),
      totalReturn: totalPrincipal + totalInterest
    };
  }, [investments]);
};
