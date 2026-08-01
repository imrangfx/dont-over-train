/**
 * Don't Over Train — Recovery Engine public surface.
 *
 * Re-exports the orchestration entry point and its result type so consumers
 * can import from `@/app/lib/recovery` without reaching into internals.
 */

export {
  runRecoveryEngine,
  type RecoveryEngineResult,
} from "./recoveryEngine";
