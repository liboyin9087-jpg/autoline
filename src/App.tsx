<Header 
  mode={mode} 
  onModeChange={setMode} 
  onReset={handleReset}
  onOpenSettings={() => setIsSettingsOpen(true)}
  showBackButton={true}   // ✅ 改成 true，按鈕就會出現了
  onBack={handleReset}    // ✅ 建議加上這行，確保點擊按鈕會執行重置/返回動作
  onSearchToggle={() => setIsSearchOpen(!isSearchOpen)}
  isSearching={isSearchOpen}
/>
