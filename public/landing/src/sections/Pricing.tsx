import { useI18n } from '@/i18n';
import { Container } from '@/components/Container';
import { SectionHeader } from '@/components/SectionHeader';
import { Button } from '@/components/Button';
import { useModal } from '@/App';

type PlanKey = 'subscription' | 'standard' | 'premium';

export function Pricing() {
  const { t } = useI18n();
  const { openModal } = useModal();

  const plans: Array<{
    key: PlanKey;
    price: string;
    period: string;
    name: string;
    tagline?: string;
    description: string;
    suitableFor?: string[];
    features: string[];
    disclaimer?: string | null;
    popular: boolean;
    support?: { price: string; description: string } | null;
  }> = [
    {
      key: 'subscription',
      price: t.pricing.plans.subscription.price,
      period: t.pricing.plans.subscription.period,
      name: t.pricing.plans.subscription.name,
      tagline: (t.pricing.plans.subscription as { tagline?: string }).tagline,
      description: t.pricing.plans.subscription.description,
      suitableFor: (t.pricing.plans.subscription as { suitableFor?: string[] }).suitableFor,
      features: t.pricing.plans.subscription.features,
      disclaimer: (t.pricing.plans.subscription as { disclaimer?: string }).disclaimer,
      popular: false,
    },
    {
      key: 'standard',
      price: t.pricing.plans.standard.price,
      period: t.pricing.plans.standard.period,
      name: t.pricing.plans.standard.name,
      tagline: (t.pricing.plans.standard as { tagline?: string }).tagline,
      description: t.pricing.plans.standard.description,
      suitableFor: (t.pricing.plans.standard as { suitableFor?: string[] }).suitableFor,
      features: t.pricing.plans.standard.features,
      disclaimer: (t.pricing.plans.standard as { disclaimer?: string }).disclaimer,
      popular: true,
      support: t.pricing.plans.standard.support,
    },
    {
      key: 'premium',
      price: t.pricing.plans.premium.price,
      period: t.pricing.plans.premium.period,
      name: t.pricing.plans.premium.name,
      tagline: (t.pricing.plans.premium as { tagline?: string }).tagline,
      description: t.pricing.plans.premium.description,
      suitableFor: (t.pricing.plans.premium as { suitableFor?: string[] }).suitableFor,
      features: t.pricing.plans.premium.features,
      disclaimer: (t.pricing.plans.premium as unknown as { disclaimer?: string | null }).disclaimer || undefined,
      popular: false,
      support: t.pricing.plans.premium.support,
    },
  ];

  const suitableForLabel = (t.pricing as { suitableForLabel?: string }).suitableForLabel;
  const techSupport = (t.pricing as { techSupport?: { title: string; features: string[]; note: string } }).techSupport;

  return (
    <section id="pricing" className="bg-[#FFFBF7] py-24 sm:py-32">
      <Container>
        <SectionHeader
          eyebrow={t.pricing.eyebrow}
          title={t.pricing.title}
          description={t.pricing.description}
          align="center"
        />
        
        <div className="mx-auto mt-16 grid gap-8 md:grid-cols-3 max-w-6xl">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative rounded-3xl border-2 bg-white p-6 sm:p-8 shadow-[0_8px_40px_rgba(44,24,16,0.1)] transition-all duration-500 hover:shadow-[0_16px_60px_rgba(44,24,16,0.15)] hover:-translate-y-1 flex flex-col ${
                plan.popular
                  ? 'border-[#C68B59] ring-2 ring-[#C68B59]/20'
                  : 'border-[#C68B59]/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-[#C68B59] px-4 py-1.5 text-xs font-semibold text-white">
                    {t.pricing.popular}
                  </span>
                </div>
              )}
              
              {/* Plan Name */}
              <p className="text-xs font-semibold uppercase tracking-wider text-[#C68B59]">
                {plan.name}
              </p>
              
              {/* Price */}
              <h3 className="mt-4 text-3xl sm:text-4xl font-bold text-[#2C1810]">
                {plan.price}
                {plan.period && (
                  <span className="text-base font-normal text-[#4A2C2A]/50"> {plan.period}</span>
                )}
              </h3>
              
              {/* Tagline */}
              {plan.tagline && (
                <p className="mt-2 text-sm font-medium text-[#C68B59]">
                  {plan.tagline}
                </p>
              )}
              
              {/* Suitable For */}
              {plan.suitableFor && suitableForLabel && (
                <div className="mt-4 p-3 rounded-xl bg-[#FFF8F0] border border-[#E8DDD4]">
                  <p className="text-xs font-semibold text-[#2C1810] mb-2">{suitableForLabel}</p>
                  <ul className="space-y-1">
                    {plan.suitableFor.map((item, index) => (
                      <li key={index} className="text-xs text-[#4A2C2A]/80 flex items-start gap-2">
                        <span className="text-[#C68B59]">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Features */}
              <ul className="mt-6 space-y-3 text-left text-sm text-[#4A2C2A]/80 flex-grow">
                {plan.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-[#C68B59] flex-shrink-0" aria-hidden="true" />
                    <span className="leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {/* Disclaimer */}
              {plan.disclaimer && (
                <p className="mt-4 text-xs text-[#4A2C2A]/50 italic">
                  {plan.disclaimer}
                </p>
              )}
              
              {/* Description / Bottom Note */}
              <p className="mt-4 text-sm font-medium text-[#2C1810] bg-[#E8DDD4]/30 p-3 rounded-lg text-center">
                👉 {plan.description}
              </p>
              
              {/* Tech Support Info for Standard and Premium */}
              {plan.support && (
                <div className="mt-4 p-4 rounded-xl bg-[#E8DDD4]/40 border border-[#E8DDD4]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">➕</span>
                      <span className="text-sm font-semibold text-[#2C1810]">{t.pricing.supportLabel}</span>
                    </div>
                    <span className="text-sm font-bold text-[#C68B59]">{plan.support.price}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#4A2C2A]/70">({plan.support.description})</p>
                </div>
              )}
              
              <div className="mt-6">
                <Button 
                  onClick={() => openModal(plan.key)}
                  variant={plan.popular ? 'primary' : 'secondary'}
                  className="w-full justify-center"
                >
                  {t.pricing.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Tech Support Block */}
        {techSupport && (
          <div className="mx-auto mt-12 max-w-2xl">
            <div className="p-6 rounded-2xl bg-[#E8DDD4]/30 border border-[#E8DDD4]">
              <h4 className="text-lg font-semibold text-[#2C1810] mb-4">{techSupport.title}</h4>
              <ul className="grid grid-cols-2 gap-2 mb-4">
                {techSupport.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-[#4A2C2A]/80">
                    <span className="text-[#C68B59]">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="text-sm font-medium text-[#2C1810] text-center">{techSupport.note}</p>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}

