import TemperaturePredictor from "@/components/TemperaturePredictor";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <TemperaturePredictor />
        </div>

        <footer className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Temperature predictions are simulated for demonstration purposes</p>
        </footer>
      </div>
    </div>
  );
}