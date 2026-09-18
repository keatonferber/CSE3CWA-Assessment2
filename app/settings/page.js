'use client';

import { useEffect, useState } from 'react';

function saveCookie(name, value) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export default function SettingsPage() {
  const [theme, setTheme] = useState('light');
  const [density, setDensity] = useState('comfortable');

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme || 'light');
    setDensity(document.documentElement.dataset.density || 'comfortable');
  }, []);

  function changeTheme(value) {
    setTheme(value); document.documentElement.dataset.theme = value; saveCookie('speech_builder_theme', value);
  }
  function changeDensity(value) {
    setDensity(value); document.documentElement.dataset.density = value; saveCookie('speech_builder_density', value);
  }

  return <section><p className="eyebrow">Persistent interface preferences</p><h1>Settings</h1><p className="lead">These preferences are stored in browser cookies so the interface remains consistent across page navigation and future visits.</p><div className="grid2" style={{ marginTop: 20 }}><article className="card"><h2>Colour theme</h2><label>Theme<select value={theme} onChange={(e) => changeTheme(e.target.value)}><option value="light">Light</option><option value="dark">Dark</option></select></label></article><article className="card"><h2>Layout density</h2><label>Spacing<select value={density} onChange={(e) => changeDensity(e.target.value)}><option value="comfortable">Comfortable</option><option value="compact">Compact</option></select></label></article></div></section>;
}
