import { useState } from 'react';
import { useI18n } from '@/i18n';
import { Container } from '@/components/Container';
import { SectionHeader } from '@/components/SectionHeader';
import { Button } from '@/components/Button';
import { useModal } from '@/App';

export function Calculator() {
  const { t } = useI18n();
  const { openModal } = useModal();
  const [ordersPerDay, setOrdersPerDay] = useState(50);
  const [averageCheck, setAverageCheck] = useState(1500);

  // Calculations based on real data
  const checkIncrease = 0.34; // +34% average check
  const repeatMultiplier = 2.3; // x2.3 repeat rate
  const monthlyDays = 30;

  const currentMonthlyRevenue = ordersPerDay * averageCheck * monthlyDays;
  const newAverageCheck = averageCheck * (1 + checkIncrease);
  const newOrdersPerDay = ordersPerDay * (1 + (repeatMultiplier - 1) * 0.3); // Conservative estimate
  const newMonthlyRevenue = newOrdersPerDay * newAverageCheck * monthlyDays;
  const revenueIncrease = newMonthlyRevenue - currentMonthlyRevenue;
  const monthlyPrice = 50000; // Subscription price in Tenge
  const netProfit = revenueIncrease - monthlyPrice;
  const paybackMonths = revenueIncrease > 0 ? monthlyPrice / revenueIncrease : 0;

  const formatMoney = (value: number) => {
    return Math.round(value).toLocaleString('ru-RU');
  };

  return (
    <section id="calculator" className="py-24 bg-gradient-to-b from-[#FFF8F0] to-[#FFFBF7]">
      <Container>
        <SectionHeader
          eyebrow={t.calculator.eyebrow}
          title={t.calculator.title}
          description={t.calculator.description}
          align="center"
        />

        <div className="mt-16 max-w-4xl mx-auto">
          <div className="coffee-card p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Input Section */}
              <div className="space-y-8">
                <h3 className="text-xl font-bold text-[#2C1810]">
                  {t.calculator.currentMetrics}
                </h3>

                {/* Orders per day */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[#4A2C2A] font-medium">
                      {t.calculator.ordersPerDay}
                    </label>
                    <span className="text-2xl font-bold text-[#6B4423]">
                      {ordersPerDay}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    step="5"
                    value={ordersPerDay}
                    onChange={(e) => setOrdersPerDay(Number(e.target.value))}
                    className="w-full h-3 bg-[#E8DDD4] rounded-full appearance-none cursor-pointer accent-[#6B4423]"
                  />
                  <div className="flex justify-between text-xs text-[#4A2C2A]/50">
                    <span>20</span>
                    <span>200</span>
                  </div>
                </div>

                {/* Average check */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[#4A2C2A] font-medium">
                      {t.calculator.averageCheck}
                    </label>
                    <span className="text-2xl font-bold text-[#6B4423]">
                      {formatMoney(averageCheck)}₸
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    step="100"
                    value={averageCheck}
                    onChange={(e) => setAverageCheck(Number(e.target.value))}
                    className="w-full h-3 bg-[#E8DDD4] rounded-full appearance-none cursor-pointer accent-[#6B4423]"
                  />
                  <div className="flex justify-between text-xs text-[#4A2C2A]/50">
                    <span>500₸</span>
                    <span>5000₸</span>
                  </div>
                </div>

                {/* Current revenue */}
                <div className="p-4 rounded-xl bg-[#E8DDD4]/50 border border-[#E8DDD4]">
                  <div className="text-sm text-[#4A2C2A]/70">{t.calculator.currentRevenue}</div>
                  <div className="text-2xl font-bold text-[#4A2C2A]">
                    {formatMoney(currentMonthlyRevenue)}₸
                  </div>
                </div>
              </div>

              {/* Results Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-[#2C1810]">
                  {t.calculator.withBrewly}
                </h3>

                {/* New metrics */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 rounded-xl bg-[#FFF8F0] border border-[#E8DDD4]">
                    <span className="text-[#4A2C2A]">{t.calculator.newCheck}</span>
                    <span className="font-bold text-[#6B4423]">{formatMoney(newAverageCheck)}₸</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-[#FFF8F0] border border-[#E8DDD4]">
                    <span className="text-[#4A2C2A]">{t.calculator.newOrders}</span>
                    <span className="font-bold text-[#6B4423]">{Math.round(newOrdersPerDay)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-[#FFF8F0] border border-[#E8DDD4]">
                    <span className="text-[#4A2C2A]">{t.calculator.newRevenue}</span>
                    <span className="font-bold text-[#6B4423]">{formatMoney(newMonthlyRevenue)}₸</span>
                  </div>
                </div>

                {/* Revenue increase highlight */}
                <div className="p-6 rounded-2xl gradient-coffee text-white">
                  <div className="text-sm opacity-80">{t.calculator.revenueIncrease}</div>
                  <div className="text-4xl font-bold">
                    +{formatMoney(revenueIncrease)}₸
                  </div>
                  <div className="text-sm opacity-80 mt-1">{t.calculator.perMonth}</div>
                </div>

                {/* ROI metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-xl bg-white border border-[#E8DDD4]">
                    <div className="text-2xl font-bold text-[#6B4423]">
                      +{formatMoney(netProfit)}₸
                    </div>
                    <div className="text-xs text-[#4A2C2A]/60">{t.calculator.netProfit}</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-white border border-[#E8DDD4]">
                    <div className="text-2xl font-bold text-[#6B4423]">
                      {paybackMonths < 1 ? '<1' : paybackMonths.toFixed(1)} {t.calculator.months}
                    </div>
                    <div className="text-xs text-[#4A2C2A]/60">{t.calculator.payback}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 pt-8 border-t border-[#E8DDD4] text-center space-y-4">
              <Button onClick={() => openModal()}>
                {t.calculator.getCalculation}
              </Button>
              {/* Disclaimer */}
              <p className="text-xs text-[#4A2C2A]/50 max-w-md mx-auto leading-relaxed">
                {t.calculator.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
