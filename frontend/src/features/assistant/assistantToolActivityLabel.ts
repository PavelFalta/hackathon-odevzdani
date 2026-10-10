function parseArgs(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return null
  }
}

export function toolActivityLabel(name: string, argumentsJson: string): string {
  const args = parseArgs(argumentsJson)
  const query = typeof args?.query === 'string' ? args.query.trim() : ''
  const category = typeof args?.category_id === 'string' ? args.category_id.trim() : ''

  switch (name) {
    case 'search_web':
      return 'Hledám aktuální akce online…'
    case 'show_timetable':
      return 'Sestavuji program…'
    case 'search_regional_knowledge':
      return query
        ? `Prohledávám regionální databázi: „${query}"…`
        : 'Prohledávám regionální databázi…'
    case 'search_mapbox':
      return query ? `Hledám na mapě: „${query}"…` : 'Hledám na mapě…'
    case 'search_mapbox_category':
      return category
        ? `Hledám místa zájmu v kategorii „${category}"…`
        : 'Hledám místa zájmu podle kategorie…'
    case 'reverse_geocode_mapbox':
      return 'Zjišťuji adresu podle souřadnic…'
    case 'highlight_place_options':
      return 'Zobrazuji možnosti na mapě…'
    case 'fly_to_place':
      return 'Přibližuji vybrané místo…'
    case 'fetch_place_reviews':
      return query ? `Načítám recenze: „${query}"…` : 'Načítám recenze…'
    case 'open_website':
      return 'Otevírám web v emulátoru…'
    case 'list_open_windows':
      return 'Kontroluji otevřená okna…'
    case 'close_window':
      return 'Zavírám okno…'
    case 'set_map_time':
      return 'Nastavuji čas na mapě…'
    case 'set_map_appearance':
      return 'Upravuji vzhled mapy…'
    case 'map_view_preset':
      return 'Přepínám pohled mapy…'
    case 'get_user_location':
      return 'Kontroluji tvoji polohu…'
    case 'set_user_location':
      return query ? `Nastavuji polohu: „${query}"…` : 'Nastavuji polohu…'
    case 'plan_route': {
      const dest = typeof args?.destination === 'string' ? args.destination.trim() : ''
      return dest ? `Plánuji trasu do „${dest}"…` : 'Plánuji trasu…'
    }
    case 'open_google_maps_route':
      return 'Otevírám trasu v Mapách Google…'
    case 'export_route_steps':
      return 'Stahuji navigační kroky…'
    case 'export_route_map_screenshot':
      return 'Ukládám snímek mapy s trasou…'
    default:
      return 'Spouštím nástroj…'
  }
}
