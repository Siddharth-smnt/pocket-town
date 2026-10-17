const tree = (x: number, y: number, s = 1, type = 0) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="4" cy="5" rx="16" ry="7" fill="#48694d12"/><path d="M0 5v-23" stroke="#a18c65" stroke-width="5"/><path d="M0-10 8-20" stroke="#a18c65" stroke-width="3"/>${type ? '<path d="m0-63-22 35h8l-13 20h54L14-28h8Z" fill="#789d72"/><path d="m0-63 0 55H27L14-28h8Z" fill="#668c63"/>' : '<ellipse cy="-31" rx="22" ry="28" fill="#86ae7b"/><ellipse cx="-6" cy="-38" rx="16" ry="22" fill="#a4c48c"/><ellipse cx="11" cy="-28" rx="13" ry="20" fill="#7ba474"/>'}</g>`;
const flowers = (x: number, y: number, c = '#e9ac78') =>
  `<g transform="translate(${x} ${y})"><path d="M0 0v-10m9 13v-8m-17 3v-6" stroke="#7c9c65" stroke-width="2"/><circle cy="-12" r="4" fill="${c}"/><circle cx="9" cy="-6" r="3.5" fill="${c}"/><circle cx="-8" cy="-10" r="3.5" fill="#f4d88f"/></g>`;
const person = (x: number, y: number, c = '#df9d7b') =>
  `<g transform="translate(${x} ${y})"><ellipse cy="6" rx="5" ry="2" fill="#566a3c15"/><path d="M-2 1v5m4-5v5" stroke="#6e7767" stroke-width="2"/><rect x="-3.5" y="-7" width="7" height="9" rx="3" fill="${c}"/><circle cy="-11" r="3.4" fill="#dfbc8c"/><path d="M-3-12q2-6 6 0" fill="#7f715b"/></g>`;
const plot = (x: number, y: number, w = 58) =>
  `<g transform="translate(${x} ${y})"><ellipse rx="${w / 2}" ry="${w / 4}" fill="#d0ddae" stroke="#b5c495" stroke-width="1.5" stroke-dasharray="4 5"/><path d="M0 0v-19" stroke="#b3b58b" stroke-width="2"/><path d="M1-19h14l-4 5 4 5H1" fill="#d7c795"/></g>`;
function house(type: string) {
  if (type === 'home')
    return `<ellipse cy="10" rx="45" ry="14" fill="#4f614417"/><path d="M-29-30 11-43 39-24v37L0 25-29 8Z" fill="#eee5c9"/><path d="M0-16 39-28v41L0 25Z" fill="#d6ccb0"/><path d="m-38-30 34-42 53 38-50 16Z" fill="#8eaa91"/><path d="m-4-72 53 38-10 6-45-31-29 31-3-2Z" fill="#a3b99b"/><path d="M-18-5 0 0v24l-18-6Z" fill="#9aa797"/><path d="M13-10 26-14v14L13 4Z" fill="#9fb8bb"/><path d="M19.5-12v14m-6.5-5 13-4" stroke="#ede7cd" stroke-width="2"/><path d="M-24-24-11-20v12l-13-4Z" fill="#a1bbc0"/><path d="M8-57v-20l10 4v23" fill="#ddd5bb"/><ellipse class="smoke" cx="13" cy="-83" rx="5" ry="7" fill="#fffdf5"/>`;
  if (type === 'bakery')
    return `<ellipse cy="14" rx="47" ry="14" fill="#4f614417"/><path d="M-35-34 11-47 42-28v42L-1 28-35 9Z" fill="#f6e4bc"/><path d="M-1-17 42-30v44L-1 28Z" fill="#e7cfa3"/><path d="m-44-35 35-38 60 39-52 17Z" fill="#ce947d"/><path d="m-9-73 60 39-9 5-50-30-29 29-7-5Z" fill="#e7ac90"/><path d="M-29-19-6-7V9L-29-3Z" fill="#a5bdba"/><path d="M9-9 32-16v20L9 11Z" fill="#95b2aa"/><path d="M7-12 34-20l5 10L7-1Z" fill="#fff1d4"/><path d="m7-12 7-2v11L7-1Zm14-4 7-2v10l-7 3Zm13-4 5 10-4 1-1-11Z" fill="#da9782"/><path d="M-25 0-9 8v16l-16-8Z" fill="#b59b75"/><rect x="-10" y="-40" width="25" height="11" rx="3" fill="#fff0d2" transform="rotate(-16)"/><path d="m-9-34 12-3" stroke="#ba9271" stroke-width="2"/><path d="M-28-12q5-7 9 4m1 0q4-7 8 3" fill="none" stroke="#d9b26b" stroke-width="4"/>`;
  if (type === 'library')
    return `<ellipse cy="14" rx="47" ry="13" fill="#4f614417"/><path d="M-33-37 12-51 42-32v46L0 28-33 10Z" fill="#f0e5cd"/><path d="M0-20 42-33v47L0 28Z" fill="#d8cdb3"/><path d="m-42-38 38-34 55 37-52 17Z" fill="#819da9"/><path d="m-4-72 55 37-8 4-47-29-31 28-7-6Z" fill="#9db8bd"/><path d="M-25-29-8-19V4L-25-6Z" fill="#a3b9ba"/><path d="m-23-24 12 7m-12-1 12 7m-12-1 12 7" stroke="#f5e6c8" stroke-width="2"/><path d="M10-13 29-19V6L10 12Z" fill="#91a9a2"/><path d="M15-9v15m6-18V4m5-18V2" stroke="#e4bd80" stroke-width="3"/><path d="M-9 4 4 10v18l-13-7Z" fill="#8caa9a"/><path d="M-12-47q9-7 14-1 6-9 14-4v13q-8-4-14 4-5-6-14 1Z" fill="#f5eaca"/>`;
  if (type === 'cafe')
    return `<ellipse cy="14" rx="47" ry="13" fill="#4f614417"/><path d="M-34-29 7-42 38-25v40L-3 28-34 10Z" fill="#ecd8c7"/><path d="M-3-12 38-25v40L-3 28Z" fill="#d8bfb0"/><path d="m-43-31 43-16 48 25-52 17Z" fill="#779b82"/><path d="m-43-31 0 9 39 23 52-17v-8L-4-7Z" fill="#94b29b"/><path d="M-27-12-10-3v19l-17-8Z" fill="#9ebbb6"/><path d="M6-3 29-10V9L6 16Z" fill="#9ebbb6"/><path d="M3-8 33-17l7 10L4 5Z" fill="#f4e5bb"/><path d="M4-8 7-2v11M17-12l6 11m7-14 6 9" stroke="#b7ae82" stroke-width="4"/><ellipse cx="45" cy="25" rx="11" ry="5" fill="#bfa782"/><path d="M45 25v10" stroke="#a38a6a" stroke-width="3"/><path d="M44-31v-14" stroke="#9b8165" stroke-width="2"/><path d="M40-45h10v7q-5 6-10 0Z" fill="#fff0d2"/>`;
  if (type === 'windmill')
    return `<ellipse cy="13" rx="36" ry="11" fill="#4f614417"/><path d="M-16-50h28l14 63-46 0Z" fill="#e7dbc0"/><path d="M0-50h12l14 63H0Z" fill="#d0c4a6"/><path d="m-22-50 19-23 23 23Z" fill="#a0a9a0"/><path d="M-4-3h11v16H-4Z" fill="#a9a483"/><g class="wind-vanes"><path d="M0-30v-42M0-30h42M0-30v42M0-30h-42" stroke="#b69d74" stroke-width="4"/><path d="M-7-71H0v26H-7ZM16-38h26v8H16ZM0-14h7v26H0Zm-42-16h26v8h-26Z" fill="#fff4db" stroke="#c8b48b" stroke-width="1"/></g><circle cy="-30" r="6" fill="#b59c72"/>`;
  if (type === 'garden')
    return `<ellipse cy="3" rx="43" ry="21" fill="#bdd096"/><path d="m-31-9 23-10 27 14L-5 6Z" fill="#a88f70"/><path d="m-10 3 23-10 27 14-24 11Z" fill="#ad9576"/><path d="m-24-9 18-7m-5 13 18-7m-9 14 16-6m-3 13 17-6" stroke="#739969" stroke-width="5"/>${flowers(-27, -12)}${flowers(-8, -5, '#d7979c')}${flowers(9, 2, '#e9c55f')}${flowers(27, 8, '#d7979c')}<path d="m-43 1 32 20 53-14m-75-14V9m21 1v16m14-10v6m22-12v6m18-20v17" fill="none" stroke="#e9dfbc" stroke-width="3"/>`;
  if (type === 'park')
    return `<ellipse cy="2" rx="50" ry="27" fill="#bad09c"/><ellipse cx="8" cy="4" rx="30" ry="15" fill="#a0c5c5"/><ellipse cx="10" cy="1" rx="25" ry="11" fill="#a8cdd0"/><path d="m-5 0 15-2m3 9 12-2" stroke="#d2e6dc" stroke-width="2"/>${tree(-37, -12, 0.65)}<path d="m-23 10 22 11m-23-17 23 11m-20-7v14m17-6v13" stroke="#b0946d" stroke-width="4"/>${flowers(36, -12)}<ellipse cx="17" cy="0" rx="4" ry="2" fill="#f8e9ba"/><circle cx="20" cy="-2" r="2" fill="#f8e9ba"/>`;
  return '';
}
export function buildingIcon(type: string) {
  return `<svg viewBox="-58 -85 116 125" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${house(type)}</svg>`;
}
export function townSVG(built: readonly string[], newId?: string) {
  const has = (id: string) => built.includes(id);
  const building = (id: string, x: number, y: number, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><g class="${newId === id ? 'new-building' : ''}">${house(id)}</g></g>`;
  return `<svg class="town-svg" viewBox="0 0 640 415" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="soil" x2="0" y2="1"><stop stop-color="#c4bc94"/><stop offset="1" stop-color="#aeb58e"/></linearGradient><linearGradient id="grass" x2="0" y2="1"><stop stop-color="#d3e0ae"/><stop offset="1" stop-color="#bdcf98"/></linearGradient></defs>
<g class="cloud-one" fill="#fffdf5" opacity=".75"><ellipse cx="121" cy="86" rx="38" ry="11"/><ellipse cx="109" cy="77" rx="19" ry="17"/><ellipse cx="134" cy="81" rx="20" ry="13"/></g><g class="cloud-two" fill="#fffdf5" opacity=".65"><ellipse cx="509" cy="79" rx="41" ry="11"/><ellipse cx="499" cy="69" rx="21" ry="18"/><ellipse cx="524" cy="73" rx="16" ry="15"/></g><circle cx="420" cy="65" r="23" fill="#f3df9b" opacity=".7"/>
<ellipse cx="323" cy="361" rx="237" ry="30" fill="#879e6f0b"/><ellipse cx="323" cy="352" rx="211" ry="21" fill="#879e6f0b"/>
<path d="M71 252Q82 190 189 173L431 167Q548 179 577 253L579 282Q565 345 441 368L216 365Q91 348 66 294Z" fill="url(#soil)"/><path d="M71 252Q82 182 189 166L431 160Q548 172 577 246Q602 310 467 341L237 347Q95 330 71 278Z" fill="url(#grass)"/><path d="M72 270q38 63 167 74l228-3q94-18 112-49" stroke="#dde5b6" stroke-width="3" fill="none"/>
<path d="M188 305Q245 277 266 239T370 206Q426 210 464 252T534 287" stroke="#d3c79f" stroke-width="27" fill="none"/><path d="M188 302Q245 274 266 236T370 203Q426 207 464 249T534 284" stroke="#ece2bc" stroke-width="21" fill="none"/><path d="M289 234q35 30 39 61" stroke="#ece2bc" stroke-width="20" fill="none"/>
<ellipse cx="144" cy="213" rx="28" ry="16" fill="#acc7ad"/><ellipse cx="144" cy="210" rx="24" ry="13" fill="#a4c7c5"/><path d="m132 210 12-2m-2 8 10-1" stroke="#d5e6d8" stroke-width="2"/>
${tree(178, 163, 0.76, 1)}${tree(214, 155, 0.72)}${tree(248, 162, 0.72, 1)}${tree(400, 159, 0.8)}${tree(440, 161, 0.58, 1)}
${building('home', 303, 189, 0.91)}
${has('windmill') ? building('windmill', 489, 207, 0.98) : plot(489, 206, 45)}
${has('library') ? building('library', 405, 245, 0.9) : plot(405, 247)}
${has('bakery') ? building('bakery', 215, 252, 0.92) : plot(210, 250, 62)}
${tree(102, 260, 0.83)}${tree(120, 285, 0.7, 1)}
${has('garden') ? building('garden', 174, 307, 0.86) : flowers(171, 304)}
${has('cafe') ? building('cafe', 328, 307, 0.92) : plot(328, 305, 65)}
${has('park') ? building('park', 476, 304, 1) : `${tree(481, 309, 0.66)}${flowers(452, 310)}`}
${tree(544, 267, 0.73, 1)}${flowers(367, 332, '#e3aa92')}${flowers(258, 326)}${flowers(378, 188)}
${person(264, 262)}${has('bakery') ? person(242, 278, '#91acb5') : ''}${has('library') ? person(436, 265, '#c7b272') : ''}${has('cafe') ? person(363, 309, '#a6b48a') : ''}${has('garden') ? person(198, 315, '#b8a0b4') : ''}
<g stroke="#b0ba8c" stroke-width="2" opacity=".65"><path d="m140 309 3-5 2 5m238 20 3-5 2 4m128-32 2-4 2 3M269 184l3-5 2 4"/></g>
<g fill="#b3c18b"><ellipse cx="138" cy="248" rx="3" ry="1.4"/><ellipse cx="388" cy="314" rx="3" ry="1.4"/><ellipse cx="432" cy="298" rx="3" ry="1.4"/></g>
</svg>`;
}
