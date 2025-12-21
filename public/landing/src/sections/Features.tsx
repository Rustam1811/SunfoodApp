import { useI18n } from '@/i18n';
import { Container } from '@/components/Container';
import { SectionHeader } from '@/components/SectionHeader';

const featureImages = [
  '/landing/screenshots/client_menu.png',
  '/landing/screenshots/client_order.png',
  '/landing/screenshots/client_card.png',
  '/landing/screenshots/admin_analytics_mobile.png',
];

export function Features() {
  const { t } = useI18n();

  return (
    <section id="features" className="py-24 sm:py-32 bg-[#FFFBF7]">
      <Container>
        <SectionHeader
          eyebrow={t.features.eyebrow}
          title={t.features.title}
          description={t.features.description}
          align="center"
        />

        <div className="mt-20 space-y-24">
          {t.features.items.map((feature, index) => (
            <div
              key={index}
              className={`flex flex-col gap-12 lg:flex-row lg:items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Text Content */}
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-3">
                  <span className="text-5xl md:text-6xl font-bold text-gradient-coffee">
                    {feature.metric}
                  </span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-[#2C1810]">
                  {feature.title}
                </h3>
                <p className="text-lg text-[#4A2C2A]/70 leading-relaxed max-w-md">
                  {feature.description}
                </p>
              </div>

              {/* Image/Phone Mockup */}
              <div className="flex-1 flex justify-center">
                <div className="phone-mockup w-[280px] md:w-[320px]">
                  <div className="phone-notch" />
                  <div className="phone-screen aspect-[9/19.5]">
                    <img
                      src={featureImages[index]}
                      alt={feature.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 390 844'%3E%3Crect fill='%23FFF8F0' width='390' height='844'/%3E%3Ctext x='50%25' y='50%25' font-family='system-ui' font-size='14' fill='%23C68B59' text-anchor='middle'%3E${encodeURIComponent(feature.title)}%3C/text%3E%3C/svg%3E`;
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6">
          {t.features.stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-white border border-[#E8DDD4] shadow-sm"
            >
              <div className="text-3xl md:text-4xl font-bold text-[#6B4423]">
                {stat.value}
              </div>
              <div className="mt-2 text-sm text-[#4A2C2A]/60">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
