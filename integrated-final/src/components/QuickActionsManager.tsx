import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { QuickAction } from '../types';

interface QuickActionsManagerProps {
  quickActions: QuickAction[];
  onSave: (actions: QuickAction[]) => void;
  onClose: () => void;
}

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { id: '1', icon: '🍑', label: '御膳房', subLabel: '附近美食', colorClass: 'bg-orange-400', prompt: '📍 請推薦附近 3 間高評價美食，請在 50 字內簡短回答，不要廢話。' },
  { id: '2', icon: '🎋', label: '天宮籤', subLabel: '今日運勢', colorClass: 'bg-purple-500', prompt: '🔮 請幫我抽一支今日運勢籤，請在 50 字內簡短回答，給我一句建議即可。' },
  { id: '3', icon: '🍵', label: '仙女錦囊', subLabel: '生活建議', colorClass: 'bg-green-500', prompt: '給我一個健康的生活建議，50字內。' },
  { id: '4', icon: '💠', label: '無字天書', subLabel: '解悶/代碼', colorClass: 'bg-blue-500', prompt: '講一個超級好笑的短笑話。' },
];

const COLOR_OPTIONS = [
  { class: 'bg-red-400', label: '紅' },
  { class: 'bg-orange-400', label: '橙' },
  { class: 'bg-yellow-400', label: '黃' },
  { class: 'bg-green-400', label: '綠' },
  { class: 'bg-blue-400', label: '藍' },
  { class: 'bg-purple-400', label: '紫' },
  { class: 'bg-pink-400', label: '粉' },
  { class: 'bg-gray-400', label: '灰' },
];

export const QuickActionsManager: React.FC<QuickActionsManagerProps> = ({ quickActions, onSave, onClose }) => {
  const [actions, setActions] = useState<QuickAction[]>(quickActions.length > 0 ? quickActions : DEFAULT_QUICK_ACTIONS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<QuickAction>>({});

  const handleEdit = (action: QuickAction) => {
    setEditingId(action.id);
    setEditForm(action);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    
    setActions(actions.map(a => 
      a.id === editingId ? { ...a, ...editForm } as QuickAction : a
    ));
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id: string) => {
    if (actions.length <= 1) {
      alert('至少需要保留一個快速操作');
      return;
    }
    setActions(actions.filter(a => a.id !== id));
  };

  const handleAdd = () => {
    const newAction: QuickAction = {
      id: Date.now().toString(),
      icon: '✨',
      label: '新快速操作',
      subLabel: '自訂指令',
      colorClass: 'bg-blue-400',
      prompt: '請輸入指令內容',
      isCustom: true,
    };
    setActions([...actions, newAction]);
    setEditingId(newAction.id);
    setEditForm(newAction);
  };

  const handleResetDefaults = () => {
    if (confirm('確定要重置為預設快速操作嗎？這將清除所有自訂內容。')) {
      setActions(DEFAULT_QUICK_ACTIONS);
      setEditingId(null);
      setEditForm({});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* 標題列 */}
        <div className="bg-fairy-primary px-5 py-4 flex justify-between items-center text-white shrink-0">
          <div className="flex gap-2 items-center">
            <div className="p-2 bg-white/20 rounded-lg">
              <Plus size={18} />
            </div>
            <h2 className="font-bold text-lg">管理快速操作</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* 內容區域 */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* 操作按鈕組 */}
          <div className="flex gap-3 justify-between">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-fairy-primary text-white rounded-xl hover:bg-fairy-dark transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              新增操作
            </button>
            <button
              onClick={handleResetDefaults}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              重置預設
            </button>
          </div>

          {/* 快速操作列表 */}
          <div className="space-y-3">
            {actions.map((action) => (
              <div
                key={action.id}
                className="border border-gray-200 rounded-2xl overflow-hidden transition-all hover:shadow-md"
              >
                {editingId === action.id ? (
                  // 編輯模式
                  <div className="p-4 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">圖示 (Emoji)</label>
                        <input
                          type="text"
                          value={editForm.icon || ''}
                          onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          placeholder="例如: 🎉"
                          maxLength={2}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">顏色</label>
                        <div className="grid grid-cols-4 gap-2">
                          {COLOR_OPTIONS.map(color => (
                            <button
                              key={color.class}
                              onClick={() => setEditForm({ ...editForm, colorClass: color.class })}
                              className={`w-full h-8 rounded-lg ${color.class} ${
                                editForm.colorClass === color.class ? 'ring-2 ring-offset-2 ring-fairy-primary' : ''
                              }`}
                              title={color.label}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">標題</label>
                        <input
                          type="text"
                          value={editForm.label || ''}
                          onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          placeholder="例如: 御膳房"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">副標題</label>
                        <input
                          type="text"
                          value={editForm.subLabel || ''}
                          onChange={(e) => setEditForm({ ...editForm, subLabel: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          placeholder="例如: 附近美食"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">指令內容</label>
                        <textarea
                          value={editForm.prompt || ''}
                          onChange={(e) => setEditForm({ ...editForm, prompt: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm h-24 resize-none"
                          placeholder="例如: 請推薦附近 3 間高評價美食"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={handleSaveEdit}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                      >
                        <Save size={14} />
                        儲存
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditForm({});
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  // 檢視模式
                  <div className="p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${action.colorClass} flex items-center justify-center text-2xl flex-shrink-0`}>
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-800">{action.label}</div>
                      <div className="text-xs text-gray-500 mb-1">{action.subLabel}</div>
                      <div className="text-xs text-gray-600 truncate">{action.prompt}</div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(action)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="編輯"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(action.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="刪除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 底部按鈕 */}
        <div className="bg-gray-50 px-5 py-4 flex justify-end gap-3 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
            取消
          </button>
          <button
            onClick={() => {
              onSave(actions);
              onClose();
            }}
            className="px-6 py-2.5 text-sm font-bold text-white bg-fairy-primary hover:bg-fairy-dark rounded-xl shadow-sm transition-transform active:scale-95"
          >
            套用變更
          </button>
        </div>
      </div>
    </div>
  );
};
