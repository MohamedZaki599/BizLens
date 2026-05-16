/**
 * Localized alert draft types for the alert engine.
 *
 * Extends DraftAlert with a semantic localization payload so that alert
 * title/message can be rendered in any locale by the consuming client.
 *
 * Consumers: alert engine rules, alert persistence layer.
 */

import type { LocalizedAlert } from '../../intelligence/localization/localization.types';
import type { DraftAlert } from './alert-engine';

/**
 * A DraftAlert enriched with an optional localized payload.
 *
 * During the transition period both the legacy prose fields (title, message)
 * and the new `localized` payload are populated. Once all consumers migrate
 * to key-based rendering, the prose fields will be removed.
 */
export interface LocalizedAlertDraft extends DraftAlert {
  /**
   * @deprecated Use `localized.titleKey` with interpolation params instead.
   * Removal target: v0.3.0
   */
  title: string;

  /**
   * @deprecated Use `localized.messageKey` with interpolation params instead.
   * Removal target: v0.3.0
   */
  message: string;

  /** Semantic localization payload with translation keys and raw params. */
  localized?: LocalizedAlert;
}
