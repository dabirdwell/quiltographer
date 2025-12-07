import { EdgeToEdgeDesigner } from '@/components/EdgeToEdgeDesigner';

export default function LongarmDemoPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Quiltographer for Longarm
          </h1>
          <p className="text-xl text-gray-600">
            Professional edge-to-edge pattern design made simple
          </p>
        </div>
        
        {/* Value Props */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 text-center shadow">
            <div className="text-3xl font-bold text-blue-600 mb-2">5 min</div>
            <div className="text-gray-600">vs 30 min design time</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow">
            <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
            <div className="text-gray-600">material efficiency</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow">
            <div className="text-3xl font-bold text-purple-600 mb-2">1000+</div>
            <div className="text-gray-600">patterns available</div>
          </div>
        </div>
        
        {/* Main Designer */}
        <EdgeToEdgeDesigner width={800} height={600} />
        
        {/* Features */}
        <div className="mt-12 grid grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-4">
              Seamless Machine Integration
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Direct export to your machine format
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Optimized stitch paths for speed
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Automatic tension adjustments
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Thread usage calculations
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-4">
              AI-Powered Features
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✨</span>
                Sketch to pattern conversion
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✨</span>
                Automatic density optimization
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✨</span>
                Pattern variation generation
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✨</span>
                Quality prediction
              </li>
            </ul>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="mt-12 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Transform Your Longarm Business?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Join thousands of quilters using Quiltographer to create stunning designs faster than ever.
          </p>
          <div className="space-x-4">
            <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100">
              Schedule Demo
            </button>
            <button className="px-8 py-3 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-900">
              Partner With Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}