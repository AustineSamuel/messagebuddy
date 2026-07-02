import env from '#start/env'
import WebsiteServiceOrder, {
  type WebsiteOrderPaymentMethod,
} from '#models/website_service_order'

export type WebsitePackage = {
  id: string
  name: string
  tagline: string
  amountNgn: number
  priceLabel: string
  popular?: boolean
  deliveryDays: number
  features: string[]
}

export type CreateWebsiteOrderInput = {
  packageId: string
  businessName?: string | null
  websiteUrl?: string | null
  contactName?: string | null
  contactPhone?: string | null
  contactEmail?: string | null
  notes?: string | null
  paymentMethod: WebsiteOrderPaymentMethod
}

const PACKAGES: WebsitePackage[] = [
  {
    id: 'starter',
    name: 'Starter Landing',
    tagline: 'Let customers shop your products straight from your landing page',
    amountNgn: 50_000,
    priceLabel: '₦50,000',
    deliveryDays: 3,
    features: [
      'Professional landing page built to sell your products',
      'Customers browse & shop your catalog from one beautiful page',
      'Product cards with prices, images & checkout links',
      'WhatsApp click-to-chat for instant follow-up',
      'Mobile-first — works perfectly on every phone',
      'Your logo, colours & business story included',
    ],
  },
  {
    id: 'growth',
    name: 'Growth Site',
    tagline: 'See what’s working with basic admin controls & analytics',
    amountNgn: 100_000,
    priceLabel: '₦100,000',
    popular: true,
    deliveryDays: 5,
    features: [
      'Everything in Starter',
      'Basic admin dashboard — manage your site yourself',
      'Track clicks, page views & visitor behaviour',
      'See which products get the most attention',
      'Google Analytics & simple performance reports',
      'Up to 3 pages + product showcase sections',
      'Contact form with email alerts when leads come in',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Storefront',
    tagline: 'A full online store that grows with your business',
    amountNgn: 200_000,
    priceLabel: '₦200,000',
    deliveryDays: 7,
    features: [
      'Everything in Growth',
      'Full product catalog with dedicated product pages',
      'Checkout-ready flow (transfer, pay on delivery & more)',
      'Admin panel for orders, products & content updates',
      'Click & conversion tracking across every page',
      'Custom domain + faster hosting setup',
      'Blog section to keep customers coming back',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise E-Commerce',
    tagline: 'Robust e-commerce — your products found on Google & beyond',
    amountNgn: 500_000,
    priceLabel: '₦500,000',
    deliveryDays: 14,
    features: [
      'Robust full e-commerce platform built for scale',
      'All your products cached & indexed online 24/7',
      'Search engines show your products in search results',
      'Advanced SEO — product schema, sitemaps & meta optimisation',
      'Complete admin suite: orders, inventory, analytics & reports',
      'Unlimited product pages with fast global delivery (CDN)',
      'Dedicated project manager + 30-day post-launch support',
    ],
  },
]

function formatNgn(amount: number) {
  return `₦${amount.toLocaleString('en-NG')}`
}

function serializeOrder(row: WebsiteServiceOrder) {
  return {
    id: row.id,
    userId: row.userId,
    packageId: row.packageId,
    packageName: row.packageName,
    amountNgn: row.amountNgn,
    amountLabel: formatNgn(row.amountNgn),
    businessName: row.businessName,
    websiteUrl: row.websiteUrl,
    contactName: row.contactName,
    contactPhone: row.contactPhone,
    contactEmail: row.contactEmail,
    notes: row.notes,
    paymentMethod: row.paymentMethod,
    status: row.status,
    createdAt: row.createdAt.toISO()!,
    updatedAt: row.updatedAt?.toISO() ?? null,
  }
}

export default class WebsiteServicesService {
  static listPackages(): WebsitePackage[] {
    return PACKAGES
  }

  static getPackage(packageId: string): WebsitePackage | null {
    return PACKAGES.find((pkg) => pkg.id === packageId) ?? null
  }

  static async createOrder(userId: number, input: CreateWebsiteOrderInput) {
    const pkg = this.getPackage(input.packageId)
    if (!pkg) throw new Error('Invalid website package selected.')

    if (!input.contactPhone?.trim() && !input.contactEmail?.trim()) {
      throw new Error('Please provide a phone number or email so we can reach you.')
    }

    const row = await WebsiteServiceOrder.create({
      userId,
      packageId: pkg.id,
      packageName: pkg.name,
      amountNgn: pkg.amountNgn,
      businessName: input.businessName?.trim() || null,
      websiteUrl: input.websiteUrl?.trim() || null,
      contactName: input.contactName?.trim() || null,
      contactPhone: input.contactPhone?.trim() || null,
      contactEmail: input.contactEmail?.trim() || null,
      notes: input.notes?.trim() || null,
      paymentMethod: input.paymentMethod,
      status: 'pending',
    })

    return {
      order: serializeOrder(row),
      message:
        input.paymentMethod === 'pay_now'
          ? `Your ${pkg.name} order (${pkg.priceLabel}) is recorded. We will send payment details shortly — check WhatsApp or your email.`
          : `Thanks! We received your ${pkg.name} request. Our team will contact you within 24 hours to get started.`,
    }
  }

  static async listOrdersForUser(userId: number) {
    const rows = await WebsiteServiceOrder.query()
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
    return rows.map(serializeOrder)
  }

  static verifyAdminSecret(secret: string | undefined): boolean {
    const expected = env.get('WEBSITE_ORDERS_ADMIN_SECRET')
    if (!expected) return false
    return Boolean(secret && secret === expected)
  }

  static async listAllOrdersAdmin() {
    const rows = await WebsiteServiceOrder.query().orderBy('created_at', 'desc')
    return rows.map(serializeOrder)
  }
}
