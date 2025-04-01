// components/ProfitShow.js
import { AnimatedNumber } from './AnimatedNumber';

export default function ProfitShow({ totalProducts = 0, totalSales = 0, totalProfit = 0 }) {
  return (
    <div className="flex flex-wrap md:flex-nowrap gap-4 justify-between w-full">
      {/* Total Products Card */}
      <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-md min-w-[250px] h-32">
        <h3 className="text-gray-400 text-sm font-medium mb-2">Total Products</h3>
        <p className="text-3xl font-bold text-white">
          <AnimatedNumber value={totalProducts} duration={1.5} />
        </p>
      </div>

      {/* Total Sales Card */}
      <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-md min-w-[250px] h-32">
        <h3 className="text-gray-400 text-sm font-medium mb-2">Total Sales</h3>
        <p className="text-3xl font-bold text-white">
          $<AnimatedNumber value={totalSales} duration={2} decimals={2} />
        </p>
      </div>

      {/* Total Profit Card */}
      <div className="flex-1 bg-gray-800 p-6 rounded-lg shadow-md min-w-[250px] h-32">
        <h3 className="text-gray-400 text-sm font-medium mb-2">Total Profit</h3>
        <p className="text-3xl font-bold text-green-400">
          $<AnimatedNumber value={totalProfit} duration={2.5} decimals={2} />
        </p>
      </div>
    </div>
  );
}
