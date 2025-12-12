import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Globe, Sparkles, X, Check } from 'lucide-react';

interface LocationCategory {
  id: string;
  name: string;
  icon: string;
  prompt: string;
  color: string;
}

interface LocationPreferences {
  categories: string[];
  autoRecommend: boolean;
  savePreferences: boolean;
  language: 'zh-TW' | 'auto';
  includeMap: boolean;
}

interface LocationCategorySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: LocationCategory, location: { lat: number; lng: number; country?: string }) => void;
  location: { lat: number; lng: number } | null;
}

const CATEGORIES: LocationCategory[] = [
  { id: 'food', name: '美食餐廳', icon: '🍜', prompt: '推薦附近美食餐廳', color: 'bg-orange-500' },
  { id: 'cafe', name: '咖啡甜點', icon: '☕', prompt: '推薦附近咖啡廳或甜點店', color: 'bg-amber-600' },
  { id: 'attraction', name: '景點觀光', icon: '🗼', prompt: '推薦附近景點或觀光地點', color: 'bg-blue-500' },
  { id: 'shopping', name: '購物商場', icon: '🛍️', prompt: '推薦附近購物中心或商店', color: 'bg-pink-500' },
  { id: 'parking', name: '停車場', icon: '🅿️', prompt: '尋找附近停車場', color: 'bg-gray-600' },
  { id: 'hotel', name: '住宿飯店', icon: '🏨', prompt: '推薦附近飯店或住宿', color: 'bg-purple-500' },
  { id: 'transport', name: '交通運輸', icon: '🚇', prompt: '查詢附近交通工具或站點', color: 'bg-green-600' },
  { id: 'medical', name: '醫療診所', icon: '🏥', prompt: '尋找附近醫院或診所', color: 'bg-red-500' },
  { id: 'entertainment', name: '娛樂休閒', icon: '🎮', prompt: '推薦附近娛樂或休閒場所', color: 'bg-indigo-500' },
  { id: 'random', name: '隨意推薦', icon: '🎲', prompt: '給我一個驚喜推薦', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
];

export const LocationCategorySelector: React.FC<LocationCategorySelectorProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
  location,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<LocationPreferences>({
    categories: [],
    autoRecommend: false,
    savePreferences: true,
    language: 'auto',
    includeMap: true,
  });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [isOverseas, setIsOverseas] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('location_preferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences(parsed);
        setSelectedCategories(parsed.categories || []);
      } catch (e) {
        console.error('Failed to load preferences', e);
      }
    }
  }, []);

  useEffect(() => {
    if (location && isOpen) {
      detectCountry(location.lat, location.lng);
    }
  }, [location, isOpen]);

  const detectCountry = async (lat: number, lng: number) => {
    setIsDetectingLocation(true);
    try {
      // 使用 Nominatim Reverse Geocoding API（免費）
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=zh-TW`,
        {
          headers: {
            'User-Agent': 'AutoLine-Fairy-Assistant/1.0'
          }
        }
      );
      const data = await response.json();
      
      if (data.address) {
        const country = data.address.country || 'Unknown';
        const countryCode = data.address.country_code?.toUpperCase() || '';
        
        setDetectedCountry(country);
        setIsOverseas(countryCode !== 'TW');
      }
    } catch (error) {
      console.error('Failed to detect country:', error);
      setDetectedCountry('無法識別');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleConfirm = () => {
    if (!location) return;

    if (preferences.savePreferences) {
      localStorage.setItem('location_preferences', JSON.stringify({
        ...preferences,
        categories: selectedCategories,
      }));
    }

    // 如果是隨意推薦模式
    if (selectedCategories.includes('random')) {
      const randomCategory = CATEGORIES.find(c => c.id === 'random');
      if (randomCategory) {
        onSelectCategory(randomCategory, { 
          ...location, 
          country: detectedCountry || undefined 
        });
        onClose();
        return;
      }
    }

    // 多個類別組合
    if (selectedCategories.length > 0) {
      const selectedCats = CATEGORIES.filter(c => selectedCategories.includes(c.id));
      const combinedPrompt = selectedCats.map(c => c.prompt).join('、');
      
      const combinedCategory: LocationCategory = {
        id: 'combined',
        name: '組合推薦',
        icon: '✨',
        prompt: combinedPrompt,
        color: 'bg-purple-500',
      };
      
      onSelectCategory(combinedCategory, { 
        ...location, 
        country: detectedCountry || undefined 
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-4 flex justify-between items-center text-white shrink-0">
          <div className="flex gap-3 items-center">
            <MapPin size={24} />
            <div>
              <h2 className="font-bold text-lg">選擇探索類別</h2>
              {location && (
                <p className="text-xs opacity-90 mt-0.5">
                  {isDetectingLocation ? '定位識別中...' : (
                    <>
                      📍 {detectedCountry || '未知位置'}
                      {isOverseas && <span className="ml-2 text-yellow-300">🌏 國外模式</span>}
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* 類別選擇 */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Navigation size={16} />
              選擇想探索的內容（可多選）
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    selectedCategories.includes(category.id)
                      ? 'border-purple-500 bg-purple-50 shadow-md scale-105'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  {selectedCategories.includes(category.id) && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <div className="text-sm font-medium text-gray-800">{category.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 偏好設定 */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Sparkles size={16} />
              進階設定
            </h3>
            
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2 cursor-pointer">
              <span className="text-sm text-gray-700">儲存我的偏好設定</span>
              <input
                type="checkbox"
                checked={preferences.savePreferences}
                onChange={(e) => setPreferences(prev => ({ ...prev, savePreferences: e.target.checked }))}
                className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
              />
            </label>

            {isOverseas && (
              <label className="flex items-center justify-between p-3 bg-blue-50 rounded-lg mb-2 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-blue-600" />
                  <span className="text-sm text-gray-700">顯示中文地圖引導</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.includeMap}
                  onChange={(e) => setPreferences(prev => ({ ...prev, includeMap: e.target.checked }))}
                  className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
                />
              </label>
            )}

            <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-gray-600 flex items-start gap-2">
                <span className="text-base">💡</span>
                <span>
                  {isOverseas 
                    ? '偵測到您在國外，回應將包含中文翻譯說明和Google地圖連結' 
                    : '選擇「隨意推薦」讓仙女驚喜推薦，或多選類別組合探索'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-5 py-4 flex justify-end gap-3 border-t border-gray-100 shrink-0">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedCategories.length === 0}
            className={`px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-sm transition-all ${
              selectedCategories.length > 0
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg active:scale-95'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {selectedCategories.length > 0 ? `開始探索 (${selectedCategories.length})` : '請選擇類別'}
          </button>
        </div>
      </div>
    </div>
  );
};
