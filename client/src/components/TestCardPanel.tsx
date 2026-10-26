import { TEST_CARDS, formatCardNumber } from '@shop/shared';
import { FlaskConical } from 'lucide-react';

/** Explains the mock payment gateway and lets the shopper fill in a test card with one click. */
export function TestCardPanel({ onUse }: { onUse: (cardNumber: string) => void }) {
  return (
    <div className="test-cards">
      <div className="test-cards__header">
        <FlaskConical size={18} aria-hidden />
        <strong>Demo mode: use a test card</strong>
      </div>
      <p className="small">No real payment is processed. Use any future expiry date and any 3-digit CVC.</p>
      <div className="test-cards__list">
        <button type="button" className="test-card" onClick={() => onUse(TEST_CARDS.success)}>
          <span className="test-card__dot test-card__dot--success" aria-hidden />
          <span>
            <span className="test-card__number">{formatCardNumber(TEST_CARDS.success)}</span>
            <span className="test-card__label">Payment succeeds</span>
          </span>
        </button>
        <button type="button" className="test-card" onClick={() => onUse(TEST_CARDS.declined)}>
          <span className="test-card__dot test-card__dot--danger" aria-hidden />
          <span>
            <span className="test-card__number">{formatCardNumber(TEST_CARDS.declined)}</span>
            <span className="test-card__label">Payment is declined</span>
          </span>
        </button>
      </div>
    </div>
  );
}
