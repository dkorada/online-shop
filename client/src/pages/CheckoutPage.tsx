import {
  COUNTRIES,
  checkoutSchema,
  formatCardNumber,
  formatMoney,
  toFieldErrors,
  type CheckoutInput,
  type Order,
} from '@shop/shared';
import { AlertCircle, ChevronLeft, CreditCard, Lock } from 'lucide-react';
import { useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import { InputField, SelectField } from '../components/FormField';
import { SummaryCard, TotalsTable } from '../components/OrderSummary';
import { TestCardPanel } from '../components/TestCardPanel';
import { Button, Skeleton } from '../components/ui';
import { useCart } from '../context/CartContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const initialValues = {
  'contact.fullName': '',
  'contact.email': '',
  'contact.phone': '',
  'shippingAddress.line1': '',
  'shippingAddress.line2': '',
  'shippingAddress.city': '',
  'shippingAddress.region': '',
  'shippingAddress.postalCode': '',
  'shippingAddress.country': 'US',
  'payment.cardName': '',
  'payment.cardNumber': '',
  'payment.expiry': '',
  'payment.cvc': '',
};

type FieldName = keyof typeof initialValues;
type Values = Record<FieldName, string>;

function toCheckoutInput(v: Values): CheckoutInput {
  return {
    contact: { fullName: v['contact.fullName'], email: v['contact.email'], phone: v['contact.phone'] },
    shippingAddress: {
      line1: v['shippingAddress.line1'],
      line2: v['shippingAddress.line2'],
      city: v['shippingAddress.city'],
      region: v['shippingAddress.region'],
      postalCode: v['shippingAddress.postalCode'],
      country: v['shippingAddress.country'],
    },
    payment: {
      cardName: v['payment.cardName'],
      cardNumber: v['payment.cardNumber'],
      expiry: v['payment.expiry'],
      cvc: v['payment.cvc'],
    },
  };
}

function formatExpiry(raw: string, previous: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  // Let backspace remove the slash naturally instead of re-adding it.
  if (raw.length < previous.length && previous.endsWith('/')) return digits.slice(0, 1);
  return digits.length >= 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function CheckoutPage() {
  useDocumentTitle('Checkout');
  const navigate = useNavigate();
  const { cart, loading, refresh } = useCart();
  const [values, setValues] = useState<Values>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<{ message: string; showCartLink?: boolean }>();
  const [placing, setPlacing] = useState(false);
  const placedOrder = useRef<Order | undefined>(undefined);
  const formRef = useRef<HTMLFormElement>(null);

  const clientErrors = useMemo(() => {
    const result = checkoutSchema.safeParse(toCheckoutInput(values));
    return result.success ? {} : toFieldErrors(result.error);
  }, [values]);

  const errorFor = (name: FieldName) => serverErrors[name] ?? ((submitted || touched[name]) ? clientErrors[name] : undefined);

  const bind = (name: FieldName, format?: (value: string, previous: string) => string) => ({
    name,
    value: values[name],
    error: errorFor(name),
    onChange: (event: { target: { value: string } }) => {
      const next = format ? format(event.target.value, values[name]) : event.target.value;
      setValues((v) => ({ ...v, [name]: next }));
      if (serverErrors[name]) setServerErrors(({ [name]: _removed, ...rest }) => rest);
    },
    onBlur: () => setTouched((t) => ({ ...t, [name]: true })),
  });

  if (!placedOrder.current && !loading && (!cart || cart.items.length === 0)) {
    return <Navigate to="/cart" replace />;
  }

  const applyTestCard = (cardNumber: string) => {
    setValues((v) => ({
      ...v,
      'payment.cardNumber': formatCardNumber(cardNumber),
      'payment.expiry': v['payment.expiry'] || '12/30',
      'payment.cvc': v['payment.cvc'] || '123',
      'payment.cardName': v['payment.cardName'] || v['contact.fullName'],
    }));
    setServerErrors({});
    setFormError(undefined);
  };

  const focusFirstError = () => {
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setFormError(undefined);
    setServerErrors({});

    if (Object.keys(clientErrors).length > 0) {
      setFormError({ message: 'Please correct the highlighted fields.' });
      focusFirstError();
      return;
    }

    setPlacing(true);
    try {
      const order = await api.checkout(toCheckoutInput(values));
      placedOrder.current = order;
      navigate(`/orders/${order.orderNumber}`, { replace: true, state: { order, justPlaced: true } });
      void refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        setServerErrors(error.fieldErrors);
        const stockProblem = ['INSUFFICIENT_STOCK', 'OUT_OF_STOCK', 'CART_CHANGED', 'CART_EMPTY'].includes(error.code);
        setFormError({ message: error.message, showCartLink: stockProblem });
        if (stockProblem) void refresh();
        if (Object.keys(error.fieldErrors).length > 0) focusFirstError();
      } else {
        setFormError({ message: 'Something went wrong. Please try again.' });
      }
    } finally {
      setPlacing(false);
    }
  };

  const total = cart?.totals.totalCents ?? 0;

  return (
    <div className="container section">
      <Link to="/cart" className="link-button">
        <ChevronLeft size={16} aria-hidden /> Back to cart
      </Link>
      <h1 className="page-title">Checkout</h1>

      <div className="checkout-layout">
        <form ref={formRef} className="checkout-form" onSubmit={handleSubmit} noValidate>
          <fieldset className="card form-section" disabled={placing}>
            <legend className="form-section__title">
              <span className="step">1</span> Contact details
            </legend>
            <div className="form-grid">
              <InputField label="Full name" autoComplete="name" className="span-2" {...bind('contact.fullName')} />
              <InputField
                label="Email"
                type="email"
                autoComplete="email"
                hint="We’ll use this to look up your orders."
                {...bind('contact.email')}
              />
              <InputField label="Phone" type="tel" autoComplete="tel" {...bind('contact.phone')} />
            </div>
          </fieldset>

          <fieldset className="card form-section" disabled={placing}>
            <legend className="form-section__title">
              <span className="step">2</span> Shipping address
            </legend>
            <div className="form-grid">
              <InputField label="Address" autoComplete="address-line1" className="span-2" {...bind('shippingAddress.line1')} />
              <InputField
                label="Apartment, suite, etc."
                optional
                autoComplete="address-line2"
                className="span-2"
                {...bind('shippingAddress.line2')}
              />
              <InputField label="City" autoComplete="address-level2" {...bind('shippingAddress.city')} />
              <InputField label="State / region" autoComplete="address-level1" {...bind('shippingAddress.region')} />
              <InputField label="Postal code" autoComplete="postal-code" {...bind('shippingAddress.postalCode')} />
              <SelectField label="Country" autoComplete="country" {...bind('shippingAddress.country')}>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </SelectField>
            </div>
          </fieldset>

          <fieldset className="card form-section" disabled={placing}>
            <legend className="form-section__title">
              <span className="step">3</span> Payment
            </legend>
            <TestCardPanel onUse={applyTestCard} />
            <div className="form-grid">
              <InputField label="Name on card" autoComplete="cc-name" className="span-2" {...bind('payment.cardName')} />
              <InputField
                label="Card number"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="4242 4242 4242 4242"
                className="span-2"
                {...bind('payment.cardNumber', (v) => formatCardNumber(v))}
              />
              <InputField
                label="Expiry (MM/YY)"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                maxLength={5}
                {...bind('payment.expiry', formatExpiry)}
              />
              <InputField
                label="CVC"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="123"
                maxLength={4}
                {...bind('payment.cvc', (v) => v.replace(/\D/g, '').slice(0, 4))}
              />
            </div>
          </fieldset>

          {formError && (
            <div className="notice notice--danger" role="alert">
              <AlertCircle size={18} aria-hidden />
              <span>
                {formError.message}
                {formError.showCartLink && (
                  <>
                    {' '}
                    <Link to="/cart">Review your cart</Link>
                  </>
                )}
              </span>
            </div>
          )}

          <Button type="submit" size="lg" block loading={placing} disabled={!cart}>
            {placing ? (
              'Processing payment…'
            ) : (
              <>
                <Lock size={16} aria-hidden /> Pay {formatMoney(total)}
              </>
            )}
          </Button>
          <p className="small muted center">
            <CreditCard size={14} aria-hidden /> Your order is only placed once the (simulated) payment succeeds.
          </p>
        </form>

        <SummaryCard>
          {cart ? (
            <>
              <ul className="summary-items">
                {cart.items.map((item) => (
                  <li key={item.productId}>
                    <span className="summary-items__media">
                      <img src={item.imageUrl} alt="" width={56} height={56} />
                      <span className="summary-items__qty">{item.quantity}</span>
                    </span>
                    <span className="summary-items__name">{item.name}</span>
                    <span>{formatMoney(item.lineTotalCents)}</span>
                  </li>
                ))}
              </ul>
              <TotalsTable totals={cart.totals} />
            </>
          ) : (
            <Skeleton className="skeleton--panel" />
          )}
        </SummaryCard>
      </div>
    </div>
  );
}
