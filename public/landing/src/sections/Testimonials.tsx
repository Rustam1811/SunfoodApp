import { useI18n } from '@/i18n';
import { Container } from '../components/Container';
import { SectionHeader } from '../components/SectionHeader';

const testimonialImages = [
  '/testimonials/dmitry-volkov.jpg',
  '/testimonials/anna-sokolova.jpg',
  '/testimonials/igor-petrov.jpg',
];

export function Testimonials() {
  const { t } = useI18n();

  return (
    <section id="testimonials" className="py-24 bg-gradient-to-b from-[#FFFBF7] to-[#FFF8F0]">
      <Container>
        <SectionHeader
          eyebrow={t.testimonials.eyebrow}
          title={t.testimonials.title}
          description={t.testimonials.description}
          align="center"
        />

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {t.testimonials.items.map((testimonial, index) => (
            <div
              key={index}
              className="coffee-card p-8"
            >
              {/* Result Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8DDD4]/50 rounded-full border-2 border-[#C68B59]/30 mb-4">
                <span className="text-2xl font-bold text-[#6B4423]">
                  {testimonial.result}
                </span>
                <span className="text-sm text-[#4A2C2A]/60">
                  {testimonial.period}
                </span>
              </div>

              {/* Before context */}
              {'before' in testimonial && testimonial.before && (
                <div className="mb-4 px-3 py-2 bg-[#FFF8F0] rounded-lg border-l-4 border-[#C68B59]/50">
                  <span className="text-xs font-semibold text-[#6B4423]">{t.testimonials.beforeLabel} </span>
                  <span className="text-xs text-[#4A2C2A]/70">{testimonial.before}</span>
                </div>
              )}

              {/* Quote */}
              <blockquote className="text-[#4A2C2A]/80 leading-relaxed mb-6">
                "{testimonial.quote}"
              </blockquote>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6 pt-6 border-t border-[#E8DDD4]">
                <div>
                  <div className="text-xl font-bold text-[#6B4423]">
                    {testimonial.metrics.checkIncrease}
                  </div>
                  <div className="text-xs text-[#4A2C2A]/50">{t.testimonials.metricsLabels.checkIncrease}</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-[#6B4423]">
                    {testimonial.metrics.queueReduction}
                  </div>
                  <div className="text-xs text-[#4A2C2A]/50">{t.testimonials.metricsLabels.queueReduction}</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-[#6B4423]">
                    {testimonial.metrics.repeatRate}
                  </div>
                  <div className="text-xs text-[#4A2C2A]/50">{t.testimonials.metricsLabels.repeatRate}</div>
                </div>
              </div>

              {/* Owner Info */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonialImages[index]}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#C68B59]"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 56'%3E%3Ccircle fill='%23E8DDD4' cx='28' cy='28' r='28'/%3E%3Ctext x='50%25' y='55%25' font-family='system-ui' font-size='20' fill='%236B4423' text-anchor='middle'%3E👤%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div>
                  <div className="font-semibold text-[#2C1810]">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-[#4A2C2A]/60">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
