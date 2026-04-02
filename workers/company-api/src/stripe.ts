interface CheckoutConfig {
  companyName: string;
  config: string; // JSON-stringified CompanyConfig
  version: string;
  returnUrl: string;
  exportType?: 'video' | 'html';
}

interface StripeSession {
  id: string;
  url: string;
  payment_status: string;
  metadata: Record<string, string>;
}

async function stripeRequest(
  path: string,
  apiKey: string,
  method: 'GET' | 'POST' = 'POST',
  body?: URLSearchParams,
): Promise<StripeSession> {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body?.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Stripe API error ${res.status}: ${err}`);
  }

  return res.json() as Promise<StripeSession>;
}

export async function createCheckoutSession(
  apiKey: string,
  checkout: CheckoutConfig,
): Promise<{ url: string }> {
  // CompanyConfig can exceed single metadata value limit (500 chars).
  // Split across two keys if needed.
  const configStr = checkout.config;
  const half = Math.ceil(configStr.length / 2);
  const config1 = configStr.slice(0, half);
  const config2 = configStr.slice(half);

  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('line_items[0][price_data][currency]', 'usd');
  params.append('line_items[0][price_data][unit_amount]', '100'); // $1.00
  params.append(
    'line_items[0][price_data][product_data][name]',
    `Company Canvas Animation - ${checkout.companyName}`,
  );
  params.append('line_items[0][quantity]', '1');
  params.append('success_url', `${checkout.returnUrl}?session_id={CHECKOUT_SESSION_ID}`);
  params.append('cancel_url', checkout.returnUrl);
  params.append('metadata[version]', checkout.version);
  params.append('metadata[config_1]', config1);
  params.append('metadata[config_2]', config2);
  if (checkout.exportType) {
    params.append('metadata[export_type]', checkout.exportType);
  }

  const session = await stripeRequest('/checkout/sessions', apiKey, 'POST', params);
  return { url: session.url };
}

export async function verifyAndGetConfig(
  apiKey: string,
  sessionId: string,
): Promise<{ paid: boolean; config: unknown; version: string; exportType?: 'video' | 'html' }> {
  const session = await stripeRequest(
    `/checkout/sessions/${encodeURIComponent(sessionId)}`,
    apiKey,
    'GET',
  );

  if (session.payment_status !== 'paid') {
    return { paid: false, config: null, version: '' };
  }

  const configStr = (session.metadata.config_1 ?? '') + (session.metadata.config_2 ?? '');
  const config = JSON.parse(configStr);
  const version = session.metadata.version ?? 'v1';
  const exportType =
    session.metadata.export_type === 'video' || session.metadata.export_type === 'html'
      ? session.metadata.export_type
      : undefined;

  return { paid: true, config, version, exportType };
}
